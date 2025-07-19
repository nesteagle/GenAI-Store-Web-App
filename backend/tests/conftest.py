"""
Pytest configuration and fixtures for tests.
"""

import pytest
from .helpers import get_test_session


@pytest.fixture
def db_session():
    """Provide a test database session."""
    session = get_test_session()
    try:
        yield session
    finally:
        session.close()
