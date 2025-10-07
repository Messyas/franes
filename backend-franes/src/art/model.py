from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    func,
    Table,
)
from src.database import metadata

art = Table(
    "art",
    metadata,
    Column("id", Integer, notnullable=True),
    Column("title", String(50),notnullable=True),
    Column("created_at", DateTime, server_default=func.now(), nullable=False),
    Column("description", String(300), nullable=False),
)