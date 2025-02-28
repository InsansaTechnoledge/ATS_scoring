"""
Analyzer for grammar and style issues.
"""
import re
import logging
from typing import List, Dict
import spacy

from Grammar.core.style_rules import StyleRules
from Grammar.core.text_utils import TextUtils


class GrammarAnalyzer:
    def __init__(self, nlp, style_rules: StyleRules, text_utils: TextUtils):
        """Initialize grammar analyzer"""
        self.nlp = nlp
        self.style_rules = style_rules
        self.text_utils = text_utils

    def analyze_section(self, section_name: str, section_content: str) -> List[Dict[str, str]]:
        """Analyze a specific section for grammar and style issues"""
        section_issues = []
        
        try:
            # Process each line in the section
            for line in section_content.split('\n'):
                line = line.strip()
                if not line:
                    continue
                
                # Check if line is a bullet point
                is_bullet = self.text_utils.is_bullet_point(line)
                
                # Check sentence length (skip for bullet points and skills lists)
                if not is_bullet and not section_name == 'SKILLS':
                    if len(line.split()) > 40:
                        section_issues.append({
                            'error': line,
                            'suggestions': ["Consider breaking this sentence into smaller ones"],
                            'category': 'LONG_SENTENCE',
                            'message': 'Sentence is too long (over 40 words)',
                            'section': section_name
                        })
                
                # Check for weak verbs
                if is_bullet and section_name in ['EXPERIENCE', 'PROJECTS']:
                    for pattern, replacements in self.style_rules.get_weak_verbs().items():
                        if re.search(pattern, line, re.IGNORECASE):
                            section_issues.append({
                                'error': line,
                                'suggestions': replacements,
                                'category': 'WEAK_VERB',
                                'message': f"Consider using stronger action verbs: {', '.join(replacements)}",
                                'section': section_name
                            })
                
                # Technical term capitalization check
                for term, correct in self.style_rules.get_technical_terms().items():
                    if re.search(r'\b' + term + r'\b', line, re.IGNORECASE):
                        if not re.search(r'\b' + correct + r'\b', line):
                            section_issues.append({
                                'error': line,
                                'suggestions': [f"Use correct capitalization: {correct}"],
                                'category': 'TECHNICAL_TERM',
                                'message': f"Technical term '{term}' should be '{correct}'",
                                'section': section_name
                            })
                
                # Check punctuation
                punctuation_issues = self.text_utils.check_punctuation(line, is_bullet)
                section_issues.extend(punctuation_issues)
            
            return section_issues
        except Exception as e:
            logging.error(f"Error analyzing section {section_name}: {str(e)}")
            return []