"""
Service functions for order management operations.
Handles CRUD operations for Order entities with item relationships and user validation.
"""

from typing import List, Dict, Any
from fastapi import HTTPException
from sqlmodel import Session, select, delete
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import IntegrityError
from ..models import Order, OrderCreate, OrderItem, User
from .utils import (
    try_get_user,
    try_get_order,
    get_order_details,
    add_order_items,
)


def get_user_orders_service(current_user: User, db: Session) -> List[Dict[str, Any]]:
    """Retrieve all orders for a specific user."""
    statement = (
        select(Order)
        .where(Order.user_id == current_user.id)
        .options(selectinload(Order.order_items).selectinload(OrderItem.item))
    )
    orders = db.exec(statement).all()
    return [get_order_details(order) for order in orders]


def get_order_by_id_service(order_id: int, db: Session) -> Dict[str, Any]:
    """Retrieve a single order by ID with detailed item information."""
    order = try_get_order(order_id, db)
    return get_order_details(order)


def create_order_service(order_data: OrderCreate, db: Session) -> Dict[str, Any]:
    """Create a new order with associated items."""
    try_get_user(order_data.user_id, db)
    try:
        new_order = Order(
            user_id=order_data.user_id,
            stripe_id=order_data.stripe_id,
            currency=order_data.currency,
            amount=order_data.amount,
            email=order_data.email,
        )
        db.add(new_order)
        db.flush()
        add_order_items(db, new_order.id, order_data.items)
        db.commit()
    except IntegrityError as exc:
        raise HTTPException(400, "Item(s) do not exist") from exc

    db.refresh(new_order)
    return get_order_details(new_order)


def update_order_service(
    order_id: int, order_data: OrderCreate, db: Session
) -> Dict[str, Any]:
    """Update an existing order and replace its items."""
    existing_order = try_get_order(order_id, db)
    try_get_user(order_data.user_id, db)
    existing_order.user_id = order_data.user_id
    existing_order.stripe_id = order_data.stripe_id
    existing_order.currency = order_data.currency
    existing_order.amount = order_data.amount
    existing_order.email = order_data.email
    db.exec(delete(OrderItem).where(OrderItem.order_id == order_id))
    add_order_items(db, order_id, order_data.items)
    db.commit()
    db.refresh(existing_order, attribute_names=["order_items"])
    return get_order_details(existing_order)


def delete_order_service(order_id: int, db: Session) -> None:
    """Delete an order and all associated order items."""
    order = try_get_order(order_id, db)
    db.exec(delete(OrderItem).where(OrderItem.order_id == order_id))
    db.commit()
    db.delete(order)


def get_orders_admin_service(db: Session) -> List[Dict[str, Any]]:
    """Retrieve all orders for admin dashboard view."""
    orders = db.exec(
        select(Order).options(
            selectinload(Order.order_items).selectinload(OrderItem.item)
        )
    ).all()
    return [get_order_details(order) for order in orders]
