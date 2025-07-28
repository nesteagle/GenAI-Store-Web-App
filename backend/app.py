"""
FastAPI application for the e-commerce store backend.
Handles authentication, payment processing, and order management.
"""

import os
import json
from contextlib import asynccontextmanager

from fastapi import (
    FastAPI,
    Depends,
    Request,
    HTTPException,
    Header,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import stripe
from .database import create_db_and_tables, get_db, get_db_session
from .routers import items, users, orders, admin, ai
from .models import OrderItemCreate, User, OrderCreate, CartItem
from .auth import get_current_user
from .services.order_services import create_order_service
from .services.item_services import get_item_service
from sqlmodel import Session

load_dotenv()

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
BASE_URL = os.getenv("BASE_URL")
FRONTEND_URL = os.getenv("FRONTEND_URL")

if not all([STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, BASE_URL, FRONTEND_URL]):
    raise Exception("Missing required Stripe configuration.")

stripe.api_key = STRIPE_SECRET_KEY


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database tables on startup."""
    create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)

origins = [FRONTEND_URL]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(items.router)
app.include_router(users.router)
app.include_router(orders.router)
app.include_router(admin.router)
app.include_router(ai.router)


@app.get("/myaccount", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)) -> User:
    """Get current authenticated user information."""
    return current_user


@app.get("/callback")
async def auth_callback():
    """Handle Auth0 authentication callback."""
    return RedirectResponse(url="/myaccount")


@app.post("/create-checkout-session/")
async def create_checkout_session(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create Stripe checkout session from user's cart."""
    cart_items = await request.json()
    item_id_to_qty = {item["id"]: item["qty"] for item in json.loads(cart_items)}
    item_ids = list(item_id_to_qty.keys())

    items = [get_item_service(item_id=item_id, db=db) for item_id in item_ids]

    if len(items) != len(item_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Some items in the cart do not exist.",
        )

    line_items = []
    for item in items:
        qty = item_id_to_qty.get(item.id, 1)
        line_items.append(
            {
                "price_data": {
                    "currency": "usd",
                    "product_data": {"name": item.name},
                    "unit_amount": int(item.price * 100),
                },
                "quantity": qty,
            }
        )

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=line_items,
            mode="payment",
            success_url=f"{FRONTEND_URL}/callback/",
            cancel_url=f"{FRONTEND_URL}/checkout",
            metadata={
                "user_id": str(current_user.id),
                "cart_items": cart_items,
            },
            customer_email=current_user.email,
        )
        return {"url": session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Stripe error: " + str(e))


@app.post("/webhook/")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None),
    db: Session = Depends(get_db),
):
    """Process Stripe webhook events and create orders."""
    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=stripe_signature,
            secret=STRIPE_WEBHOOK_SECRET,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid payload") from exc
    except stripe.error.SignatureVerificationError as exc:
        raise HTTPException(status_code=400, detail="Invalid signature") from exc

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session["metadata"]["user_id"]
        cart = session["metadata"]["cart_items"]
        items = [
            OrderItemCreate(item_id=item["id"], quantity=item["qty"])
            for item in json.loads(cart)
        ]
        order_data = OrderCreate(
            user_id=user_id,
            items=items,
            stripe_id=session["id"],
            currency=session["currency"],
            amount=session["amount_total"],
            email=session["customer_email"],
        )
        try:
            create_order_service(order_data=order_data, db=db)
        except Exception as exc:
            raise HTTPException(
                status_code=500, detail="Order DB error: " + str(exc)
            ) from exc
    return {"status": "success"}
