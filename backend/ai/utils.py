from typing import Dict
from backend.models import Item, CartItem
from backend.ai.models import Cart

def add_item_cart_service(cart:Cart, item_id: int, quantity: int = 1) -> Cart:
    for cart_item in cart.items:
        if cart_item.id == item_id:
            cart_item.qty += quantity
            break
    else:
        cart.items.append(CartItem(id=item_id,qty=quantity))
    return cart


def remove_item_cart_service(cart:Cart, item_id: int) -> Cart:
    cart.items = [cart_item for cart_item in cart.items if cart_item.id != item_id]
    return cart


def format_cart(cart: Cart, item_lookup: Dict[int, Item]) -> str:
    if not cart:
        return "User Cart: (empty)"
    lines = ["User Cart:"]
    for cart_item in cart.items:
        item = item_lookup.get(cart_item.id)
        lines.append(f"- {item.name} (ID: {item.id}), Quantity: {cart_item.qty}")
    return "\n".join(lines)
