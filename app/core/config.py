# Configuration using pydantic-settings, including Supabase keys.
# Removed old database connection settings.

from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    """Application settings."""
    PROJECT_NAME: str = "Freelancer Tax Assistant (Supabase)"
    API_V1_STR: str = "/api/v1"

    # Supabase Configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "") # Use Service Role Key for backend operations
    # SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "") # Deprecated - Use JWKS URL instead for better security

    # LLM API Keys (Load securely)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")

    # CORS Origins (Adjust as needed)
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000", "https://your-frontend-domain.com"]

    # Optional: Redis/RabbitMQ config if used
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", 6379))
    RABBITMQ_URL: str = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost/")


    class Config:
        # Load from .env file if present
        env_file = '.env'
        env_file_encoding = 'utf-8'
        case_sensitive = True

settings = Settings()

# Validate essential Supabase settings
if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in environment variables or .env file.") 