from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel
from typing import List
from loguru import logger
import os
import json

class DayBalance(BaseModel):
    day: str
    work_hours: float
    health_hours: float
    study_hours: float
    personal_hours: float
    is_balanced: bool

class BalanceAgentOutput(BaseModel):
    daily_balance: List[DayBalance]
    warnings: List[str]
    recommendations: List[str]
    summary: str

async def run_balance_agent(goals_json: str, free_slots_json: str) -> BalanceAgentOutput:
    logger.info("Balance Agent started")

    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0.3,
        api_key=os.getenv("GROQ_API_KEY")
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are the Balance Agent in a multi-agent weekly planning system.

Your job is to ensure the weekly plan has a healthy balance across all life areas.
Check that no single day is overloaded and all categories get appropriate time.

Rules:
- No more than 10 hours of work/study per day
- At least 1 hour of health/exercise per week
- At least 1 rest day or light day per week
- Warn if any day exceeds 12 hours of scheduled tasks

Respond ONLY with valid JSON — no extra text:
{{
  "daily_balance": [
    {{
      "day": "Monday",
      "work_hours": 3.0,
      "health_hours": 1.0,
      "study_hours": 2.0,
      "personal_hours": 1.0,
      "is_balanced": true
    }}
  ],
  "warnings": ["Tuesday is overloaded with 13 hours scheduled"],
  "recommendations": ["Move some Tuesday tasks to Thursday"],
  "summary": "Overall the week is well balanced with minor adjustments needed"
}}"""),
        ("human", "Goals: {goals}\n\nAvailable slots: {slots}")
    ])

    chain = prompt | llm
    response = await chain.ainvoke({
        "goals": goals_json,
        "slots": free_slots_json
    })

    text = response.content.strip()
    if "```" in text:
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]

    data = json.loads(text)

    result = BalanceAgentOutput(
        daily_balance=[DayBalance(**d) for d in data["daily_balance"]],
        warnings=data["warnings"],
        recommendations=data["recommendations"],
        summary=data["summary"]
    )

    logger.success("Balance Agent done")
    return result