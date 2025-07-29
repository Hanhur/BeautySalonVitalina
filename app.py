import os
import re
import logging
from logging.handlers import RotatingFileHandler
from datetime import datetime, time
from typing import Dict, Any
from functools import wraps
from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
from dotenv import load_dotenv
from cryptography.fernet import Fernet
import psycopg2
from psycopg2 import errors as pg_errors
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib

# Configuration and Initialization
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level = logging.INFO)
logger = logging.getLogger(__name__)
handler = RotatingFileHandler('app.log', maxBytes = 10000, backupCount = 3)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

class Config:
    """Centralized configuration management"""
    ENCRYPTION_KEY = os.getenv('ENCRYPTION_KEY')
    DB_HOST = os.getenv('DB_HOST')
    DB_NAME = os.getenv('DB_NAME')
    DB_USER = os.getenv('DB_USER')
    DB_PASSWORD = os.getenv('DB_PASSWORD')
    DB_PORT = os.getenv('DB_PORT', '5432')
    SMTP_SERVER = os.getenv('SMTP_SERVER')
    SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
    SMTP_USER = os.getenv('SMTP_USER')
    SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')
    FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'False') == 'True'

class EncryptionService:
    """Singleton for encryption/decryption operations"""
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Initialize encryption service with key validation"""
        if not Config.ENCRYPTION_KEY:
            Config.ENCRYPTION_KEY = Fernet.generate_key().decode()
            logger.info("Generated new encryption key")
        
        try:
            self.cipher = Fernet(Config.ENCRYPTION_KEY.encode())
        except ValueError as e:
            logger.error("Invalid encryption key format: %s", e)
            raise RuntimeError("Invalid encryption key configuration") from e
    
    def encrypt(self, data: str) -> bytes:
        """Encrypt string data"""
        return self.cipher.encrypt(data.encode()) if data else b''
    
    def decrypt(self, encrypted_data: bytes) -> str:
        """Decrypt to string"""
        return self.cipher.decrypt(encrypted_data).decode() if encrypted_data else ''

class DatabaseService:
    """Handles all database operations with connection pooling"""
    
    @staticmethod
    def get_connection():
        """Get a managed database connection"""
        try:
            conn = psycopg2.connect(
                host = Config.DB_HOST,
                database = Config.DB_NAME,
                user = Config.DB_USER,
                password = Config.DB_PASSWORD,
                port = Config.DB_PORT
            )
            conn.autocommit = False
            return conn
        except pg_errors.OperationalError as e:
            logger.error("Database connection failed: %s", e)
            raise RuntimeError("Database connection error") from e
    
    @staticmethod
    def initialize_db():
        """Initialize database schema with error handling"""
        try:
            with DatabaseService.get_connection() as conn:
                with conn.cursor() as cur:
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
                            is_notified BOOLEAN DEFAULT FALSE
                        )
                    """)
                    conn.commit()
                    logger.info("Database table initialized successfully")
        except pg_errors.Error as e:
            logger.error("Database initialization failed: %s", e)
            raise RuntimeError("Database initialization error") from e

    @staticmethod
    def save_appointment(appointment_data: Dict[str, Any]) -> int:
        """Save appointment data to database with transaction handling"""
        try:
            with DatabaseService.get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute("""
                        INSERT INTO appointments (
                            first_name, last_name, email, phone, service, date, time
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                        RETURNING id
                    """, (
                        appointment_data['first_name'],
                        appointment_data['last_name'],
                        appointment_data['email'],
                        appointment_data['phone'],
                        appointment_data['service'],
                        appointment_data['date'],
                        appointment_data['time']
                    ))
                    appointment_id = cur.fetchone()[0]
                    conn.commit()
                    return appointment_id
        except pg_errors.Error as e:
            logger.error("Database operation failed: %s", e)
            raise RuntimeError("Failed to save appointment") from e

class EmailService:
    """Handles email notifications with template support"""
    
    @staticmethod
    def send_confirmation(recipient_data: Dict[str, Any]) -> bool:
        """Send appointment confirmation email with HTML template"""
        if not all([Config.SMTP_SERVER, Config.SMTP_USER, Config.SMTP_PASSWORD]):
            logger.warning("Email configuration incomplete, skipping send")
            return False
        
        try:
            msg = MIMEMultipart()
            msg['From'] = Config.SMTP_USER
            msg['To'] = recipient_data['email']
            msg['Subject'] = "Your Appointment Confirmation - Beauty Salon Vitalina"
            
            body = f"""
            <html>
                <body>
                    <h2>Dear {recipient_data['first_name']} {recipient_data['last_name']},</h2>
                    <p>Thank you for booking with Beauty Salon Vitalina!</p>

                    <h3>Your Contact Information:</h3>
                    <ul>
                        <li>Email: {recipient_data['email']}</li>
                    </ul>

                    <h3>Appointment Details:</h3>
                    <ul>
                        <li>Service: {recipient_data['service']}</li>
                        <li>Date: {recipient_data['date']}</li>
                        <li>Time: {recipient_data['time']}</li>
                    </ul>
                    <p>Please arrive 10 minutes before your appointment.</p>
                    <p>Best regards,<br>Vitalina Team</p>
                </body>
            </html>
            """
            
            msg.attach(MIMEText(body, 'html'))
            
            with smtplib.SMTP(Config.SMTP_SERVER, Config.SMTP_PORT) as server:
                server.starttls()
                server.login(Config.SMTP_USER, Config.SMTP_PASSWORD)
                server.send_message(msg)
            logger.info(f"Confirmation email sent to {recipient_data['email']}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {recipient_data['email']}: {str(e)}")
            return False

# Utility Functions
def validate_booking_data(data: Dict[str, Any]) -> None:
    """Validate booking request data with comprehensive checks"""
    required_fields = ['firstName', 'lastName', 'email', 'phone', 'service', 'date', 'time']
    missing = [field for field in required_fields if not data.get(field)]
    if missing:
        raise ValueError(f"Missing required fields: {', '.join(missing)}")
    
    if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', data['email']):
        raise ValueError("Invalid email format")

def parse_datetime(date_str: str, time_str: str) -> tuple:
    """Parse and validate date and time strings"""
    try:
        return (
            datetime.strptime(date_str, '%Y-%m-%d').date(),
            datetime.strptime(time_str, '%H:%M').time()
        )
    except ValueError as e:
        raise ValueError(f"Invalid datetime format: {str(e)}") from e

def handle_errors(f):
    """Decorator for consistent error handling and logging"""
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

# API Endpoints
@app.route('/book-appointment', methods = ['POST'])
@handle_errors
def book_appointment():
    """Endpoint for booking appointments with comprehensive validation"""
    data = request.get_json()
    if not data:
        raise ValueError("No data provided")
    
    validate_booking_data(data)
    appointment_date, appointment_time = parse_datetime(data['date'], data['time'])
    
    # Encrypt sensitive data
    encryptor = EncryptionService()
    encrypted_data = {
        'first_name': encryptor.encrypt(data['firstName']),
        'last_name': encryptor.encrypt(data['lastName']),
        'email': encryptor.encrypt(data['email']),
        'phone': encryptor.encrypt(data['phone']),
        'service': data['service'],
        'date': appointment_date,
        'time': appointment_time
    }
    
    # Save to database
    appointment_id = DatabaseService.save_appointment(encrypted_data)
    
    # Send confirmation email
    email_sent = EmailService.send_confirmation({
        'email': data['email'],
        'first_name': data['firstName'],
        'last_name': data['lastName'],
        'service': data['service'],
        'date': data['date'],
        'time': data['time']
    })
    
    # Update notification status if email was sent
    if email_sent:
        with DatabaseService.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE appointments 
                    SET is_notified = TRUE 
                    WHERE id = %s
                """, (appointment_id,))
                conn.commit()
    
    return jsonify({
        'success': True,
        'message': 'Appointment booked successfully!',
        'appointment_id': appointment_id,
        'email_sent': email_sent
    })

@app.route('/health')
def health_check():
    """Health check endpoint for service monitoring"""
    try:
        with DatabaseService.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
                if cur.fetchone()[0] != 1:
                    raise RuntimeError("Database check failed")
        
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error("Health check failed: %s", e)
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500

@app.route('/')
def index():
    """Simple index page for API documentation"""
    return render_template_string("""
        <!DOCTYPE html>
        <html>
        <head><title>Beauty Salon API</title></head>
        <body>
            <h1>Beauty Salon Booking API</h1>
            <p>Use POST /book-appointment to submit bookings</p>
            <p>Health check: GET /health</p>
        </body>
        </html>
    """)

if __name__ == '__main__':
    try:
        # Initialize services
        DatabaseService.initialize_db()
        EncryptionService()  # Test encryption initialization
        
        # Start application
        app.run(
            host = '0.0.0.0', 
            port = 5000, 
            debug = Config.FLASK_DEBUG,
            threaded = True
        )
    except Exception as e:
        logger.critical("Application startup failed: %s", e)
        raise

