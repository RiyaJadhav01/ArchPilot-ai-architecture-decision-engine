import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.api.analyze import ai_extractor
from app.services.llm_service import LLMServiceError


client = TestClient(app)


def test_analyze_returns_successful_architecture_decision(monkeypatch):
    extracted_requirements = {
        "application_type": "ecommerce",
        "expected_users": 100000,
        "traffic_level": "high",
        "team_size": 10,
        "budget": "high",
        "availability_requirement": "high",
        "latency_requirement": "high",
        "global_distribution": True,
        "real_time": True,
        "compliance_required": True,
    }

    monkeypatch.setattr(
        ai_extractor,
        "extract_requirements",
        lambda prompt: extracted_requirements,
    )

    response = client.post(
    "/api/v1/architecture/analyze",
    json={
        "applicationDescription": (
            "Global e-commerce platform for 100,000 users "
            "with high traffic and real-time tracking."
        )
    },
)

    assert response.status_code == 200

    data = response.json()

    assert data["recommendation"] is not None
    assert data["overallScore"] is not None
    assert data["architecture"] is not None
    assert len(data["alternatives"]) == 2
    assert 0 <= data["confidence"] <= 100
    assert data["missingRequirements"] == []


def test_analyze_handles_insufficient_requirements(monkeypatch):
    extracted_requirements = {
        "application_type": "college_app",
        "expected_users": None,
        "traffic_level": None,
        "team_size": None,
        "budget": None,
        "availability_requirement": None,
        "latency_requirement": None,
        "global_distribution": None,
        "real_time": None,
        "compliance_required": None,
    }

    monkeypatch.setattr(
        ai_extractor,
        "extract_requirements",
        lambda prompt: extracted_requirements,
    )

    response = client.post(
    "/api/v1/architecture/analyze",
        json={
            "applicationDescription": "Build a college application."
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["recommendation"] is None
    assert data["overallScore"] is None
    assert data["architecture"] is None
    assert data["alternatives"] == []
    assert data["confidence"] < 40
    assert len(data["missingRequirements"]) > 0
    assert data["riskLevel"] == "high"


def test_analyze_rejects_invalid_extracted_requirements(monkeypatch):
    invalid_requirements = {
        "application_type": "web_application",
        "expected_users": 5000,
        "traffic_level": "extreme",
        "team_size": 5,
        "budget": "medium",
        "availability_requirement": "standard",
        "latency_requirement": "standard",
        "global_distribution": False,
        "real_time": False,
        "compliance_required": False,
    }

    monkeypatch.setattr(
        ai_extractor,
        "extract_requirements",
        lambda prompt: invalid_requirements,
    )

    response = client.post(
    "/api/v1/architecture/analyze",
        json={
            "applicationDescription": "Build a web application."
        },
    )

    assert response.status_code == 422


def test_analyze_rejects_too_short_description():
    response = client.post(
    "/api/v1/architecture/analyze",
        json={
            "applicationDescription": "test"
        },
    )

    assert response.status_code == 422
    

def test_analyze_returns_503_when_llm_provider_fails(monkeypatch):
    def raise_llm_error(prompt):
        raise LLMServiceError("Simulated provider failure")

    monkeypatch.setattr(
        ai_extractor,
        "extract_requirements",
        raise_llm_error,
    )

    response = client.post(
        "/api/v1/architecture/analyze",
        json={
            "applicationDescription": (
                "Build an e-commerce platform for 100,000 users."
            )
        },
    )

    assert response.status_code == 503
    assert response.json()["detail"] == (
        "The AI service is temporarily unavailable. "
        "Please try again shortly."
    )
    assert "Simulated provider failure" not in response.text
