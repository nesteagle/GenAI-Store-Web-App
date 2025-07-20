from fastapi import APIRouter
from backend.ai.app import ask_question

router = APIRouter(prefix="/assistant", tags=["assistant"])

@router.get("/ask/")
def ask_assistant(question:str):
    return ask_question(question=question)