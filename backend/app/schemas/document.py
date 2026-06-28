from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DocumentoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idDoc: int
    caminhoArquivo: str
    dataEnvio: datetime
    nomeArquivo: str
    cpf: str
    idUsuario: int
    nomeDoc: str
    nomeStatus: str


class DocumentoStatusUpdate(BaseModel):
    nomeStatus: str


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
