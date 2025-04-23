# API endpoints for managing conversations and messages.
# Uses Supabase for auth via dependencies and interacts with ConversationService.

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Body
from app.api.deps import get_supabase_client, get_current_user_id # Use new deps
from app.services.conversation import ConversationService
# Adapt schemas as needed for request/response bodies
from app.schemas.conversation import ConversationResponse, MessageCreatePayload, ConversationListResponse
from supabase import Client
import structlog
from typing import List

logger = structlog.get_logger(__name__)
router = APIRouter()

# Initialize ConversationService with Supabase client dependency
# This could also be done within each endpoint if preferred
def get_conversation_service(client: Client = Depends(get_supabase_client)) -> ConversationService:
    return ConversationService(supabase_client=client)


@router.post("/message", response_model=ConversationResponse)
async def create_message(
    # Use a Pydantic model for the request body for validation
    payload: MessageCreatePayload = Body(...),
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user_id), # Get user ID from verified Supabase token
    service: ConversationService = Depends(get_conversation_service), # Inject service
):
    """
    Processes a new message from the user, creates a conversation if needed,
    gets an AI response, and saves the turn.
    """
    logger.info("Received request to /message endpoint.", user_id=user_id, conversation_id=payload.conversation_id)
    try:
        response = await service.process_message(
            user_id=user_id,
            conversation_id=payload.conversation_id,
            message_content=payload.message
        )

        # Optional: Add background task for interaction tracking
        if response.token_usage:
            background_tasks.add_task(
                service.track_interaction,
                user_id=user_id,
                conversation_id=response.conversation_id,
                tokens_used=response.token_usage
            )

        return response
    except ValueError as ve: # Catch specific errors from service
         logger.warning(f"Value error processing message: {ve}", user_id=user_id)
         raise HTTPException(status_code=400, detail=str(ve))
    except HTTPException: # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Log unexpected errors
        logger.exception(
            "Unexpected error processing message",
            user_id=user_id,
            conversation_id=payload.conversation_id,
            error=str(e)
        )
        raise HTTPException(
            status_code=500,
            detail="An internal error occurred while processing your message."
        )

@router.get("/conversations", response_model=List[ConversationListResponse])
async def get_conversations_list(
    user_id: str = Depends(get_current_user_id),
    service: ConversationService = Depends(get_conversation_service),
):
    """
    Retrieves the list of conversations for the current user.
    """
    logger.info("Received request to /conversations endpoint.", user_id=user_id)
    try:
        conversations = await service.get_user_conversations(user_id=user_id)
        # Map DB result to response schema if necessary
        return conversations # Assuming service returns data compatible with ConversationListResponse
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error retrieving conversations list", user_id=user_id, error=str(e))
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve conversations."
        )


# Add endpoints for DELETE /conversations/{conversation_id}, etc. as needed
# Ensure they use get_current_user_id and call appropriate service methods. 