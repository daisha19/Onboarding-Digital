from datetime import datetime
from sqlalchemy.orm import Session

from app.models.log_auditoria import LogAuditoria


def registrar_log(
    db: Session,
    usuario_id: int,
    acao: str,
    descricao: str,
    documento_id: int | None = None,
):
    log = LogAuditoria(
        idUsuario=usuario_id,
        acaoAuditoria=acao,
        descricao=descricao,
        idDoc=documento_id,
        dataHora=datetime.now()
    )

    db.add(log)
    db.commit()