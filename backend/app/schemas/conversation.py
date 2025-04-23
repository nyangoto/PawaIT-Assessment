# Placeholder for conversation schemas
# Implement Pydantic models for request/response data

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

class MessageCreatePayload(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ConversationResponse(BaseModel):
    conversation_id: str
    user_message_id: str
    assistant_message_id: str
    answer: str
    follow_up_questions: Optional[List[str]] = None
    token_usage: Optional[Dict[str, int]] = None
    disclaimer: str

class ConversationListResponse(BaseModel):
    id: str
    title: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

