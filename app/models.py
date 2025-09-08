# File: backend/app/models.py

from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func # Import func
from .database import Base

# ... User, Page, and Product models are unchanged ...
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    page = relationship("Page", back_populates="owner", uselist=False, cascade="all, delete-orphan")

class Page(Base):
    __tablename__ = "pages"
    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, index=True, default="My Page")
    description = Column(String, default="Welcome to my page!")
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="page")
    products = relationship("Product", back_populates="page", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="page", cascade="all, delete-orphan")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    page_id = Column(Integer, ForeignKey("pages.id"))
    page = relationship("Page", back_populates="products")


class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, nullable=False)
    customer_phone = Column(String, nullable=False)
    total_price = Column(Float, nullable=False)
    # ADD THIS NEW COLUMN
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    page_id = Column(Integer, ForeignKey("pages.id"))
    page = relationship("Page", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    price_per_item = Column(Float, nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"))
    order = relationship("Order", back_populates="items")