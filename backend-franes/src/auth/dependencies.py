from __future__ import annotations

import secrets
from typing import Any

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials

from src.config import settings

basic_security = HTTPBasic()


def _verify_password(password: str, *, hashed: str | None, plain: str | None) -> bool:
    if hashed:
        try:
            return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
        except ValueError:
            return False

    if plain:
        return secrets.compare_digest(password, plain)

    return False


async def get_current_admin_user(
    credentials: HTTPBasicCredentials = Depends(basic_security),
) -> dict[str, Any]:
    username_valid = secrets.compare_digest(
        credentials.username, settings.ADMIN_USERNAME
    )
    password_valid = _verify_password(
        credentials.password,
        hashed=settings.ADMIN_PASSWORD_HASH,
        plain=settings.ADMIN_PASSWORD,
    )

    if not (username_valid and password_valid):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Basic"},
        )

    return {"username": credentials.username}
