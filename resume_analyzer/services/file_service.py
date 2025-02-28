import os
import json
import datetime
import logging
from config import RESULTS_FILE, BACKUP_DIR

logger = logging.getLogger(__name__)

def load_results():
    """Load saved analysis results from file"""
    if os.path.exists(RESULTS_FILE):
        try:
            with open(RESULTS_FILE, "r") as file:
                return json.load(file)
        except json.JSONDecodeError:
            logger.error("Error loading results file, creating new one")
            return {}
    return {}

def save_results(data):
    """Save analysis results to file with backup"""
    # Create a backup first
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = os.path.join(BACKUP_DIR, f"file_history_{timestamp}.json")
    
    try:
        # Save backup
        with open(backup_path, "w") as file:
            json.dump(data, file, indent=4)
        
        # Save main file
        with open(RESULTS_FILE, "w") as file:
            json.dump(data, file, indent=4)
            
        # Remove old backups (keep only last 10)
        cleanup_backups()
    except Exception as e:
        logger.error(f"Error saving results: {str(e)}")

def cleanup_backups():
    """Keep only the 10 most recent backups"""
    backup_files = [os.path.join(BACKUP_DIR, f) for f in os.listdir(BACKUP_DIR) 
                   if f.startswith("file_history_") and f.endswith(".json")]
    if len(backup_files) > 10:
        backup_files.sort()
        for old_file in backup_files[:-10]:
            try:
                os.remove(old_file)
            except Exception as e:
                logger.error(f"Failed to remove old backup {old_file}: {str(e)}")