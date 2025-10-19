from datetime import datetime

from pydantic import BaseModel, ConfigDict, model_validator


class CurriculumBase(BaseModel):
    title: str
    description: str | None = None
    file_name: str


class CurriculumCreate(CurriculumBase):
    csv_content: str | None = None
    pdf_base64: str | None = None

    @model_validator(mode="after")
    def ensure_content(self) -> "CurriculumCreate":
        if not self.csv_content and not self.pdf_base64:
            raise ValueError(
                "É necessário informar o conteúdo CSV ou PDF do currículo.",
            )
        return self


class CurriculumUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    file_name: str | None = None
    csv_content: str | None = None
    pdf_base64: str | None = None

    @model_validator(mode="after")
    def ensure_any_content(self) -> "CurriculumUpdate":
        if self.csv_content is None and self.pdf_base64 is None:
            return self
        if (self.csv_content or "") == "" and (self.pdf_base64 or "") == "":
            raise ValueError(
                "Informe um conteúdo válido para o currículo.",
            )
        return self


class Curriculum(CurriculumBase):
    id: int
    csv_content: str | None = None
    pdf_base64: str | None = None
    pdf_url: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
