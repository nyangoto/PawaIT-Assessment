# Factory pattern for selecting and configuring LLM clients
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
    """
    Get or create an LLM client instance.
    
    Args:
        provider: The LLM provider to use (e.g., 'openai', 'anthropic', 'google').
                 If None, uses the default provider.
    
    Returns:
        An instance of the appropriate LLM client.
        
    Raises:
        ValueError: If the requested provider is not supported.
    """
    provider = provider or DEFAULT_LLM
    
    if provider not in _LLM_REGISTRY:
        raise ValueError(f"Unsupported LLM provider: {provider}. "
                         f"Available providers: {list(_LLM_REGISTRY.keys())}")
    
    # Create instance if it doesn't exist
    if provider not in _instances:
        _instances[provider] = _LLM_REGISTRY[provider]()
    
    return _instances[provider]

