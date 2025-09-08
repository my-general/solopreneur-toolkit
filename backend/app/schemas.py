# File: backend/app/schemas.py

from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime # Import datetime

# --- User Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: int
    email: EmailStr
    model_config = ConfigDict(from_attributes=True)

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None

# --- Product Schemas ---
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None

class Product(ProductBase):
    id: int
    page_id: int
    model_config = ConfigDict(from_attributes=True)

# --- Page Schemas ---
class PageCreate(BaseModel):
    title: str
    description: Optional[str] = None

class PageUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class Page(BaseModel):
    id: int
    slug: str
    title: str
    description: Optional[str] = None
    owner_id: int
    products: List[Product] = []
    model_config = ConfigDict(from_attributes=True)

# --- NEW SCHEMAS FOR ORDERS ---

# Data shape for a single item when creating an order
# The customer's cart will be a list of these
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

# Data shape for a full order when creating it
class OrderCreate(BaseModel):
    customer_name: str
    customer_phone: str
    items: List[OrderItemCreate]

# Data shape for a single item when returned from the API
class OrderItem(BaseModel):
    id: int
    product_name: str
    quantity: int
    price_per_item: float
    model_config = ConfigDict(from_attributes=True)

# Data shape for a full order when returned from the API
class Order(BaseModel):
    id: int
    customer_name: str
    customer_phone: str
    total_price: float
    items: List[OrderItem] = []
    model_config = ConfigDict(from_attributes=True)


class Page(BaseModel):
    id: int
    slug: str
    title: str
    description: Optional[str] = None
    owner_id: int
    products: List[Product] = []
    model_config = ConfigDict(from_attributes=True)

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    customer_name: str
    customer_phone: str
    items: List[OrderItemCreate]

class OrderItem(BaseModel):
    id: int
    product_name: str
    quantity: int
    price_per_item: float
    model_config = ConfigDict(from_attributes=True)

class Order(BaseModel):
    id: int
    customer_name: str
    customer_phone: str
    total_price: float
    created_at: datetime # ADD THIS LINE
    items: List[OrderItem] = []
    model_config = ConfigDict(from_attributes=True)