from openai import OpenAI
from app.config import settings

class LLMServiceError(Exception):
    """Raised when the LLM provider cannot complete a request."""

class LLMService:
    def __init__(self):
        self.provider = settings.llm_provider
        self.model = settings.llm_model
        if self.provider == "groq":
            self.client = OpenAI(
                base_url="https://api.groq.com/openai/v1",
                api_key=settings.groq_api_key
            )
        elif self.provider == "ollama":
            self.client = OpenAI(
                base_url="http://localhost:11434/v1/",
                api_key="ollama"
            )
        else:
            self.client = OpenAI(
                api_key=settings.openai_api_key
            )

    
    def generate_chat(self, system_prompt: str, user_prompt: str) -> str:
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.2,
                timeout=30.0,
            )

            content = response.choices[0].message.content

            if not content or not content.strip():
                raise LLMServiceError(
                    "The LLM provider returned an empty response."
                )

            return content

        except LLMServiceError:
            raise

        except Exception as exc:
            raise LLMServiceError(
                "The LLM provider request failed."
            ) from exc
