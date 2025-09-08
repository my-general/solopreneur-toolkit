from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ... import crud, schemas, security
from ...database import get_db

router = APIRouter()

# --- User Registration (Existing) ---
@router.post("/", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def create_new_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    return crud.create_user(db=db, user=user)

# --- User Login (UPDATED WITH DEBUGGING) ---
@router.post("/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    
    # --- DEBUGGING STEP 1: Print what we received from the user ---
    print("--- LOGIN ATTEMPT ---")
    print(f"Username received: '{form_data.username}'")
    print(f"Password received: '{form_data.password}'")
    
    # --- Look up the user in the database ---
    user = crud.get_user_by_email(db, email=form_data.username)
    
    # --- DEBUGGING STEP 2: Check if the user was found ---
    if not user:
        print("DEBUG: User not found in the database.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"DEBUG: User '{user.email}' found in the database.")
    print(f"DEBUG: Hashed password from DB: '{user.hashed_password}'")
    
    # --- Verify the password ---
    is_password_correct = security.verify_password(form_data.password, user.hashed_password)
    
    # --- DEBUGGING STEP 3: Check if the password verification was successful ---
    print(f"DEBUG: Password verification result: {is_password_correct}")
    
    if not is_password_correct:
        print("DEBUG: Password verification FAILED.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # --- If everything is correct, create and return the token ---
    print("DEBUG: Password verification SUCCEEDED. Generating token.")
    access_token = security.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


# --- Get Current User (Existing) ---
@router.get("/me", response_model=schemas.User)
def read_users_me(current_user: schemas.User = Depends(security.get_current_user)):
    return current_user