import json
from pathlib import Path
from jinja2 import Environment, FileSystemLoader

from app.schemas.itinerary import ItineraryRequest, ItineraryResponse, Itinerary
from app.services.ai.llm_client import get_llm_client

class GeneratorService:
    def __init__(self):
        self.llm_client = get_llm_client()
        # Set up Jinja2 environment to load templates
        prompt_dir = Path(__file__).parent.parent.parent / "prompts"
        self.jinja_env = Environment(loader=FileSystemLoader(prompt_dir))

    def _load_prompt_template(self, template_name: str) -> str:
        template = self.jinja_env.get_template(template_name)
        return template.render()

    async def generate_itinerary(self, request: ItineraryRequest) -> ItineraryResponse:
        """Generates an itinerary by calling the configured LLM."""
        
        # Render the prompt with user's input
        prompt_template = self.jinja_env.get_template("itinerary_v1.txt")
        prompt = prompt_template.render(
            destination=request.destination,
            start_date=request.start_date,
            end_date=request.end_date,
            interests=request.interests,
            budget=request.budget,
            party_size=request.party_size
        )

        # Generate the itinerary using the LLM
        llm_response_str = await self.llm_client.generate(prompt)
        
        # Parse the JSON response from the LLM
        try:
            llm_response_json = json.loads(llm_response_str)
        except json.JSONDecodeError:
            # Handle cases where the LLM response is not valid JSON
            # For now, we'll raise an error. In production, you might want a retry mechanism.
            raise ValueError("Failed to decode LLM response as JSON.")

        # Calculate duration
        duration = (request.end_date - request.start_date).days + 1

        # Structure the final response
        response = ItineraryResponse(
            destination=request.destination,
            duration_days=duration,
            itinerary=Itinerary(**llm_response_json)
        )

        return response
