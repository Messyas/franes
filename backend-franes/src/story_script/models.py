from sqlalchemy import JSON, Column, DateTime, Integer, String, Table, func

from src.database import metadata

story_script = Table(
    "story_script",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("title", String(60), nullable=False),
    Column("sub_title", String(120), nullable=False),
    Column("created_at", DateTime, server_default=func.now(), nullable=False),
    Column("author_note", String(300), nullable=True),
    Column("content", String, nullable=False),
    Column("author_final_comment", String, nullable=True),
    Column("cover_image", JSON, nullable=True),
)
