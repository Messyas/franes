# +--------------------------------------------------------------------+
# Esquemas garantem que os dados entrem e saiam da api de forma correta.
# +--------------------------------------------------------------------+

import datetime
from pydantic import BaseModel

# Schema base de campos normais
class BlogPostBase(BaseModel): 
    title: str
    reading_time: int
    content: str

# Schema para criação de posts, herda do base
class BBlogPostCreate(BlogPostBase):
    pass

# Schema para retorno de post(read), herda do base e adiciona id e created_at
# Representa o dado como ele vem do banco de dados
class BlogPost(BlogPostBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True # Permite converter automaticamente de ORM para Pydantic ler os dados
