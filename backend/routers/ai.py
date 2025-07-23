from fastapi import APIRouter, Depends
from backend.ai.app import ask_question
from backend.auth import get_current_user
from backend.models import User

router = APIRouter(prefix="/assistant", tags=["assistant"])

@router.get("/ask/")
def ask_assistant(question:str, current_user: User = Depends(get_current_user)):
    return ask_question(question=question, user_id=current_user.id)