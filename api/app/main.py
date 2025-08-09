from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import itinerary

app = FastAPI(
    title="Trafella API",
    description="AI-powered itinerary generation",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(itinerary.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Trafella API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
