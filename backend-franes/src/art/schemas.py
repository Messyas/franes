# +--------------------------------------------------------------------+
# Garantem que os dados entrem e saiam da api no molde correto.
# +--------------------------------------------------------------------+

from datetime import datetime

from pydantic import BaseModel, ConfigDict

from src.schemas import CloudinaryAsset

# Schema de campos normais
class ArtBase(BaseModel): 
    title: str
    description: str
    image: CloudinaryAsset | None = None

# Schema para criação de artes, herda do base
class CreateArt(ArtBase):
    pass

# Representa o dado como ele vem do banco de dados
class ArtScript(ArtBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True # Permite converter automaticamente de ORM para Pydantic ler os dados
    )
