from typing import List
from pydantic import BaseModel
from fastapi import APIRouter, Depends
from backend.ai.app import ask_question
from backend.auth import get_current_user
from backend.models import User, CartItem

router = APIRouter(prefix="/assistant", tags=["assistant"])


class ChatMessage(BaseModel):
    message: str
    cart: List[CartItem]


@router.post("/ask/")
async def ask_assistant(
    request: ChatMessage,
    current_user: User = Depends(get_current_user),
):
    return ask_question(question=request.message, user_id=current_user.id, cart=request.cart)
