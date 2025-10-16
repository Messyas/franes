from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class UserBase(BaseModel):
    username: str = Field(min_length=3, max_length=150)
    is_active: bool = True
    is_admin: bool = False


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserUpdate(BaseModel):
    username: Optional[str] = Field(default=None, min_length=3, max_length=150)
    password: Optional[str] = Field(default=None, min_length=8, max_length=128)
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None


class User(BaseModel):
    id: int
    username: str
    is_active: bool
    is_admin: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
