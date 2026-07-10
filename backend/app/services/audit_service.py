from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models import LogAuditoria


UPLOAD_DOCUMENT = "upload_documento"
APPROVE_DOCUMENT = "aprovar_documento"
REJECT_DOCUMENT = "rejeitar_documento"
REVIEW_DOCUMENT = "marcar_documento_em_analise"
CREATE_COLLABORATOR = "cadastrar_colaborador"

LOGIN_SUCCESS = "login_sucesso"
LOGIN_FAILURE = "login_falha"
LOGOUT = "logout"
DOWNLOAD_DOCUMENT = "download_documento"
DELETE_DOCUMENT = "excluir_documento"
ACCESS_DENIED = "acesso_negado"

DOCUMENT_STATUS_ACTIONS = {
    "aprovado": APPROVE_DOCUMENT,
    "rejeitado": REJECT_DOCUMENT,
    "em_analise": REVIEW_DOCUMENT,
}


def register_audit_log(
    db: Session,
    *,
    action: str,
    description: str,
    user_id: int | None,
    document_id: int | None = None,
) -> LogAuditoria:
    log = LogAuditoria(
        descricao=description,
        dataHora=datetime.now(timezone.utc),
        idUsuario=user_id,
        idDoc=document_id,
        nomeAcao=action,
    )
    db.add(log)
    return log


def get_all_audit_logs(db: Session) -> list[LogAuditoria]:
    return db.query(LogAuditoria).order_by(LogAuditoria.dataHora.desc()).all()
