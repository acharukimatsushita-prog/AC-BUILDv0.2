from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgres://postgres:postgres@localhost:5432/ac_builde"
    openai_api_key: str | None = None  # OPENAI_API_KEY
    openai_model: str = "gpt-4.1-mini"  # OPENAI_MODEL
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"


settings = Settings()
