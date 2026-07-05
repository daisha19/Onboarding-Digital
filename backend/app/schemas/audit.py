from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idAuditoria: int
    descricao: str
    dataHora: datetime
    idUsuario: int
    idDoc: int | None
    nomeAcao: str
