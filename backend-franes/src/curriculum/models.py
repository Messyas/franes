from sqlalchemy import (
    Column,
    DateTime,
    Integer,
    String,
    Table,
    Text,
    func,
)

from src.database import metadata

curriculum_files = Table(
    "curriculum_files",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("title", String(120), nullable=False),
    Column("description", String(300), nullable=True),
    Column("file_name", String(255), nullable=False),
    Column("csv_content", Text, nullable=False),
    Column("created_at", DateTime, server_default=func.now(), nullable=False),
    Column(
        "updated_at",
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    ),
)
