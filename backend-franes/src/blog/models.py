from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    func,
    Table,
)
from src.database import metadata

#Define a estrutura da tabela blog_posts no banco de dados
blog_posts = Table(
    "blog_posts",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("title", String(100), nullable=False),
    Column("reading_time", Integer, nullable=False),
    Column("created_at", DateTime, server_default=func.now(), nullable=False),
    Column("content", String, nullable=False),
)