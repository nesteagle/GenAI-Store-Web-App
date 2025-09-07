"""
Unit tests for order service functions.
Tests order creation, retrieval, and user order management.
"""

import pytest
from backend.services.order_services import (
    get_user_orders_service,
    get_order_by_id_service,
    create_order_service,
    get_orders_admin_service,
    update_order_service,
    delete_order_service,
    get_order_by_id_service,
)
from backend.models import OrderCreate, OrderItemCreate, Order, OrderItem
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


def test_get_orders_admin_service_returns_all_orders(db_session):
    """Test admin service; admin should see all orders across users."""
    admin_orders = get_orders_admin_service(db_session)
    assert admin_orders == []

    user1 = create_test_user(db_session, auth0_sub="auth0|rupert890")
    user2 = create_test_user(db_session, auth0_sub="auth0|marie321")
    item1 = create_test_item(db_session, "Kiwi", 2.49, "Green kiwi")
    item2 = create_test_item(db_session, "Mango", 4.29, "Semi sweet mango")

    order1 = create_test_order(db_session, user1.id, (item1, 2))
    order2 = create_test_order(db_session, user2.id, (item2, 3))

    admin_orders = get_orders_admin_service(db_session)

    assert len(admin_orders) == 2

    returned_ids = {o["id"] for o in admin_orders}
    returned_user_ids = {o["user_id"] for o in admin_orders}

    assert order1["id"] in returned_ids
    assert order2["id"] in returned_ids
    assert returned_user_ids == {user1.id, user2.id}


def test_update_order_service_replaces_items_and_fields(db_session):
    """Update an existing order and replace its items."""
    user = create_test_user(db_session, "Eve")
    item_old = create_test_item(db_session, "Old Item", 1.00, "Old")
    item_new = create_test_item(db_session, "New Item", 2.00, "New")

    created = create_test_order(db_session, user.id, (item_old, 1))
    order_id = created["id"]

    order_data = OrderCreate(
        user_id=user.id,
        items=[OrderItemCreate(item_id=item_new.id, quantity=3)],
        stripe_id="stripe_new_123",
        amount=1234,
        email="eve_new@example.com",
    )

    update_order_service(order_id, order_data, db_session)
    updated = get_order_by_id_service(order_id, db_session)

    assert updated["id"] == order_id
    assert updated["user_id"] == user.id
    assert updated["stripe_id"] == "stripe_new_123"
    assert len(updated["items"]) == 1
    assert updated["items"][0]["item_id"] == item_new.id
    assert updated["items"][0]["quantity"] == 3


def test_delete_order_service_removes_order_and_items(db_session):
    """Delete an order and its items."""
    user = create_test_user(db_session, "Zed")
    item = create_test_item(db_session, "Temp Item", 3.00, "Temp")
    created = create_test_order(db_session, user.id, (item, 2))
    order_id = created["id"]

    delete_order_service(order_id, db_session)

    with pytest.raises(Exception):
        get_order_by_id_service(order_id, db_session)
