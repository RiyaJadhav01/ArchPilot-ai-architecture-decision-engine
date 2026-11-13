from app.engine.scoring import ArchitectureScoringEngine
from app.schemas.architecture import ArchitectureRequest


def test_engine_evaluates_all_architectures():
    engine = ArchitectureScoringEngine()

    request = ArchitectureRequest(
        application_type="web_application",
        expected_users=5000,
        traffic_level="medium",
        team_size=5,
        budget="medium",
        availability_requirement="standard",
        latency_requirement="standard",
        global_distribution=False,
        real_time=False,
        compliance_required=False,
    )

    result = engine.evaluate(request)

    assert set(result["scores"].keys()) == {
        "monolith",
        "modular_monolith",
        "microservices",
    }


def test_scores_stay_within_valid_range():
    engine = ArchitectureScoringEngine()

    request = ArchitectureRequest(
        application_type="ecommerce",
        expected_users=1_000_000,
        traffic_level="high",
        team_size=15,
        budget="high",
        availability_requirement="critical",
        latency_requirement="high",
        global_distribution=True,
        real_time=True,
        compliance_required=True,
    )

    result = engine.evaluate(request)

    for score in result["scores"].values():
        assert 0 <= score <= 100


def test_large_high_scale_application_favors_microservices():
    engine = ArchitectureScoringEngine()

    request = ArchitectureRequest(
        application_type="global_platform",
        expected_users=10_000_000,
        traffic_level="high",
        team_size=20,
        budget="high",
        availability_requirement="critical",
        latency_requirement="high",
        global_distribution=True,
        real_time=True,
        compliance_required=True,
    )

    result = engine.evaluate(request)

    assert result["recommended_architecture"] == "microservices"


def test_small_low_traffic_application_favors_monolith():
    engine = ArchitectureScoringEngine()

    request = ArchitectureRequest(
        application_type="college_app",
        expected_users=500,
        traffic_level="low",
        team_size=2,
        budget="low",
        availability_requirement="low",
        latency_requirement="standard",
        global_distribution=False,
        real_time=False,
        compliance_required=False,
    )

    result = engine.evaluate(request)

    assert result["recommended_architecture"] == "monolith"


def test_close_scores_are_marked_as_close():
    engine = ArchitectureScoringEngine()

    request = ArchitectureRequest()

    result = engine.evaluate(request)

    assert result["decision_strength"] == "close"


def test_missing_requirements_reduce_confidence():
    engine = ArchitectureScoringEngine()

    request = ArchitectureRequest(
        application_type="web_application",
        traffic_level="medium",
        team_size=5,
    )

    result = engine.evaluate(request)

    assert result["confidence"] < 100
    assert len(result["missing_requirements"]) > 0


def test_complete_requirements_give_full_confidence():
    engine = ArchitectureScoringEngine()

    request = ArchitectureRequest(
        application_type="ecommerce",
        expected_users=100_000,
        traffic_level="high",
        team_size=10,
        budget="high",
        availability_requirement="high",
        latency_requirement="high",
        global_distribution=True,
        real_time=True,
        compliance_required=True,
    )

    result = engine.evaluate(request)

    assert result["confidence"] == 100
    assert result["missing_requirements"] == []


def test_score_breakdown_contains_all_criteria():
    engine = ArchitectureScoringEngine()

    request = ArchitectureRequest(
        application_type="ecommerce",
        expected_users=100_000,
        traffic_level="high",
        team_size=10,
        budget="medium",
        availability_requirement="high",
        latency_requirement="standard",
        global_distribution=True,
        real_time=True,
        compliance_required=True,
    )

    result = engine.evaluate(request)

    expected_criteria = {
        "traffic",
        "expected_users",
        "team_size",
        "availability",
        "budget",
        "latency",
        "real_time",
        "global_distribution",
        "compliance",
        "application_type",
    }

    for architecture in (
        "monolith",
        "modular_monolith",
        "microservices",
    ):
        assert set(result["score_breakdown"][architecture].keys()) == expected_criteria


def test_ranking_is_sorted_highest_to_lowest():
    engine = ArchitectureScoringEngine()

    request = ArchitectureRequest(
        application_type="global_platform",
        expected_users=1_000_000,
        traffic_level="high",
        team_size=15,
        budget="high",
        availability_requirement="critical",
        latency_requirement="high",
        global_distribution=True,
        real_time=True,
        compliance_required=True,
    )

    result = engine.evaluate(request)

    ranking_scores = [score for _, score in result["ranking"]]

    assert ranking_scores == sorted(ranking_scores, reverse=True)


def test_recommendation_matches_top_of_ranking():
    engine = ArchitectureScoringEngine()

    request = ArchitectureRequest(
        application_type="ecommerce",
        expected_users=100_000,
        traffic_level="high",
        team_size=8,
        budget="medium",
        availability_requirement="high",
        latency_requirement="standard",
        global_distribution=True,
        real_time=True,
        compliance_required=False,
    )

    result = engine.evaluate(request)

    assert result["recommended_architecture"] == result["ranking"][0][0]
    
    
def test_expected_users_crossing_threshold_changes_score_breakdown():
    engine = ArchitectureScoringEngine()

    smaller_request = ArchitectureRequest(expected_users=50_000)
    larger_request = ArchitectureRequest(expected_users=100_000)

    smaller_result = engine.evaluate(smaller_request)
    larger_result = engine.evaluate(larger_request)

    assert (
        smaller_result["score_breakdown"]["monolith"]["expected_users"]
        != larger_result["score_breakdown"]["monolith"]["expected_users"]
    )
    assert (
        smaller_result["score_breakdown"]["microservices"]["expected_users"]
        != larger_result["score_breakdown"]["microservices"]["expected_users"]
    )

    

def test_changing_traffic_changes_only_traffic_contribution():
    engine = ArchitectureScoringEngine()

    base_request = ArchitectureRequest(
        application_type="web_application",
        expected_users=50_000,
        traffic_level="low",
        team_size=5,
        budget="medium",
        availability_requirement="standard",
        latency_requirement="standard",
        global_distribution=False,
        real_time=False,
        compliance_required=False,
    )

    changed_request = base_request.model_copy(
        update={"traffic_level": "high"}
    )

    base_result = engine.evaluate(base_request)
    changed_result = engine.evaluate(changed_request)

    # Monolith and Microservices have different traffic scores
    # for low versus high traffic.
    for architecture in ("monolith", "microservices"):
        assert (
            base_result["score_breakdown"][architecture]["traffic"]
            != changed_result["score_breakdown"][architecture]["traffic"]
        )

    # Modular Monolith has the same traffic score (85) in both cases.
    assert (
        base_result["score_breakdown"]["modular_monolith"]["traffic"]
        == changed_result["score_breakdown"]["modular_monolith"]["traffic"]
    )

    # All non-traffic contributions must remain unchanged.
    for architecture in engine.architectures:
        for criterion in base_result["score_breakdown"][architecture]:
            if criterion != "traffic":
                assert (
                    base_result["score_breakdown"][architecture][criterion]
                    == changed_result["score_breakdown"][architecture][criterion]
                )
                

def test_ranking_uses_tie_break_priority_when_scores_are_equal():
    engine = ArchitectureScoringEngine()

    request = ArchitectureRequest()

    result = engine.evaluate(request)

    # With no requirements, Monolith and Modular Monolith
    # receive equal displayed scores under the current rules.
    assert result["scores"]["monolith"] == result["scores"]["modular_monolith"]

    # Monolith has the higher tie-break priority.
    assert result["ranking"][0][0] == "monolith"
    assert result["ranking"][1][0] == "modular_monolith"


def test_decision_drivers_have_expected_fields_and_valid_impact():
    engine = ArchitectureScoringEngine()

    request = ArchitectureRequest(
        traffic_level="high",
        team_size=5,
        budget="medium",
    )

    result = engine.evaluate(request)

    assert result["decision_drivers"]

    for driver in result["decision_drivers"]:
        assert {
            "criterion",
            "impact",
            "direction",
            "reason",
            "weight",
            "influence",
        }.issubset(driver.keys())

        assert driver["impact"] in {"low", "medium", "high"}
        assert isinstance(driver["direction"], str)
        assert driver["direction"]
        assert isinstance(driver["reason"], str)
        assert driver["reason"]

