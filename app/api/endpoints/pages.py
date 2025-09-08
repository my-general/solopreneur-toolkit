# File: backend/app/api/endpoints/pages.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ... import crud, schemas, security
from ...database import get_db

router = APIRouter()

# --- PROTECTED ENDPOINTS ---

@router.post("/", response_model=schemas.Page, status_code=status.HTTP_201_CREATED)
def create_page_for_current_user(
    page: schemas.PageCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(security.get_current_user)
):
    existing_page = crud.get_page_by_owner_id(db, owner_id=current_user.id)
    if existing_page:
        raise HTTPException(
            status_code=400,
            detail="User already has a page. Use the update endpoint instead.",
        )
    return crud.create_user_page(db=db, page=page, owner_id=current_user.id)

@router.get("/me", response_model=schemas.Page)
def read_current_user_page(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(security.get_current_user)
):
    page = crud.get_page_by_owner_id(db, owner_id=current_user.id)
    if not page:
        raise HTTPException(status_code=404, detail="Page not found for this user.")
    return page

@router.put("/me", response_model=schemas.Page)
def update_current_user_page(
    page_update: schemas.PageUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(security.get_current_user)
):
    db_page = crud.get_page_by_owner_id(db, owner_id=current_user.id)
    if not db_page:
        raise HTTPException(status_code=404, detail="Page not found for this user.")
    return crud.update_user_page(db=db, db_page=db_page, page_update=page_update)

# --- PUBLIC ENDPOINT ---
# This is new and does not require authentication.

@router.get("/{slug}", response_model=schemas.Page)
def read_public_page(slug: str, db: Session = Depends(get_db)):
    """
    Fetch a page by its public slug for anyone to view.
    """
    db_page = crud.get_page_by_slug(db, slug=slug)
    if db_page is None:
        raise HTTPException(status_code=404, detail="Page not found")
    return db_page