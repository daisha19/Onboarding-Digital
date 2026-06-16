from datetime import datetime

from pydantic import BaseModel


class DocumentoResponse(BaseModel):
    idDoc: int
    caminhoArquivo: str
    dataEnvio: datetime
    nomeArquivo: str
    cpf: str
    idUsuario: int
    nomeDoc: str
    nomeStatus: str

    class Config:
        from_attributes = True