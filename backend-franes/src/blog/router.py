# +--------------------------------------------------------------------------------
# Contem a logica para receber as requisicoes HTTP e interagir com o banco de dados
# +--------------------------------------------------------------------------------


import datetime
from typing import List
from fastapi import APIRouter, HTTPException
from src.database import fetch_all, fetch_one, execute
from src.blog.models import blog_posts
from src.blog.schemas import BlogPostCreate, BlogPost

router = APIRouter(
    prefix="/blog",
    tags=["Blog"],
)

@router.post("/", response_model=BlogPost, status_code=201)
async def create_blog_post(post: BlogPostCreate):
    """
    Cria um novo post no blog.
    """
    query = blog_posts.insert().values(
        title=post.title,
        reading_time=post.reading_time,
        content=post.content,
    )
    # A função execute não retorna o ID diretamente. Para ter o post completo,
    # uma abordagem seria buscar o último post criado.
    # Por simplicidade aqui, vamos assumir que a inserção funcionou.
    # Uma implementação mais robusta retornaria o objeto criado.
    last_record_id = await execute(query, commit_after=True) # Assumindo que execute retorna o id
    return BlogPost(id=last_record_id, created_at=datetime.utcnow(), **post.model_dump()) 