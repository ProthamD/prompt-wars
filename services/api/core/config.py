from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    APP_ENV: str = "development"
    SECRET_KEY: str = "change-me-in-production"
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/terraprint"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # External APIs
    CLIMATIQ_API_KEY: str = ""
    PLAID_CLIENT_ID: str = ""
    PLAID_SECRET: str = ""
    PLAID_ENV: str = "sandbox"  # sandbox | development | production
    WATTTIME_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    PINECONE_API_KEY: str = ""
    PINECONE_INDEX: str = "terraprint-coach"
    FIREBASE_CREDENTIALS_PATH: str = ""
    MONGODB_URL: str = "mongodb://localhost:27017"
    GROQ_API_KEY: str = ""

    model_config = {"env_file": ".env", "case_sensitive": True}


settings = Settings()
