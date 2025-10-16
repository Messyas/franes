from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError

from src.admin.models import users
from src.admin.schemas import User, UserCreate, UserUpdate
from src.auth.dependencies import get_current_admin_user
from src.auth.utils import hash_password
from src.database import execute, fetch_all, fetch_one

router = APIRouter(
    prefix="/admin/users",
    tags=["Admin Users"],
    dependencies=[Depends(get_current_admin_user)],
)


async def _count_admins(exclude_user_id: int | None = None) -> int:
    query = (
        select(func.count())
        .select_from(users)
        .where(users.c.is_admin.is_(True), users.c.is_active.is_(True))
    )
    if exclude_user_id is not None:
        query = query.where(users.c.id != exclude_user_id)
    result = await fetch_one(query)
    if not result:
        return 0
    return int(next(iter(result.values())))


@router.post("/", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_user(payload: UserCreate) -> User:
    values = {
        "username": payload.username,
        "password_hash": hash_password(payload.password),
        "is_active": payload.is_active,
        "is_admin": payload.is_admin,
    }
    query = users.insert().values(values).returning(users)
    try:
        created = await fetch_one(query, commit_after=True)
    except IntegrityError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists",
        ) from exc

    return created


@router.get("/", response_model=List[User])
async def list_users() -> List[User]:
    query = users.select()
    return await fetch_all(query)


@router.get("/{user_id}", response_model=User)
async def get_user(user_id: int) -> User:
    query = users.select().where(users.c.id == user_id)
    result = await fetch_one(query)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    return result


@router.put("/{user_id}", response_model=User)
async def update_user(user_id: int, payload: UserUpdate) -> User:
    existing = await fetch_one(users.select().where(users.c.id == user_id))
    if existing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    update_data = payload.model_dump(exclude_unset=True)
    if "password" in update_data:
        password = update_data.pop("password")
        if password is not None:
            update_data["password_hash"] = hash_password(password)

    new_is_admin = update_data.get("is_admin", existing["is_admin"])
    new_is_active = update_data.get("is_active", existing["is_active"])
    if (
        existing["is_admin"]
        and (not new_is_admin or not new_is_active)
        and await _count_admins(exclude_user_id=user_id) == 0
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove the last active admin user",
        )

    if not update_data:
        return existing

    query = (
        users.update()
        .where(users.c.id == user_id)
        .values(update_data)
        .returning(users)
    )
    try:
        updated = await fetch_one(query, commit_after=True)
    except IntegrityError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists",
        ) from exc

    if updated is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    return updated


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int) -> None:
    existing = await fetch_one(users.select().where(users.c.id == user_id))
    if existing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    if existing["is_admin"] and await _count_admins(exclude_user_id=user_id) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete the last active admin user",
        )

    query = users.delete().where(users.c.id == user_id)
    await execute(query, commit_after=True)
