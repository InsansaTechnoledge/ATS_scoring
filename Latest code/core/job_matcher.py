from typing import Dict, List, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from fuzzywuzzy import fuzz
from core.resume_parser import ResumeParser
from models.scoring_result import ScoringResult

class JobMatcher:
    """Match resume against job description"""
    
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
    
    def calculate_job_match_score(self, resume_data: Dict[str, Any], job_description: str) -> ScoringResult:
        """Calculate job-specific matching score"""
        job_requirements = self._parse_job_description(job_description)
        
        scores = {}
        feedback = []
        recommendations = []
        
        # Check if job description has meaningful requirements
        has_meaningful_requirements = self._has_meaningful_requirements(job_requirements, job_description)
        
        if not has_meaningful_requirements:
            return ScoringResult(
                overall_score=60.0,
                scoring_type='job_match',
                breakdown={'skills_match': 60.0, 'keyword_relevance': 60.0, 'experience_relevance': 60.0, 'education_match': 60.0},
                feedback=["Job description lacks specific requirements"],
                recommendations=["Provide detailed job description with specific skills and requirements for better matching"]
            )
        
        # Skills matching (40% weight)
        skills_score = self._calculate_skills_match(resume_data['skills'], job_requirements['skills'])
        scores['skills_match'] = skills_score
        
        # Determine scoring based on skills match
        if skills_score >= 0.7:
            feedback.append(f"Excellent skills match ({skills_score:.1%}) - Resume contains required skills")
            keyword_score = self._calculate_keyword_relevance(resume_data, job_description)
            experience_score = self._calculate_experience_relevance(resume_data, job_requirements)
            education_score = self._calculate_education_match(resume_data['education'], job_requirements['education'])
            
        elif skills_score >= 0.4:
            feedback.append(f"Good skills match ({skills_score:.1%}) - Most required skills present")
            recommendations.append("Consider adding any missing technical skills mentioned in job description")
            keyword_score = self._calculate_keyword_relevance(resume_data, job_description)
            experience_score = self._calculate_experience_relevance(resume_data, job_requirements)
            education_score = self._calculate_education_match(resume_data['education'], job_requirements['education'])
            
        elif skills_score >= 0.2:
            feedback.append(f"Moderate skills match ({skills_score:.1%}) - Some required skills present")
            recommendations.append("Add more relevant technical skills mentioned in job description")
            keyword_score = self._calculate_keyword_relevance(resume_data, job_description) * 0.8
            experience_score = self._calculate_experience_relevance(resume_data, job_requirements) * 0.8
            education_score = self._calculate_education_match(resume_data['education'], job_requirements['education']) * 0.8
            
        else:
            feedback.append(f"Poor skills match ({skills_score:.1%}) - Required skills not found in resume")
            recommendations.append("Add the specific technical skills mentioned in job description")
            recommendations.append("Highlight any transferable skills that might be relevant")
            keyword_score = self._calculate_keyword_relevance(resume_data, job_description) * 0.5
            experience_score = self._calculate_experience_relevance(resume_data, job_requirements) * 0.5
            education_score = self._calculate_education_match(resume_data['education'], job_requirements['education']) * 0.5
        
        scores['keyword_relevance'] = keyword_score
        scores['experience_relevance'] = experience_score
        scores['education_match'] = education_score
        
        # Calculate weighted overall score
        weights = {
            'skills_match': 0.4,
            'keyword_relevance': 0.3,
            'experience_relevance': 0.2,
            'education_match': 0.1
        }
        
        overall_score = sum(scores[key] * weights[key] for key in scores)
        final_score = overall_score * 100
        
        return ScoringResult(
            overall_score=final_score,
            scoring_type='job_match',
            breakdown={k: v * 100 for k, v in scores.items()},
            feedback=feedback,
            recommendations=recommendations
        )
    
    def _has_meaningful_requirements(self, job_requirements: Dict, job_description: str) -> bool:
        """Check if job description has meaningful requirements"""
        word_count = len(job_description.split())
        has_skills = len(job_requirements['skills']) > 0
        has_education = len(job_requirements['education']) > 0
        has_experience = job_requirements['experience_years'] > 0
        
        if word_count >= 1 and has_skills:
            return True
        
        return word_count >= 15 and (has_skills or has_education or has_experience)
    
    def _parse_job_description(self, job_description: str) -> Dict[str, Any]:
        """Parse job description to extract requirements"""
        parser = ResumeParser()
        
        return {
            'skills': parser._extract_skills(job_description),
            'education': parser._extract_education(job_description),
            'experience_years': parser._extract_experience_years(job_description),
            'keywords': parser._extract_keywords(job_description)
        }
    
    def _calculate_skills_match(self, resume_skills: List[str], job_skills: List[str]) -> float:
        """Calculate skills matching score with improved logic"""
        if not job_skills:
            return 0.6
        
        if not resume_skills:
            return 0.0
        
        resume_skills_lower = [skill.lower().strip() for skill in resume_skills]
        job_skills_lower = [skill.lower().strip() for skill in job_skills]
        
        total_matches = 0
        matched_job_skills = set()
        
        for job_skill in job_skills_lower:
            best_match_score = 0
            
            if job_skill in resume_skills_lower:
                total_matches += 1.0
                matched_job_skills.add(job_skill)
            else:
                for resume_skill in resume_skills_lower:
                    if job_skill in resume_skill or resume_skill in job_skill:
                        match_score = 0.9
                    else:
                        match_score = fuzz.ratio(job_skill, resume_skill) / 100.0
                    
                    if match_score > best_match_score:
                        best_match_score = match_score
                
                if best_match_score >= 0.8:
                    total_matches += best_match_score
                    matched_job_skills.add(job_skill)
        
        if len(job_skills) == 0:
            match_score = 0.6
        else:
            match_score = total_matches / len(job_skills)
        
        if match_score >= 0.8:
            final_score = match_score
        elif match_score >= 0.4:
            final_score = match_score * 0.95
        elif match_score > 0:
            final_score = match_score * 0.8
        else:
            final_score = 0.0
        
        return min(final_score, 1.0)
    
    def _calculate_keyword_relevance(self, resume_data: Dict, job_description: str) -> float:
        """Calculate keyword relevance using TF-IDF"""
        resume_text = ' '.join(resume_data.get('keywords', []))
        
        if not resume_text.strip() or not job_description.strip():
            return 0.0
        
        try:
            tfidf_matrix = self.vectorizer.fit_transform([resume_text, job_description])
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return similarity
        except:
            return 0.0
    
    def _calculate_experience_relevance(self, resume_data: Dict, job_requirements: Dict) -> float:
        """Calculate experience relevance"""
        resume_exp = resume_data.get('experience', 0)
        required_exp = job_requirements.get('experience_years', 0)
        
        if required_exp == 0:
            return 0.8
        
        if resume_exp >= required_exp:
            return 1.0
        elif resume_exp > 0:
            return min(resume_exp / required_exp, 1.0)
        else:
            return 0.2
    
    def _calculate_education_match(self, resume_education: List[str], job_education: List[str]) -> float:
        """Calculate education matching score"""
        if not job_education:
            return 0.8
        
        if not resume_education:
            return 0.3
        
        resume_edu_lower = [edu.lower() for edu in resume_education]
        job_edu_lower = [edu.lower() for edu in job_education]
        
        matches = len(set(resume_edu_lower) & set(job_edu_lower))
        return min(matches / len(job_education), 1.0)