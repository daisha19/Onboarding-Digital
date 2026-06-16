from datetime import datetime

from pydantic import BaseModel


class TipoDocumentoResponse(BaseModel):
    nomeDoc: str
    descricao: str
    obrigatorio: bool


class DocumentoUploadResponse(BaseModel):
    idDoc: int
    nomeArquivo: str
    nomeDoc: str
    dataEnvio: datetime
    nomeStatus: str
    mensagem: str