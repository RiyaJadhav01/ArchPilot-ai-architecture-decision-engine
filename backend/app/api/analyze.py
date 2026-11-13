from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
import traceback
import uuid

from app.schemas.architecture import (
    AnalyzeRequest,
    ArchitectureRequest,
    AnalysisResponse,
)

from app.services.ai_extractor import AIExtractor
from app.engine.scoring import ArchitectureScoringEngine
from app.services.llm_service import LLMServiceError

from app.schemas.architecture import (
    AnalyzeRequest,
    ArchitectureRequest,
    AnalysisResponse,
    WhatIfRequest,
    WhatIfResponse,
)

from app.services.what_if_service import WhatIfService

scoring_engine = ArchitectureScoringEngine()
ai_extractor = AIExtractor()

what_if_service = WhatIfService()

router = APIRouter()

scoring_engine = ArchitectureScoringEngine()
ai_extractor = AIExtractor()


@router.post("/analyze", response_model=AnalysisResponse)
def analyze_architecture(payload: AnalyzeRequest):
    
    try:
        # ----------------------------------------------------
        # 1. Extract requirements from natural language
        # ----------------------------------------------------

        extracted_data = ai_extractor.extract_requirements(
            payload.applicationDescription
        )

        # ----------------------------------------------------
        # 2. Validate extracted requirements
        # ----------------------------------------------------

        requirements = ArchitectureRequest(**extracted_data)

        # ----------------------------------------------------
        # 3. Run deterministic architecture decision engine
        # ----------------------------------------------------

        decision = scoring_engine.evaluate(requirements)

        # ----------------------------------------------------
        # 4. Check whether we have enough information
        # ----------------------------------------------------

        if decision["confidence"] < 40:
            return {
                "id": str(uuid.uuid4()),
                "applicationDescription": payload.applicationDescription,
                "createdAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                "requirements": requirements.model_dump(exclude_none=True),

                "recommendation": None,
                "overallScore": None,
                "confidence": decision["confidence"],
                "decisionStrength": decision["decision_strength"],

                "missingRequirements": decision["missing_requirements"],
                "assumptions": decision["assumptions"],

                "riskLevel": "high",

                "estimatedMonthlyCost": None,
                "keyTradeoffs": [],

                "scoreBreakdown": decision["score_breakdown"],
                "decisionDrivers": decision["decision_drivers"],

                "architecture": None,
                "alternatives": [],
            }
        # ----------------------------------------------------
        # 5. Get recommended architecture
        # ----------------------------------------------------

        recommended_id = decision["recommended_architecture"]
        recommended_profile = decision["recommended_profile"]

        # ----------------------------------------------------
        # 6. Build recommended architecture response
        # ----------------------------------------------------

        recommended_architecture = {
            **recommended_profile,
            "score": round(decision["scores"][recommended_id]),
            "estimatedCost": recommended_profile["estimated_cost"],
        }

        recommended_architecture.pop("estimated_cost", None)

        # ----------------------------------------------------
        # 7. Build alternative architectures
        # ----------------------------------------------------

        alternatives = []

        for architecture_id, score in decision["ranking"]:
            if architecture_id == recommended_id:
                continue

            profile = decision["alternative_profiles"][architecture_id]

            alternative = {
                **profile,
                "score": round(score),
                "estimatedCost": profile["estimated_cost"],
            }

            alternative.pop("estimated_cost", None)
            alternatives.append(alternative)

        # ----------------------------------------------------
        # 8. Return final frontend-ready response
        # ----------------------------------------------------

        return {
            "id": str(uuid.uuid4()),
            "applicationDescription": payload.applicationDescription,
            "createdAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "requirements": requirements.model_dump(exclude_none=True),
            "recommendation": recommended_profile["name"],
            "overallScore": decision["scores"][recommended_id],
            "confidence": decision["confidence"],
            "decisionStrength": decision["decision_strength"],

            "missingRequirements": decision["missing_requirements"],
            "assumptions": decision["assumptions"],

            "riskLevel": (
                "low"
                if decision["confidence"] >= 80
                else "medium"
                if decision["confidence"] >= 60
                else "high"
            ),

            "estimatedMonthlyCost": recommended_profile["estimated_cost"],

            "keyTradeoffs": decision["reasons"][recommended_id],
            
            "scoreBreakdown": decision["score_breakdown"],

            "decisionDrivers": decision["decision_drivers"],

            "architecture": recommended_architecture,

            "alternatives": alternatives,
        }

    except LLMServiceError as e:
        print(f"LLM provider error: {e.__cause__ or e}")
        raise HTTPException(
            status_code=503,
            detail="The AI service is temporarily unavailable. Please try again shortly.",
        )

    except ValueError as e:
        raise HTTPException(
            status_code=422,
            detail=str(e)
        )

    except Exception:
        print("--- ERROR IN ANALYZE ENDPOINT ---")
        print(traceback.format_exc())

        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while analyzing the architecture.",
        )
        
@router.post(
"/analyze/what-if",
response_model=WhatIfResponse
)
def analyze_what_if(payload: WhatIfRequest):

    try:

        result = what_if_service.analyze(
            payload.current_requirements,
            payload.modified_requirements,
        )

        return result

    except ValueError as e:

        raise HTTPException(
            status_code=422,
            detail=str(e)
        )

    except Exception:

        print("--- ERROR IN WHAT-IF ANALYSIS ---")
        print(traceback.format_exc())

        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred during what-if analysis.",
        )
