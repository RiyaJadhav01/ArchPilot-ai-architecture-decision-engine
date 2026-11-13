from enum import Enum
from pydantic import BaseModel, Field

class TrafficLevel(str, Enum):
    low = "low"
    moderate = "moderate"
    high = "high"
    very_high = "very_high"
    extreme = "extreme"

class BudgetLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    enterprise = "enterprise"

class AvailabilityRequirement(str, Enum):
    standard = "standard"  # ~99.9%
    high = "high"          # ~99.99%
    critical = "critical"  # ~99.999%

class SystemRequirements(BaseModel):
    expected_users: int = Field(..., description="Estimated active user count", ge=1)
    traffic_level: TrafficLevel = Field(..., description="Load intensity and query frequency")
    team_size: int = Field(..., description="Number of developers available to build and maintain", ge=1)
    budget: BudgetLevel = Field(..., description="Financial constraints for infrastructure")
    availability_requirement: AvailabilityRequirement = Field(AvailabilityRequirement.standard)
    latency_requirement: str = Field("moderate", description="Response time strictness (e.g., real-time, low, moderate)")
    real_time: bool = Field(False, description="Requires WebSockets or event streams")
    global_distribution: bool = Field(False, description="Multi-region user base deployment needed")
    app_complexity: str = Field("medium", description="Business domain complexity")