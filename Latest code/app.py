from flask import Flask
from api.routes import api_bp
from config import Config
import nltk
from flask_cors import CORS
 
# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
 
def create_app():
    """Application factory"""
    app = Flask(__name__)
    app.config.from_object(Config)
   
    # Configure CORS for port 5173 (Vite dev server)
    CORS(app, resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:3000",  # Keep this for standard React apps
                "http://127.0.0.1:3000"
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "expose_headers": ["Content-Range", "X-Content-Range"]
        }
    })
   
    # Initialize config
    Config.init_app(app)
   
    # Register blueprints
    app.register_blueprint(api_bp)
   
    return app
 
if __name__ == "__main__":
    app = create_app()
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000
    )
 



# from flask import Flask
# from api.routes import api_bp
# from config import Config
# import nltk

# # Download required NLTK data
# try:
#     nltk.data.find('tokenizers/punkt')
# except LookupError:
#     nltk.download('punkt')

# def create_app():
#     """Application factory"""
#     app = Flask(__name__)
#     app.config.from_object(Config)
    
#     # Initialize config
#     Config.init_app(app)
    
#     # Register blueprints
#     app.register_blueprint(api_bp)
    
#     return app

# if __name__ == "__main__":
#     app = create_app()
#     app.run(
#         debug=Config.DEBUG, 
#         host='0.0.0.0', 
#         port=5000
#     )