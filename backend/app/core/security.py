# Handles Supabase JWT verification using the JWKS endpoint.
# Replaces previous custom token generation/verification logic.

import httpx
from jose import jwt, jwk
from jose.exceptions import JWTError, JWKError
from fastapi import HTTPException, status
from app.core.config import settings
from typing import Dict, Any
from cachetools import TTLCache
import logging
import time

logger = logging.getLogger(__name__)

# Cache for JWKS (e.g., cache for 1 hour)
jwks_cache = TTLCache(maxsize=1, ttl=3600)
JWKS_URL = f"{settings.SUPABASE_URL}/auth/v1/jwks"

async def get_jwks() -> Dict[str, Any]:
    """
    Fetches JWKS from Supabase, using a time-based cache.
    """
    cached_jwks = jwks_cache.get("jwks")
    if cached_jwks:
        logger.debug("Using cached JWKS.")
        return cached_jwks

    logger.info(f"Fetching JWKS from {JWKS_URL}")
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(JWKS_URL, timeout=10.0)
            response.raise_for_status()
            jwks = response.json()
            jwks_cache["jwks"] = jwks
            logger.info("Successfully fetched and cached JWKS.")
            return jwks
        except httpx.RequestError as exc:
            logger.error(f"Error fetching JWKS: {exc}")
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Could not fetch authentication keys.")
        except Exception as e:
            logger.error(f"Unexpected error fetching JWKS: {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal error during authentication setup.")


async def verify_supabase_jwt(token: str) -> Dict[str, Any]:
    """
    Verifies a JWT received from the frontend against Supabase JWKS.
    Returns the decoded payload if valid.
    Handles both authenticated and anonymous user tokens.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_expired_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token has expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    invalid_claims_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid claims in token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        jwks = await get_jwks()
        unverified_header = jwt.get_unverified_header(token)
        rsa_key = {}
        if not jwks.get("keys"):
             logger.error("JWKS response did not contain 'keys'.")
             raise credentials_exception

        kid = unverified_header.get("kid")
        if not kid:
            logger.warning("Token header missing 'kid'.")
            raise credentials_exception

        for key in jwks["keys"]:
            if key.get("kid") == kid:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"],
                }
                break

        if not rsa_key:
            logger.warning(f"Unable to find matching key for kid '{kid}' in JWKS.")
            raise credentials_exception

        # Decode the JWT
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            # Supabase audiences: 'authenticated' for logged-in, 'anon' for anonymous
            # Allow both, verify specific roles later if needed
            audience=[ 'authenticated', 'anon' ],
            issuer=f"{settings.SUPABASE_URL}/auth/v1"
        )

        # Basic validation of essential claims
        user_id: str | None = payload.get("sub")
        role: str | None = payload.get("role")
        exp: int | None = payload.get("exp")

        if not user_id or not role or not exp:
            logger.warning("Token payload missing essential claims (sub, role, exp).")
            raise invalid_claims_exception

        # Check expiry (using a small grace period if desired)
        current_time = time.time()
        if current_time > exp:
            logger.info(f"Token expired for user {user_id}.")
            raise token_expired_exception

        # Add is_anonymous flag for convenience
        payload["is_anonymous"] = (role == "anon")

        logger.debug(f"JWT verified successfully for user {user_id} with role {role}.")
        return payload

    except jwt.ExpiredSignatureError:
        logger.info("Attempted to use an expired token.")
        raise token_expired_exception
    except (JWTError, JWKError, KeyError) as e:
        logger.warning(f"JWT verification failed: {e}")
        raise credentials_exception
    except HTTPException:
        # Re-raise HTTPExceptions from get_jwks
        raise
    except Exception as e:
        logger.error(f"Unexpected error during JWT verification: {e}", exc_info=True)
        raise credentials_exception 