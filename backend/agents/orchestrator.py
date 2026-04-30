from langgraph.graph import StateGraph, END
from typing import TypedDict, Optional
from loguru import logger
import json

from agents.goal_agent import run_goal_agent, GoalAgentOutput
from agents.calendar_agent import run_calendar_agent, CalendarAgentOutput
from agents.energy_agent import run_energy_agent, EnergyAgentOutput
from agents.balance_agent import run_balance_agent, BalanceAgentOutput
from agents.planner_agent import run_planner_agent, PlannerAgentOutput

# This is the shared state passed between all agents
class PlannerState(TypedDict):
    # User inputs
    user_goals: str
    user_commitments: str
    user_preferences: str

    # Agent outputs (filled one by one)
    goals_output: Optional[str]
    calendar_output: Optional[str]
    energy_output: Optional[str]
    balance_output: Optional[str]
    final_plan: Optional[str]

    # Status tracking
    current_agent: str
    error: Optional[str]

# ── Node 1: Goal Agent ──────────────────────────────
async def goal_node(state: PlannerState) -> PlannerState:
    logger.info("🎯 Goal Agent running...")
    state["current_agent"] = "Goal Agent"
    try:
        result = await run_goal_agent(state["user_goals"])
        state["goals_output"] = result.model_dump_json()
        logger.success("🎯 Goal Agent done")
    except Exception as e:
        state["error"] = f"Goal Agent failed: {e}"
        logger.error(state["error"])
    return state

# ── Node 2: Calendar Agent ──────────────────────────
async def calendar_node(state: PlannerState) -> PlannerState:
    logger.info("📅 Calendar Agent running...")
    state["current_agent"] = "Calendar Agent"
    try:
        result = await run_calendar_agent(state["user_commitments"])
        state["calendar_output"] = result.model_dump_json()
        logger.success("📅 Calendar Agent done")
    except Exception as e:
        state["error"] = f"Calendar Agent failed: {e}"
        logger.error(state["error"])
    return state

# ── Node 3: Energy Agent ────────────────────────────
async def energy_node(state: PlannerState) -> PlannerState:
    logger.info("⚡ Energy Agent running...")
    state["current_agent"] = "Energy Agent"
    try:
        result = await run_energy_agent(state["user_preferences"])
        state["energy_output"] = result.model_dump_json()
        logger.success("⚡ Energy Agent done")
    except Exception as e:
        state["error"] = f"Energy Agent failed: {e}"
        logger.error(state["error"])
    return state

# ── Node 4: Balance Agent ───────────────────────────
async def balance_node(state: PlannerState) -> PlannerState:
    logger.info("⚖️ Balance Agent running...")
    state["current_agent"] = "Balance Agent"
    try:
        result = await run_balance_agent(
            state["goals_output"],
            state["calendar_output"]
        )
        state["balance_output"] = result.model_dump_json()
        logger.success("⚖️ Balance Agent done")
    except Exception as e:
        state["error"] = f"Balance Agent failed: {e}"
        logger.error(state["error"])
    return state

# ── Node 5: Planner Agent ───────────────────────────
async def planner_node(state: PlannerState) -> PlannerState:
    logger.info("📋 Planner Agent running — final plan...")
    state["current_agent"] = "Planner Agent"
    try:
        result = await run_planner_agent(
            state["goals_output"],
            state["calendar_output"],
            state["energy_output"],
            state["balance_output"]
        )
        state["final_plan"] = result.model_dump_json()
        logger.success("📋 Planner Agent done — plan ready!")
    except Exception as e:
        state["error"] = f"Planner Agent failed: {e}"
        logger.error(state["error"])
    return state

# ── Build the Graph ─────────────────────────────────
def build_planner_graph():
    graph = StateGraph(PlannerState)

    # Add all 5 agents as nodes
    graph.add_node("goal_agent", goal_node)
    graph.add_node("calendar_agent", calendar_node)
    graph.add_node("energy_agent", energy_node)
    graph.add_node("balance_agent", balance_node)
    graph.add_node("planner_agent", planner_node)

    # Define the flow — agents run in this order
    graph.set_entry_point("goal_agent")
    graph.add_edge("goal_agent", "calendar_agent")
    graph.add_edge("calendar_agent", "energy_agent")
    graph.add_edge("energy_agent", "balance_agent")
    graph.add_edge("balance_agent", "planner_agent")
    graph.add_edge("planner_agent", END)

    return graph.compile()

# Single instance of the compiled graph
planner_graph = build_planner_graph()