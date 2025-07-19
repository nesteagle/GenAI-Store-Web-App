"""
Unit tests for order service functions.
Tests order creation, retrieval, and user order management.
"""

import pytest
from backend.services.order_services import (
    get_user_orders_service,
    get_order_by_id_service,
    create_order_service,
)
from backend.models import OrderCreate, OrderItemCreate
from .helpers import create_test_user, create_test_item, create_test_order


def test_create_order_service(db_session):
    """Test creating an order."""
    user = create_test_user(db_session, "John")
    item1 = create_test_item(db_session, "Apple", 2.99, "Fresh apple")
    item2 = create_test_item(db_session, "Banana", 1.99, "Yellow banana")

    order_items = [
        OrderItemCreate(item_id=item1.id, quantity=3),
        OrderItemCreate(item_id=item2.id, quantity=2),
    ]

    order_data = OrderCreate(
        user_id=user.id,
        items=order_items,
        stripe_id="test_stripe_123",
        currency="usd",
        amount=12.95 * 100,  # Recall amount represents cents
        email="john@example.com",
    )

    created_order = create_order_service(order_data, db_session)

    assert created_order["user_id"] == user.id
    assert len(created_order["items"]) == 2
    assert created_order["stripe_id"] == "test_stripe_123"


def test_get_user_orders_service(db_session):
    """Test getting user orders."""
    user = create_test_user(db_session, "Jane")
    item = create_test_item(db_session, "Orange", 3.99, "Citrus fruit")

    create_test_order(db_session, user.id, (item, 2))

    orders = get_user_orders_service(user, db_session)

    assert len(orders) == 1
    assert orders[0]["user_id"] == user.id


def test_get_order_by_id_service(db_session):
    """Test getting an order by ID."""
    user = create_test_user(db_session, "Bob")
    item = create_test_item(db_session, "Grape", 5.99, "Purple grapes")

    created_order = create_test_order(db_session, user.id, (item, 1))

    retrieved_order = get_order_by_id_service(created_order["id"], db_session)

    assert retrieved_order["id"] == created_order["id"]
    assert retrieved_order["user_id"] == user.id
