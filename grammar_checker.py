import language_tool_python
import textstat
from typing import List, Dict, Union
import re
from collections import Counter
import spacy
import logging
from concurrent.futures import ThreadPoolExecutor

class GrammarChecker:
    """
    Enhanced grammar checker with resume-specific analysis capabilities.
    """
    
    def __init__(self, language: str = "en-US", spacy_model: str = "en_core_web_sm"):
        """
        Initialize the grammar checker with specified language and spaCy model.
        
        Args:
            language (str): Language code for grammar checking
            spacy_model (str): Name of spaCy model to use for NLP tasks
        """
        try:
            self.tool = language_tool_python.LanguageTool(language)
            self.nlp = spacy.load(spacy_model)
            self.setup_logging()
        except Exception as e:
            logging.error(f"Initialization error: {str(e)}")
            raise

    def setup_logging(self):
        """Configure logging for the grammar checker."""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )

    def check_grammar(self, text: str) -> List[Dict[str, str]]:
        """
        Check grammar mistakes with detailed context and categorization.
        
        Args:
            text (str): Text to analyze
            
        Returns:
            List[Dict]: List of grammar issues with detailed information
        """
        try:
            matches = self.tool.check(text)
            issues = []
            
            for match in matches:
                issue = {
                    'error': match.context,
                    'suggestions': match.replacements,
                    'category': match.category,
                    'rule_id': match.ruleId,
                    'message': match.message,
                    'position': (match.offset, match.offset + match.errorLength)
                }
                issues.append(issue)
            
            logging.info(f"Found {len(issues)} grammar issues")
            return issues
        except Exception as e:
            logging.error(f"Grammar check error: {str(e)}")
            return []

    def analyze_readability(self, text: str) -> Dict[str, float]:
        """
        Compute comprehensive readability metrics.
        
        Args:
            text (str): Text to analyze
            
        Returns:
            Dict[str, float]: Dictionary of readability scores
        """
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

    def analyze_resume_keywords(self, text: str, industry_keywords: List[str]) -> Dict[str, Union[int, List[str]]]:
        """
        Analyze presence of industry-specific keywords in the resume.
        
        Args:
            text (str): Resume text
            industry_keywords (List[str]): List of relevant industry keywords
            
        Returns:
            Dict: Analysis of keyword usage
        """
        try:
            doc = self.nlp(text.lower())
            words = [token.text for token in doc if not token.is_stop and not token.is_punct]
            
            keyword_matches = []
            for keyword in industry_keywords:
                if keyword.lower() in text.lower():
                    keyword_matches.append(keyword)
            
            return {
                'keyword_count': len(keyword_matches),
                'matched_keywords': keyword_matches,
                'keyword_density': len(keyword_matches) / len(words) if words else 0
            }
        except Exception as e:
            logging.error(f"Keyword analysis error: {str(e)}")
            return {}

    def check_passive_voice(self, text: str) -> List[str]:
        """
        Identify instances of passive voice in the text.
        
        Args:
            text (str): Text to analyze
            
        Returns:
            List[str]: Sentences containing passive voice
        """
        try:
            doc = self.nlp(text)
            passive_sentences = []
            
            for sent in doc.sents:
                if any(token.dep_ == "nsubjpass" for token in sent):
                    passive_sentences.append(sent.text)
            
            return passive_sentences
        except Exception as e:
            logging.error(f"Passive voice check error: {str(e)}")
            return []

    def get_improvement_suggestions(self, text: str) -> Dict[str, List[str]]:
        """
        Provide comprehensive improvement suggestions for the text.
        
        Args:
            text (str): Text to analyze
            
        Returns:
            Dict: Various improvement suggestions
        """
        suggestions = {
            'grammar_issues': self.check_grammar(text),
            'passive_voice': self.check_passive_voice(text),
            'readability_scores': self.analyze_readability(text),
            'style_suggestions': []
        }
        
        # Add style suggestions based on analysis
        readability = suggestions['readability_scores'].get('Flesch Reading Ease', 0)
        if readability < 40:
            suggestions['style_suggestions'].append("Consider simplifying language for better readability")
        
        if len(suggestions['passive_voice']) > 2:
            suggestions['style_suggestions'].append("Consider reducing use of passive voice")
        
        return suggestions

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.tool.close()