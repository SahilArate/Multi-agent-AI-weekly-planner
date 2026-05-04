import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from loguru import logger
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage

router = APIRouter(prefix="/api", tags=["chat"])

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    plan_context: str = ""

@router.post("/chat")
async def chat(request: ChatRequest):
    try:
        llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0.5,
            api_key=os.getenv("GROQ_API_KEY")
        )

        system = f"""You are an AI weekly planner assistant. 
The user has this weekly plan context:
{request.plan_context if request.plan_context else "No plan loaded yet."}

Help the user understand, modify, and optimize their weekly plan.
When they ask to move or change events, describe what the updated schedule would look like.
Be concise, friendly, and specific. Use bullet points for lists."""

        lc_messages = [SystemMessage(content=system)]
        for msg in request.messages:
            if msg.role == "user":
                lc_messages.append(HumanMessage(content=msg.content))

        response = await llm.ainvoke(lc_messages)
        return {"response": response.content}

    except Exception as e:
        logger.error(f"Chat failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))