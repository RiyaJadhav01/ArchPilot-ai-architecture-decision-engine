import pytest

from app.schemas.architecture import ArchitectureRequest


def test_valid_extracted_requirements_are_accepted():
    data = {
        "application_type": "ecommerce",
        "expected_users": 100000,
        "traffic_level": "high",
        "team_size": 8,
        "budget": "medium",
        "availability_requirement": "high",
        "latency_requirement": "high",
        "global_distribution": True,
        "real_time": True,
        "compliance_required": False,
    }

    requirements = ArchitectureRequest(**data)

    assert requirements.application_type == "ecommerce"
    assert requirements.expected_users == 100000
    assert requirements.traffic_level == "high"
    assert requirements.team_size == 8
    assert requirements.budget == "medium"
    assert requirements.availability_requirement == "high"
    assert requirements.latency_requirement == "high"
    assert requirements.global_distribution is True
    assert requirements.real_time is True
    assert requirements.compliance_required is False


def test_missing_requirements_are_allowed():
    data = {
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

    requirements = ArchitectureRequest(**data)

    assert requirements.application_type == "college_app"
    assert requirements.expected_users is None
    assert requirements.traffic_level is None
    assert requirements.team_size is None


def test_invalid_traffic_level_is_rejected():
    data = {
        "application_type": "web_application",
        "traffic_level": "extreme",
    }

    with pytest.raises(ValueError):
        ArchitectureRequest(**data)


def test_invalid_budget_is_rejected():
    data = {
        "application_type": "web_application",
        "budget": "unlimited",
    }

    with pytest.raises(ValueError):
        ArchitectureRequest(**data)


def test_invalid_availability_requirement_is_rejected():
    data = {
        "application_type": "web_application",
        "availability_requirement": "maximum",
    }

    with pytest.raises(ValueError):
        ArchitectureRequest(**data)


def test_invalid_latency_requirement_is_rejected():
    data = {
        "application_type": "web_application",
        "latency_requirement": "instant",
    }

    with pytest.raises(ValueError):
        ArchitectureRequest(**data)