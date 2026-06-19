from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime
)
from models.document import Documento
from sqlalchemy.sql import func
from database import Base


class Documento(Base):
    __tablename__ = "documentos"

    id = Column(Integer, primary_key=True)
    nomeArquivo = Column(String)
    caminhoArquivo = Column(String)

    nomeDoc = Column(String)
    caminhoArquivo = Column(Integer)

    nomeStatus = Column(String)
    
    idUsuario = Column(
        Integer,
        ForeignKey("usuarios.id")
    )

    dataEnvio = Column(
        DateTime,
        server_default=func.now()
    )