from flask import Flask
from flask_cors import CORS
import logging
import os
from api.routes import register_routes

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("resume_analyzer.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}})
    
    # Create necessary directories
    os.makedirs("backups", exist_ok=True)
    
    # Register routes
    register_routes(app)
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)