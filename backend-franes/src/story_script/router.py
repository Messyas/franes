from typing import List
from fastapi import APIRouter, HTTPException, status
from src.database import fetch_all, fetch_one, execute
from src.story_script.models import story_script
from src.story_script.schemas import StoryScriptCreate, StoryScript

router = APIRouter(
    prefix="/story-script",
    tags=["Story Script"],
)

@router.post("/", response_model=StoryScriptCreate, status_code=status.HTTP_201_CREATED)
async def create_story_script(story_script_par: StoryScriptCreate):
    query = (
        story_script.insert()
        .values(
            title=story_script_par.title,
            sub_title=story_script_par.sub_title,
            author_note=story_script_par.author_note,
            content=story_script_par.content,
            author_final_comment=story_script_par.author_final_comment
        )
        .returning(story_script)
    )
    created_post = await fetch_one(query, commit_after=True)
    return created_post

@router.get("/", response_model=List[StoryScript])
async def list_story_script():
    query = story_script.select()
    return await fetch_all(query)

@router.get("/{post_id}", response_model=StoryScript)
async def get_story_script_by_id(story_script_id: int):
    query = story_script.select().where(story_script.c.id == story_script_id)
    post = await fetch_one(query)
    
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Story script not found")
    return post

@router.put("/{post_id}", response_model=StoryScript)
async def update_story_script(story_script_id: int, post_data: StoryScriptCreate): 
    select_query = story_script.select().where(story_script.c.id == story_script_id)
    if not await fetch_one(select_query):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Story script not found")
    update_query = (
        story_script.update()
        .where(story_script.c.id == story_script_id)
        .values(post_data.model_dump())
        .returning(story_script) 
    )
    updated_story_script = await fetch_one(update_query, commit_after=True)
    return updated_story_script


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_story_script(story_script_id: int): 
    select_query = story_script.select().where(story_script.c.id == story_script_id)
    if not await fetch_one(select_query):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Story script not found")
    
    delete_query = story_script.delete().where(story_script.c.id == story_script_id)
    await execute(delete_query, commit_after=True)
    return {}