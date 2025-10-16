from sqlalchemy import JSON, Column, DateTime, Integer, String, Table, func

from src.database import metadata

art = Table(
    "art",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("title", String(50), nullable=False),
    Column("created_at", DateTime, server_default=func.now(), nullable=False),
    Column("description", String(300), nullable=False),
    Column("image", JSON, nullable=True),
)
