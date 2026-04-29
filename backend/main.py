import sys
import os

# This MUST be first — before any other imports
os.environ["PYTHONPATH"] = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from loguru import logger
import uvicorn

load_dotenv()

app = FastAPI(
    title="AI Weekly Planner",
    description="Multi-agent weekly planning system",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from api.plan import router as plan_router
app.include_router(plan_router)

@app.get("/")
async def root():
    return {"status": "AI Planner backend is running"}

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "openai_configured": bool(os.getenv("OPENAI_API_KEY"))
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)