from werkzeug.utils import secure_filename
from werkzeug.datastructures import FileStorage
from config import Config
import uuid
import os

def validate_file(file: FileStorage) -> str:
    """Validate uploaded file"""
    if file.filename == '':
        return 'No file selected'
    
    if not file.filename.lower().endswith(('.pdf', '.docx', '.doc')):
        return 'Invalid file type. Use PDF or DOCX'
    
    return None

def save_uploaded_file(file: FileStorage) -> str:
    """Save uploaded file temporarily and return file path"""
    filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
    file_path = os.path.join(Config.UPLOAD_FOLDER, filename)
    file.save(file_path)
    return file_path

def cleanup_file(file_path: str) -> None:
    # """Remove temporary file"""
    # if file_path and os.path.exists(file_path):
    #     os.remove(file_path)
    pass

def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS