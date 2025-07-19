"""
Database configuration and session management for the backend application.
Provides SQLModel engine setup and session factories for dependency injection.
"""
import os

from typing import Generator
from sqlmodel import SQLModel, create_engine, Session
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise Exception("Missing DB URL")

engine = create_engine(DATABASE_URL, echo=True)


def create_db_and_tables():
    """Create all database tables from SQLModel metadata."""
    SQLModel.metadata.create_all(engine)


def get_db() -> Generator[Session, None, None]:
    """Dependency injection factory for database sessions."""
    with Session(engine) as session:
        yield session


def get_db_session() -> Session:
    """Create a new database session for direct use."""
    return Session(engine)