import difflib
import logging
from typing import Tuple, List, Dict, Set
import json
import os
from collections import defaultdict
import nltk
from nltk.tokenize import sent_tokenize
from nltk.corpus import stopwords
import yaml
import re
from dataclasses import dataclass
from datetime import datetime

@dataclass
class DuplicateMatch:
    """Data class to store information about duplicate matches"""
    original_text: str
    matched_template: str
    similarity_score: float
    section_type: str
    suggested_improvement: str

class DuplicateContentChecker:
    def __init__(self, custom_templates_path: str = None):
        """
        Initialize the duplicate content checker with enhanced capabilities.
        
        Args:
            custom_templates_path (str): Optional path to custom templates YAML file
        """
        self.setup_logging()
        self.load_nltk_resources()
        
        # Initialize template categories
        self.template_categories = {
            'objective': self._load_objective_templates(),
            'skills': self._load_skill_templates(),
            'experience': self._load_experience_templates(),
            'education': self._load_education_templates(),
            'general': self._load_general_templates()
        }
        
        # Load custom templates if provided
        if custom_templates_path:
            self.load_custom_templates(custom_templates_path)
        
        self.stop_words = set(stopwords.words('english'))

    def setup_logging(self):
        """Configure logging with detailed formatting"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s',
            handlers=[
                logging.FileHandler('duplicate_checker.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)

    def load_nltk_resources(self):
        """Download required NLTK resources"""
        try:
            nltk.download('punkt', quiet=True)
            nltk.download('stopwords', quiet=True)
        except Exception as e:
            self.logger.error(f"Failed to download NLTK resources: {str(e)}")

    def _load_template_category(self, templates: List[str], category: str) -> Dict[str, List[str]]:
        """Helper method to load and categorize templates"""
        return {
            'templates': templates,
            'category': category,
            'timestamp': datetime.now().isoformat()
        }

    def _load_objective_templates(self) -> List[str]:
        """Load objective statement templates"""
        return [
            "Seeking a challenging position in a dynamic organization where I can utilize my skills",
            "Looking to leverage my experience in {field} to contribute to a growing organization",
            "Ambitious professional seeking opportunities to grow and contribute in {industry}",
            "Detail-oriented {profession} seeking to bring value to a forward-thinking company"
        ]

    def _load_skill_templates(self) -> List[str]:
        """Load skill statement templates"""
        return [
            "Proficient in Microsoft Office Suite, including Word, Excel, and PowerPoint",
            "Strong problem-solving skills with the ability to work under pressure",
            "Excellent communication and interpersonal skills",
            "Detail-oriented with strong analytical and organizational abilities"
        ]

    def _load_experience_templates(self) -> List[str]:
        """Load experience statement templates"""
        return [
            "Responsible for managing day-to-day operations and improving efficiency",
            "Led a team of {number} professionals in delivering successful projects",
            "Increased efficiency by {percentage}% through process improvements",
            "Collaborated with cross-functional teams to achieve business objectives"
        ]

    def _load_education_templates(self) -> List[str]:
        """Load education statement templates"""
        return [
            "Bachelor's degree in {field} from {university}, graduated in {year}",
            "Master's degree in {field} with focus on {specialization}",
            "Completed coursework in {subjects}",
            "Relevant certifications: {certifications}"
        ]

    def _load_general_templates(self) -> List[str]:
        """Load general templates"""
        return [
            "References available upon request",
            "Experienced professional with a demonstrated history",
            "Track record of success in {field}",
            "Proven ability to deliver results in fast-paced environments"
        ]

    def load_custom_templates(self, file_path: str):
        """
        Load custom templates from a YAML file
        
        Args:
            file_path (str): Path to YAML file containing custom templates
        """
        try:
            with open(file_path, 'r') as file:
                custom_templates = yaml.safe_load(file)
                for category, templates in custom_templates.items():
                    if category in self.template_categories:
                        self.template_categories[category].extend(templates)
                    else:
                        self.template_categories[category] = templates
            self.logger.info(f"Successfully loaded custom templates from {file_path}")
        except Exception as e:
            self.logger.error(f"Error loading custom templates: {str(e)}")

    def preprocess_text(self, text: str) -> str:
        """
        Preprocess text for comparison
        
        Args:
            text (str): Input text to preprocess
            
        Returns:
            str: Preprocessed text
        """
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters and extra whitespace
        text = re.sub(r'[^\w\s]', '', text)
        text = ' '.join(text.split())
        
        # Remove stopwords
        words = text.split()
        words = [word for word in words if word not in self.stop_words]
        
        return ' '.join(words)

    def check_duplicate_content(self, resume_text: str, threshold: float = 0.85) -> Tuple[bool, List[DuplicateMatch]]:
        """
        Check if resume contains duplicated content from templates with enhanced analysis
        
        Args:
            resume_text (str): Extracted text from resume
            threshold (float): Similarity threshold (default: 85%)
            
        Returns:
            Tuple[bool, List[DuplicateMatch]]: Tuple containing boolean and list of matches
        """
        try:
            duplicate_matches = []
            sentences = sent_tokenize(resume_text)
            
            for sentence in sentences:
                preprocessed_sentence = self.preprocess_text(sentence)
                
                for category, templates in self.template_categories.items():
                    for template in templates:
                        preprocessed_template = self.preprocess_text(template)
                        similarity = difflib.SequenceMatcher(
                            None,
                            preprocessed_template,
                            preprocessed_sentence
                        ).ratio()
                        
                        if similarity >= threshold:
                            match = DuplicateMatch(
                                original_text=sentence,
                                matched_template=template,
                                similarity_score=similarity,
                                section_type=category,
                                suggested_improvement=self.generate_improvement_suggestion(category)
                            )
                            duplicate_matches.append(match)
            
            has_duplicates = len(duplicate_matches) > 0
            self.logger.info(f"Found {len(duplicate_matches)} duplicate matches")
            
            return has_duplicates, duplicate_matches
            
        except Exception as e:
            self.logger.error(f"Error checking duplicate content: {str(e)}")
            return False, []

    def generate_improvement_suggestion(self, category: str) -> str:
        """
        Generate specific improvement suggestions based on the category
        
        Args:
            category (str): Category of the template matched
            
        Returns:
            str: Improvement suggestion
        """
        suggestions = {
            'objective': "Make your objective more specific to the role and company you're applying to",
            'skills': "Quantify your skills with specific examples and achievements",
            'experience': "Use action verbs and include specific metrics/results",
            'education': "Focus on relevant coursework and academic achievements",
            'general': "Replace with specific, concrete examples from your experience"
        }
        
        return suggestions.get(category, "Make this section more specific and unique to your experience")

    def generate_report(self, duplicate_matches: List[DuplicateMatch]) -> Dict:
        """
        Generate a detailed report of duplicate content analysis
        
        Args:
            duplicate_matches (List[DuplicateMatch]): List of duplicate matches
            
        Returns:
            Dict: Detailed analysis report
        """
        report = {
            'timestamp': datetime.now().isoformat(),
            'total_matches': len(duplicate_matches),
            'categories': defaultdict(int),
            'matches': [],
            'summary': '',
            'improvement_suggestions': set()
        }
        
        for match in duplicate_matches:
            report['categories'][match.section_type] += 1
            report['matches'].append({
                'original_text': match.original_text,
                'template_matched': match.matched_template,
                'similarity_score': f"{match.similarity_score:.2%}",
                'category': match.section_type,
                'suggestion': match.suggested_improvement
            })
            report['improvement_suggestions'].add(match.suggested_improvement)
        
        report['summary'] = self._generate_summary(report)
        return report

    def _generate_summary(self, report: Dict) -> str:
        """Generate a summary of the analysis"""
        if report['total_matches'] == 0:
            return "No duplicate content detected. The resume appears to be original."
        
        category_summary = ", ".join(
            f"{category}: {count}" for category, count in report['categories'].items()
        )
        
        return (
            f"Found {report['total_matches']} instances of potential duplicate content. "
            f"Breakdown by category: {category_summary}. "
            f"Consider implementing the provided improvement suggestions to make your resume more unique."
        )

if __name__ == "__main__":
    # Example usage
    checker = DuplicateContentChecker()
    
    sample_resume = """
    Seeking a challenging position in a dynamic organization where I can utilize my skills.
    I am a detail-oriented professional with strong analytical abilities.
    Led a team of 5 professionals in delivering successful projects with measurable outcomes.
    """
    
    has_duplicates, matches = checker.check_duplicate_content(sample_resume)
    
    if has_duplicates:
        report = checker.generate_report(matches)
        print(json.dumps(report, indent=2, default=str))
    else:
        print("No duplicate content detected.")