from sqlalchemy.orm import Session

from app.models import LogAuditoria


def get_all_audit_logs(db: Session) -> list[LogAuditoria]:
    return db.query(LogAuditoria).order_by(LogAuditoria.dataHora.desc()).all()
