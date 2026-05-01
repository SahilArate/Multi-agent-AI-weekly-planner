import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from loguru import logger
from agents.goal_agent import run_goal_agent
from agents.calendar_agent import run_calendar_agent
from agents.energy_agent import run_energy_agent
from agents.balance_agent import run_balance_agent
from agents.planner_agent import run_planner_agent
from utils.supabase_client import supabase
from datetime import date
from typing import List
import json

router = APIRouter(prefix="/api", tags=["planning"])

# ── Models ───────────────────────────────────────────
class PlanRequest(BaseModel):
    goals: str

class FullPlanRequest(BaseModel):
    goals: str
    commitments: str = "No existing commitments"
    preferences: str = "I am a morning person, most productive before noon"

class SavePlanRequest(BaseModel):
    user_id: str
    goals: str
    commitments: str
    preferences: str
    events: List[dict]
    week_summary: str
    total_hours: float

# ── Goal parse endpoint ──────────────────────────────
@router.post("/goals/parse")
async def parse_goals(request: PlanRequest):
    try:
        logger.info(f"Parsing goals: {request.goals}")
        result = await run_goal_agent(request.goals)
        return result
    except Exception as e:
        logger.error(f"Goal Agent failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ── Full plan REST endpoint ──────────────────────────
@router.post("/plan/generate")
async def generate_plan(request: FullPlanRequest):
    try:
        logger.info("Starting full multi-agent planning...")
        goals_result = await run_goal_agent(request.goals)
        calendar_result = await run_calendar_agent(request.commitments)
        energy_result = await run_energy_agent(request.preferences)
        balance_result = await run_balance_agent(
            goals_result.model_dump_json(),
            calendar_result.model_dump_json()
        )
        final_result = await run_planner_agent(
            goals_result.model_dump_json(),
            calendar_result.model_dump_json(),
            energy_result.model_dump_json(),
            balance_result.model_dump_json()
        )
        return {
            "status": "success",
            "plan": final_result.model_dump(),
            "agents_used": [
                "Goal Agent", "Calendar Agent",
                "Energy Agent", "Balance Agent", "Planner Agent"
            ]
        }
    except Exception as e:
        logger.error(f"Planning failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ── Save plan endpoint ───────────────────────────────
@router.post("/plan/save")
async def save_plan(request: SavePlanRequest):
    try:
        data = supabase.table("plans").insert({
            "user_id": request.user_id,
            "goals": request.goals,
            "commitments": request.commitments,
            "preferences": request.preferences,
            "week_start": str(date.today()),
            "events": request.events,
            "week_summary": request.week_summary,
            "total_hours": request.total_hours
        }).execute()
        logger.success(f"Plan saved for user: {request.user_id}")
        return {"status": "success", "plan_id": data.data[0]["id"]}
    except Exception as e:
        logger.error(f"Save plan failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ── Get plans endpoint ───────────────────────────────
@router.get("/plans/{user_id}")
async def get_plans(user_id: str):
    try:
        data = supabase.table("plans")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .execute()
        return {"status": "success", "plans": data.data}
    except Exception as e:
        logger.error(f"Get plans failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ── WebSocket endpoint ───────────────────────────────
@router.websocket("/ws/plan")
async def websocket_plan(websocket: WebSocket):
    await websocket.accept()
    logger.info("WebSocket connection opened")

    try:
        data = await websocket.receive_text()
        request = json.loads(data)

        goals = request.get("goals", "")
        commitments = request.get("commitments", "No existing commitments")
        preferences = request.get("preferences", "I am a morning person")

        async def send_update(agent: str, status: str, message: str, data=None):
            payload = {
                "agent": agent,
                "status": status,
                "message": message,
                "data": data
            }
            await websocket.send_text(json.dumps(payload))
            logger.info(f"WS sent: {agent} — {status}")

        await send_update("Goal Agent", "thinking", "Reading your goals and breaking them down...")
        goals_result = await run_goal_agent(goals)
        await send_update("Goal Agent", "done", f"Found {len(goals_result.goals)} goals — {goals_result.summary}", goals_result.model_dump())

        await send_update("Calendar Agent", "thinking", "Checking your schedule and finding free slots...")
        calendar_result = await run_calendar_agent(commitments)
        await send_update("Calendar Agent", "done", f"{calendar_result.summary}", calendar_result.model_dump())

        await send_update("Energy Agent", "thinking", "Analyzing your energy patterns...")
        energy_result = await run_energy_agent(preferences)
        await send_update("Energy Agent", "done", f"{energy_result.summary}", energy_result.model_dump())

        await send_update("Balance Agent", "thinking", "Making sure your week is balanced...")
        balance_result = await run_balance_agent(
            goals_result.model_dump_json(),
            calendar_result.model_dump_json()
        )
        await send_update("Balance Agent", "done", f"{balance_result.summary}", balance_result.model_dump())

        await send_update("Planner Agent", "thinking", "Creating your final weekly schedule...")
        final_result = await run_planner_agent(
            goals_result.model_dump_json(),
            calendar_result.model_dump_json(),
            energy_result.model_dump_json(),
            balance_result.model_dump_json()
        )
        await send_update("Planner Agent", "done", f"Done! Scheduled {len(final_result.events)} events for your week.", final_result.model_dump())

        await websocket.send_text(json.dumps({
            "agent": "system",
            "status": "complete",
            "message": "Your weekly plan is ready!",
            "data": {
                "events": final_result.model_dump()["events"],
                "week_summary": final_result.week_summary,
                "total_hours": final_result.total_scheduled_hours
            }
        }))

        logger.success("WebSocket planning complete")

    except WebSocketDisconnect:
        logger.info("WebSocket disconnected by client")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.send_text(json.dumps({
            "agent": "system",
            "status": "error",
            "message": f"Something went wrong: {str(e)}",
            "data": None
        }))
    finally:
        logger.info("WebSocket connection closed")