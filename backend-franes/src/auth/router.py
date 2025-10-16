from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import IntegrityError

from src.admin.models import users
from src.auth.dependencies import (
    authenticate_admin_user,
    create_access_token,
)
from src.auth.schemas import AdminCredentials, Token
from src.auth.utils import hash_password
from src.config import settings
from src.database import fetch_one

router = APIRouter(
    prefix="/admin/auth",
    tags=["Auth"],
)


@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> Token:
    user = await authenticate_admin_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        subject=str(user["id"]),
        expires_delta=timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        ),
    )
    return Token(access_token=access_token)


@router.post(
    "/bootstrap",
    response_model=Token,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
async def bootstrap_admin(credentials: AdminCredentials) -> Token:
    existing_admin = await fetch_one(
        users.select().where(users.c.is_admin.is_(True))
    )
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin already initialized",
        )

    values = {
        "username": credentials.username,
        "password_hash": hash_password(credentials.password),
        "is_active": True,
        "is_admin": True,
    }
    query = users.insert().values(values).returning(users)
    try:
        created = await fetch_one(query, commit_after=True)
    except IntegrityError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists",
        ) from exc

    access_token = create_access_token(
        subject=str(created["id"]),
        expires_delta=timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        ),
    )
    return Token(access_token=access_token)
