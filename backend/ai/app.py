import os

from backend.models import Item

from dotenv import load_dotenv
from typing import List, TypedDict, Literal
from typing_extensions import Annotated

from langgraph.graph import START, StateGraph
from langchain_core.prompts import PromptTemplate

from langsmith import Client
from langchain_ollama.chat_models import ChatOllama
from langchain_ollama import OllamaEmbeddings
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_core.documents import Document
from langchain_core.tools import tool
from langchain_text_splitters import RecursiveCharacterTextSplitter

load_dotenv()

llm = ChatOllama(model="llama3.1:8b", temperature=0)
embeddings = OllamaEmbeddings(model="llama3.1:8b")
vector_store = InMemoryVectorStore(embeddings)
LANGSMITH_API_KEY = os.getenv("LANGSMITH_API_KEY")

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
    items, chunk_size=1500, chunk_overlap=200, min_chunk_length=500
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
        base_text = f"{item.name}: {desc}"
        # Decide whether to chunk or not
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

template = """Find pieces of context to answer the question at the end.
Do not make up answers, if necessary say you don't know.
Keep the answer as concise as possible, use three sentences max.
If user is asking a question, say "Thanks for asking!". 
Otherwise, tell the user you've done their request.

{context}

Question: {question}

Helpful Answer:"""

prompt = PromptTemplate.from_template(template)


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

    question: str
    query: Search
    context: List[Document]
    answer: str


def analyze_query(state: State):
    structured_llm = llm.with_structured_output(Search)
    query = structured_llm.invoke(state["question"])
    return {"query": query}


def retrieve(state: State):
    query = state["query"]
    retrieved_docs = vector_store.similarity_search(query["query"])
    return {"context": retrieved_docs}


def generate(state: State):
    docs_content = "\n\n".join(doc.page_content for doc in state["context"])
    messages = prompt.invoke({"question": state["question"], "context": docs_content})
    response = llm.invoke(messages)
    return {"answer": response.content}


def recommend_similar_item(query: str, top_k: int = 1) -> list[dict]:
    """Recommends most similar item to the query."""
    # Embed the query text
    query_vector = embeddings.embed([query])[0]
    # Search vector store for similar items
    results = vector_store.similarity_search(query_vector, k=top_k)
    # Format and return metadata for each result
    return [
        {
            "id": doc.metadata["id"],
            "name": doc.metadata["name"],
            "description": doc.page_content,
            # ...add other fields as needed
        }
        for doc in results
    ]


@tool
def recommend_item():
    """Recommends popular items"""
    return [1, 2]  # hardcoded for now.


@tool
def add_item_to_cart(item_id: int, quantity: int = 1) -> str:
    """
    Adds the specified item (by ID) in the given quantity to the user's cart.
    """
    # In production: emit event, update server, context, or session
    # For now, just return a string for LLM chat
    return f"Added {quantity} of item {item_id} to your cart."


@tool
def get_cart() -> List[dict]:
    """Returns contents of the user's cart as a list of items."""
    # Implement using your in-memory or persisted cart model
    pass


@tool
def remove_item_from_cart(item_id: int) -> str:
    """Removes the specified item from the user's cart."""
    # Implement removal logic
    pass


@tool
def direct_to_checkout_menu():
    """Directs the user to checkout menu"""
    # returns an event? that directs to checkout menu
    pass


graph_builder = StateGraph(State).add_sequence([analyze_query, retrieve, generate])
graph_builder.add_edge(START, "analyze_query")


llm = llm.bind_tools(
    [
        recommend_similar_item,
        add_item_to_cart,
        get_cart,
        remove_item_from_cart,
        direct_to_checkout_menu,
    ]
)


def ask_question(question: str):
    graph = graph_builder.compile()
    result = graph.invoke({"question": question})
    answer = result["answer"]
    print(answer)
    return answer
