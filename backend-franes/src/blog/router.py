# +--------------------------------------------------------------------------------
# Contem a logica para receber as requisicoes HTTP e interagir com o banco de dados
# +--------------------------------------------------------------------------------

import datetime
from typing import List
from fastapi import APIRouter, status
from src.database import fetch_all, fetch_one, execute
from src.blog.models import blog_posts
from src.blog.schemas import BlogPostCreate, BlogPost

router = APIRouter(
    prefix="/blog",
    tags=["Blog"],
)

#futuramente criar meddleware para ver se o user e admin

@router.post("/", response_model=BlogPost, status_code=status.HTTP_201_CREATED)
async def create_blog_post(
    post: BlogPostCreate
    # Descomente a linha abaixo para proteger a rota.
    # , current_admin: User = Depends(get_current_admin_user)
):
    """
    Cria um novo post no blog e retorna o post completo que foi salvo no banco.
    """
    query = (
        blog_posts.insert()
        .values(
            title=post.title,
            reading_time=post.reading_time,
            content=post.content,
        )
        .returning(blog_posts)  # Pede ao banco para retornar a linha inserida
    )

    # A função fetchone executa a query e já retorna o resultado formatado
    created_post = await fetch_one(query, commit_after=True)
    return created_post

@router.get("/", response_model=List[BlogPost])
async def get_all_posts():
    query = blog_posts.select()
    return await fetch_all(query)

