import pytest
from httpx import AsyncClient
from fastapi import status
from datetime import date

from app.main import app

@pytest.mark.asyncio
class TestItineraryAPI:
    async def test_generate_itinerary_valid_request(self):
        """Test successful itinerary generation with valid inputs."""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            payload = {
                "destination": "Paris",
                "start_date": "2024-09-01",
                "end_date": "2024-09-03",
                "interests": ["art", "food", "culture"],
                "budget": "medium",
                "party_size": 2
            }
            response = await ac.post("/api/v1/generate-itinerary", json=payload)
            
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "destination" in data
        assert data["destination"] == "Paris"
        assert "duration_days" in data
        assert data["duration_days"] == 3
        assert "itinerary" in data
        assert "days" in data["itinerary"]
        assert len(data["itinerary"]["days"]) == 3

    async def test_generate_itinerary_missing_destination(self):
        """Test API returns 422 when destination is missing."""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            payload = {
                "start_date": "2024-09-01",
                "end_date": "2024-09-03",
                "interests": ["art", "food"],
                "budget": "medium"
            }
            response = await ac.post("/api/v1/generate-itinerary", json=payload)
            
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    async def test_generate_itinerary_invalid_date_format(self):
        """Test API returns 422 for invalid date format."""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            payload = {
                "destination": "Tokyo",
                "start_date": "invalid-date",
                "end_date": "2024-09-03",
                "interests": ["culture"]
            }
            response = await ac.post("/api/v1/generate-itinerary", json=payload)
            
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    async def test_generate_itinerary_end_before_start(self):
        """Test API returns 422 when end date is before start date."""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            payload = {
                "destination": "London",
                "start_date": "2024-09-05",
                "end_date": "2024-09-03",
                "interests": ["history"]
            }
            response = await ac.post("/api/v1/generate-itinerary", json=payload)
            
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    async def test_health_check(self):
        """Test health check endpoint returns 200."""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.get("/health")
            
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == {"status": "healthy"}

    async def test_root_endpoint(self):
        """Test root endpoint returns welcome message."""
        async with AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.get("/")
            
        assert response.status_code == status.HTTP_200_OK
        assert "message" in response.json()
