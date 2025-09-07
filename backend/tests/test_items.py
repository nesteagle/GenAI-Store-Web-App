"""
Unit tests for item service functions.
Tests CRUD operations and search functionality using database fixtures.
"""

import pytest
from backend.services.item_services import (
    get_items_service,
    get_item_service,
    create_item_service,
    update_item_service,
    delete_item_service,
)
from backend.models import Item
from .helpers import create_test_item


def test_get_items_service(db_session):
    """Test getting all items."""
    create_test_item(db_session, "Apple", 2.99, "Fresh apple")
    create_test_item(db_session, "Banana", 1.99, "Yellow banana")

    items = get_items_service(search="", db=db_session)
    assert len(items) == 2


def test_get_items_service_with_search(db_session):
    """Test getting items with search filter."""
    create_test_item(db_session, "Apple", 2.99, "Fresh apple")
    create_test_item(db_session, "Banana", 1.99, "Yellow banana")

    items = get_items_service(search="Apple", db=db_session)
    assert len(items) == 1
    assert items[0].name == "Apple"


def test_create_item_service(db_session):
    """Test creating an item."""
    item = Item(name="Orange", description="Citrus fruit", price=3.99)
    created_item = create_item_service(item, db_session)

    assert created_item.name == "Orange"
    assert created_item.description == "Citrus fruit"
    assert created_item.price == 3.99
    assert created_item.id is not None


def test_get_item_service(db_session):
    """Test getting a single item by ID."""
    created_item = create_test_item(db_session, "Grape", 5.99, "Purple grapes")

    retrieved_item = get_item_service(created_item.id, db_session)
    assert retrieved_item.name == "Grape"
    assert retrieved_item.price == 5.99


def test_update_item_service(db_session):
    """Test updating an item."""
    created_item = create_test_item(db_session, "Pear", 4.99, "Green pear")

    updated_data = Item(name="Red Pear", description="Red pear", price=5.99)
    updated_item = update_item_service(created_item.id, updated_data, db_session)

    assert updated_item.name == "Red Pear"
    assert updated_item.description == "Red pear"
    assert updated_item.price == 5.99


def test_delete_item_service(db_session):
    """Test deleting an item."""
    created_item = create_test_item(db_session, "Mango", 6.99, "Tropical fruit")

    deleted_item_id = delete_item_service(created_item.id, db_session)
    assert deleted_item_id == created_item.id

    with pytest.raises(Exception):  # Expected item not found
        get_item_service(created_item.id, db_session)

