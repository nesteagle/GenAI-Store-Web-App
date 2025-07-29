import os

from dotenv import load_dotenv
from typing import List

from langgraph.graph import START, END, StateGraph

from langsmith import Client

from langchain_google_genai import ChatGoogleGenerativeAI

from langchain.schema import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langgraph.prebuilt import ToolNode

from backend.models import CartItem
from backend.ai.prompts import few_shot_examples, system_prompt
from backend.ai.vectorstore import vectorstore_add_items, vectorstore_search_text
from backend.ai.tools import tools
from backend.ai.models import Search, State
from backend.ai.utils import format_cart
from backend.ai.session import get_items, get_items_dict, get_session_history, set_session_history


load_dotenv()

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.1)
LANGSMITH_API_KEY = os.getenv("LANGSMITH_API_KEY")

MAX_CONTEXT_MESSAGES = 8

client = Client(api_key=LANGSMITH_API_KEY)

vectorstore_add_items(get_items())

tool_node = ToolNode(tools=tools)

llm = llm.bind_tools(tools=tools)


def analyze_query(state: State) -> State:
    structured_llm = llm.with_structured_output(Search)
    query = structured_llm.invoke(state["question"])
    state["query"] = query
    return state


def retrieve(state: State) -> State:
    query_text = state["query"].get("query", "")
    retrieved = vectorstore_search_text(query_text, k=3)
    state["context"] = retrieved
    return state


def generate(state: State) -> State:
    system_prompt_msg = SystemMessage(content=system_prompt.strip())
    cart_msg = SystemMessage(format_cart(cart=state.get("cart", []), item_lookup=get_items_dict()))

    messages = [system_prompt_msg, cart_msg]

    for example in few_shot_examples:
        messages.append(HumanMessage(content=example["question"]))
        messages.append(AIMessage(content=example["answer"]))

    context_docs = state.get("context", [])
    if context_docs:
        context_text = "\n".join(
            f"ID {doc.metadata['id']}, {doc.page_content}" for doc in context_docs
        )
        messages.append(
            SystemMessage(content=f"Relevant Product Info:\n{context_text}")
        )

    messages.extend(state.get("messages", [])[-MAX_CONTEXT_MESSAGES:])

    if not (
        messages
        and isinstance(messages[-1], HumanMessage)
        and messages[-1].content == state["question"]
    ):
        messages.append(HumanMessage(content=state["question"]))

    response = llm.invoke(messages)

    messages.append(response)
    state["messages"] = messages

    state["tool_calls"] = getattr(response, "tool_calls", []) or []

    if not state["tool_calls"]:
        state["answer"] = response.content

    return state


def generate_final_reply(state: State) -> State:
    if not state.get("answer"):
        state["answer"] = "Thanks for asking! Your request has been processed."
    return state


def tool_execution(state: State) -> State:
    new_state = tool_node.invoke(state)
    new_state["tool_calls"] = []
    return new_state


def after_tool_execution(state: State) -> str:
    return "generate" if state.get("tool_calls") else "generate_final_reply"


def after_generate(state: State):
    return "tool_execution" if state.get("tool_calls") else "generate_final_reply"


graph_builder = StateGraph(State).add_sequence([analyze_query, retrieve, generate])
graph_builder.add_edge(START, "analyze_query")

graph_builder.add_node("tool_execution", tool_execution)
graph_builder.add_node("generate_final_reply", generate_final_reply)

graph_builder.add_conditional_edges(
    "generate",
    after_generate,
    {
        "tool_execution": "tool_execution",
        "generate_final_reply": "generate_final_reply",
    },
)

graph_builder.add_conditional_edges(
    "tool_execution",
    after_tool_execution,
    {
        "generate": "generate",
        "generate_final_reply": "generate_final_reply",
    },
)

graph_builder.add_edge("generate_final_reply", END)

graph = graph_builder.compile()


def ask_question(question: str, user_id: str, cart: List[CartItem] = None) -> str:
    history = get_session_history(user_id)

    initial_state: State = {
        "question": question,
        "messages": history,
        "tool_calls": [],
        "tool_outputs": {},
        "context": [],
        "query": {},
        "answer": "",
        "cart": cart,
    }

    final_state = graph.invoke(initial_state)

    set_session_history(user_id=user_id, messages=final_state.get("messages"))

    return final_state["answer"]
