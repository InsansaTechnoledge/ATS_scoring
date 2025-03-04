import hashlib
import datetime
import re
from config import COMPONENT_WEIGHTS, REQUIRED_SECTIONS

class ResumeAnalysisResult:
    """Model representing the result of a resume analysis"""
    
    def __init__(self, filename, text_content):
        self.filename = filename
        self.text_content = text_content
        self.unique_id = hashlib.md5(filename.encode()).hexdigest()
        self.timestamp = datetime.datetime.utcnow().isoformat()
        self.word_count = len(text_content.split())
        
        # Analysis results (to be filled by analyzer)
        self.score = 0
        self.detailed_scores = {}
        self.sections_present = []
        self.sections_missing = []
        self.formatting_issues = []
        self.grammar_issues_count = 0
        self.passive_voice_count = 0
        self.industry = ""
        self.recommendations = []
        self.messages = []
        self.buzz_words = []
    
    def to_dict(self):
        """Convert analysis result to dictionary"""
        return {
            self.unique_id: {
                "filename": self.filename,
                "last_checked": self.timestamp,
                "result": {
                    "score": max(0, int(self.score)),
                    "component_scores": self.detailed_scores,
                    "messages": self.messages,
                    "file_type": "application/pdf",
                    "word_count": self.word_count,
                    "sections_present": self.sections_present,
                    "sections_missing": self.sections_missing,
                    "formatting_issues": self.formatting_issues,
                    "recommendations": self.recommendations,
                    "industry": self.industry,
                    "buzz_words": self.buzz_words
                }
            }
        }
    
    def calculate_final_score(self):
        """Calculate final score based on component scores"""
        self.score = sum(score * COMPONENT_WEIGHTS[component] 
                    for component, score in self.detailed_scores.items())
        return self.score
    
    def set_messages(self):
        """Set the messages based on analysis results"""
        self.messages = [
            f"Grammar Issues: {self.grammar_issues_count}",
            f"Passive Voice Instances: {self.passive_voice_count}",
            f"Word Count: {self.word_count} words",
            f"Missing Sections: {', '.join(self.sections_missing) if self.sections_missing else 'None'}",
            f"Job Description Keyword Match: {self.detailed_scores.get('keyword_match', 0)}%",
            f"Detected Industry: {self.industry.capitalize() if self.industry else 'General'}"
        ]