import textstat
import logging
from typing import Dict


class ReadabilityAnalyzer:
    """Analyzer for text readability metrics"""
    
    def __init__(self):
        """Initialize readability analyzer"""
        self.logger = logging.getLogger(__name__)

    def analyze(self, text: str) -> Dict[str, float]:
        """Compute comprehensive readability metrics"""
        if not text or not text.strip():
            return {}
            
        try:
            scores = {
                "flesch_reading_ease": textstat.flesch_reading_ease(text),
                "gunning_fog_index": textstat.gunning_fog(text),
                "smog_index": textstat.smog_index(text),
                "automated_readability_index": textstat.automated_readability_index(text),
                "coleman_liau_index": textstat.coleman_liau_index(text),
                "dale_chall_readability": textstat.dale_chall_readability_score(text),
                "difficult_words": textstat.difficult_words(text),
                "syllable_count": textstat.syllable_count(text),
                "reading_time": self._calculate_reading_time(text)
            }
            return scores
        except Exception as e:
            self.logger.error(f"Readability analysis error: {str(e)}")
            return {}
    
    def _calculate_reading_time(self, text: str) -> float:
        """Calculate estimated reading time in minutes"""
        word_count = len(text.split())
        # Average reading speed: 200-250 words per minute
        reading_time = word_count / 225
        return round(reading_time, 2)