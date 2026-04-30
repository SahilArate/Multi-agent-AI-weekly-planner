from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel
from typing import List
from loguru import logger
import os
import json

class EnergySlot(BaseModel):
    time_of_day: str    # "morning", "afternoon", "evening"
    energy_level: str   # "high", "medium", "low"
    best_for: str       # "deep work", "light tasks", "rest"

class EnergyAgentOutput(BaseModel):
    energy_profile: List[EnergySlot]
    peak_hours: str
    low_hours: str
    summary: str

async def run_energy_agent(user_preferences: str) -> EnergyAgentOutput:
    logger.info("Energy Agent started")

    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0.3,
        api_key=os.getenv("GROQ_API_KEY")
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are the Energy Agent in a multi-agent weekly planning system.

Your job is to analyze the user's energy patterns and determine the best times 
for different types of tasks.

Based on user preferences, create an energy profile for the day.
- Morning (6am-12pm)
- Afternoon (12pm-6pm)  
- Evening (6pm-11pm)

Respond ONLY with valid JSON — no extra text:
{{
  "energy_profile": [
    {{
      "time_of_day": "morning",
      "energy_level": "high",
      "best_for": "deep work like studying and coding"
    }},
    {{
      "time_of_day": "afternoon",
      "energy_level": "medium",
      "best_for": "meetings and collaborative tasks"
    }},
    {{
      "time_of_day": "evening",
      "energy_level": "low",
      "best_for": "light reading and planning"
    }}
  ],
  "peak_hours": "6am-12pm",
  "low_hours": "2pm-4pm",
  "summary": "You are a morning person with peak energy before noon"
}}"""),
        ("human", "My preferences and habits: {preferences}")
    ])

    chain = prompt | llm
    response = await chain.ainvoke({"preferences": user_preferences})

    text = response.content.strip()
    if "```" in text:
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]

    data = json.loads(text)

    result = EnergyAgentOutput(
        energy_profile=[EnergySlot(**s) for s in data["energy_profile"]],
        peak_hours=data["peak_hours"],
        low_hours=data["low_hours"],
        summary=data["summary"]
    )

    logger.success("Energy Agent done")
    return result