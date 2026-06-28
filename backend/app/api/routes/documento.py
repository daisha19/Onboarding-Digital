import os
import shutil
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db, require_rh
from app.models.document import Documento, StatusDocumento
from app.models.user import Usuario
from app.schemas.document import DocumentoResponse, DocumentoStatusUpdate
from app.services.document_service import (
    create_document,
    get_all_documents,
    get_documents_by_user,
)

router = APIRouter(
    prefix="/documentos",
    tags=["documentos"],
)

_VALID_RH_STATUSES = {
    "aprovado": "Documento aprovado pelo RH",
    "rejeitado": "Documento rejeitado pelo RH",
    "em_analise": "Documento em análise pelo RH",
}


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


@router.get("/colaborador/{cpf}", response_model=list[DocumentoResponse])
def list_documents_by_cpf(
    cpf: str,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_rh),
):
    return db.query(Documento).filter(Documento.cpf == cpf).all()


@router.patch("/{id_doc}/status", response_model=DocumentoResponse)
def update_document_status(
    id_doc: int,
    payload: DocumentoStatusUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_rh),
):
    if payload.nomeStatus not in _VALID_RH_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Status inválido. Valores aceitos: {', '.join(_VALID_RH_STATUSES)}",
        )

    documento = db.get(Documento, id_doc)
    if documento is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Documento não encontrado.")

    status_obj = db.get(StatusDocumento, payload.nomeStatus)
    if status_obj is None:
        status_obj = StatusDocumento(
            nomeStatus=payload.nomeStatus,
            descricao=_VALID_RH_STATUSES[payload.nomeStatus],
        )
        db.add(status_obj)
        db.flush()

    documento.nomeStatus = payload.nomeStatus
    db.commit()
    db.refresh(documento)
    return documento


@router.get("/{id_doc}/download")
def download_document(
    id_doc: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    documento = db.get(Documento, id_doc)
    if documento is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Documento não encontrado.")

    # RH pode baixar qualquer documento; colaborador só pode baixar o próprio
    is_rh = current_user.rh is not None
    is_owner = documento.idUsuario == current_user.idUsuario
    if not is_rh and not is_owner:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado.")

    path = Path(documento.caminhoArquivo)
    if not path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Arquivo não encontrado no servidor.")

    return FileResponse(
        path=str(path),
        filename=documento.nomeArquivo,
        media_type="application/octet-stream",
    )