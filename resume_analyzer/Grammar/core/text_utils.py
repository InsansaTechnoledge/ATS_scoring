"""
Utility functions for text processing.
"""
import re
import logging
from typing import List, Dict


class TextUtils:
    def __init__(self):
        """Initialize text utilities"""
        self.skip_patterns = {
            r'\d+\.\d+',  # Decimal numbers
            r'\w+\.\w+',  # File extensions or web addresses
            r'\w+@\w+\.\w+',  # Email addresses
            r'\b[A-Z][a-z]*\.[A-Z][a-z]*',  # Abbreviated names
            r'\b[A-Z]{2,}\b'  # Acronyms
        }

    def is_bullet_point(self, line: str) -> bool:
        """Detect bullet points in any format"""
        bullet_patterns = [
            r'^\s*[\•\-\*\⋄\◦\○\▪\▫\-]\s',  # Common bullet point characters
            r'^\s*\d+\.',  # Numbered lists
            r'^\s*[a-zA-Z]\)',  # Letter lists
            r'^\s*\[\+\*\]\s',  # Task list items
            r'^\s*\d+\)',  # Numbered with parentheses
        ]
        return any(re.match(pattern, line) for pattern in bullet_patterns)

    def check_punctuation(self, line: str, is_bullet: bool = False) -> List[Dict[str, str]]:
        """Check for punctuation errors with context awareness"""
        issues = []
        
        try:
            # Check each character in the line
            for match in re.finditer(r'[,\.\!\?](?!\s)', line):
                pos = match.start()
                # Skip if part of excepted pattern
                skip = False
                for pattern in self.skip_patterns:
                    if re.search(pattern, line[max(0, pos-10):pos+10]):
                        skip = True
                        break
                
                if not skip:
                    issues.append({
                        'error': line[max(0, pos-10):pos+10],
                        'suggestions': ["Add space after punctuation"],
                        'category': 'PUNCTUATION',
                        'message': 'Missing space after punctuation mark'
                    })
                    
            return issues
        except Exception as e:
            logging.error(f"Error checking punctuation: {str(e)}")
            return []