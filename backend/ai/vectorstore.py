from langchain_core.documents import Document
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

from backend.models import Item
from typing import List


def get_section(x: int, n_splits: int):
    if n_splits == 1:
        return "middle"
    elif x < n_splits // 3:
        return "beginning"
    elif x < 2 * n_splits // 3:
        return "middle"
    else:
        return "end"


def vectorstore_search_text(query_text: str, k=3):
    return vector_store.similarity_search(query_text, k=k)


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


def vectorstore_add_items(items: List[Item]):
    chunked_item_docs = create_chunked_docs_from_items(items=items)
    vector_store.add_documents(chunked_item_docs)


embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")

vector_store = InMemoryVectorStore(embeddings)
