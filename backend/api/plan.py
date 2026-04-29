from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from loguru import logger
from agents.goal_agent import run_goal_agent

router = APIRouter(prefix="/api", tags=["planning"])

class PlanRequest(BaseModel):
    goals: str

@router.post("/goals/parse")
async def parse_goals(request: PlanRequest):
    try:
        logger.info(f"Parsing goals: {request.goals}")
        result = await run_goal_agent(request.goals)
        return result
    except Exception as e:
        logger.error(f"Goal Agent failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))