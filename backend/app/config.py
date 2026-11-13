
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"
    port: int = 8000
    database_url: str = (
        "postgresql://postgres:postgres@localhost:5432/architecture_db"
    )
    openai_api_key: str = ""
    llm_provider: str = "groq"
    llm_model: str = "openai/gpt-oss-120b"
    groq_api_key: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
    )


settings = Settings()
