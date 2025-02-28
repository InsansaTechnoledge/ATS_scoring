# grammar_checker.py

import spacy
import textstat
from typing import List, Dict, Union, Set
import re
from collections import Counter
import logging
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

class GrammarChecker:
    def __init__(self, language: str = "en-US", spacy_model: str = "en_core_web_sm"):
        """Initialize the enhanced grammar checker"""
        try:
            self.nlp = spacy.load(spacy_model)
            self.setup_logging()
            self.load_style_rules()
        except Exception as e:
            logging.error(f"Initialization error: {str(e)}")
            raise

    def setup_logging(self):
        """Configure logging for the grammar checker"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )

    def load_style_rules(self):
        """Load generic resume style and grammar rules that work for any format"""
        self.style_rules = {
            # Common weak verbs found in any resume
            'weak_verbs': {
                r'\bwork(ed)?\s+on\b': ['developed', 'engineered', 'implemented'],
                r'\bhelp(ed)?\b': ['led', 'coordinated', 'facilitated'],
                r'\bwas\s+responsible\s+for\b': ['managed', 'directed', 'orchestrated'],
                r'\buse(d)?\b': ['leveraged', 'utilized', 'implemented'],
                r'\bmade\b': ['created', 'developed', 'designed'],
                r'\bassist(ed)?\b': ['facilitated', 'coordinated', 'managed'],
                r'\bdo(ne)?\b': ['completed', 'executed', 'delivered'],
                r'\btry|tried\b': ['implemented', 'executed', 'achieved']
            },
            # Technical terms with correct capitalization
            'technical_terms': {
                'javascript': 'JavaScript',
                'typescript': 'TypeScript',
                'nodejs': 'Node.js',
                'reactjs': 'ReactJS',
                'react': 'React',
                'mongodb': 'MongoDB',
                'mysql': 'MySQL',
                'postgresql': 'PostgreSQL',
                'github': 'GitHub',
                'gitlab': 'GitLab',
                'api': 'API',
                'rest': 'REST',
                'aws': 'AWS',
                'docker': 'Docker',
                'kubernetes': 'Kubernetes',
                'linux': 'Linux',
                'unix': 'Unix',
                'ai': 'AI',
                'ml': 'ML',
                'css': 'CSS',
                'html': 'HTML'
            },
            # Resume sections and their variations
            'section_patterns': {
                'EDUCATION': r'(?i)(education|academic|qualification|degree|studies)',
                'EXPERIENCE': r'(?i)(experience|employment|work|career|history)',
                'SKILLS': r'(?i)(skills|expertise|competencies|proficiencies|technical)',
                'PROJECTS': r'(?i)(projects|portfolio|works)',
                'ACHIEVEMENTS': r'(?i)(achievements|accomplishments|awards|honors)',
                'CERTIFICATIONS': r'(?i)(certifications|certificates|credentials)',
                'SUMMARY': r'(?i)(summary|profile|objective|about)',
                'ACTIVITIES': r'(?i)(activities|involvement|leadership|volunteer)'
            }
        }

    def _detect_resume_sections(self, text: str) -> Dict[str, str]:
        """Intelligently detect resume sections regardless of format"""
        sections = {}
        lines = text.split('\n')
        current_section = 'OTHER'
        current_content = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Check if line is a section header
            section_found = False
            for section, pattern in self.style_rules['section_patterns'].items():
                if re.search(pattern, line, re.IGNORECASE) and len(line) < 50:
                    if current_content:
                        sections[current_section] = '\n'.join(current_content)
                    current_section = section
                    current_content = []
                    section_found = True
                    break
            
            if not section_found:
                current_content.append(line)
        
        # Add last section
        if current_content:
            sections[current_section] = '\n'.join(current_content)
            
        return sections

    def _is_bullet_point(self, line: str) -> bool:
        """Detect bullet points in any format"""
        bullet_patterns = [
            r'^\s*[\•\-\*\⋄\◦\○\▪\▫\-]\s',  # Common bullet point characters
            r'^\s*\d+\.',  # Numbered lists
            r'^\s*[a-zA-Z]\)',  # Letter lists
            r'^\s*\[\+\*\]\s',  # Task list items
            r'^\s*\d+\)',  # Numbered with parentheses
        ]
        return any(re.match(pattern, line) for pattern in bullet_patterns)

    def _check_punctuation(self, line: str, is_bullet: bool = False) -> List[Dict[str, str]]:
        """Check for punctuation errors with context awareness"""
        issues = []
        
        # Skip checks for certain patterns
        skip_patterns = {
            r'\d+\.\d+',  # Decimal numbers
            r'\w+\.\w+',  # File extensions or web addresses
            r'\w+@\w+\.\w+',  # Email addresses
            r'\b[A-Z][a-z]*\.[A-Z][a-z]*',  # Abbreviated names
            r'\b[A-Z]{2,}\b'  # Acronyms
        }
        
        # Check each character in the line
        for match in re.finditer(r'[,\.\!\?](?!\s)', line):
            pos = match.start()
            # Skip if part of excepted pattern
            skip = False
            for pattern in skip_patterns:
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

    def check_grammar(self, text: str) -> List[Dict[str, str]]:
        """Enhanced grammar check that works with any resume format"""
        try:
            doc = self.nlp(text)
            issues = []
            
            # Split into sections for context-aware analysis
            sections = self._detect_resume_sections(text)
            
            for section_name, section_content in sections.items():
                section_issues = []
                
                # Process each line in the section
                for line in section_content.split('\n'):
                    line = line.strip()
                    if not line:
                        continue
                    
                    # Check if line is a bullet point
                    is_bullet = self._is_bullet_point(line)
                    
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
                        for pattern, replacements in self.style_rules['weak_verbs'].items():
                            if re.search(pattern, line, re.IGNORECASE):
                                section_issues.append({
                                    'error': line,
                                    'suggestions': replacements,
                                    'category': 'WEAK_VERB',
                                    'message': f"Consider using stronger action verbs: {', '.join(replacements)}",
                                    'section': section_name
                                })
                    
                    # Technical term capitalization check
                    for term, correct in self.style_rules['technical_terms'].items():
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
                    punctuation_issues = self._check_punctuation(line, is_bullet)
                    section_issues.extend(punctuation_issues)
                
                issues.extend(section_issues)
            
            return issues
            
        except Exception as e:
            logging.error(f"Grammar check error: {str(e)}")
            return []

    def check_passive_voice(self, text: str) -> List[str]:
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

    def analyze_readability(self, text: str) -> Dict[str, float]:
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

    def get_improvement_suggestions(self, text: str) -> Dict[str, List[str]]:
        """Generate improvement suggestions based on comprehensive analysis"""
        try:
            sections = self._detect_resume_sections(text)
            suggestions = {
                'content_suggestions': [],
                'style_suggestions': [],
                'technical_suggestions': [],
                'formatting_suggestions': []
            }
            
            # Analyze each section
            for section_name, content in sections.items():
                # Check section length
                if len(content.split()) < 30 and section_name in ['EXPERIENCE', 'PROJECTS']:
                    suggestions['content_suggestions'].append(
                        f"Add more detail to your {section_name.lower()} section"
                    )
                
                # Check bullet point consistency
                bullets = [line for line in content.split('\n') if self._is_bullet_point(line)]
                if bullets and section_name in ['EXPERIENCE', 'PROJECTS']:
                    # Check for action verbs at start
                    weak_starts = sum(1 for b in bullets 
                                    if not any(b.strip().lower().startswith(verb) 
                                             for verb in ['developed', 'created', 'implemented']))
                    if weak_starts > len(bullets) / 2:
                        suggestions['style_suggestions'].append(
                            f"Start more bullet points with strong action verbs in {section_name.lower()} section"
                        )
            
            # Technical term consistency
            tech_terms = set()
            for term in self.style_rules['technical_terms'].values():
                if term.lower() in text.lower():
                    tech_terms.add(term)
            
            if tech_terms:
                suggestions['technical_suggestions'].append(
                    "Maintain consistent capitalization for technical terms: " + 
                    ", ".join(sorted(tech_terms))
                )
            
            return suggestions
            
        except Exception as e:
            logging.error(f"Error generating suggestions: {str(e)}")
            return {
                'content_suggestions': [],
                'style_suggestions': [],
                'technical_suggestions': [],
                'formatting_suggestions': []
            }