import os
import shutil

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import Usuario
from app.schemas.document import DocumentoResponse, DocumentoStatusUpdate
from app.services.document_service import (
    create_document,
    get_all_documents,
    get_documents_by_user,
    update_document_status,
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
    if current_user.rh is not None:
        return get_all_documents(db)

    if current_user.colaborador is not None:
        return get_documents_by_user(db, current_user.idUsuario)

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Perfil de usuário inválido.",
    )


@router.post("/", response_model=DocumentoResponse)
async def upload_document(
    arquivo: UploadFile = File(...),
    nome_doc: str = Form(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if not arquivo.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Arquivo inválido.",
        )

    if current_user.colaborador is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas colaboradores podem enviar documentos.",
        )

    os.makedirs("uploads", exist_ok=True)

    caminho_arquivo = f"uploads/{arquivo.filename}"

    with open(caminho_arquivo, "wb") as buffer:
        shutil.copyfileobj(arquivo.file, buffer)

    documento = create_document(
        db=db,
        caminho_arquivo=caminho_arquivo,
        nome_arquivo=arquivo.filename,
        cpf=current_user.colaborador.cpf,
        id_usuario=current_user.idUsuario,
        nome_doc=nome_doc,
        nome_status="PENDENTE",
    )

    return documento


@router.patch("/{id_doc}/status", response_model=DocumentoResponse)
def update_status_document(
    id_doc: int,
    status_update: DocumentoStatusUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if current_user.rh is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas usuários RH podem alterar o status de documentos.",
        )

    return update_document_status(
        db=db,
        id_doc=id_doc,
        nome_status=status_update.nomeStatus,
    )