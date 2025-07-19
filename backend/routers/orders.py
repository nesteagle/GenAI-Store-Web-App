"""
API routes for order management operations.
Provides endpoints for order CRUD operations with permission-based access control.
get:order and modify:orders are configured as admin-level permissions on Auth0
"""

from fastapi import APIRouter, Depends
from sqlmodel import Session
from backend.models import OrderCreate, User
from backend.database import get_db
from backend.auth import require_permissions, get_current_user
from backend.services.order_services import (
    get_user_orders_service,
    get_order_by_id_service,
    create_order_service,
    update_order_service,
    delete_order_service,
)

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("/")
async def get_my_orders(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get all orders for the authenticated user."""
    orders = get_user_orders_service(current_user, db)
    return {"orders": orders}


@router.get("/{order_id}", dependencies=[Depends(require_permissions(["get:order"]))])
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Get a single order by ID."""
    order_details = get_order_by_id_service(order_id, db)
    return {"order": order_details}


@router.post("/", dependencies=[Depends(require_permissions(["modify:orders"]))])
async def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    """Create a new order."""
    order_details = create_order_service(order, db)
    return {"order": order_details}


@router.put(
    "/{order_id}", dependencies=[Depends(require_permissions(["modify:orders"]))]
)
async def update_order(
    order_id: int, order: OrderCreate, db: Session = Depends(get_db)
):
    """Update an existing order."""
    order_details = update_order_service(order_id, order, db)
    return {"order": order_details}


@router.delete(
    "/{order_id}", dependencies=[Depends(require_permissions(["modify:orders"]))]
)
async def delete_order(order_id: int, db: Session = Depends(get_db)):
    """Delete an order by ID."""
    delete_order_service(order_id, db)
    return {"message": f"Order {order_id} deleted successfully"}
