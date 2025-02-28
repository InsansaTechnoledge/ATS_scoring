"""
Analyzer for text readability metrics.
"""
import textstat
import logging
from typing import Dict


class ReadabilityAnalyzer:
    def __init__(self):
        """Initialize readability analyzer"""
        pass

    def analyze(self, text: str) -> Dict[str, float]:
        """Compute comprehensive readability metrics"""
        try:
            scores = {
                "Flesch Reading Ease": textstat.flesch_reading_ease(text),
                "Gunning Fog Index": textstat.gunning_fog(text),
                "SMOG Index": textstat.smog_index(text),
                "Automated Readability Index": textstat.automated_readability_index(text),
                "Coleman Liau Index": textstat.coleman_liau_index(text),
                "Dale Chall Readability": textstat.dale_chall_readability_score(text),
                "Difficult Words": textstat.difficult_words(text),
                "Syllable Count": textstat.syllable_count(text)
            }
            return scores
        except Exception as e:
            logging.error(f"Readability analysis error: {str(e)}")
            return {}