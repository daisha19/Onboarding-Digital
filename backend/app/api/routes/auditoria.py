from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_rh
from app.db.session import get_db
from app.models import Usuario
from app.schemas.audit import AuditLogResponse
from app.services.audit_service import get_all_audit_logs

router = APIRouter(prefix="/auditoria", tags=["auditoria"])


@router.get("/", response_model=list[AuditLogResponse])
def list_audit_logs(
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_rh),
):
    return get_all_audit_logs(db)
