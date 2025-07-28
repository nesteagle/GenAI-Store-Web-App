"""
This module defines the backend's data models using SQLModel and Pydantic.
It includes models for items, users, orders, and order items, as well as Pydantic schemas for order creation.
Relationships between entities are established for ORM operations.
"""

import uuid
from datetime import datetime, UTC

from pydantic import BaseModel
from sqlmodel import SQLModel, Field, Relationship


def utc_now():
    """Return current UTC timestamp."""
    return datetime.now(UTC)


class Item(SQLModel, table=True):
    """Product item model with name, price, and optional image."""

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True, max_length=100)
    description: str | None = Field(default=None, max_length=500)
    price: float = Field(default=None, index=True)
    image_src: str | None = Field(default=None, max_length=300)
    order_items: list["OrderItem"] = Relationship(back_populates="item")


class User(SQLModel, table=True):
    """User model with Auth0 integration and order history."""

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()), primary_key=True, max_length=48
    )
    auth0_sub: str = Field(index=True, unique=True, max_length=64)
    email: str = Field(index=True, max_length=255)
    orders: list["Order"] = Relationship(back_populates="user")


class Order(SQLModel, table=True):
    """Order model tracking purchases with Stripe id integration. Amount is in cents."""

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()), primary_key=True, max_length=48
    )
    date: datetime = Field(default_factory=utc_now, index=True)
    stripe_id: str = Field(default=None, index=True, max_length=128)
    currency: str | None = Field(default="USD", max_length=10)
    amount: int = Field(default=None)
    user_id: str = Field(foreign_key="user.id", index=True, max_length=48)
    user: User = Relationship(back_populates="orders")
    order_items: list["OrderItem"] = Relationship(back_populates="order")
    email: str = Field(default=None, index=True, max_length=255)


class OrderItem(SQLModel, table=True):
    """Links orders to items with quantity."""

    id: int | None = Field(default=None, primary_key=True)
    order_id: str = Field(foreign_key="order.id", index=True, max_length=48)
    order: Order = Relationship(back_populates="order_items")
    item_id: int = Field(foreign_key="item.id", index=True)
    item: Item = Relationship(back_populates="order_items")
    quantity: int = Field(default=1)


class OrderItemCreate(BaseModel):
    """Schema for creating order items with item ID and quantity."""

    item_id: int
    quantity: int = 1


class OrderCreate(BaseModel):
    """Schema for creating orders with items and Stripe payment details. Amount is in cents."""

    user_id: str
    items: list[OrderItemCreate]
    stripe_id: str
    currency: str | None = None
    amount: int
    email: str

class CartItem(BaseModel):
    """Cart item with product ID and quantity."""

    id: int
    qty: int
