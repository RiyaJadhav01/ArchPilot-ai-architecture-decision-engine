
from app.schemas.architecture import ArchitectureRequest
from app.services.what_if_service import WhatIfService


def test_unchanged_requirements_keep_recommendation():
    service = WhatIfService()
    request = ArchitectureRequest()

    result = service.analyze(request, request.model_copy(deep=True))

    assert result.recommendation_changed is False
    assert result.original_recommendation == result.new_recommendation
    assert result.original_score == result.new_score
    assert result.changed_requirements == []
    assert "No requirements were changed" in result.explanation


def test_changed_traffic_is_reported():
    service = WhatIfService()

    current = ArchitectureRequest(traffic_level="low")
    modified = current.model_copy(update={"traffic_level": "high"})

    result = service.analyze(current, modified)

    assert "Traffic" in result.changed_requirements


def test_score_comparisons_include_all_architectures():
    service = WhatIfService()
    current = ArchitectureRequest()
    modified = current.model_copy(update={"traffic_level": "high"})

    result = service.analyze(current, modified)

    compared_architectures = {
        item.architecture for item in result.score_changes
    }

    assert compared_architectures == {
        "monolith",
        "modular_monolith",
        "microservices",
    }


def test_score_change_matches_new_score_minus_original_score():
    service = WhatIfService()
    current = ArchitectureRequest(traffic_level="low")
    modified = current.model_copy(update={"traffic_level": "high"})

    result = service.analyze(current, modified)

    for item in result.score_changes:
        assert item.change == item.new_score - item.original_score

def test_explanation_uses_tie_break_priority_for_second_place(monkeypatch):
    service = WhatIfService()

    decisions = [
        {
            "recommended_architecture": "monolith",
            "scores": {
                "monolith": 80.0,
                "modular_monolith": 70.0,
                "microservices": 60.0,
            },
        },
        {
            "recommended_architecture": "microservices",
            "scores": {
                "monolith": 92.40,
                "modular_monolith": 92.49,
                "microservices": 95.0,
            },
        },
    ]

    def fake_evaluate(request):
        return decisions.pop(0)

    monkeypatch.setattr(
        service.scoring_engine,
        "evaluate",
        fake_evaluate,
    )

    result = service.analyze(
        ArchitectureRequest(),
        ArchitectureRequest(
            traffic_level="high",
        ),
    )

    assert result.recommendation_changed is True
    assert "Monolith ranks second with a score of 92." in result.explanation
