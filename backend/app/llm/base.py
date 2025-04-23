# Base class for LLM client implementations

from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional

class BaseLLMClient(ABC):
    @abstractmethod
    async def generate_response(self, message: str, history: List[Dict[str, str]]) -> Dict[str, Any]:
        """
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
        """
        pass
