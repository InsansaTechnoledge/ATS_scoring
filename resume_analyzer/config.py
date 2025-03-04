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
            'SUMMARY': (['profile summary', 'summary'], 0.10),
            'EXPERIENCE': (['work experience', 'experience'], 0.15),
            'EDUCATION': (['education', 'academic background'], 0.10),
            'SKILLS': (['skills', 'key skills'], 0.15),
            'CERTIFICATES': (['certificates', 'certifications', 'training'], 0.2),
            'PROJECTS': (['projects', 'personal projects', 'professional projects'], 0.15)
        }
