from pydantic import BaseModel
from typing import TypedDict, Literal
from typing_extensions import Annotated
from langgraph.graph.message import add_messages
from langchain_core.documents import Document
from backend.models import CartItem


class Cart(BaseModel):
    items: list[CartItem]


class Search(TypedDict):
    """Search query."""

    query: Annotated[str, ..., "Search query to run."]
    section: Annotated[
        Literal["beginning", "middle", "end"],
        ...,
        "Section to query.",
    ]


class State(TypedDict):
    """Helper class for RAG"""

    messages: Annotated[list, add_messages]
    tool_calls: list
    tool_outputs: dict
    question: str
    context: list[Document]
    query: dict
    answer: str
    cart: Cart
