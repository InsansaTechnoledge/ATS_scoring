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

                # Sentence Length Check (excluding bullet points & SKILLS section)
                if not is_bullet and section_name != 'SKILLS':
                    words = line.split()
                    if len(words) > 40:
                        problematic_text = " ".join(words[:10]) + "..."  # Show partial long sentence
                        section_issues.append({
                            'error': problematic_text,
                            'suggestions': ["Consider breaking this sentence into smaller ones"],
                            'category': 'LONG_SENTENCE',
                            'message': 'Sentence is too long (over 40 words)',
                            'section': section_name
                        })
                
                # Weak Verbs Check (only for EXPERIENCE, PROJECTS)
                if is_bullet and section_name in ['EXPERIENCE', 'PROJECTS']:
                    for pattern, replacements in self.style_rules.get_weak_verbs().items():
                        match = re.search(pattern, line, re.IGNORECASE)
                        if match:
                            section_issues.append({
                                'error': match.group(0),  # Show the exact weak verb
                                'suggestions': replacements,
                                'category': 'WEAK_VERB',
                                'message': f"Consider using stronger action verbs: {', '.join(replacements)}",
                                'section': section_name
                            })
                
                # Technical Terms Capitalization Check
                for term, correct in self.style_rules.get_technical_terms().items():
                    match = re.search(r'\b' + term + r'\b', line, re.IGNORECASE)
                    if match and not re.search(r'\b' + correct + r'\b', line):
                        section_issues.append({
                            'error': match.group(0),  # Show the incorrect capitalization
                            'suggestions': [f"Use correct capitalization: {correct}"],
                            'category': 'TECHNICAL_TERM',
                            'message': f"Technical term '{match.group(0)}' should be '{correct}'",
                            'section': section_name
                        })
                
                # Check Punctuation Issues
                punctuation_issues = self.text_utils.check_punctuation(line, is_bullet)
                section_issues.extend(punctuation_issues)
            
            return section_issues
        except Exception as e:
            logging.error(f"Error analyzing section {section_name}: {str(e)}")
            return []
