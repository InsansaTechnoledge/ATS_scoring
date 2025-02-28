"""
Main class for grammar checking functionality.
"""
import spacy
import logging
from typing import List, Dict, Union

from Grammar.core.style_rules import StyleRules
from Grammar.core.section_analyzer import SectionAnalyzer
from Grammar.core.text_utils import TextUtils
from Grammar.analyzers.readability_analyzer import ReadabilityAnalyzer
from Grammar.analyzers.grammar_analyzer import GrammarAnalyzer
from Grammar.analyzers.passive_voice_analyzer import PassiveVoiceAnalyzer
from Grammar.utils.logging_config import setup_logging


class GrammarChecker:
    def __init__(self, language: str = "en-US", spacy_model: str = "en_core_web_sm"):
        """Initialize the enhanced grammar checker"""
        try:
            self.nlp = spacy.load(spacy_model)
            setup_logging()
            self.style_rules = StyleRules()
            self.section_analyzer = SectionAnalyzer(self.style_rules)
            self.text_utils = TextUtils()
            self.readability_analyzer = ReadabilityAnalyzer()
            self.grammar_analyzer = GrammarAnalyzer(self.nlp, self.style_rules, self.text_utils)
            self.passive_voice_analyzer = PassiveVoiceAnalyzer(self.nlp)
        except Exception as e:
            logging.error(f"Initialization error: {str(e)}")
            raise

    def check_grammar(self, text: str) -> List[Dict[str, str]]:
        """Enhanced grammar check that works with any resume format"""
        try:
            doc = self.nlp(text)
            issues = []
            
            # Split into sections for context-aware analysis
            sections = self.section_analyzer.detect_resume_sections(text)
            
            for section_name, section_content in sections.items():
                section_issues = self.grammar_analyzer.analyze_section(section_name, section_content)
                issues.extend(section_issues)
            
            return issues
            
        except Exception as e:
            logging.error(f"Grammar check error: {str(e)}")
            return []

    def check_passive_voice(self, text: str) -> List[str]:
        """Identify passive voice usage with context awareness"""
        return self.passive_voice_analyzer.analyze(text)

    def analyze_readability(self, text: str) -> Dict[str, float]:
        """Compute comprehensive readability metrics"""
        return self.readability_analyzer.analyze(text)

    def get_improvement_suggestions(self, text: str) -> Dict[str, List[str]]:
        """Generate improvement suggestions based on comprehensive analysis"""
        try:
            sections = self.section_analyzer.detect_resume_sections(text)
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
                bullets = [line for line in content.split('\n') if self.text_utils.is_bullet_point(line)]
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
            for term in self.style_rules.get_technical_terms().values():
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