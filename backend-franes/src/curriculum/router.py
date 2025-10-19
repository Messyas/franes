import base64
from typing import AsyncIterator, Dict, List

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


def serialize_curriculum(record: Dict) -> Dict:
    """Normaliza o payload retornado para incluir informações de PDF."""
    if record is None:
        return record

    record_dict = dict(record)

    file_name = (record_dict.get("file_name") or "").lower()
    stored_content = record_dict.get("csv_content")
    pdf_base64 = None
    csv_content = stored_content
    if file_name.endswith(".pdf"):
        pdf_base64 = stored_content
        csv_content = None

    return {
        **record_dict,
        "csv_content": csv_content,
        "pdf_base64": pdf_base64,
        "pdf_url": f"/curriculum/{record_dict['id']}/download",
    }


@router.post(
    "/",
    response_model=Curriculum,
    status_code=status.HTTP_201_CREATED,
)
async def create_curriculum_entry(
    payload: CurriculumCreate,
    _: dict = Depends(get_current_admin_user),
):
    stored_content = payload.pdf_base64 or payload.csv_content or ""
    query = (
        curriculum_files.insert()
        .values(
            title=payload.title,
            description=payload.description,
            file_name=payload.file_name,
            csv_content=stored_content,
        )
        .returning(curriculum_files)
    )
    created = await fetch_one(query, commit_after=True)
    return serialize_curriculum(created)


@router.get("/", response_model=List[Curriculum])
async def list_curriculum_entries():
    query = curriculum_files.select()
    entries = await fetch_all(query)
    return [serialize_curriculum(entry) for entry in entries]


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
    return serialize_curriculum(entry)


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

    return build_file_response(entry)


@router.get(
    "/{curriculum_id}/download",
    response_class=StreamingResponse,
)
async def download_curriculum_entry(curriculum_id: int) -> StreamingResponse:
    query = curriculum_files.select().where(
        curriculum_files.c.id == curriculum_id,
    )
    entry = await fetch_one(query)
    if entry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Curriculum entry not found",
        )

    return build_file_response(entry)


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
    return serialize_curriculum(entry)


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
    if "pdf_base64" in update_data:
        update_data["csv_content"] = update_data.pop("pdf_base64")
    if not update_data:
        return existing

    update_query = (
        curriculum_files.update()
        .where(curriculum_files.c.id == curriculum_id)
        .values(update_data)
        .returning(curriculum_files)
    )
    updated = await fetch_one(update_query, commit_after=True)
    return serialize_curriculum(updated)


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


def build_file_response(entry: Dict) -> StreamingResponse:
    record = dict(entry)
    filename = record.get("file_name") or "curriculum.csv"
    stored_content = record.get("csv_content") or ""
    is_pdf = filename.lower().endswith(".pdf")

    if is_pdf:
        try:
            file_bytes = base64.b64decode(stored_content, validate=True)
        except (base64.binascii.Error, TypeError):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Arquivo PDF inválido armazenado.",
            )
        media_type = "application/pdf"
    else:
        file_bytes = stored_content.encode("utf-8")
        media_type = "text/csv; charset=utf-8"

    async def file_iterator() -> AsyncIterator[bytes]:
        yield file_bytes

    headers = {
        "Content-Disposition": f'attachment; filename="{filename}"',
        "Content-Type": media_type,
    }

    return StreamingResponse(
        file_iterator(),
        media_type=media_type,
        headers=headers,
    )
