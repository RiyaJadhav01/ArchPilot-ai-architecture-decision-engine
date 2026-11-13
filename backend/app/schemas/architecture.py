from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict
import uuid


# ============================================================
# USER INPUT
# ============================================================

class AnalyzeRequest(BaseModel):
    applicationDescription: str = Field(
        ...,
        min_length=10,
        description="Natural-language description of the application"
    )


# ============================================================
# STRUCTURED REQUIREMENTS
# Produced by the LLM requirement extractor
# and consumed by the deterministic scoring engine.
# ============================================================

class ArchitectureRequest(BaseModel):
    
    requirements: Optional[ArchitectureRequest] = None
    
    application_type: Optional[str] = None

    expected_users: Optional[int] = None

    traffic_level: Optional[
        Literal["low", "medium", "high"]
    ] = None

    team_size: Optional[int] = None

    budget: Optional[
        Literal["low", "medium", "high"]
    ] = None

    availability_requirement: Optional[
        Literal["low", "standard", "high", "critical"]
    ] = None

    latency_requirement: Optional[
        Literal["low", "standard", "high", "critical"]
    ] = None

    global_distribution: Optional[bool] = None

    real_time: Optional[bool] = None

    compliance_required: Optional[bool] = None


# ============================================================
# TEXT PROMPT
# ============================================================

class TextPromptRequest(BaseModel):
    text_prompt: str


# ============================================================
# ARCHITECTURE OPTION
# ============================================================

class ArchitectureOptionSchema(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))

    name: str
    summary: str

    score: int = Field(ge=0, le=100)

    complexity: str
    estimatedCost: str

    scalability: int = Field(ge=0, le=100)
    maintainability: int = Field(ge=0, le=100)
    performance: int = Field(ge=0, le=100)
    security: int = Field(ge=0, le=100)

    risks: List[str]
    strengths: List[str]

    components: List[str]


# ============================================================
# FINAL ANALYSIS RESPONSE
# ============================================================

class AnalysisResponse(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))

    applicationDescription: str
    createdAt: str

    recommendation: Optional[str] = None
    
    requirements: Optional[ArchitectureRequest] = None

    overallScore: Optional[int] = Field(
        default=None,
        ge=0,
        le=100
    )

    confidence: int = Field(
        ge=0,
        le=100
    )

    decisionStrength: str

    missingRequirements: List[str] = []
    
    assumptions: List[str] = []

    riskLevel: str

    estimatedMonthlyCost: Optional[str] = None

    keyTradeoffs: List[str] = []
    
    scoreBreakdown: Dict[str, Dict[str, float]] = {}
    
    decisionDrivers: List[dict] = []

    architecture: Optional[ArchitectureOptionSchema] = None

    alternatives: List[ArchitectureOptionSchema] = []
    
# ============================================================
# WHAT-IF ANALYSIS
# ============================================================

class WhatIfRequest(BaseModel):
    current_requirements: ArchitectureRequest
    modified_requirements: ArchitectureRequest


class ArchitectureScoreComparison(BaseModel):
    architecture: str
    original_score: int
    new_score: int
    change: int


class WhatIfResponse(BaseModel):
    original_recommendation: Optional[str] = None
    new_recommendation: Optional[str] = None

    original_score: Optional[int] = None
    new_score: Optional[int] = None

    recommendation_changed: bool

    score_changes: List[ArchitectureScoreComparison]

    changed_requirements: List[str]

    explanation: str
        
    
    