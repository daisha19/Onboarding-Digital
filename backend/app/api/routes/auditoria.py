from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_rh
from app.db.session import get_db
from app.models import LogAuditoria, Usuario

router = APIRouter(
    prefix="/auditoria",
    tags=["auditoria"],
)


@router.get("/")
def listar_logs(
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_rh),
):
    logs = (
        db.query(LogAuditoria)
        .order_by(LogAuditoria.dataHora.desc())
        .all()
    )

    return [
        {
            "idAuditoria": log.idAuditoria,
            "descricao": log.descricao,
            "dataHora": log.dataHora,
            "idUsuario": log.idUsuario,
            "idDocumento": log.idDoc,
            "nomeAcao": log.nomeAcao,
        }
        for log in logs
    ]