from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Integer,
    String,
    Table,
    func,
    UniqueConstraint,
)

from src.database import metadata

users = Table(
    "users",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("username", String(150), nullable=False),
    Column("password_hash", String(255), nullable=False),
    Column("is_active", Boolean, nullable=False, server_default="true"),
    Column("is_admin", Boolean, nullable=False, server_default="false"),
    Column("created_at", DateTime, nullable=False, server_default=func.now()),
    Column(
        "updated_at",
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    ),
    UniqueConstraint("username", name="users_username_key"),
)
