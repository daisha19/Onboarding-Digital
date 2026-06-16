from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.document import DocumentoResponse
from app.services.document_service import get_all_documents

router = APIRouter(
    prefix="/documentos",
    tags=["documentos"],
)


@router.get("/", response_model=list[DocumentoResponse])
def list_documents(db: Session = Depends(get_db)):
    return get_all_documents(db)