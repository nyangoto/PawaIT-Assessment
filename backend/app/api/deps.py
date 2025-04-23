# Provides FastAPI dependencies for handling Supabase authentication
# and accessing the Supabase client.

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Dict, Any, Optional
from supabase import Client
import logging

from app.core.security import verify_supabase_jwt
from app.db.supabase_client import get_supabase_client as get_db_client # Renamed for clarity

logger = logging.getLogger(__name__)

# Scheme for extracting the token from the Authorization header
# auto_error=False means it won't raise an error if the header is missing,
# allowing us to handle missing tokens explicitly in the dependency.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False) # tokenUrl is not used directly here

async def get_verified_token_payload(token: Optional[str] = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """
    Dependency to get the verified payload from a Supabase JWT.
    Raises 401 if the token is missing or invalid.
    Handles both authenticated and anonymous user tokens.
    """
    if token is None:
        logger.info("Authentication attempt failed: No token provided.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = await verify_supabase_jwt(token)
        return payload
    except HTTPException as e:
        # Re-raise HTTP exceptions from verify_supabase_jwt
        raise e
    except Exception as e:
        # Catch unexpected errors during verification
        logger.error(f"Unexpected error in token verification dependency: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal error occurred during authentication."
        )


async def get_current_user_id(payload: Dict[str, Any] = Depends(get_verified_token_payload)) -> str:
    """
    Dependency to get the user ID (sub claim) from the verified token payload.
    Ensures that the 'sub' claim exists.
    """
    user_id = payload.get("sub")
    if not user_id or not isinstance(user_id, str):
         logger.error("Verified token payload is missing 'sub' claim.")
         # This should ideally not happen if verify_supabase_jwt works correctly
         raise HTTPException(
             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
             detail="Invalid token payload structure after verification."
         )
    return user_id

# Dependency to get the Supabase client instance
def get_supabase_client() -> Client:
    """Provides the Supabase client instance."""
    return get_db_client()

# Optional: Dependency to specifically require a non-anonymous user
# async def get_current_authenticated_user_id(payload: Dict[str, Any] = Depends(get_verified_token_payload)) -> str:
#     """
#     Dependency that requires the user to be authenticated (not anonymous).
#     """
#     if payload.get("is_anonymous", True): # Default to True if flag is missing
#         logger.info("Access denied: Authenticated user required.")
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Requires authenticated user",
#         )
#     user_id = payload.get("sub")
#     if not user_id: # Should be caught by get_verified_token_payload already
#          raise HTTPException(status_code=500, detail="Invalid token state.")
#     return user_id 