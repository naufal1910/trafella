import os
from abc import ABC, abstractmethod
import httpx
from dotenv import load_dotenv
from pydantic import BaseModel

# Load environment variables from .env file
load_dotenv()

class LLMClient(ABC):
    """Abstract base class for a Large Language Model client."""
    @abstractmethod
    async def generate(self, prompt: str) -> str:
        pass

class OpenAIClient(LLMClient):
    """Client for interacting with the OpenAI API."""
    def __init__(self, api_key: str, model: str = "gpt-4o"):
        if not api_key:
            raise ValueError("OpenAI API key is required.")
        self.api_key = api_key
        self.model = model
        self.api_url = "https://api.openai.com/v1/chat/completions"

    async def generate(self, prompt: str) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "response_format": {"type": "json_object"},
        }
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(self.api_url, headers=headers, json=payload, timeout=90.0)
                response.raise_for_status()
                data = response.json()
                content = data['choices'][0]['message']['content']
                return content
            except httpx.HTTPStatusError as e:
                # Log error or handle it as needed
                print(f"Error calling OpenAI API: {e}")
                raise

def get_llm_client() -> LLMClient:
    """Factory function to get the configured LLM client."""
    provider = os.getenv("LLM_PROVIDER", "openai").lower()
    
    if provider == "openai":
        api_key = os.getenv("OPENAI_API_KEY")
        return OpenAIClient(api_key=api_key)
    
    # Future providers can be added here
    # elif provider == "google":
    #     return GoogleClient(...)
    
    else:
        raise ValueError(f"Unsupported LLM provider: {provider}")
