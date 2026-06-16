from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import Usuario
from app.schemas.document import DocumentoResponse
from app.services.document_service import (
    get_all_documents,
    create_document,
)

router = APIRouter(
    prefix="/documentos",
    tags=["documentos"],
)


@router.get("/", response_model=list[DocumentoResponse])
def list_documents(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    return get_all_documents(db)


@router.post("/")
async def upload_document(
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if not arquivo.filename:
        raise HTTPException(
            status_code=400,
            detail="Arquivo inválido",
        )

    if current_user.colaborador is None:
        raise HTTPException(
            status_code=403,
            detail="Apenas colaboradores podem enviar documentos.",
        )

    documento = create_document(
        db=db,
        caminho_arquivo=f"uploads/{arquivo.filename}",
        nome_arquivo=arquivo.filename,
        cpf=current_user.colaborador.cpf,
        id_usuario=current_user.idUsuario,
        nome_doc="DOCUMENTO",
    )

    return documento