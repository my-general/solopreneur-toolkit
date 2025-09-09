# File: backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models, database
# Import the new orders router
from .api.endpoints import users, pages, products, orders 

# This line creates the tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="Solopreneur Digital Toolkit API",
    description="The backend API for the Solopreneur Digital Toolkit.",
    version="0.1.0",
)

# --- CORS Configuration ---
origins = [
    "http://localhost:3000",
    "https://gentle-hill-000ab8500.1.azurestaticapps.net",
    "https://solopreneur-toolkit-jchjqll1b-mys-projects-e11c9265.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers ---
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(pages.router, prefix="/pages", tags=["Pages"])
app.include_router(products.router, prefix="/products", tags=["Products"])
# Include the new orders router
app.include_router(orders.router, prefix="/orders", tags=["Orders"])


@app.get("/")
def read_root():
    """A simple root endpoint to confirm the API is running."""

    return {"status": "ok", "message": "Welcome to the Solopreneur Toolkit API!"}

