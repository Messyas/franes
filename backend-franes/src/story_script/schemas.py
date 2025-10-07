# +--------------------------------------------------------------------+
# Esquemas garantem que os dados entrem e saiam da api de forma correta.
# +--------------------------------------------------------------------+

from pydantic import BaseModel, ConfigDict
from datetime import datetime

# Schema base de campos normais
class StoryScriptBase(BaseModel): 
    title: str
    sub_title: str
    author_note: str
    content: str
    author_final_comment: str

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