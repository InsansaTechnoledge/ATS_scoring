import os

class Config:
    """Application configuration"""
    
    # Flask settings
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    
    # Upload settings
    UPLOAD_FOLDER = 'uploads'
    ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc'}
    
    # API settings
    API_VERSION = '1.0.0'
    DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    
    # Processing settings
    MAX_TEXT_LENGTH = 2000  # For grammar checking
    MAX_KEYWORDS = 10       # Limit keywords in response
    
    @staticmethod
    def init_app(app):
        """Initialize application with config"""
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)