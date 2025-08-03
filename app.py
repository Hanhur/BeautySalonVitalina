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
from telegram import Update
from telegram.ext import Updater, CommandHandler, CallbackContext, MessageHandler, Filters

# Configuration
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

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
    DB_HOST = os.getenv('DB_HOST')
    DB_NAME = os.getenv('DB_NAME')
    DB_USER = os.getenv('DB_USER')
    DB_PASSWORD = os.getenv('DB_PASSWORD')
    DB_PORT = os.getenv('DB_PORT', '5432')
    SMTP_SERVER = os.getenv('SMTP_SERVER')
    SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
    SMTP_USER = os.getenv('SMTP_USER')
    SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')
    TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
    FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'false').lower() == 'true'

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
            raise RuntimeError("Database connection error")

    @staticmethod
    def initialize():
        """Initialize database schema"""
        try:
            with Database.get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(sql.SQL("""
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
                    """))
                    cur.execute(sql.SQL("""
                        CREATE TABLE IF NOT EXISTS telegram_subscribers (
                            chat_id BIGINT PRIMARY KEY,
                            registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                        )
                    """))
                    conn.commit()
                    logger.info("Database initialized")
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
                    return [
                        {
                            'id': row[0],
                            'first_name': encryptor.safe_decrypt(row[1]),
                            'last_name': encryptor.safe_decrypt(row[2]),
                            'email': encryptor.safe_decrypt(row[3]),
                            'phone': encryptor.safe_decrypt(row[4]),
                            'service': row[5],
                            'date': row[6],
                            'time': row[7]
                        }
                        for row in cur.fetchall()
                    ]
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
            return self.cipher.decrypt(encrypted_data.tobytes()).decode()
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
            msg = MIMEMultipart()
            msg['From'] = Config.SMTP_USER
            msg['To'] = recipient_data['email']
            msg['Subject'] = "Your Appointment Confirmation"

            body = f"""
            <html>
                <body>
                    <h2>Dear {recipient_data['first_name']} {recipient_data['last_name']},</h2>
                    <p>Thank you for booking with us!</p>
                    <h3>Appointment Details:</h3>
                    <ul>
                        <li>Service: {recipient_data['service']}</li>
                        <li>Date: {recipient_data['date']}</li>
                        <li>Time: {recipient_data['time']}</li>
                    </ul>
                </body>
            </html>
            """

            msg.attach(MIMEText(body, 'html'))

            with smtplib.SMTP(Config.SMTP_SERVER, Config.SMTP_PORT) as server:
                server.starttls()
                server.login(Config.SMTP_USER, Config.SMTP_PASSWORD)
                server.send_message(msg)

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
            message = NotificationService.create_appointment_message(appointment_data)
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

    @staticmethod
    def create_appointment_message(appointment):
        """Create consistent appointment message format"""
        return (
            "📅 New Appointment\n\n"
            f"👤 Client: {appointment['first_name']} {appointment['last_name']}\n"
            f"📞 Phone: {appointment['phone']}\n"
            f"📧 Email: {appointment['email']}\n"
            f"💈 Service: {appointment['service']}\n"
            f"📅 Date: {appointment['date']}\n"
            f"⏰ Time: {appointment['time']}"
        )

# Utility functions
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

# Telegram Bot Handlers
def handle_appointments(update: Update, context: CallbackContext, automatic=False):
    """Shared logic for manual and automatic appointment handling"""
    try:
        appointments = Database.get_new_appointments()
        if not appointments:
            if not automatic:
                update.message.reply_text("No new appointments found.")
            return
        
        for appt in appointments:
            try:
                message = NotificationService.create_appointment_message(appt)
                if automatic:
                    context.bot.send_message(chat_id=context.job.context, text=message)
                else:
                    update.message.reply_text(message)
                Database.mark_as_notified(appt['id'])
            except Exception as e:
                logger.error(f"Failed to process appointment {appt.get('id')}: {e}")
                continue
                
    except Exception as e:
        logger.error(f"Error handling appointments: {e}")
        if not automatic:
            update.message.reply_text("⚠️ Error fetching appointments. Please try again.")

def start(update: Update, context: CallbackContext):
    """Handler for /start command"""
    update.message.reply_text(
        "👋 Hello! I'm your appointment notification bot.\n"
        "I'll notify you about new appointments in this chat.\n\n"
        "Commands:\n"
        "/appointments - Check for new appointments\n"
        "/notify - Enable automatic notifications\n"
        "/chatid - Get your chat ID"
    )

def list_appointments(update: Update, context: CallbackContext):
    """Handler for /appointments command"""
    handle_appointments(update, context)

def check_new_appointments(context: CallbackContext):
    """Periodic check for new appointments"""
    handle_appointments(None, context, automatic=True)

def register_notifications(update: Update, context: CallbackContext):
    """Register chat for automatic notifications"""
    try:
        chat_id = update.message.chat_id
        
        # Add subscriber to database
        if Database.add_telegram_subscriber(chat_id):
            # Remove existing job if any
            current_jobs = context.job_queue.get_jobs_by_name(str(chat_id))
            for job in current_jobs:
                job.schedule_removal()
            
            # Add new job
            context.job_queue.run_repeating(
                check_new_appointments,
                interval=300.0,  # 5 minutes
                first=0.0,
                context=chat_id,
                name=str(chat_id)
            )
            
            update.message.reply_text(
                "🔔 You will now receive automatic notifications about new appointments.\n"
                "Notifications will arrive every 5 minutes if new appointments exist."
            )
        else:
            update.message.reply_text("⚠️ Failed to register for notifications. Please try again.")
    except Exception as e:
        logger.error(f"Error registering notifications: {e}")
        update.message.reply_text("⚠️ Failed to setup notifications. Please try again.")

def get_chat_id(update: Update, context: CallbackContext):
    """Handler for /chatid command"""
    update.message.reply_text(f"Your chat ID: {update.message.chat_id}")

def start_telegram_bot():
    """Start the Telegram bot"""
    if not Config.TELEGRAM_BOT_TOKEN:
        logger.warning("Telegram bot token not configured - skipping bot startup")
        return

    try:
        # Verify services
        EncryptionService()
        Database.get_connection()  # Test connection
        
        updater = Updater(Config.TELEGRAM_BOT_TOKEN, use_context=True)
        dp = updater.dispatcher
        
        # Add handlers
        dp.add_handler(CommandHandler("start", start))
        dp.add_handler(CommandHandler("appointments", list_appointments))
        dp.add_handler(CommandHandler("notify", register_notifications))
        dp.add_handler(CommandHandler("chatid", get_chat_id))
        
        logger.info("Telegram bot started successfully")
        updater.start_polling()
    except Exception as e:
        logger.critical(f"Failed to start Telegram bot: {e}")
        raise

# API Endpoints
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

@app.route('/book-appointment', methods=['POST'])
@error_handler
def book_appointment():
    """Optimized appointment booking endpoint"""
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

@app.route('/health')
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

@app.route('/register-telegram', methods=['POST'])
@error_handler
def register_telegram():
    """Register Telegram chat for notifications"""
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
        
        # Start Telegram bot in a separate thread if configured
        if Config.TELEGRAM_BOT_TOKEN:
            import threading
            bot_thread = threading.Thread(target=start_telegram_bot, daemon=True)
            bot_thread.start()
            logger.info("Telegram bot started in background thread")
        
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