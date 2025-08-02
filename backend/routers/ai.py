from pydantic import BaseModel
from fastapi import APIRouter, Depends
from backend.ai.app import ask_question
from backend.auth import get_current_user
from backend.models import User
from backend.ai.models import Cart
from backend.ai.session import set_session_history

router = APIRouter(prefix="/assistant", tags=["assistant"])


class ChatMessage(BaseModel):
    message: str
    cart: Cart


@router.post("/ask/")
async def ask_assistant(
    request: ChatMessage,
    current_user: User = Depends(get_current_user),
):
    return ask_question(
        question=request.message, user_id=current_user.id, cart=request.cart
    )


@router.delete("/ask/")
async def clear_chat_history(current_user: User = Depends(get_current_user)):
    set_session_history(user_id=current_user.id, messages=[])
    return {"message": f"History for user id {current_user.id} deleted successfully"}
