import os
import re
import logging
from logging.handlers import RotatingFileHandler
from datetime import datetime
from typing import Dict, Any
from functools import wraps
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from cryptography.fernet import Fernet, InvalidToken
import psycopg2
from psycopg2 import sql, errors as pg_errors
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib
import requests
from concurrent.futures import ThreadPoolExecutor
import subprocess
import sys

# Configuration
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
handler = RotatingFileHandler('app.log', maxBytes=10000, backupCount=3)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

# Thread pool for async operations
executor = ThreadPoolExecutor(max_workers=4)

class Config:
    """Centralized configuration management"""
    ENCRYPTION_KEY = os.getenv('ENCRYPTION_KEY') or Fernet.generate_key().decode()
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_NAME = os.getenv('DB_NAME', 'salon_db')
    DB_USER = os.getenv('DB_USER', 'postgres')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    DB_PORT = os.getenv('DB_PORT', '5432')
    SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
    SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
    SMTP_USER = os.getenv('SMTP_USER', '')
    SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', '')
    TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', '')
    FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'false').lower() == 'true'

def create_database_if_not_exists():
    """Create database if it doesn't exist"""
    try:
        # First try to connect to the target database
        conn = psycopg2.connect(
            host=Config.DB_HOST,
            database=Config.DB_NAME,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            port=Config.DB_PORT
        )
        conn.close()
        logger.info(f"Database {Config.DB_NAME} already exists")
        return True
    except pg_errors.OperationalError:
        # If database doesn't exist, create it
        try:
            # Connect to default postgres database to create new database
            admin_conn = psycopg2.connect(
                host=Config.DB_HOST,
                database='postgres',
                user=Config.DB_USER,
                password=Config.DB_PASSWORD,
                port=Config.DB_PORT,
                autocommit=True  # Important: no transaction block
            )
            
            with admin_conn.cursor() as cur:
                # Check if database exists
                cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (Config.DB_NAME,))
                exists = cur.fetchone()
                
                if not exists:
                    cur.execute(f"CREATE DATABASE {Config.DB_NAME}")
                    logger.info(f"Database {Config.DB_NAME} created successfully")
                else:
                    logger.info(f"Database {Config.DB_NAME} already exists")
            
            admin_conn.close()
            return True
            
        except Exception as e:
            logger.error(f"Failed to create database {Config.DB_NAME}: {e}")
            
            # Try using createdb command as fallback
            try:
                env = os.environ.copy()
                if Config.DB_PASSWORD:
                    env['PGPASSWORD'] = Config.DB_PASSWORD
                
                result = subprocess.run([
                    'createdb',
                    '-h', Config.DB_HOST,
                    '-p', Config.DB_PORT,
                    '-U', Config.DB_USER,
                    Config.DB_NAME
                ], env=env, capture_output=True, text=True, timeout=30)
                
                if result.returncode == 0:
                    logger.info(f"Database {Config.DB_NAME} created using createdb command")
                    return True
                else:
                    logger.error(f"createdb command failed: {result.stderr}")
                    return False
                    
            except Exception as cmd_error:
                logger.error(f"Failed to create database using createdb: {cmd_error}")
                return False
                
    except Exception as e:
        logger.error(f"Unexpected error checking database: {e}")
        return False

class Database:
    """Database connection pool with context management"""
    
    @staticmethod
    def get_connection():
        """Get a database connection from the pool"""
        try:
            return psycopg2.connect(
                host=Config.DB_HOST,
                database=Config.DB_NAME,
                user=Config.DB_USER,
                password=Config.DB_PASSWORD,
                port=Config.DB_PORT
            )
        except pg_errors.OperationalError as e:
            logger.error("Database connection failed: %s", e)
            raise RuntimeError(f"Database connection error: {e}")

    @staticmethod
    def initialize():
        """Initialize database schema"""
        # First ensure database exists
        if not create_database_if_not_exists():
            raise RuntimeError("Failed to create or connect to database")
        
        try:
            with Database.get_connection() as conn:
                with conn.cursor() as cur:
                    # Create appointments table if not exists
                    cur.execute("""
                        CREATE TABLE IF NOT EXISTS appointments (
                            id SERIAL PRIMARY KEY,
                            first_name BYTEA NOT NULL,
                            last_name BYTEA NOT NULL,
                            email BYTEA NOT NULL,
                            phone BYTEA NOT NULL,
                            service TEXT NOT NULL,
                            date DATE NOT NULL,
                            time TIME NOT NULL,
                            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                            is_notified BOOLEAN DEFAULT FALSE,
                            is_telegram_notified BOOLEAN DEFAULT FALSE
                        )
                    """)
                    
                    # Create telegram_subscribers table if not exists
                    cur.execute("""
                        CREATE TABLE IF NOT EXISTS telegram_subscribers (
                            chat_id BIGINT PRIMARY KEY,
                            registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                        )
                    """)
                    
                    conn.commit()
                    logger.info("Database tables initialized successfully")
                    
        except pg_errors.Error as e:
            logger.error("Database initialization failed: %s", e)
            raise RuntimeError("Database initialization error")

    @staticmethod
    def add_telegram_subscriber(chat_id: int):
        """Add new Telegram subscriber"""
        try:
            with Database.get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(sql.SQL("""
                        INSERT INTO telegram_subscribers (chat_id)
                        VALUES (%s)
                        ON CONFLICT (chat_id) DO NOTHING
                    """), (chat_id,))
                    conn.commit()
                    return True
        except pg_errors.Error as e:
            logger.error("Failed to add Telegram subscriber: %s", e)
            return False
    
    @staticmethod
    def get_telegram_subscribers():
        """Get all active Telegram subscribers"""
        try:
            with Database.get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(sql.SQL("SELECT chat_id FROM telegram_subscribers"))
                    return [row[0] for row in cur.fetchall()]
        except pg_errors.Error as e:
            logger.error("Failed to get Telegram subscribers: %s", e)
            return []

    @staticmethod
    def get_new_appointments(limit=10):
        """Retrieve new appointments with optimized decryption"""
        try:
            with Database.get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(sql.SQL("""
                        SELECT id, first_name, last_name, email, phone, service, date, time
                        FROM appointments
                        WHERE is_telegram_notified = FALSE
                        ORDER BY created_at DESC
                        LIMIT %s
                    """), (limit,))
                    
                    encryptor = EncryptionService()
                    appointments = []
                    for row in cur.fetchall():
                        try:
                            appointments.append({
                                'id': row[0],
                                'first_name': encryptor.safe_decrypt(row[1]),
                                'last_name': encryptor.safe_decrypt(row[2]),
                                'email': encryptor.safe_decrypt(row[3]),
                                'phone': encryptor.safe_decrypt(row[4]),
                                'service': row[5],
                                'date': row[6],
                                'time': row[7]
                            })
                        except Exception as e:
                            logger.error(f"Failed to decrypt appointment data: {e}")
                            continue
                    return appointments
        except pg_errors.Error as e:
            logger.error("Failed to fetch appointments: %s", e)
            return []

    @staticmethod
    def mark_as_notified(appointment_id):
        """Optimized marking as notified"""
        try:
            with Database.get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(sql.SQL("""
                        UPDATE appointments 
                        SET is_telegram_notified = TRUE 
                        WHERE id = %s
                    """), (appointment_id,))
                    conn.commit()
        except pg_errors.Error as e:
            logger.error("Failed to mark appointment as notified: %s", e)
            raise RuntimeError("Failed to update appointment status")

# Остальной код остается без изменений (EncryptionService, NotificationService, utility functions, endpoints)

class EncryptionService:
    """Optimized encryption service"""
    
    def __init__(self):
        try:
            self.cipher = Fernet(Config.ENCRYPTION_KEY.encode())
        except (ValueError, TypeError) as e:
            logger.error("Invalid encryption key: %s", e)
            raise RuntimeError("Invalid encryption configuration")

    def encrypt(self, data: str) -> bytes:
        """Encrypt string data"""
        if not data:
            return b''
        try:
            return self.cipher.encrypt(data.encode())
        except (TypeError, ValueError) as e:
            logger.error("Encryption failed: %s", e)
            raise RuntimeError("Data encryption failed")

    def decrypt(self, encrypted_data: bytes) -> str:
        """Decrypt data to string"""
        if not encrypted_data:
            return ''
        try:
            return self.cipher.decrypt(encrypted_data).decode()
        except (InvalidToken, TypeError) as e:
            logger.error("Decryption failed: %s", e)
            return '[DECRYPTION_ERROR]'
    
    def safe_decrypt(self, encrypted_data):
        """Safe decryption with null and error handling"""
        if not encrypted_data:
            return ''
        try:
            if hasattr(encrypted_data, 'tobytes'):
                return self.cipher.decrypt(encrypted_data.tobytes()).decode()
            else:
                return self.cipher.decrypt(encrypted_data).decode()
        except Exception as e:
            logger.warning(f"Decryption failed: {e}")
            return '[DECRYPTION_ERROR]'

class NotificationService:
    """Unified notification service with async support"""
    
    @staticmethod
    def send_email_async(recipient_data: Dict[str, Any]):
        """Send email in background thread"""
        executor.submit(NotificationService._send_email, recipient_data)

    @staticmethod
    def _send_email(recipient_data: Dict[str, Any]) -> bool:
        """Actual email sending logic"""
        if not all([Config.SMTP_SERVER, Config.SMTP_USER, Config.SMTP_PASSWORD]):
            logger.warning("Email configuration incomplete")
            return False

        try:
            msg = MIMEText(f"""
            Dear {recipient_data['first_name']} {recipient_data['last_name']},

            Thank you for booking with us!

            Appointment Details:
            - Service: {recipient_data['service']}
            - Date: {recipient_data['date']}
            - Time: {recipient_data['time']}

            We look forward to seeing you!
            """)
            
            msg['From'] = Config.SMTP_USER
            msg['To'] = recipient_data['email']
            msg['Subject'] = "Your Appointment Confirmation"

            with smtplib.SMTP(Config.SMTP_SERVER, Config.SMTP_PORT) as server:
                server.starttls()
                server.login(Config.SMTP_USER, Config.SMTP_PASSWORD)
                server.sendmail(Config.SMTP_USER, recipient_data['email'], msg.as_string())

            logger.info(f"Email sent to {recipient_data['email']}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return False

    @staticmethod
    def send_telegram_async(appointment_data: Dict[str, Any]):
        """Send Telegram notification in background"""
        executor.submit(NotificationService._send_telegram, appointment_data)

    @staticmethod
    def _send_telegram(appointment_data: Dict[str, Any]) -> bool:
        """Actual Telegram notification logic"""
        if not Config.TELEGRAM_BOT_TOKEN:
            logger.warning("Telegram bot token not configured")
            return False

        try:
            message = f"""📅 New Appointment
            
            👤 Client: {appointment_data['first_name']} {appointment_data['last_name']}
            📞 Phone: {appointment_data['phone']}
            📧 Email: {appointment_data['email']}
            💈 Service: {appointment_data['service']}
            📅 Date: {appointment_data['date']}
            ⏰ Time: {appointment_data['time']}"""
            
            subscribers = Database.get_telegram_subscribers()
            
            if not subscribers:
                logger.warning("No Telegram subscribers found")
                return False

            for chat_id in subscribers:
                try:
                    response = requests.post(
                        f"https://api.telegram.org/bot{Config.TELEGRAM_BOT_TOKEN}/sendMessage",
                        json={'chat_id': chat_id, 'text': message},
                        timeout=5
                    )
                    response.raise_for_status()
                    logger.info(f"Telegram notification sent to chat {chat_id}")
                except Exception as e:
                    logger.error(f"Failed to send Telegram notification to chat {chat_id}: {e}")
                    continue

            return True
        except Exception as e:
            logger.error(f"Failed to send Telegram notification: {e}")
            return False

# Utility functions (остаются без изменений)
def validate_booking_data(data: Dict[str, Any]) -> None:
    """Enhanced data validation"""
    required = {
        'firstName': (r'^[a-zA-Z\s-]{2,50}$', "Invalid first name"),
        'lastName': (r'^[a-zA-Z\s-]{2,50}$', "Invalid last name"),
        'email': (r'^[^\s@]+@[^\s@]+\.[^\s@]+$', "Invalid email"),
        'phone': (r'^\+?[\d\s-]{7,15}$', "Invalid phone"),
        'service': (r'^.{3,100}$', "Invalid service"),
        'date': (r'^\d{4}-\d{2}-\d{2}$', "Invalid date format (YYYY-MM-DD)"),
        'time': (r'^\d{2}:\d{2}$', "Invalid time format (HH:MM)")
    }

    missing = [field for field in required if not data.get(field)]
    if missing:
        raise ValueError(f"Missing required fields: {', '.join(missing)}")

    for field, (pattern, error) in required.items():
        if not re.fullmatch(pattern, str(data[field])):
            raise ValueError(f"{error}: {data[field]}")

def parse_datetime(date_str: str, time_str: str) -> tuple:
    """Safe datetime parsing"""
    try:
        return (
            datetime.strptime(date_str, '%Y-%m-%d').date(),
            datetime.strptime(time_str, '%H:%M').time()
        )
    except ValueError as e:
        raise ValueError(f"Invalid datetime: {e}")

def error_handler(f):
    """Optimized error handling decorator"""
    @wraps(f)
    def wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except ValueError as e:
            logger.warning("Validation error: %s", e)
            return jsonify({'success': False, 'message': str(e)}), 400
        except RuntimeError as e:
            logger.error("Service error: %s", e)
            return jsonify({'success': False, 'message': str(e)}), 503
        except Exception as e:
            logger.exception("Unexpected error: %s", e)
            response = {'success': False, 'message': 'Internal server error'}
            if Config.FLASK_DEBUG:
                response['error'] = str(e)
            return jsonify(response), 500
    return wrapper

# API Endpoints (остаются без изменений)
@app.route('/')
def index():
    return jsonify({
        "service": "Beauty Salon Booking API",
        "status": "operational",
        "endpoints": {
            "book_appointment": "POST /book-appointment",
            "health_check": "GET /health",
            "register_telegram": "POST /register-telegram"
        }
    })

@app.route('/book-appointment', methods=['POST', 'OPTIONS'])
@error_handler
def book_appointment():
    """Optimized appointment booking endpoint"""
    if request.method == 'OPTIONS':
        return '', 200
        
    data = request.get_json()
    if not data:
        raise ValueError("No data provided")

    validate_booking_data(data)
    date, time = parse_datetime(data['date'], data['time'])

    # Encrypt sensitive data
    encryptor = EncryptionService()
    encrypted_data = {
        'first_name': encryptor.encrypt(data['firstName']),
        'last_name': encryptor.encrypt(data['lastName']),
        'email': encryptor.encrypt(data['email']),
        'phone': encryptor.encrypt(data['phone']),
        'service': data['service'],
        'date': date,
        'time': time
    }

    # Save to database
    with Database.get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql.SQL("""
                INSERT INTO appointments (
                    first_name, last_name, email, phone, service, date, time
                ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """), (
                encrypted_data['first_name'],
                encrypted_data['last_name'],
                encrypted_data['email'],
                encrypted_data['phone'],
                encrypted_data['service'],
                encrypted_data['date'],
                encrypted_data['time']
            ))
            appointment_id = cur.fetchone()[0]
            conn.commit()

    # Prepare notification data
    notification_data = {
        'id': appointment_id,
        'first_name': data['firstName'],
        'last_name': data['lastName'],
        'email': data['email'],
        'phone': data['phone'],
        'service': data['service'],
        'date': data['date'],
        'time': data['time']
    }

    # Send notifications asynchronously
    NotificationService.send_email_async(notification_data)
    NotificationService.send_telegram_async(notification_data)

    return jsonify({
        'success': True,
        'message': 'Appointment booked successfully!',
        'appointment_id': appointment_id
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        with Database.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
                if cur.fetchone()[0] != 1:
                    raise RuntimeError("Database check failed")

        # Test encryption
        EncryptionService()

        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'encryption': 'operational',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error("Health check failed: %s", e)
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500

@app.route('/register-telegram', methods=['POST', 'OPTIONS'])
@error_handler
def register_telegram():
    """Register Telegram chat for notifications"""
    if request.method == 'OPTIONS':
        return '', 200
        
    data = request.get_json()
    if not data or 'chat_id' not in data:
        raise ValueError("Missing chat_id in request")

    try:
        chat_id = int(data['chat_id'])
    except (ValueError, TypeError):
        raise ValueError("Invalid chat_id format")

    if Database.add_telegram_subscriber(chat_id):
        return jsonify({
            'success': True,
            'message': 'Chat registered for notifications'
        })
    
    raise RuntimeError("Failed to register chat")

def run_application():
    """Main application startup"""
    try:
        # Initialize services
        Database.initialize()
        EncryptionService()  # Test encryption
        
        logger.info("Starting Flask application...")
        logger.info(f"Database: {Config.DB_NAME}")
        logger.info(f"Host: {Config.DB_HOST}")
        logger.info(f"User: {Config.DB_USER}")
        
        # Start Flask application
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=Config.FLASK_DEBUG,
            threaded=True,
            use_reloader=False
        )
    except Exception as e:
        logger.critical("Application startup failed: %s", e)
        raise

if __name__ == '__main__':
    run_application()