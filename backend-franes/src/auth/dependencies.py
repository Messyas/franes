from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from src.admin.models import users
from src.auth.utils import verify_password
from src.config import settings
from src.database import fetch_one

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/admin/auth/token")


async def authenticate_admin_user(username: str, password: str) -> dict[str, Any] | None:
    query = users.select().where(users.c.username == username)
    user = await fetch_one(query)
    if not user:
        return None

    if not user["is_active"] or not user["is_admin"]:
        return None

    if not verify_password(password, user["password_hash"]):
        return None

    return user


def create_access_token(
    *, subject: str, expires_delta: timedelta | None = None
) -> str:
    expire_delta = expires_delta or timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    expire_at = datetime.now(timezone.utc) + expire_delta
    to_encode = {"sub": subject, "exp": expire_at}
    encoded_jwt = jwt.encode(
        to_encode,
        settings.ADMIN_TOKEN_SECRET,
        algorithm=settings.ADMIN_TOKEN_ALGORITHM,
    )
    return encoded_jwt


async def get_current_admin_user(
    token: str = Depends(oauth2_scheme),
) -> dict[str, Any]:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token,
            settings.ADMIN_TOKEN_SECRET,
            algorithms=[settings.ADMIN_TOKEN_ALGORITHM],
        )
        subject = payload.get("sub")
        if subject is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    try:
        user_id = int(subject)
    except (TypeError, ValueError):
        raise credentials_exception

    user = await fetch_one(users.select().where(users.c.id == user_id))
    if not user or not user["is_active"] or not user["is_admin"]:
        raise credentials_exception

    sanitized_user = dict(user)
    sanitized_user.pop("password_hash", None)
    return sanitized_user
