#!/bin/bash

# Exit on error
set -e

echo "Starting backend file restructuring..."

# Create base directories
mkdir -p backend/app/{api/{endpoints},core,db,llm,schemas,services,utils}
mkdir -p backend/tests
mkdir -p backend/supabase/migrations

# Function to safely move a file
move_file() {
    SOURCE=$1
    DEST=$2
    
    # Check if source exists
    if [ -f "$SOURCE" ]; then
        # Create destination directory if it doesn't exist
        mkdir -p "$(dirname "$DEST")"
        
        # Move the file
        mv "$SOURCE" "$DEST"
        echo "Moved: $SOURCE -> $DEST"
    else
        echo "Warning: Source file not found: $SOURCE"
    fi
}

# Move root level files
move_file "pyproject.toml" "backend/pyproject.toml"
move_file "poetry.lock" "backend/poetry.lock"
move_file ".env.example" "backend/.env.example"
move_file "Dockerfile" "backend/Dockerfile"
move_file "docker-compose.yml" "backend/docker-compose.yml"

# Move app directory files
move_file "app/core/config.py" "backend/app/core/config.py"
move_file "app/db/supabase_client.py" "backend/app/db/supabase_client.py"
move_file "app/core/security.py" "backend/app/core/security.py"
move_file "app/api/deps.py" "backend/app/api/deps.py"
move_file "app/services/conversation.py" "backend/app/services/conversation.py"
move_file "app/api/endpoints/conversation.py" "backend/app/api/endpoints/conversation.py"
move_file "app/services/user_service.py" "backend/app/services/user_service.py"
move_file "app/api/endpoints/user.py" "backend/app/api/endpoints/user.py"
move_file "app/api/router.py" "backend/app/api/router.py"

# Check and move schema files if they exist
move_file "app/schemas/conversation.py" "backend/app/schemas/conversation.py"

# Create a placeholder for schemas if not found
if [ ! -f "backend/app/schemas/conversation.py" ]; then
    mkdir -p "backend/app/schemas"
    echo "# Placeholder for conversation schemas
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
" > "backend/app/schemas/conversation.py"
    echo "Created placeholder schema file: backend/app/schemas/conversation.py"
fi

# Move LLM files if they exist
if [ -d "app/llm" ]; then
    # Create LLM directory
    mkdir -p "backend/app/llm"
    
    # Move all files from app/llm to backend/app/llm
    for file in app/llm/*; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            mv "$file" "backend/app/llm/$filename"
            echo "Moved: $file -> backend/app/llm/$filename"
        fi
    done
else
    # Create placeholder LLM files
    mkdir -p "backend/app/llm"
    
    # Create base.py
    echo "# Base class for LLM client implementations

from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional

class BaseLLMClient(ABC):
    @abstractmethod
    async def generate_response(self, message: str, history: List[Dict[str, str]]) -> Dict[str, Any]:
        \"\"\"
        Generate a response based on the given message and conversation history.
        
        Args:
            message: The current user message.
            history: List of previous messages in the conversation.
                     Each message is a dict with 'role' (user/assistant) and 'content'.
        
        Returns:
            Dict containing:
                - answer: The LLM's response text.
                - follow_up_questions: List of suggested follow-up questions.
                - token_usage: Dict with token usage statistics.
                - metadata: Any additional data about the generation.
        \"\"\"
        pass" > "backend/app/llm/base.py"
    
    # Create factory.py
    echo "# Factory pattern for selecting and configuring LLM clients
# based on settings or request parameters.

from typing import Dict, Optional, Type
from .base import BaseLLMClient
# Import specific implementations
# from .openai_client import OpenAIClient
# from .anthropic_client import AnthropicClient
# from .google_client import GoogleClient

# Default client to use if none specified
DEFAULT_LLM = 'openai'

# Registry of available LLM clients
_LLM_REGISTRY: Dict[str, Type[BaseLLMClient]] = {
    # Register actual implementations here
    # 'openai': OpenAIClient,
    # 'anthropic': AnthropicClient,
    # 'google': GoogleClient,
}

# Singleton instances (created on demand)
_instances: Dict[str, BaseLLMClient] = {}

def get_llm_client(provider: Optional[str] = None) -> BaseLLMClient:
    \"\"\"
    Get or create an LLM client instance.
    
    Args:
        provider: The LLM provider to use (e.g., 'openai', 'anthropic', 'google').
                 If None, uses the default provider.
    
    Returns:
        An instance of the appropriate LLM client.
        
    Raises:
        ValueError: If the requested provider is not supported.
    \"\"\"
    provider = provider or DEFAULT_LLM
    
    if provider not in _LLM_REGISTRY:
        raise ValueError(f\"Unsupported LLM provider: {provider}. \"
                         f\"Available providers: {list(_LLM_REGISTRY.keys())}\")
    
    # Create instance if it doesn't exist
    if provider not in _instances:
        _instances[provider] = _LLM_REGISTRY[provider]()
    
    return _instances[provider]
" > "backend/app/llm/factory.py"
    
    echo "Created placeholder LLM files (base.py, factory.py) in backend/app/llm/"
fi

# Create a basic main.py if it doesn't exist
if [ ! -f "app/main.py" ]; then
    echo "# FastAPI application main entry point

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.core.config import settings
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format=\"%(levelname)s:     %(message)s\",
)

app = FastAPI(
    title=\"Freelancer Tax Assistant API\",
    description=\"API for the Supabase-powered Freelancer Tax Assistant\",
    version=\"0.1.0\",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=[\"*\"],
    allow_headers=[\"*\"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Health check endpoint
@app.get(\"/health\")
async def health_check():
    return {\"status\": \"ok\", \"message\": \"API is healthy\"}

# Startup event
@app.on_event(\"startup\")
async def startup_event():
    # Any startup tasks (e.g., verifying db connection)
    logging.info(\"API Starting Up...\")

# Shutdown event
@app.on_event(\"shutdown\")
async def shutdown_event():
    # Any cleanup tasks
    logging.info(\"API Shutting Down...\")
" > "backend/app/main.py"
    echo "Created placeholder main.py in backend/app/"
else
    move_file "app/main.py" "backend/app/main.py"
fi

echo "Backend file restructuring completed!"