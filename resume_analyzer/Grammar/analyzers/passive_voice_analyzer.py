"""
Analyzer for passive voice detection.
"""
import logging
from typing import List


class PassiveVoiceAnalyzer:
    def __init__(self, nlp):
        """Initialize passive voice analyzer"""
        self.nlp = nlp

    def analyze(self, text: str) -> List[str]:
        """Identify passive voice usage with context awareness"""
        try:
            doc = self.nlp(text)
            passive_sentences = []
            
            for sent in doc.sents:
                # Check for passive voice construction
                if any(token.dep_ == "nsubjpass" for token in sent):
                    # Skip certain technical descriptions where passive might be appropriate
                    if not any(tech_term in sent.text.lower() 
                             for tech_term in ['implemented', 'deployed', 'developed']):
                        passive_sentences.append(sent.text)
            
            return passive_sentences
        except Exception as e:
            logging.error(f"Passive voice check error: {str(e)}")
            return []