import nltk
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import json
import os
import logging
from typing import Dict, List, Tuple, Optional, Set
import re
from dataclasses import dataclass
from datetime import datetime
import pandas as pd
from collections import Counter
import spacy

@dataclass
class ProfileSection:
    """Data class to store section information"""
    name: str
    content: str
    word_count: int
    keywords: Set[str]
    score: float

@dataclass
class AnalysisResult:
    """Data class to store analysis results"""
    linkedin_compatibility: bool
    section_scores: Dict[str, float]
    missing_sections: List[str]
    job_match_score: Optional[float]
    improvement_suggestions: List[str]
    keyword_analysis: Dict[str, int]
    readability_metrics: Dict[str, float]

class LinkedInProfileAnalyzer:
    def __init__(self, config_file: str = 'config.json'):
        """
        Initialize the LinkedIn Profile Analyzer with enhanced capabilities.
        
        Args:
            config_file (str): Path to configuration file
        """
        self.setup_logging()
        self.load_nlp_resources()
        self.config = self.load_config(config_file)
        self.lemmatizer = WordNetLemmatizer()
        self.nlp = spacy.load('en_core_web_sm')
        
        # Initialize industry-specific keywords
        self.industry_keywords = self.load_industry_keywords()
        
    def setup_logging(self):
        """Configure logging system"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s',
            handlers=[
                logging.FileHandler('Logs/linkedin_analyzer.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)

    def load_nlp_resources(self):
        """Download required NLTK resources"""
        try:
            nltk.download('punkt', quiet=True)
            nltk.download('stopwords', quiet=True)
            nltk.download('wordnet', quiet=True)
            nltk.download('averaged_perceptron_tagger', quiet=True)
        except Exception as e:
            self.logger.error(f"Failed to download NLTK resources: {str(e)}")

    def load_config(self, config_file: str) -> Dict:
        """
        Load configuration from JSON file with error handling
        
        Args:
            config_file (str): Path to configuration file
            
        Returns:
            Dict: Configuration dictionary
        """
        try:
            if os.path.exists(config_file):
                with open(config_file, 'r') as f:
                    config = json.load(f)
                self.logger.info(f"Successfully loaded configuration from {config_file}")
                return config
            else:
                self.logger.warning(f"Config file not found at {config_file}. Using default configuration.")
                return self.get_default_config()
        except Exception as e:
            self.logger.error(f"Error loading config: {str(e)}")
            return self.get_default_config()

    def get_default_config(self) -> Dict:
        """Provide default configuration"""
        return {
            'required_sections': [
                'Summary',
                'Experience',
                'Education',
                'Skills',
                'Accomplishments',
            ],
            'recommended_lengths': {
                'Summary': {'min': 100, 'max': 300},
                'Experience': {'min': 200, 'max': 1000},
                'Education': {'min': 50, 'max': 200},
                'Skills': {'min': 100, 'max': 500}
            },
            'keyword_weights': {
                'technical_skills': 2.0,
                'soft_skills': 1.5,
                'industry_terms': 1.8
            }
        }

    def load_industry_keywords(self) -> Dict[str, Set[str]]:
        """Load industry-specific keywords"""
        # This could be expanded to load from external files
        return {
            'technical_skills': {
                'python', 'java', 'javascript', 'sql', 'aws', 'docker', 'kubernetes',
                'machine learning', 'data analysis', 'cloud computing'
            },
            'soft_skills': {
                'leadership', 'communication', 'teamwork', 'problem-solving',
                'project management', 'analytical', 'strategic thinking'
            },
            'industry_terms': {
                'agile', 'scrum', 'devops', 'ci/cd', 'digital transformation',
                'innovation', 'optimization', 'scalability'
            }
        }

    def preprocess_text(self, text: str) -> str:
        """
        Preprocess text for analysis
        
        Args:
            text (str): Input text
            
        Returns:
            str: Preprocessed text
        """
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters and extra whitespace
        text = re.sub(r'[^\w\s]', ' ', text)
        text = ' '.join(text.split())
        
        # Lemmatize words
        words = word_tokenize(text)
        words = [self.lemmatizer.lemmatize(word) for word in words 
                if word not in stopwords.words('english')]
        
        return ' '.join(words)

    def extract_sections(self, text: str) -> Dict[str, List[ProfileSection]]:
        """
        Extract and analyze individual sections from the profile, handling multiple entries.
        
        Args:
            text (str): Profile text
            
        Returns:
            Dict[str, List[ProfileSection]]: Dictionary with lists of analyzed sections.
        """
        sections = {}
        current_section = None
        current_content = []

        for line in text.split('\n'):
            line = line.strip()
            if not line:
                continue

            # Check if line is a section header
            if any(section.lower() in line.lower() for section in self.config['required_sections']):
                if current_section and current_content:
                    content = ' '.join(current_content)
                    analyzed_entries = self.analyze_section(current_section, content)
                    sections.setdefault(current_section, []).extend(analyzed_entries.values())

                current_section = next(s for s in self.config['required_sections'] 
                                    if s.lower() in line.lower())
                current_content = []
            else:
                current_content.append(line)

            # Add last section
            # if current_section and current_content:
            #     content = ' '.join(current_content)
            #     analyzed_entries = self.analyze_section(current_section, content)
            #     sections.setdefault(current_section, []).extend(analyzed_entries.values())

        return sections


    def analyze_section(self, section_name: str, content: str) -> Dict[str, ProfileSection]:
        """
        Analyze individual section content with multiple entries (like Education).
        
        Args:
            section_name (str): Name of the section
            content (str): Section content
            
        Returns:
            Dict[str, ProfileSection]: Dictionary of analyzed sections
        """
        entries = content.split("•")  # Splitting at bullet points
        analyzed_sections = {}

        for idx, entry in enumerate(entries):
            print(f"Entries for {section_name}: {entries}")  # Debugging step

            entry = entry.strip()
            if not entry:  # Skip empty entries
                continue
            
            words = word_tokenize(entry)
            keywords = set(word.lower() for word in words 
                        if word.lower() in self.get_all_keywords())

            recommended_length = self.config['recommended_lengths'].get(section_name, {'min': 50, 'max': 500})
            length_score = self.calculate_length_score(len(words), recommended_length)
            keyword_score = len(keywords) / len(words) if words else 0

            section_obj = ProfileSection(
                name=f"{section_name} {idx+1}",  # Differentiating multiple entries
                content=entry,
                word_count=len(words),
                keywords=keywords,
                score=(length_score + keyword_score) / 2
            )

            analyzed_sections[f"{section_name}_{idx+1}"] = section_obj  # Unique key for each entry

        return analyzed_sections

    def calculate_length_score(self, length: int, recommended: Dict[str, int]) -> float:
        """Calculate score based on content length"""
        if length < recommended['min']:
            return length / recommended['min']
        if length > recommended['max']:
            return recommended['max'] / length
        return 1.0

    def get_all_keywords(self) -> Set[str]:
        """Get all keywords from all categories"""
        all_keywords = set()
        for category in self.industry_keywords.values():
            all_keywords.update(category)
        return all_keywords

    def calculate_job_match_score(self, profile_text: str, job_description: str) -> float:
        """
        Calculate job match score using enhanced TF-IDF and keyword matching
        
        Args:
            profile_text (str): Profile text
            job_description (str): Job description
            
        Returns:
            float: Match score percentage
        """
        # Preprocess texts
        profile_processed = self.preprocess_text(profile_text)
        job_processed = self.preprocess_text(job_description)

        # TF-IDF similarity
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform([profile_processed, job_processed])
        cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]

        # Keyword matching
        profile_keywords = set(profile_processed.split())
        job_keywords = set(job_processed.split())
        keyword_overlap = len(profile_keywords.intersection(job_keywords)) / len(job_keywords)

        # Weighted average
        return (cosine_sim * 0.7 + keyword_overlap * 0.3) * 100

    def generate_improvement_suggestions(self, sections: Dict[str, List[ProfileSection]]) -> List[str]:
        """Generate specific improvement suggestions for each entry in a section"""
        suggestions = []
        
        for section_name, section_list in sections.items():
            for section in section_list:  # Iterate through multiple entries per section
                if section.score < 0.7:
                    if section.word_count < self.config['recommended_lengths'].get(section_name, {'min': 50})['min']:
                        suggestions.append(f"Add more detail to your {section.name} section")
                    if len(section.keywords) < 5:
                        suggestions.append(f"Include more relevant keywords in your {section.name} section")

        return suggestions


    def analyze_profile(self, profile_text: str, job_description: Optional[str] = None) -> AnalysisResult:
        """
        Perform comprehensive profile analysis
        
        Args:
            profile_text (str): Profile text
            job_description (Optional[str]): Job description for matching
            
        Returns:
            AnalysisResult: Complete analysis results
        """
        try:
            # Extract and analyze sections (now returning lists of ProfileSection objects per section)
            sections = self.extract_sections(profile_text)
            
            # Calculate overall scores (adjusted for multiple entries per section)
            section_scores = {
                name: [entry.score for entry in entries] for name, entries in sections.items()
            }

            # Identify missing sections
            missing_sections = [
                section for section in self.config['required_sections'] if section not in sections
            ]
            
            # Calculate job match if description provided
            job_match_score = None
            if job_description:
                job_match_score = self.calculate_job_match_score(profile_text, job_description)

            # Generate improvement suggestions (now works with lists of ProfileSection)
            suggestions = self.generate_improvement_suggestions(sections)

            # Keyword analysis (collect keywords across all entries)
            all_keywords = Counter()
            for entries in sections.values():
                for entry in entries:
                    all_keywords.update(entry.keywords)

            # Calculate readability metrics
            doc = self.nlp(profile_text)
            sentences = list(doc.sents)
            total_words = len([token.text for token in doc if token.is_alpha])

            readability_metrics = {
                'avg_sentence_length': sum(len(sent.text.split()) for sent in sentences) / len(sentences) if sentences else 0,
                'unique_words_ratio': len(set(token.text.lower() for token in doc if token.is_alpha)) / total_words if total_words else 0
            }

            return AnalysisResult(
                linkedin_compatibility=len(missing_sections) == 0,
                section_scores=section_scores,  # Now lists of scores per section
                missing_sections=missing_sections,
                job_match_score=job_match_score,
                improvement_suggestions=suggestions,
                keyword_analysis=dict(all_keywords),
                readability_metrics=readability_metrics
            )

        except Exception as e:
            self.logger.error(f"Error analyzing profile: {str(e)}")
            raise


    def generate_report(self, analysis: AnalysisResult) -> Dict:
        """
        Generate detailed analysis report
        
        Args:
            analysis (AnalysisResult): Analysis results
            
        Returns:
            Dict: Formatted report
        """
        report = {
            'timestamp': datetime.now().isoformat(),
            'overall_assessment': {
                'linkedin_compatible': analysis.linkedin_compatibility,
                'overall_score': sum(analysis.section_scores.values()) / len(analysis.section_scores) if analysis.section_scores else 0
            },
            'section_analysis': analysis.section_scores,
            'missing_sections': analysis.missing_sections,
            'job_match_score': analysis.job_match_score,
            'improvement_suggestions': analysis.improvement_suggestions,
            'keyword_analysis': analysis.keyword_analysis,
            'readability_metrics': analysis.readability_metrics
        }
        
        return report

if __name__ == "__main__":
    # Example usage
    analyzer = LinkedInProfileAnalyzer()
    
    sample_profile = """
    Summary
    Experienced software engineer with a passion for building scalable applications.
    
    Experience
    Senior Software Engineer at Tech Corp
    Led development of cloud-based solutions using Python and AWS.
    
    Education
    Bachelor's in Computer Science
    """
    
    sample_job = """
    Looking for experienced software engineer with Python and cloud expertise.
    Must have experience with AWS and scalable applications.
    """
    
    analysis = analyzer.analyze_profile(sample_profile, sample_job)
    report = analyzer.generate_report(analysis)
    print(json.dumps(report, indent=2, default=str))