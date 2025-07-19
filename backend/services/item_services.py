"""
Service functions for item management operations.
Handles CRUD operations and search functionality for Item entities.
"""

from sqlmodel import Session, select
from ..models import Item
from .utils import try_get_item, encode_item_fields


def get_items_service(search: str, db: Session):
    """Retrieve all items with optional search filtering."""
    statement = select(Item)
    if search:
        statement = statement.where(Item.name.ilike(f"%{search}%"))
    return db.exec(statement).all()


def get_item_service(item_id: int, db: Session):
    """Retrieve a single item by ID."""
    return try_get_item(item_id, db)


def create_item_service(item: Item, db: Session):
    """Create a new item with field validation."""
    item = encode_item_fields(item)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_item_service(item_id: int, new_item: Item, db: Session):
    """Update an existing item with new data."""
    existing = try_get_item(item_id, db)
    existing.name = new_item.name
    existing.description = new_item.description
    existing.price = new_item.price
    existing.image_src = new_item.image_src
    db.commit()
    db.refresh(existing)
    return existing


def delete_item_service(item_id: int, db: Session):
    """Delete an item from the database."""
    existing = try_get_item(item_id, db)
    db.delete(existing)
    db.commit()
    return item_id
