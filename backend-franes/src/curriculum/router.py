from typing import AsyncIterator, List

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from src.auth.dependencies import get_current_admin_user
from src.curriculum.models import curriculum_files
from src.curriculum.schema import (
    Curriculum,
    CurriculumCreate,
    CurriculumUpdate,
)
from src.database import execute, fetch_all, fetch_one

router = APIRouter(
    prefix="/curriculum",
    tags=["Curriculum"],
)


@router.post(
    "/",
    response_model=Curriculum,
    status_code=status.HTTP_201_CREATED,
)
async def create_curriculum_entry(
    payload: CurriculumCreate,
    _: dict = Depends(get_current_admin_user),
):
    query = (
        curriculum_files.insert()
        .values(
            title=payload.title,
            description=payload.description,
            file_name=payload.file_name,
            csv_content=payload.csv_content,
        )
        .returning(curriculum_files)
    )
    created = await fetch_one(query, commit_after=True)
    return created


@router.get("/", response_model=List[Curriculum])
async def list_curriculum_entries():
    query = curriculum_files.select()
    return await fetch_all(query)


@router.get("/latest", response_model=Curriculum)
async def get_latest_curriculum_entry():
    query = (
        curriculum_files.select()
        .order_by(curriculum_files.c.created_at.desc())
        .limit(1)
    )
    entry = await fetch_one(query)
    if entry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nenhum currículo disponível no momento.",
        )
    return entry


@router.get(
    "/latest/download",
    response_class=StreamingResponse,
    responses={
        status.HTTP_200_OK: {
            "content": {"text/csv": {}},
            "description": "Curriculum CSV download",
        }
    },
)
async def download_latest_curriculum_entry() -> StreamingResponse:
    query = (
        curriculum_files.select()
        .order_by(curriculum_files.c.created_at.desc())
        .limit(1)
    )
    entry = await fetch_one(query)
    if entry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nenhum currículo disponível para download.",
        )

    filename = entry["file_name"] or "curriculum.csv"
    csv_content = entry["csv_content"] or ""

    async def csv_iterator() -> AsyncIterator[bytes]:
        yield csv_content.encode("utf-8")

    headers = {
        "Content-Disposition": f'attachment; filename="{filename}"',
        "Content-Type": "text/csv; charset=utf-8",
    }

    return StreamingResponse(
        csv_iterator(),
        media_type="text/csv",
        headers=headers,
    )


@router.get("/{curriculum_id}", response_model=Curriculum)
async def get_curriculum_entry(curriculum_id: int):
    query = curriculum_files.select().where(
        curriculum_files.c.id == curriculum_id
    )
    entry = await fetch_one(query)
    if entry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Curriculum entry not found",
        )
    return entry


@router.put("/{curriculum_id}", response_model=Curriculum)
async def update_curriculum_entry(
    curriculum_id: int,
    payload: CurriculumUpdate,
    _: dict = Depends(get_current_admin_user),
):
    select_query = curriculum_files.select().where(
        curriculum_files.c.id == curriculum_id
    )
    existing = await fetch_one(select_query)
    if existing is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Curriculum entry not found",
        )

    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        return existing

    update_query = (
        curriculum_files.update()
        .where(curriculum_files.c.id == curriculum_id)
        .values(update_data)
        .returning(curriculum_files)
    )
    updated = await fetch_one(update_query, commit_after=True)
    return updated


@router.delete("/{curriculum_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_curriculum_entry(
    curriculum_id: int,
    _: dict = Depends(get_current_admin_user),
):
    select_query = curriculum_files.select().where(
        curriculum_files.c.id == curriculum_id
    )
    if not await fetch_one(select_query):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Curriculum entry not found",
        )

    delete_query = curriculum_files.delete().where(
        curriculum_files.c.id == curriculum_id
    )
    await execute(delete_query, commit_after=True)
