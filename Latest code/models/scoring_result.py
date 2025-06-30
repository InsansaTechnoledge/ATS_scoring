from dataclasses import dataclass
from typing import Dict, List

@dataclass
class ScoringResult:
    """Data model for scoring results"""
    overall_score: float
    scoring_type: str  # 'job_match' or 'quality_assessment'
    breakdown: Dict[str, float]
    feedback: List[str]
    recommendations: List[str]