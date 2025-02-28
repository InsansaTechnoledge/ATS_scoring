import os

# File paths
RESULTS_FILE = "file_history.json"
BACKUP_DIR = "backups"

# Cache settings
CACHE_EXPIRY_SECONDS = 86400  # 24 hours
CACHE_CLEANUP_INTERVAL = 3600  # 1 hour

# Scoring weights
COMPONENT_WEIGHTS = {
    "sections": 0.15,
    "grammar": 0.15,
    "active_voice": 0.1,
    "buzzwords": 0.1,
    "keyword_match": 0.3,
    "action_verbs": 0.2
}

# Required resume sections
REQUIRED_SECTIONS = {
    "SUMMARY": ["profile summary", "summary"],
    "EXPERIENCE": ["work experience", "experience"],
    "EDUCATION": ["education", "academic background"], 
    "SKILLS": ["skills", "key skills"],
    "PROJECTS": ["projects", "personal projects", "professional projects"],
    "CERTIFICATES": ["certificates", "certifications", "training"]
}

