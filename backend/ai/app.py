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
from langchain_text_splitters import RecursiveCharacterTextSplitter

load_dotenv()

llm = ChatOllama(model="llama3.1", temperature=0)
embeddings = OllamaEmbeddings(model="llama3")
vector_store = InMemoryVectorStore(embeddings)
LANGSMITH_API_KEY = os.getenv("LANGSMITH_API_KEY")

items = [
#... assume List[Item] from DB module
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

def create_chunked_docs_from_items(items: List[Item], chunk_size=1500, chunk_overlap=200):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    all_docs = []
    for item in items:
        # Prepare source text to split
        desc = item.description or ""
        base_text = f"{item.name}: {desc}"
        if not desc.strip():
            continue
        # Split text into chunks
        splits = text_splitter.split_text(base_text)
        # Optionally assign sections based on position
        for x, chunk in enumerate(splits):
            section = get_section(x, len(splits))
            all_docs.append(
                Document(
                    page_content=chunk,
                    metadata={
                        "id": item.id,
                        "name": item.name,
                        "section": section,
                        "price": item.price
                    }
                )
            )
    return all_docs

chunked_docs = create_chunked_docs_from_items(items)

vector_store.add_documents(chunked_docs)

client = Client(api_key=LANGSMITH_API_KEY)

template = """Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
Use three sentences maximum and keep the answer as concise as possible.
Always say "thanks for asking!" at the end of the answer.

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
    retrieved_docs = vector_store.similarity_search(
        query["query"],
        filter=lambda doc: doc.metadata.get("section") == query["section"],
    )
    return {"context": retrieved_docs}


def generate(state: State):
    docs_content = "\n\n".join(doc.page_content for doc in state["context"])
    messages = prompt.invoke({"question": state["question"], "context": docs_content})
    response = llm.invoke(messages)
    return {"answer": response.content}


def recommend_similar_item(
    query: str,
    top_k: int = 1
) -> list[dict]:
    """Recommends k product items most similar (by name and description) to the query."""
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

def recommend_item():
    """Recommends bestseller items"""
    return [1,2] # hardcoded for now.

def add_item_to_cart(item_id: int, quantity: int = 1) -> str:
    """
    Adds the specified item (by ID) in the given quantity to the user's cart.
    The React frontend should listen for this function call and update the UI/cart accordingly.
    Returns a confirmation string.
    """
    # In production: emit event, update server, context, or session
    # For now, just return a string for LLM chat
    return f"Added {quantity} of item {item_id} to your cart."

def get_cart() -> List[dict]:
    """
    Returns the current contents of the user's cart as a list of items.
    """
    # Implement using your in-memory or persisted cart model
    pass

def remove_item_from_cart(item_id: int) -> str:
    """
    Removes the specified item from the user's cart.
    """
    # Implement removal logic
    pass

def direct_to_checkout_menu():
    # returns an event? that directs to checkout menu
    pass


graph_builder = StateGraph(State).add_sequence([analyze_query, retrieve, generate])
graph_builder.add_edge(START, "analyze_query")


llm.bind_tools([recommend_similar_item, add_item_to_cart, get_cart, remove_item_from_cart, direct_to_checkout_menu])

def get_example_answer(question:str):
    graph = graph_builder.compile()
    result = graph.invoke({"question": question})
    answer = result["answer"]
    print(answer)
    return answer

get_example_answer("What is the shape of the Earth?")