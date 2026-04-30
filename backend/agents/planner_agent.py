from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel
from typing import List
from loguru import logger
import os
import json

class ScheduledEvent(BaseModel):
    title: str
    day: str
    start_time: str
    end_time: str
    category: str      # "study", "health", "work", "personal"
    priority: str      # "high", "medium", "low"
    color: str         # hex color for UI

class PlannerAgentOutput(BaseModel):
    events: List[ScheduledEvent]
    week_summary: str
    total_scheduled_hours: float

async def run_planner_agent(
    goals_json: str,
    free_slots_json: str,
    energy_json: str,
    balance_json: str
) -> PlannerAgentOutput:
    logger.info("Planner Agent started — final orchestration")

    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0.3,
        api_key=os.getenv("GROQ_API_KEY")
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are the Planner Agent — the final decision maker in a multi-agent weekly planning system.

You receive outputs from 3 other agents:
- Goal Agent: what the user wants to achieve
- Calendar Agent: when they are free
- Energy Agent: when they perform best
- Balance Agent: how to keep days balanced

Your job is to combine all this information and create the FINAL weekly schedule.

Rules:
- Schedule high priority + study tasks during peak energy hours
- Schedule health tasks in free afternoon slots
- Never exceed balance agent warnings
- Assign colors: study=#3B82F6, health=#10B981, work=#8B5CF6, personal=#F59E0B

Respond ONLY with valid JSON — no extra text:
{{
  "events": [
    {{
      "title": "Study DSA",
      "day": "Monday",
      "start_time": "09:00",
      "end_time": "11:00",
      "category": "study",
      "priority": "high",
      "color": "#3B82F6"
    }}
  ],
  "week_summary": "A focused week with 14hrs study, 3hrs gym, 21hrs project work",
  "total_scheduled_hours": 38.0
}}"""),
        ("human", """Create the final weekly plan using:

GOALS: {goals}
FREE SLOTS: {slots}
ENERGY PROFILE: {energy}
BALANCE CHECK: {balance}""")
    ])

    chain = prompt | llm
    response = await chain.ainvoke({
        "goals": goals_json,
        "slots": free_slots_json,
        "energy": energy_json,
        "balance": balance_json
    })

    text = response.content.strip()
    if "```" in text:
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]

    data = json.loads(text)

    result = PlannerAgentOutput(
        events=[ScheduledEvent(**e) for e in data["events"]],
        week_summary=data["week_summary"],
        total_scheduled_hours=data["total_scheduled_hours"]
    )

    logger.success(f"Planner Agent done — {len(result.events)} events scheduled")
    return result