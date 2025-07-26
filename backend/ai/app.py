import os

from collections import defaultdict
from dotenv import load_dotenv
from typing import List, TypedDict, Literal
from typing_extensions import Annotated

from langgraph.graph import START, END, StateGraph

from langsmith import Client

from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_core.documents import Document
from langchain_core.tools import tool
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.schema import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langgraph.prebuilt import ToolNode
from langgraph.graph.message import add_messages

from backend.models import Item
from backend.ai.prompts import few_shot_examples, system_prompt
from backend.ai.utils import add_item_to_cart_service

load_dotenv()

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.1)
embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")

vector_store = InMemoryVectorStore(embeddings)
LANGSMITH_API_KEY = os.getenv("LANGSMITH_API_KEY")

session_histories: defaultdict[str, list[BaseMessage]] = defaultdict(list)

MAX_CONTEXT_MESSAGES = 8


items = [
    Item(
        id=1,
        name="Earth Globe",
        description="Is triangular, how particular",
        price=123,
        image_src="https://cdn.pixabay.com/photo/2021/12/08/04/26/flower-6854656_1280.jpg",
    ),
    Item(
        id=2,
        name="Cheese Wheel",
        description="A square block of cheese despite its name",
        price=342,
        image_src="https://cdn.pixabay.com/photo/2021/12/08/04/26/flower-6854656_1280.jpg",
    ),
    # ... assume List[Item] from DB module
    # Currently sample data - when testing, ask about the shape and expect description returns
]

cart = []


def get_section(x: int, n_splits: int):
    if n_splits == 1:
        return "middle"
    elif x < n_splits // 3:
        return "beginning"
    elif x < 2 * n_splits // 3:
        return "middle"
    else:
        return "end"


def create_chunked_docs_from_items(
    items, chunk_size=500, chunk_overlap=50, min_chunk_length=300
):
    """
    Only chunk descriptions longer than min_chunk_length; shorter ones are left as single docs.
    """
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size, chunk_overlap=chunk_overlap
    )
    all_docs = []
    for item in items:
        desc = item.description or ""
        base_text = f"Item Name: {item.name}, Item Description: {desc}"
        if len(desc) > min_chunk_length:
            splits = text_splitter.split_text(base_text)
        else:
            splits = [base_text]
        for x, chunk in enumerate(splits):
            section = get_section(x, len(splits))
            all_docs.append(
                Document(
                    page_content=chunk,
                    metadata={
                        "id": item.id,
                        "name": item.name,
                        "section": section,
                        "price": item.price,
                    },
                )
            )
    return all_docs


chunked_docs = create_chunked_docs_from_items(items)

vector_store.add_documents(chunked_docs)

client = Client(api_key=LANGSMITH_API_KEY)


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


@tool
def recommend_similar_items(
    query: str, top_k: int = 1, add_to_cart: bool = False
) -> list[dict]:
    """Recommends the most similar item(s) to the query string.

    Args:
        query: The search query string (e.g., user question or 'recommend me items').
        top_k: Number of top similar items to return.
        add_to_cart: Whether to add recommended item with quantity 1 to user's cart.

    Returns:
        A list of dicts, each with keys 'id', 'name', 'description'.
    """
    query_vector = embeddings.embed_query(query)

    results = vector_store.similarity_search_by_vector(query_vector, k=top_k)
    similar_items = [
        {
            "id": doc.metadata["id"],
            "name": doc.metadata["name"],
            "description": doc.page_content,
        }
        for doc in results
    ]
    if add_to_cart:
        for item in similar_items:
            add_item_to_cart_service(item_id=item["id"]) 
    return similar_items


@tool
def recommend_item():
    """Recommends popular items in the form of a list of their integer IDs."""
    return [1, 2]  # hardcoded for now.


@tool
def add_item_to_cart(item_id: int, quantity: int = 1) -> str:
    """
    Adds the specified item (by ID) in the given quantity to the user's cart.
    """
    add_item_to_cart_service(item_id=item_id, quantity=quantity)


@tool
def remove_item_from_cart(item_id: int) -> str:
    """Removes the specified item (by ID) from the user's cart."""
    # Implement removal logic
    pass


@tool
def direct_to_checkout_menu():
    """Directs the user to checkout menu"""
    # returns an event? that directs to checkout menu
    pass


tools = [
    recommend_similar_items,
    add_item_to_cart,
    remove_item_from_cart,
    direct_to_checkout_menu,
]

tool_node = ToolNode(tools=tools)

llm = llm.bind_tools(tools=tools)


def analyze_query(state: State) -> State:
    structured_llm = llm.with_structured_output(Search)
    query = structured_llm.invoke(state["question"])
    state["query"] = query
    return state


def retrieve(state: State) -> State:
    query_text = state["query"].get("query", "")
    retrieved = vector_store.similarity_search(query_text, k=3)
    state["context"] = retrieved
    return state


def generate(state: State) -> State:
    messages = [SystemMessage(content=system_prompt.strip())]
    messages.append(SystemMessage(content=f"User Cart: {cart or 'empty'}"))

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

graph_builder.add_node("tool_execution", tool_execution)  # Use wrapped function node
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


def ask_question(question: str, user_id: str) -> str:
    history = session_histories.get(user_id, [])

    initial_state: State = {
        "question": question,
        "messages": history,
        "tool_calls": [],
        "tool_outputs": {},
        "context": [],
        "query": {},
        "answer": "",
    }

    final_state = graph.invoke(initial_state)

    session_histories[user_id] = final_state.get("messages", [])

    return final_state["answer"]
