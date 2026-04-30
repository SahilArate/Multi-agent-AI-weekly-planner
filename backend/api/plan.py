import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from loguru import logger
from agents.goal_agent import run_goal_agent
from agents.orchestrator import planner_graph, PlannerState
import json

router = APIRouter(prefix="/api", tags=["planning"])

class PlanRequest(BaseModel):
    goals: str

class FullPlanRequest(BaseModel):
    goals: str
    commitments: str = "No existing commitments"
    preferences: str = "I am a morning person, energetic in the morning"

@router.post("/goals/parse")
async def parse_goals(request: PlanRequest):
    try:
        logger.info(f"Parsing goals: {request.goals}")
        result = await run_goal_agent(request.goals)
        return result
    except Exception as e:
        logger.error(f"Goal Agent failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/plan/generate")
async def generate_plan(request: FullPlanRequest):
    try:
        logger.info("Starting full multi-agent planning...")

        initial_state: PlannerState = {
            "user_goals": request.goals,
            "user_commitments": request.commitments,
            "user_preferences": request.preferences,
            "goals_output": None,
            "calendar_output": None,
            "energy_output": None,
            "balance_output": None,
            "final_plan": None,
            "current_agent": "starting",
            "error": None
        }

        # Run all 5 agents through LangGraph
        final_state = await planner_graph.ainvoke(initial_state)

        if final_state.get("error"):
            raise HTTPException(status_code=500, detail=final_state["error"])

        # Parse the final plan
        final_plan = json.loads(final_state["final_plan"])

        return {
            "status": "success",
            "plan": final_plan,
            "agents_used": [
                "Goal Agent",
                "Calendar Agent",
                "Energy Agent",
                "Balance Agent",
                "Planner Agent"
            ]
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Planning failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))