# FastAPI application main entry point

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.core.config import settings
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s:     %(message)s",
)

app = FastAPI(
    title="Freelancer Tax Assistant API",
    description="API for the Supabase-powered Freelancer Tax Assistant",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "API is healthy"}

# Startup event
@app.on_event("startup")
async def startup_event():
    # Any startup tasks (e.g., verifying db connection)
    logging.info("API Starting Up...")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    # Any cleanup tasks
    logging.info("API Shutting Down...")

