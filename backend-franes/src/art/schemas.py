# +--------------------------------------------------------------------+
# Garantem que os dados entrem e saiam da api no molde correto.
# +--------------------------------------------------------------------+

from pydantic import BaseModel, ConfigDict
from datetime import datetime

# Schema de campos normais
class ArtBase(BaseModel): 
    title: str
    description: str

# Schema para criação de artes, herda do base
class CreateArt(ArtBase):
    pass

# Representa o dado como ele vem do banco de dados
class StoryScript(ArtBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True # Permite converter automaticamente de ORM para Pydantic ler os dados
    )