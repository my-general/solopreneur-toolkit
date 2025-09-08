# File: backend/app/api/endpoints/orders.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ... import crud, schemas, security
from ...database import get_db

router = APIRouter()

# --- PUBLIC ENDPOINT FOR PLACING AN ORDER ---
@router.post("/{page_slug}", response_model=schemas.Order, status_code=status.HTTP_201_CREATED)
def place_order_on_page(
    page_slug: str,
    order: schemas.OrderCreate,
    db: Session = Depends(get_db)
):
    """
    Public endpoint for a customer to create a new order on a specific page.
    """
    # First, find the page the customer is ordering from
    page = crud.get_page_by_slug(db, slug=page_slug)
    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The page you are trying to order from does not exist.",
        )
    
    try:
        # Use the CRUD function to create the order
        return crud.create_order_for_page(db=db, order=order, page_id=page.id)
    except ValueError as e:
        # This catches errors from our CRUD function, like an invalid product ID
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


# --- PROTECTED ENDPOINT FOR VIEWING ORDERS ---
@router.get("/my-orders", response_model=List[schemas.Order])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(security.get_current_user)
):
    """
    Protected endpoint for a solopreneur to view all orders for their page.
    """
    # Get the logged-in user's page
    page = crud.get_page_by_owner_id(db, owner_id=current_user.id)
    if not page:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You do not have a page yet. No orders to show.",
        )
    
    # Fetch the orders for that page
    return crud.get_orders_for_page(db=db, page_id=page.id)