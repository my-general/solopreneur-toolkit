from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ... import crud, schemas, security
from ...database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.Product, status_code=status.HTTP_201_CREATED)
def create_product_for_current_user(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(security.get_current_user)
):
    """
    Create a new product for the current user's page.

    A user must have created a page before they can add products.
    """
    # First, get the user's page
    user_page = crud.get_page_by_owner_id(db, owner_id=current_user.id)
    if not user_page:
        raise HTTPException(
            status_code=404,
            detail="You must create a page before adding products.",
        )
    # If the page exists, create the product for that page
    return crud.create_product_for_page(db=db, product=product, page_id=user_page.id)

@router.put("/{product_id}", response_model=schemas.Product)
def update_user_product(
    product_id: int,
    product_update: schemas.ProductUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(security.get_current_user)
):
    """
    Update a product belonging to the current user.
    """
    db_product = crud.get_product(db, product_id=product_id)
    # Security Check 1: Does the product exist?
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found.")
    
    # Security Check 2: Does this product belong to the current user?
    if db_product.page.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this product.")
        
    return crud.update_product(db=db, db_product=db_product, product_update=product_update)

@router.delete("/{product_id}", response_model=schemas.Product)
def delete_user_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(security.get_current_user)
):
    """
    Delete a product belonging to the current user.
    """
    db_product = crud.get_product(db, product_id=product_id)
    # Security Check 1: Does the product exist?
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found.")
        
    # Security Check 2: Does this product belong to the current user?
    if db_product.page.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this product.")
        
    return crud.delete_product(db=db, db_product=db_product)