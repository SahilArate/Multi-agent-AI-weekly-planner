from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel
from typing import List
from loguru import logger
import os
import json

class TimeSlot(BaseModel):
    day: str          # "Monday", "Tuesday" etc
    start_time: str   # "09:00"
    end_time: str     # "11:00"
    is_free: bool

class CalendarAgentOutput(BaseModel):
    free_slots: List[TimeSlot]
    busy_slots: List[TimeSlot]
    total_free_hours: float
    summary: str

async def run_calendar_agent(existing_commitments: str) -> CalendarAgentOutput:
    logger.info("Calendar Agent started")

    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0.3,
        api_key=os.getenv("GROQ_API_KEY")
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are the Calendar Agent in a multi-agent weekly planning system.

Your job is to analyze the user's existing commitments and identify free time slots across the week.

Assume a standard week: Monday to Sunday, 6:00 AM to 11:00 PM each day.
Mark slots as busy based on the user's commitments.
Identify all remaining free slots of at least 1 hour.

Respond ONLY with valid JSON — no extra text:
{{
  "free_slots": [
    {{
      "day": "Monday",
      "start_time": "09:00",
      "end_time": "11:00",
      "is_free": true
    }}
  ],
  "busy_slots": [
    {{
      "day": "Monday", 
      "start_time": "11:00",
      "end_time": "12:00",
      "is_free": false
    }}
  ],
  "total_free_hours": 45.0,
  "summary": "You have X free hours this week across Y days"
}}"""),
        ("human", "My existing commitments this week: {commitments}")
    ])

    chain = prompt | llm
    response = await chain.ainvoke({"commitments": existing_commitments})

    text = response.content.strip()
    if "```" in text:
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]

    data = json.loads(text)

    result = CalendarAgentOutput(
        free_slots=[TimeSlot(**s) for s in data["free_slots"]],
        busy_slots=[TimeSlot(**s) for s in data["busy_slots"]],
        total_free_hours=data["total_free_hours"],
        summary=data["summary"]
    )

    logger.success(f"Calendar Agent done — {result.total_free_hours} free hours found")
    return result