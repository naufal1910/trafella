from fastapi import APIRouter, HTTPException
from app.schemas.itinerary import ItineraryRequest, ItineraryResponse
from app.services.ai.generator import GeneratorService

router = APIRouter(prefix="/api/v1", tags=["itinerary"])
generator_service = GeneratorService()

@router.post("/generate-itinerary", response_model=ItineraryResponse)
async def generate_itinerary(request: ItineraryRequest):
    """
    Generates a travel itinerary based on user preferences.
    
    - **destination**: The travel destination
    - **start_date**: Start date of the trip (YYYY-MM-DD)
    - **end_date**: End date of the trip (YYYY-MM-DD)
    - **interests**: List of interests or themes for the trip
    - **budget**: Optional budget preference (low, medium, high)
    - **party_size**: Number of travelers (default: 1)
    """
    try:
        itinerary = await generator_service.generate_itinerary(request)
        return itinerary
    except Exception as e:
        # Log the error here in production
        raise HTTPException(status_code=500, detail=str(e))
