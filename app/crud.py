# File: backend/app/crud.py

import re
from sqlalchemy.orm import Session
from . import models, schemas, security

# --- User CRUD (Existing) ---
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = security.get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Page CRUD (Existing) ---
def _generate_slug(title: str) -> str:
    s = title.lower().strip()
    s = re.sub(r'[\s\W-]+', '-', s)
    return s

def get_page_by_owner_id(db: Session, owner_id: int):
    return db.query(models.Page).filter(models.Page.owner_id == owner_id).first()

def create_user_page(db: Session, page: schemas.PageCreate, owner_id: int):
    slug = _generate_slug(page.title)
    if db.query(models.Page).filter(models.Page.slug == slug).first():
        raise ValueError("Page with this title already exists, creating a duplicate slug.")
    db_page = models.Page(**page.model_dump(), owner_id=owner_id, slug=slug)
    db.add(db_page)
    db.commit()
    db.refresh(db_page)
    return db_page

def update_user_page(db: Session, db_page: models.Page, page_update: schemas.PageUpdate):
    update_data = page_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_page, key, value)
    db.add(db_page)
    db.commit()
    db.refresh(db_page)
    return db_page

def get_page_by_slug(db: Session, slug: str):
    return db.query(models.Page).filter(models.Page.slug == slug).first()

# --- Product CRUD (Existing) ---
def create_product_for_page(db: Session, product: schemas.ProductCreate, page_id: int):
    db_product = models.Product(**product.model_dump(), page_id=page_id)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def update_product(db: Session, db_product: models.Product, product_update: schemas.ProductUpdate):
    update_data = product_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, db_product: models.Product):
    db.delete(db_product)
    db.commit()
    return db_product

# --- NEW FUNCTIONS FOR ORDERS ---

def get_orders_for_page(db: Session, page_id: int):
    """Fetches all orders for a specific page, newest first."""
    return db.query(models.Order).filter(models.Order.page_id == page_id).order_by(models.Order.id.desc()).all()

def create_order_for_page(db: Session, order: schemas.OrderCreate, page_id: int):
    """Creates a new order, calculating total price and linking items."""
    total_price = 0.0
    order_items_to_create = []

    # Loop through the items from the incoming order data
    for item_in in order.items:
        product = get_product(db, product_id=item_in.product_id)
        
        # Validation: Ensure the product exists and belongs to the correct page
        if not product or product.page_id != page_id:
            raise ValueError(f"Product with ID {item_in.product_id} is invalid for this page.")
        
        # Calculate the total price
        total_price += product.price * item_in.quantity
        
        # Create the OrderItem database model instance
        order_item = models.OrderItem(
            product_name=product.name,
            quantity=item_in.quantity,
            price_per_item=product.price
        )
        order_items_to_create.append(order_item)

    # Create the main Order database model instance
    db_order = models.Order(
        customer_name=order.customer_name,
        customer_phone=order.customer_phone,
        total_price=total_price,
        page_id=page_id,
        items=order_items_to_create # SQLAlchemy will handle linking these
    )

    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order