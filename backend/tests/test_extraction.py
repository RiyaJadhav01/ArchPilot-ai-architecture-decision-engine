from app.services.ai_extractor import AIExtractor


def test_valid_llm_response_is_parsed():
    extractor = AIExtractor()

    extractor.llm.generate_chat = lambda system_msg, prompt: """
    {
        "application_type": "ecommerce",
        "expected_users": 100000,
        "traffic_level": "high",
        "team_size": 8,
        "budget": "medium",
        "availability_requirement": "high",
        "latency_requirement": "high",
        "global_distribution": true,
        "real_time": true,
        "compliance_required": false
    }
    """

    result = extractor.extract_requirements(
        "Build an e-commerce platform for 100,000 users."
    )

    assert result["application_type"] == "ecommerce"
    assert result["expected_users"] == 100000
    assert result["traffic_level"] == "high"
    assert result["team_size"] == 8
    assert result["budget"] == "medium"
    assert result["availability_requirement"] == "high"
    assert result["latency_requirement"] == "high"
    assert result["global_distribution"] is True
    assert result["real_time"] is True
    assert result["compliance_required"] is False


def test_markdown_json_is_cleaned():
    extractor = AIExtractor()

    extractor.llm.generate_chat = lambda system_msg, prompt: """
    ```json
    {
        "application_type": "web_application",
        "expected_users": 5000,
        "traffic_level": "medium",
        "team_size": null,
        "budget": null,
        "availability_requirement": null,
        "latency_requirement": null,
        "global_distribution": false,
        "real_time": false,
        "compliance_required": null
    }
    ```
    """

    result = extractor.extract_requirements(
        "Build a web application for 5,000 users."
    )

    assert result["application_type"] == "web_application"
    assert result["expected_users"] == 5000
    assert result["traffic_level"] == "medium"


def test_missing_information_is_preserved_as_null():
    extractor = AIExtractor()

    extractor.llm.generate_chat = lambda system_msg, prompt: """
    {
        "application_type": "college_app",
        "expected_users": null,
        "traffic_level": null,
        "team_size": null,
        "budget": null,
        "availability_requirement": null,
        "latency_requirement": null,
        "global_distribution": null,
        "real_time": null,
        "compliance_required": null
    }
    """

    result = extractor.extract_requirements(
        "Build a college application."
    )

    assert result["application_type"] == "college_app"
    assert result["expected_users"] is None
    assert result["traffic_level"] is None
    assert result["team_size"] is None
    assert result["budget"] is None
    assert result["availability_requirement"] is None
    assert result["latency_requirement"] is None
    assert result["global_distribution"] is None
    assert result["real_time"] is None
    assert result["compliance_required"] is None


def test_invalid_json_raises_value_error():
    extractor = AIExtractor()

    extractor.llm.generate_chat = lambda system_msg, prompt: """
    This is not valid JSON.
    """

    try:
        extractor.extract_requirements(
            "Build an application."
        )
        assert False, "Expected ValueError"
    except ValueError as error:
        assert "Failed to parse requirement extraction response" in str(error)
        