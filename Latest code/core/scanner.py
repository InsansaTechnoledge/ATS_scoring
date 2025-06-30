# # core/scanner.py
# from typing import Optional, List, Tuple
# from core.document_parser import DocumentParser
# from core.resume_parser import ResumeParser
# from core.job_matcher import JobMatcher
# from core.quality_assessor import ResumeQualityAssessor
# from core.readability_analyzer import ReadabilityAnalyzer
# from models.scoring_result import ScoringResult

# class EnhancedATSScanner:
#     """Main ATS Scanner with dual scoring capability"""
    
#     def __init__(self):
#         self.document_parser = DocumentParser()
#         self.resume_parser = ResumeParser()
#         self.job_matcher = JobMatcher()
#         self.quality_assessor = ResumeQualityAssessor()
#         self.readability_analyzer = ReadabilityAnalyzer()
    
#     def scan_resume(self, file_path: str, job_description: Optional[str] = None) -> ScoringResult:
#         """
#         Scan resume and return appropriate scoring result
        
#         Args:
#             file_path: Path to resume file
#             job_description: Optional job description for job-specific matching
            
#         Returns:
#             ScoringResult with appropriate scoring type
#         """
#         # Extract text from resume
#         text = self.document_parser.extract_text(file_path)
        
#         if not text.strip():
#             raise ValueError("No text could be extracted from the resume")
        
#         # Parse resume data
#         resume_data = self.resume_parser.parse_resume(text)
        
#         # Add readability analysis (only scores)
#         readability_scores = self.readability_analyzer.analyze(text)
#         resume_data['readability'] = readability_scores
        
#         # Choose scoring method based on job description availability and content
#         if job_description and job_description.strip():
#             return self.job_matcher.calculate_job_match_score(resume_data, job_description)
#         else:
#             return self.quality_assessor.assess_quality(text, resume_data)
    
#     def batch_scan(self, file_paths: List[str], job_description: Optional[str] = None) -> List[Tuple[str, ScoringResult]]:
#         """Batch scan multiple resumes"""
#         results = []
        
#         for file_path in file_paths:
#             try:
#                 result = self.scan_resume(file_path, job_description)
#                 results.append((file_path, result))
#             except Exception as e:
#                 error_result = ScoringResult(
#                     overall_score=0.0,
#                     scoring_type='error',
#                     breakdown={},
#                     feedback=[f"Error processing file: {str(e)}"],
#                     recommendations=["Check file format and content"]
#                 )
#                 results.append((file_path, error_result))
        
#         return results

from typing import Optional, List, Tuple
from core.document_parser import DocumentParser
from core.resume_parser import ResumeParser
from core.job_matcher import JobMatcher
from core.quality_assessor import ResumeQualityAssessor
from core.readability_analyzer import ReadabilityAnalyzer
from core.resume_validator import ResumeValidator
from models.scoring_result import ScoringResult

class EnhancedATSScanner:
    """Main ATS Scanner with dual scoring capability"""
    
    def __init__(self):
        self.document_parser = DocumentParser()
        self.resume_parser = ResumeParser()
        self.job_matcher = JobMatcher()
        self.quality_assessor = ResumeQualityAssessor()
        self.readability_analyzer = ReadabilityAnalyzer()
        self.resume_validator = ResumeValidator()
    
    def scan_resume(self, file_path: str, job_description: Optional[str] = None) -> ScoringResult:
        """
        Scan resume and return appropriate scoring result
        
        Args:
            file_path: Path to resume file
            job_description: Optional job description for job-specific matching
            
        Returns:
            ScoringResult with appropriate scoring type
        """
        # Extract text from resume
        text = self.document_parser.extract_text(file_path)
        
        if not text.strip():
            raise ValueError("No text could be extracted from the document")
        
        # Parse resume data
        resume_data = self.resume_parser.parse_resume(text)
        
        # Validate if this is actually a resume
        is_resume, validation_reason, confidence_score = self.resume_validator.is_resume(text, resume_data)
        
        if not is_resume:
            return ScoringResult(
                overall_score=0.0,
                scoring_type='validation_error',
                breakdown={'validation_confidence': round(confidence_score * 100, 1)},
                feedback=[
                    f"Document validation failed (confidence: {confidence_score:.1%})",
                    "This document does not appear to be a resume or CV",
                    f"Reason: {validation_reason}"
                ],
                recommendations=[
                    "Please upload a valid resume or CV document",
                    "Ensure the document contains typical resume sections like Experience, Education, Skills",
                    "Check that the document includes contact information and professional details"
                ]
            )
        
        # Add readability analysis (only scores)
        readability_scores = self.readability_analyzer.analyze(text)
        resume_data['readability'] = readability_scores
        
        # Add validation confidence to resume data
        resume_data['validation_confidence'] = confidence_score
        
        # Choose scoring method based on job description availability and content
        if job_description and job_description.strip():
            return self.job_matcher.calculate_job_match_score(resume_data, job_description)
        else:
            return self.quality_assessor.assess_quality(text, resume_data)
    
    def batch_scan(self, file_paths: List[str], job_description: Optional[str] = None) -> List[Tuple[str, ScoringResult]]:
        """Batch scan multiple resumes"""
        results = []
        
        for file_path in file_paths:
            try:
                result = self.scan_resume(file_path, job_description)
                results.append((file_path, result))
            except Exception as e:
                error_result = ScoringResult(
                    overall_score=0.0,
                    scoring_type='error',
                    breakdown={},
                    feedback=[f"Error processing file: {str(e)}"],
                    recommendations=["Check file format and content"]
                )
                results.append((file_path, error_result))
        
        return results