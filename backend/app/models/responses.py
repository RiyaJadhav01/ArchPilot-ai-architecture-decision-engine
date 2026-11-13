from pydantic import BaseModel
from typing import List, Dict, Any

class ArchitectureScore(BaseModel):
    architecture_key: str
    name: str
    description: str
    scores: Dict[str, float]
    overall_score: float
    reasons: List[str]
    tradeoffs: Dict[str, List[str]]

class AnalysisResponse(BaseModel):
    recommended_architecture: str
    architecture_score: float
    architecture_ranking: List[ArchitectureScore]