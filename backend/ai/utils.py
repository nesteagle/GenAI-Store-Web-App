from typing import List
from backend.models import CartItem

def add_item_cart_service(item_id: int, quantity: int = 1):
    print(f"Added {quantity} of item {item_id} to your cart.")

def remove_item_cart_service(item_id: int):
    print(f"Removed item {item_id} from your cart.")

    
def format_cart(cart: List[CartItem], item_lookup: dict[int, str]) -> str:
    if not cart:
        return "User Cart: (empty)"
    lines = ["User Cart:"]
    for item in cart:
        name = item_lookup.get(item.id, f"ID {item.id}")
        lines.append(f"- {name} (ID: {item.id}), Quantity: {item.qty}")
    return "\n".join(lines)
