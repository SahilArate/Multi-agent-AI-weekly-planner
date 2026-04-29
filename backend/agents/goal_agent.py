import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel
from typing import List
from loguru import logger
import os

# This is what the Goal Agent returns
class ParsedGoal(BaseModel):
    title: str          # e.g. "Study DSA"
    hours_per_week: float  # e.g. 2.0
    priority: str       # "high", "medium", "low"
    preferred_time: str # "morning", "afternoon", "evening", "any"
    category: str       # "study", "health", "work", "personal"

class GoalAgentOutput(BaseModel):
    goals: List[ParsedGoal]
    summary: str

# The Goal Agent — reads raw user text and turns it into structured goals
async def run_goal_agent(user_input: str) -> GoalAgentOutput:
    logger.info(f"Goal Agent started — input: {user_input}")

    llm = ChatOpenAI(
        model="gpt-4o-mini",  # cheaper, fast, good enough
        temperature=0.3,
        api_key=os.getenv("OPENAI_API_KEY")
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are the Goal Agent in a multi-agent weekly planning system.
        
Your job is to read the user's weekly goals written in plain English and convert them 
into a structured list of goals.

For each goal extract:
- title: short name for the goal
- hours_per_week: realistic hours needed per week (be practical)
- priority: "high", "medium", or "low"  
- preferred_time: "morning", "afternoon", "evening", or "any"
- category: "study", "health", "work", or "personal"

Respond ONLY with a valid JSON object in this exact format:
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
  "summary": "One sentence summary of all the goals"
}}

Be practical with hours. A week has 168 hours total."""),
        ("human", "{user_input}")
    ])

    chain = prompt | llm

    response = await chain.ainvoke({"user_input": user_input})
    
    # Clean the response and parse it
    import json
    text = response.content.strip()
    
    # Remove markdown code blocks if present
    if text.startswith("```"):
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
    