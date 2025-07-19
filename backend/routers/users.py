"""
API routes for user management operations.
Provides CRUD endpoints with permission-based access control.
All permissions are configured as admin-level on Auth0.
"""

from fastapi import APIRouter, Depends
from sqlmodel import Session
from backend.models import User
from backend.database import get_db
from backend.auth import require_permissions
from backend.services.user_services import (
    get_users_service,
    get_user_service,
    create_user_service,
    update_user_service,
    delete_user_service,
)

router = APIRouter(prefix="/users", tags=["users"])


@router.get(
    "/", dependencies=[Depends(require_permissions(["get:users"]))]
)
async def get_users(db: Session = Depends(get_db)):
    """Get all users."""
    users = get_users_service(db)
    return {"users": users}


@router.get("/{user_id}", dependencies=[Depends(require_permissions(["get:user"]))])
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get a single user by ID."""
    user = get_user_service(user_id, db)
    return {"user": user}


@router.post("/", dependencies=[Depends(require_permissions(["modify:users"]))])
async def create_user(user: User, db: Session = Depends(get_db)):
    """Create a new user."""
    new_user = create_user_service(user, db)
    return {"user": new_user}


@router.put("/{user_id}", dependencies=[Depends(require_permissions(["modify:users"]))])
async def update_user(user_id: int, user: User, db: Session = Depends(get_db)):
    """Update an existing user."""
    updated_user = update_user_service(user_id, user, db)
    return {"user": updated_user}


@router.delete(
    "/{user_id}", dependencies=[Depends(require_permissions(["modify:users"]))]
)
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Delete a user by ID."""
    delete_user_service(user_id, db)
    return {"message": f"User {user_id} deleted successfully"}
