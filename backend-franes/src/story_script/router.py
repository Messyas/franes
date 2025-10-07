from typing import List
from fastapi import APIRouter, HTTPException, status
from src.database import fetch_all, fetch_one, execute
from src.story_script.models import story_script
from src.story_script.schemas import StoryScriptCreate, StoryScript

router = APIRouter(
    prefix="/storyScript",
    tags=["Story Script"],
)

@router.post("/", response_model=StoryScriptCreate, status_code=status.HTTP_201_CREATED)
async def create_story_script(post: StoryScriptCreate):
    query = (
        story_script.insert()
        .values(
            title=post.title,
            sub_title=post.sub_title,
            author_note=post.author_note,
            content=post.content,
            author_final_comment=post.author_final_comment
        )
        .returning(story_script)
    )
    created_post = await fetch_one(query, commit_after=True)
    return created_post

@router.get("/", response_model=StoryScript)
async def get_story_script():
    query = story_script.select()
    return await fetch_all(query)