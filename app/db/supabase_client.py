# Initializes the Supabase client instance for backend use.
# Uses the Service Role Key for elevated privileges when necessary,
# but API endpoints should operate within user context via RLS where possible.

from supabase import create_client, Client
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

supabase_client: Client | None = None

try:
    # Initialize Supabase client with URL and Service Role Key
    supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    logger.info("Supabase client initialized successfully.")
except Exception as e:
    logger.error(f"Failed to initialize Supabase client: {e}", exc_info=True)
    # Depending on the application, you might want to exit or handle this differently
    raise RuntimeError("Could not initialize Supabase client.") from e

def get_supabase_client() -> Client:
    """Dependency function to get the initialized Supabase client."""
    if supabase_client is None:
        # This should ideally not happen if initialization check is done at startup
        raise RuntimeError("Supabase client is not initialized.")
    return supabase_client 