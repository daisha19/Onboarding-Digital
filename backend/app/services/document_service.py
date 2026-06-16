from sqlalchemy.orm import Session

from app.models.document import Documento


def get_all_documents(db: Session) -> list[Documento]:
    return db.query(Documento).all()