from langchain_core.tools import tool
from backend.ai.utils import add_item_cart_service
from backend.ai.vectorstore import vectorstore_search_text

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
    results = vectorstore_search_text(query, k=top_k)
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
            add_item_cart_service(item_id=item["id"])
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
    add_item_cart_service(item_id=item_id, quantity=quantity)


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