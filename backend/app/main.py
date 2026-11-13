from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.analyze import router as analyze_router

app = FastAPI(
    title="AI Architecture Decision Engine",
    version="1.0.0",
    description="Deterministic architecture decision engine with FastAPI and Pydantic."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect our new architecture analysis endpoint!
app.include_router(analyze_router, prefix="/api/v1/architecture", tags=["Architecture Analysis"])

@app.get("/health", tags=["System"])
def health_check():
    """Verify backend health and operational status."""
    return {
        "status": "healthy",
        "environment": settings.app_env
    }