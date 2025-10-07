from typing import List
from fastapi import APIRouter, HTTPException, status
from src.database import fetch_all, fetch_one, execute
from src.art.model import art
from src.art.schemas import CreateArt, ArtScript

router = APIRouter(
    prefix="/art",
    tags=["Art"],
)

@router.post("/", response_model=CreateArt, status_code=status.HTTP_201_CREATED)
async def create_art(art: CreateArt):
    query = (
        art.insert()
        .values(
            title=art.title,
            description=art.description,
        )
        .returning(art)
    )
    created_art = await fetch_one(query, commit_after=True)
    return created_art

@router.get("/", response_model=List[ArtScript])
async def list_arts():
    query = art.select()
    return await fetch_all(query)

@router.get("/{art_id}", response_model=ArtScript)
async def get_art_by_id(art_id: int):
    query = art.select().where(art.c.id == art_id)
    the_art = await fetch_one(query)
    if the_art is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Art not found")
    return the_art

@router.put("/{art_id}", response_model=ArtScript)
async def update_art(art_id: int, art_data: CreateArt): 
    select_query = art.select().where(art.c.id == art_id)
    if not await fetch_one(select_query):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Art not found")
    update_query = (
        art.update()
        .where(art.c.id == art_id)
        .values(art_data.model_dump())
        .returning(art) 
    )
    updated_art = await fetch_one(update_query, commit_after=True)
    return updated_art


@router.delete("/{art_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_art(art_id: int): 
    select_query = art.select().where(art.c.id == art_id)
    if not await fetch_one(select_query):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Art not found")
    
    delete_query = art.delete().where(art.c.id == art_id)
    await execute(delete_query, commit_after=True)
    return {}