from typing import List, Dict
from backend.models import CartItem, Item


def add_item_cart_service(item_id: int, quantity: int = 1):
    print(f"Added {quantity} of item {item_id} to your cart.")


def remove_item_cart_service(item_id: int):
    print(f"Removed item {item_id} from your cart.")


def format_cart(cart: List[CartItem], item_lookup: Dict[int, Item]) -> str:
    if not cart:
        return "User Cart: (empty)"
    lines = ["User Cart:"]
    for cart_item in cart:
        item = item_lookup.get(cart_item.id)
        lines.append(f"- {item.name} (ID: {item.id}), Quantity: {cart_item.qty}")
    return "\n".join(lines)
