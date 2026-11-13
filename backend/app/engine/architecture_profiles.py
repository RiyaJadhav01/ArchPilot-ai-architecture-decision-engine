ARCHITECTURE_PROFILES = {

    "monolith": {
        "name": "Monolith",
        "summary": (
            "A single application containing all major business functionality "
            "and deployed as one unit."
        ),
        "complexity": "Low",
        "estimated_cost": "Low",
        "scalability": 65,
        "maintainability": 80,
        "performance": 85,
        "security": 75,
        "strengths": [
            "Simple deployment",
            "Low operational overhead",
            "Fast development",
            "Easy local development and debugging",
        ],
        "risks": [
            "Scaling the entire application may become inefficient",
            "Large codebases can become difficult to maintain",
            "A failure can affect the entire application",
        ],
        "components": [
            "Web Application",
            "Application Logic",
            "Database",
            "Authentication",
        ],
    },

    "modular_monolith": {
        "name": "Modular Monolith",
        "summary": (
            "A single deployable application organized into clearly separated "
            "business modules with defined boundaries."
        ),
        "complexity": "Medium",
        "estimated_cost": "Low–Medium",
        "scalability": 80,
        "maintainability": 90,
        "performance": 85,
        "security": 85,
        "strengths": [
            "Clear module boundaries",
            "Simpler operations than microservices",
            "Good maintainability",
            "Can evolve toward microservices later",
        ],
        "risks": [
            "Modules still share the same deployment unit",
            "Poor boundaries can lead to tightly coupled code",
            "Independent service scaling is limited",
        ],
        "components": [
            "API Layer",
            "Business Modules",
            "Authentication Module",
            "Database",
            "Background Jobs",
        ],
    },

    "microservices": {
        "name": "Microservices",
        "summary": (
            "A distributed architecture where business capabilities are "
            "implemented as independently deployable services."
        ),
        "complexity": "High",
        "estimated_cost": "High",
        "scalability": 95,
        "maintainability": 80,
        "performance": 80,
        "security": 85,
        "strengths": [
            "Independent service scaling",
            "Fault isolation",
            "Independent deployments",
            "Suitable for large engineering teams",
            "Supports distributed and globally scaled workloads",
        ],
        "risks": [
            "High operational complexity",
            "Distributed-system debugging",
            "Network communication overhead",
            "Higher infrastructure and monitoring requirements",
        ],
        "components": [
            "API Gateway",
            "Authentication Service",
            "User Service",
            "Business Services",
            "Message Broker",
            "Service Databases",
            "Monitoring and Logging",
        ],
    },
}

def get_architecture_profile(architecture_id: str) -> dict:
    """
    Return the static profile for an architecture.
    """

    profile = ARCHITECTURE_PROFILES.get(architecture_id)

    if profile is None:
        raise ValueError(
            f"Unknown architecture: {architecture_id}"
        )

    return {
        "id": architecture_id,
        **profile,
    }