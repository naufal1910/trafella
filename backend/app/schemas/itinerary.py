from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import date
from uuid import UUID, uuid4

class ItineraryRequest(BaseModel):
    destination: str
    start_date: date
    end_date: date
    interests: List[str] = []
    budget: Optional[str] = None
    party_size: int = 1

    @validator('end_date')
    def validate_end_date(cls, v, values):
        if 'start_date' in values and v <= values['start_date']:
            raise ValueError('end_date must be after start_date')
        return v

class Activities(BaseModel):
    morning: str
    afternoon: str
    evening: str

class DayPlan(BaseModel):
    day_number: int
    date: date
    title: str
    summary: str
    activities: Activities
    tips: Optional[str] = None

class Itinerary(BaseModel):
    days: List[DayPlan]

class ItineraryResponse(BaseModel):
    request_id: UUID = Field(default_factory=uuid4)
    destination: str
    duration_days: int
    itinerary: Itinerary
