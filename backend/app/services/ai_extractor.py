import json
from app.services.llm_service import LLMService


class AIExtractor:
    def __init__(self):
        self.llm = LLMService()

    def extract_requirements(self, prompt: str) -> dict:
        system_msg = """
You are a software requirements extraction system.

Your ONLY task is to extract software architecture requirements
from the user's application description.

Do NOT:
- recommend an architecture
- select Monolith, Modular Monolith, Microservices, Serverless,
  or Event-Driven
- calculate scores
- estimate costs
- invent missing information
- provide explanations

Return ONLY valid JSON using exactly this structure:

{
  "application_type": "string or null",
  "expected_users": "integer or null",
  "traffic_level": "low | medium | high | null",
  "team_size": "integer or null",
  "budget": "low | medium | high | null",
  "availability_requirement": "low | standard | high | critical | null",
  "latency_requirement": "low | standard | high | critical | null",
  "global_distribution": "boolean or null",
  "real_time": "boolean or null",
  "compliance_required": "boolean or null"
}

Rules:

1. Extract only information supported by the user's description.
2. If information is not provided, return null.
3. Do not guess values.
4. Convert natural language into the closest valid value.
5. expected_users and team_size must be integers when explicitly stated.
6. Return JSON only. No markdown. No explanation.
"""

        raw_response = self.llm.generate_chat(
            system_msg,
            prompt
        )

        try:
            clean_json = (
                raw_response
                .replace("```json", "")
                .replace("```", "")
                .strip()
            )

            return json.loads(clean_json)

        except (json.JSONDecodeError, TypeError) as e:
            raise ValueError(
                f"Failed to parse requirement extraction response: {e}"
            )