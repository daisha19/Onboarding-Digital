from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import Usuario
from app.schemas.document import DocumentoResponse
from app.services.document_service import (
    create_document,
    get_all_documents,
    get_document_by_id,
    get_documents_by_user,
)
from app.services.storage import save_upload_file

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
        detail="Perfil de usuario invalido.",
    )


@router.get("/{id_doc}", response_model=DocumentoResponse)
def get_document(
    id_doc: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    documento = get_document_by_id(db, id_doc)
    if documento is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento nao encontrado.",
        )

    if current_user.rh is not None:
        return documento

    if (
        current_user.colaborador is not None
        and documento.idUsuario == current_user.idUsuario
    ):
        return documento

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Voce nao tem permissao para acessar este documento.",
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
            detail="Arquivo invalido.",
        )

    if current_user.colaborador is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas colaboradores podem enviar documentos.",
        )

    contents = await arquivo.read()
    stored_file = save_upload_file(
        arquivo=arquivo,
        contents=contents,
        cpf=current_user.colaborador.cpf,
    )

    documento = create_document(
        db=db,
        caminho_arquivo=stored_file.path,
        nome_arquivo=stored_file.original_filename,
        cpf=current_user.colaborador.cpf,
        id_usuario=current_user.idUsuario,
        nome_doc=nome_doc,
        nome_status="pendente",
    )

    return documento
