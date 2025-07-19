"""
Admin router module for FastAPI Store Web App.
Provides endpoints for administrative actions.
get:orders and get:users are configured as admin-level permissions on Auth0.
"""

from fastapi import APIRouter, Depends
from sqlmodel import Session
from backend.database import get_db
from backend.auth import require_permissions
from backend.services.order_services import get_orders_admin_service
from backend.services.user_services import get_users_service

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/orders/", dependencies=[Depends(require_permissions(["get:orders"]))])
async def get_all_orders(db: Session = Depends(get_db)):
    """Get all orders for admin dashboard."""
    orders = get_orders_admin_service(db)
    return {"orders": orders}


@router.get("/users/", dependencies=[Depends(require_permissions(["get:users"]))])
async def get_users(db: Session = Depends(get_db)):
    """Get all users for admin management."""
    users = get_users_service(db)
    return {"users": users}
