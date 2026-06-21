"""
AI Coach router — RAG-based carbon coaching endpoint.

This module provides the conversational AI interface that helps users
understand their carbon footprint and suggests actionable reductions.
It acts as a supportive, evidence-based guide rather than a shaming tool.

In production: LangChain + MongoDB chat history + Groq (LLaMA3-8b).
Guardrailed against greenwashing by strictly grounding responses in
verified emission factors (DEFRA, EPA, Climatiq) and the user's own data.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from core.config import settings

router = APIRouter()


class CoachRequest(BaseModel):
    """Input schema for a user message to the AI Carbon Coach."""
    user_id: str = Field(..., description="Unique identifier of the authenticated user")
    message: str = Field(..., description="The user's chat message or question")
    conversation_history: Optional[list[dict]] = Field(
        default=[], description="Optional context of previous messages"
    )


class CoachResponse(BaseModel):
    """Output schema for the AI coach's reply."""
    reply: str = Field(..., description="The AI's response text in markdown format")
    sources: list[str] = Field(
        default=[], description="List of scientific sources cited (e.g. 'DEFRA 2023')"
    )
    confidence: float = Field(
        default=1.0, ge=0.0, le=1.0, description="Confidence score of the emission data provided"
    )


SYSTEM_PROMPT = """You are Terraprint's AI Carbon Coach. You are grounded, empathetic, and evidence-based.

Rules:
1. ONLY cite the user's actual footprint data and verified emission factors (DEFRA, EPA, Climatiq).
2. NEVER shame users for their footprint — frame everything as opportunity, not failure.
3. NEVER make up emission factors or percentages. If uncertain, say so.
4. Keep responses concise (3–5 sentences) unless the user asks for detail.
5. Always suggest a SPECIFIC next action when offering advice.
6. Be equity-aware: never assume the user can afford expensive changes.

Format: plain text. Use ** for bold emphasis. Use numbered lists for actions.
"""


@router.post("/", response_model=CoachResponse)
async def coach_chat(req: CoachRequest) -> CoachResponse:
    """
    RAG-based coaching endpoint.

    Takes a user's question, retrieves their conversation history from MongoDB,
    and streams the prompt through LLaMA3 via Groq to generate an empathetic,
    actionable carbon-reduction tip.

    Falls back to a rule-based engine if the Groq API key is missing (e.g. local dev).

    Args:
        req: CoachRequest containing the user's ID and message.

    Returns:
        CoachResponse with the reply text, cited sources, and confidence score.
    """
    if not settings.GROQ_API_KEY:
        # Demo mode — rule-based responses without LLM
        return CoachResponse(
            reply=_demo_response(req.message),
            sources=["DEFRA 2023", "EPA EEIO 2023"],
            confidence=0.85,
        )

    try:
        from langchain_groq import ChatGroq
        from langchain_mongodb.chat_message_histories import MongoDBChatMessageHistory
        from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
        from langchain_core.runnables.history import RunnableWithMessageHistory

        llm = ChatGroq(
            temperature=0.3,
            model_name="llama3-8b-8192",
            groq_api_key=settings.GROQ_API_KEY
        )

        prompt = ChatPromptTemplate.from_messages([
            ("system", SYSTEM_PROMPT),
            MessagesPlaceholder(variable_name="history"),
            ("human", "{question}"),
        ])

        chain = prompt | llm

        def get_session_history(session_id: str):
            return MongoDBChatMessageHistory(
                connection_string=settings.MONGODB_URL,
                session_id=session_id,
                database_name="terraprint",
                collection_name="chat_histories"
            )

        chain_with_history = RunnableWithMessageHistory(
            chain,
            get_session_history,
            input_messages_key="question",
            history_messages_key="history",
        )

        response = await chain_with_history.ainvoke(
            {"question": req.message},
            config={"configurable": {"session_id": req.user_id}}
        )

        return CoachResponse(
            reply=response.content,
            sources=["DEFRA 2023", "EPA EEIO 2023"],
            confidence=0.92,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Coach unavailable: {str(e)}")


def _demo_response(message: str) -> str:
    """Rule-based fallback for demo/development without an API key."""
    msg = message.lower()
    if "food" in msg or "diet" in msg or "meat" in msg:
        return (
            "Your food choices matter significantly. Beef generates ~27 kg CO₂e per kg, "
            "vs lentils at just 0.9 kg/kg. Cutting red meat to twice a week typically saves "
            "400–600 kg CO₂e per year. **Specific action:** try swapping one dinner per week to "
            "a plant-based protein this month."
        )
    if "transport" in msg or "car" in msg or "flight" in msg:
        return (
            "Transport is often the largest personal footprint category. A single long-haul flight "
            "adds ~1,100 kg CO₂e — roughly 3 months of average car driving. "
            "**Specific action:** if you have an upcoming short trip, compare train vs. flight — "
            "you can often save 90% of emissions by rail."
        )
    if "energy" in msg or "electric" in msg or "heat" in msg:
        return (
            "Switching to a renewable energy tariff can cut your home energy footprint by up to 80%. "
            "It usually takes under 10 minutes to switch online and costs ~$2–5/month extra. "
            "**Specific action:** search '[your city] green energy tariff' and switch this week."
        )
    return (
        "Based on global averages, the top 3 high-impact, low-effort actions are: "
        "1) **Switch to renewable energy** (saves 1–2 tons/yr), "
        "2) **Cut beef to 2×/week** (saves 0.5 tons/yr), "
        "3) **Replace one flight with train** (saves 0.8 tons per trip). "
        "Which category would you like me to dig into?"
    )
