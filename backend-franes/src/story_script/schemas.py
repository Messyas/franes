# +--------------------------------------------------------------------+
# Esquemas garantem que os dados entrem e saiam da api de forma correta.
# +--------------------------------------------------------------------+

from datetime import datetime

from pydantic import BaseModel, ConfigDict

from src.schemas import CloudinaryAsset


# Schema base de campos normais
class StoryScriptBase(BaseModel):
    title: str
    sub_title: str
    author_note: str
    content: str
    author_final_comment: str
    cover_image: CloudinaryAsset | None = None

# Schema para criação de Roteiro de historias, herda do base
class StoryScriptCreate(StoryScriptBase):
    pass

# Representa o dado como ele vem do banco de dados
class StoryScript(StoryScriptBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True # Permite converter automaticamente de ORM para Pydantic ler os dados
    )
