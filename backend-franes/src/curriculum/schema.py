from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CurriculumBase(BaseModel):
    title: str
    description: str | None = None
    file_name: str
    csv_content: str


class CurriculumCreate(CurriculumBase):
    pass


class CurriculumUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    file_name: str | None = None
    csv_content: str | None = None


class Curriculum(CurriculumBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )
