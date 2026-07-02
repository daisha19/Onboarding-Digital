from datetime import datetime

from sqlalchemy.orm import Session

from app.models.audit import LogAuditoria


def registrar_log(
    db: Session,
    id_usuario: int,
    id_documento: int,
    nome_acao: str,
    descricao: str,
) -> LogAuditoria:

    log = LogAuditoria(
        dataHora=datetime.now(),
        descricao=descricao,
        idUsuario=id_usuario,
        idDoc=id_documento,
        nomeAcao=nome_acao,
    )

    db.add(log)
    db.commit()
    db.refresh(log)

    return log