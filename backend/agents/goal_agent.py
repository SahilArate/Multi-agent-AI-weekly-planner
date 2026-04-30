from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel
from typing import List
from loguru import logger
import os
import json

class ParsedGoal(BaseModel):
    title: str
    hours_per_week: float
    priority: str
    preferred_time: str
    category: str

class GoalAgentOutput(BaseModel):
    goals: List[ParsedGoal]
    summary: str

async def run_goal_agent(user_input: str) -> GoalAgentOutput:
    logger.info(f"Goal Agent started — input: {user_input}")

    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0.3,
        api_key=os.getenv("GROQ_API_KEY")
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are the Goal Agent in a multi-agent weekly planning system.

Your job is to read the user's weekly goals and convert them into structured JSON.

For each goal extract:
- title: short name for the goal
- hours_per_week: realistic hours needed per week
- priority: "high", "medium", or "low"
- preferred_time: "morning", "afternoon", "evening", or "any"
- category: "study", "health", "work", or "personal"

Respond ONLY with a valid JSON object — no extra text, no markdown:
{{
  "goals": [
    {{
      "title": "Study DSA",
      "hours_per_week": 10.0,
      "priority": "high",
      "preferred_time": "morning",
      "category": "study"
    }}
  ],
  "summary": "One sentence summary of all goals"
}}"""),
        ("human", "{user_input}")
    ])

    chain = prompt | llm
    response = await chain.ainvoke({"user_input": user_input})

    text = response.content.strip()

    # Clean markdown if present
    if "```" in text:
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]

    data = json.loads(text)

    result = GoalAgentOutput(
        goals=[ParsedGoal(**g) for g in data["goals"]],
        summary=data["summary"]
    )

    logger.success(f"Goal Agent done — found {len(result.goals)} goals")
    return result