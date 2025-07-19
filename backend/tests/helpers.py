"""
Test helper functions.

This module provides utility functions and fixtures to support unit and integration tests for the backend.
It includes helpers for:
- Setting up an in-memory SQLite test database and session
- Creating test users, items, and orders using the service layer
- Building order data dictionaries for API tests

These helpers are used in test modules to simplify test setup and teardown, and to ensure consistent test data creation.
"""

from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.pool import StaticPool
from backend.models import Item, User, OrderCreate, OrderItemCreate
from backend.services.item_services import create_item_service
from backend.services.user_services import create_user_service
from backend.services.order_services import (
    create_order_service,
)


def get_test_engine():
    return create_engine(
        "sqlite:///:memory:",
        echo=False,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )


def get_test_session():
    """Get a test database session"""
    test_engine = get_test_engine()
    SQLModel.metadata.create_all(test_engine)
    with Session(test_engine) as session:
        return session


def create_test_user(
    db: Session, username="William", email="test@example.com", auth0_sub="auth0|test123"
):
    """Create a test user using the service layer"""
    user = User(username=username, email=email, auth0_sub=auth0_sub)
    return create_user_service(user, db)


def create_test_item(db: Session, name, price, description=None, image_src=None):
    """Create a test item using the service layer"""
    item = Item(name=name, description=description, price=price, image_src=image_src)
    return create_item_service(item, db)


def create_test_order(db: Session, user_id, *item_quantity_tuples):
    """Create a test order using the service layer"""

    order_items = [
        OrderItemCreate(item_id=item.id, quantity=quantity)
        for item, quantity in item_quantity_tuples
    ]

    order_data = OrderCreate(
        user_id=user_id,
        items=order_items,
        stripe_id="test_stripe_id",
        currency="usd",
        amount=sum(
            item.price * 100 * quantity for item, quantity in item_quantity_tuples
        ),
        email="test@example.com",
    )

    return create_order_service(order_data, db)


def build_order_data(user_id: int, *item_quantity_tuples: tuple) -> dict:
    """Build order data for testing"""
    return {
        "user_id": user_id,
        "items": [
            {"item_id": item.id, "quantity": quantity}
            for item, quantity in item_quantity_tuples
        ],
        "stripe_id": "test_stripe_id",
        "currency": "usd",
        "amount": sum(
            item.price * 100 * quantity for item, quantity in item_quantity_tuples
        ),
        "email": "test@example.com",
    }
