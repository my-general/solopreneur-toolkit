# File: backend/app/database.py (Final Corrected Version)

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Load environment variables (only works for local .env file)
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# --- THE FIX ---
# We create a dictionary for connection arguments
connect_args = {}
# If our database is SQLite (for local development), we add the special argument.
# For PostgreSQL in production, this dictionary remains empty.
if DATABASE_URL and DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# Create the SQLAlchemy engine, passing the conditional connect_args
engine = create_engine(
    DATABASE_URL, connect_args=connect_args
)

# Each instance of the SessionLocal class will be a new database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# This Base will be used by all our ORM models to inherit from
Base = declarative_base()

# --- Dependency ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
