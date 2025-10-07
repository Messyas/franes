# +--------------------------------------------------------------------------------
# Contem a logica para receber as requisicoes HTTP e interagir com o banco de dados
# +--------------------------------------------------------------------------------

from typing import List
from fastapi import APIRouter, HTTPException, status
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

@router.get("/{post_id}", response_model=BlogPost)
async def get_post_by_id(post_id: int):
    """
    Retorna um post específico pelo seu ID.
    Se o post não for encontrado, retorna um erro 404.
    """
    query = blog_posts.select().where(blog_posts.c.id == post_id)
    post = await fetch_one(query)
    
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
        
    return post

@router.put("/{post_id}", response_model=BlogPost)
async def update_post(post_id: int, post_data: BlogPostCreate): 
    """
    Atualiza um post existente.
    Retorna o post com os dados atualizados.
    """
    select_query = blog_posts.select().where(blog_posts.c.id == post_id)
    if not await fetch_one(select_query):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    update_query = (
        blog_posts.update()
        .where(blog_posts.c.id == post_id)
        .values(post_data.model_dump())
        .returning(blog_posts) 
    )
    updated_post = await fetch_one(update_query, commit_after=True)
    return updated_post

@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(post_id: int): 
    """
    Deleta um post.
    Retorna uma resposta vazia com status 204 se for bem-sucedido.
    """
    select_query = blog_posts.select().where(blog_posts.c.id == post_id)
    if not await fetch_one(select_query):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    
    delete_query = blog_posts.delete().where(blog_posts.c.id == post_id)
    await execute(delete_query, commit_after=True)
    return {}