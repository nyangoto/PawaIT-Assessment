# Service layer for handling conversation logic.
# Uses Supabase client for database interactions, relying on RLS for data scoping.
# Removed dependencies on SQLAlchemy models and sessions.

from supabase import Client, PostgrestAPIResponse
from app.llm.base import BaseLLMClient # Assuming this exists and is configured
from app.schemas.conversation import ConversationResponse, MessageFormat # Define/adapt these schemas
from typing import Optional, List, Dict, Any
import uuid
import structlog
from app.llm.factory import get_llm_client # Assuming LLM factory exists

logger = structlog.get_logger(__name__)

class ConversationService:
    """Service for managing conversations and messages using Supabase."""

    def __init__(self, supabase_client: Client):
        self.db: Client = supabase_client
        # Get LLM client instance (specific provider based on config/request)
        # This might need adjustment based on how LLM selection is implemented (FR-13)
        self.llm_client: BaseLLMClient = get_llm_client() # Example: Get default client

    async def _get_conversation_history(self, conversation_id: str, user_id: str) -> List[Dict[str, str]]:
        """Retrieves message history for a given conversation, respecting RLS."""
        try:
            # Fetch messages associated with the conversation_id.
            # RLS policy on 'messages' table ensures only user's messages are returned
            # based on the user_id associated with the JWT used by the Supabase client
            # passed to this service (or implicitly via API call context).
            # **IMPORTANT**: For this backend service using the *Service Role Key*,
            # RLS is bypassed unless we explicitly set the user's JWT for the request.
            # A better pattern for strict RLS adherence even in the backend is needed.
            # Option 1: Pass user's JWT to this service and use it for DB calls.
            # Option 2: Filter explicitly by user_id here (less secure if RLS is the goal).
            # Let's implement Option 2 for now, assuming RLS is the primary guard on direct frontend access.

            response: PostgrestAPIResponse = await self.db.table('messages')\
                .select('role, content')\
                .eq('conversation_id', conversation_id)\
                .eq('user_id', user_id) # Explicit filter needed when using Service Role Key
                .order('created_at', desc=False)\
                .execute()

            if response.data:
                # Convert to the simple list format expected by LLM client
                history = [{"role": msg["role"], "content": msg["content"]} for msg in response.data]
                logger.debug(f"Retrieved {len(history)} messages for conversation {conversation_id}")
                return history
            else:
                 logger.debug(f"No history found for conversation {conversation_id}")
                 return []
        except Exception as e:
            logger.error(f"Error retrieving history for conversation {conversation_id}: {e}", exc_info=True)
            # Depending on policy, might return empty list or re-raise
            return [] # Return empty list on error to avoid breaking flow

    async def process_message(
        self,
        user_id: str,
        message_content: str,
        conversation_id: Optional[str] = None,
    ) -> ConversationResponse:
        """
        Processes a new message: gets history, calls LLM, saves messages, returns response.
        """
        log = logger.bind(user_id=user_id, conversation_id=conversation_id)
        log.info("Processing new message.")

        history: List[Dict[str, str]] = []
        if conversation_id:
            history = await self._get_conversation_history(conversation_id, user_id)
        else:
            # Create a new conversation if ID is not provided
            log.info("No conversation ID provided, creating new conversation.")
            try:
                new_conv_id = str(uuid.uuid4())
                insert_data = {"id": new_conv_id, "user_id": user_id, "title": message_content[:60]} # Example title
                response: PostgrestAPIResponse = await self.db.table('conversations')\
                    .insert(insert_data)\
                    .execute()
                if response.data and len(response.data) > 0:
                    conversation_id = response.data[0]['id']
                    log = log.bind(conversation_id=conversation_id) # Update log context
                    log.info(f"Created new conversation with ID: {conversation_id}")
                else:
                     log.error("Failed to create new conversation record.", response=response.error or response.status_code)
                     raise ValueError("Failed to create conversation") # Or specific exception
            except Exception as e:
                 log.error(f"Error creating new conversation: {e}", exc_info=True)
                 raise # Re-raise the exception

        # Call the LLM
        log.debug("Calling LLM to generate response.")
        try:
             # Ensure history does not exceed context window limits (implementation needed in LLM client)
            llm_response_data = await self.llm_client.generate_response(message_content, history)
            log.debug("LLM response received.", tokens=llm_response_data.get("token_usage"))
        except Exception as e:
            log.error(f"LLM generation failed: {e}", exc_info=True)
            raise HTTPException(status_code=502, detail="Failed to get response from AI model.")


        # Save user message and AI response to Supabase
        try:
            user_message_id = str(uuid.uuid4())
            assistant_message_id = str(uuid.uuid4())
            messages_to_insert = [
                {
                    "id": user_message_id,
                    "conversation_id": conversation_id,
                    "user_id": user_id, # Associate both with user for filtering
                    "role": "user",
                    "content": message_content
                },
                {
                    "id": assistant_message_id,
                    "conversation_id": conversation_id,
                    "user_id": user_id,
                    "role": "assistant",
                    "content": llm_response_data["answer"],
                    "metadata": {
                        "token_usage": llm_response_data.get("token_usage"),
                        "follow_up_questions": llm_response_data.get("follow_up_questions"),
                        "llm_provider": self.llm_client.__class__.__name__ # Example provider tracking
                    }
                }
            ]
            response: PostgrestAPIResponse = await self.db.table('messages').insert(messages_to_insert).execute()
            if not response.data or len(response.data) != 2:
                 log.error("Failed to save messages to database.", response=response.error or response.status_code)
                 # Decide handling: maybe retry, or raise error
                 raise ValueError("Failed to save conversation turn.")
            log.info("User and assistant messages saved successfully.")

        except Exception as e:
            log.error(f"Error saving messages to database: {e}", exc_info=True)
            # Consider compensating actions if needed (e.g., marking conversation as potentially inconsistent)
            raise # Re-raise

        # Prepare and return the response structure expected by the frontend
        # Adapt the ConversationResponse schema as needed
        return ConversationResponse(
            conversation_id=conversation_id,
            user_message_id=user_message_id,
            assistant_message_id=assistant_message_id,
            answer=llm_response_data["answer"],
            follow_up_questions=llm_response_data.get("follow_up_questions", []),
            token_usage=llm_response_data.get("token_usage"),
            disclaimer="This information is provided for general guidance only..." # Add full disclaimer
        )

    async def get_user_conversations(self, user_id: str) -> List[Dict[str, Any]]:
        """Retrieves a list of conversations for the given user."""
        log = logger.bind(user_id=user_id)
        log.info("Fetching user conversations list.")
        try:
             # RLS Note: Explicit user_id filter needed when using Service Role Key
            response: PostgrestAPIResponse = await self.db.table('conversations')\
                .select('id, title, created_at, updated_at') # Select desired fields
                .eq('user_id', user_id)\
                .order('created_at', desc=True)\
                .execute()
            if response.data:
                log.info(f"Found {len(response.data)} conversations.")
                return response.data
            else:
                 log.info("No conversations found for user.")
                 return []
        except Exception as e:
            log.error(f"Error fetching conversations: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail="Could not retrieve conversation history.")


    async def track_interaction(self, user_id: str, conversation_id: str, tokens_used: Optional[Dict]):
        """Placeholder for tracking usage metrics (e.g., token counts)."""
        # This could write to a separate metrics table, call an external service, etc.
        logger.info("Tracking interaction.", user_id=user_id, conversation_id=conversation_id, tokens_used=tokens_used)
        pass

    # Add other methods as needed: delete_conversation, rename_conversation, etc.
    # Always ensure operations are scoped by user_id when using the service key. 