from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime
)

from sqlalchemy.sql import func
from database import Base


class Documento(Base):
    __tablename__ = "documentos"

    id = Column(Integer, primary_key=True)
    nome_original = Column(String)
    nome_armazenado = Column(String)

    tipo = Column(String)
    tamanho = Column(Integer)

    status = Column(String)

    usuario_id = Column(
        Integer,
        ForeignKey("usuarios.id")
    )

    criado_em = Column(
        DateTime,
        server_default=func.now()
    )