from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Response,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.document import Documento, TipoDocumento
from app.models.user import Usuario
from app.schemas.document import (
    DocumentoResponse,
    DocumentoStatusUpdate,
    TipoDocumentoResponse,
)
from app.services.document_service import (
    create_document,
    delete_document,
    get_all_documents,
    get_document_by_id,
    get_documents_by_user,
    update_document_status,
)
from app.services.storage import (
    build_download_response,
    delete_stored_file,
    save_upload_file,
)


router = APIRouter(
    prefix="/documentos",
    tags=["documentos"],
)


@router.get("/tipos", response_model=list[TipoDocumentoResponse])
def list_document_types(
    db: Session = Depends(get_db),
    _current_user: Usuario = Depends(get_current_user),
):
    return db.query(TipoDocumento).all()


def _get_allowed_document(
    *,
    db: Session,
    id_doc: int,
    current_user: Usuario,
) -> Documento:
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


@router.get("/{id_doc}/download")
def download_document(
    id_doc: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    documento = _get_allowed_document(
        db=db,
        id_doc=id_doc,
        current_user=current_user,
    )
    return build_download_response(
        path=documento.caminhoArquivo,
        filename=documento.nomeArquivo,
    )


@router.get("/{id_doc}", response_model=DocumentoResponse)
def get_document(
    id_doc: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    return _get_allowed_document(
        db=db,
        id_doc=id_doc,
        current_user=current_user,
    )


@router.delete("/{id_doc}", status_code=status.HTTP_204_NO_CONTENT)
def remove_document(
    id_doc: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    documento = _get_allowed_document(
        db=db,
        id_doc=id_doc,
        current_user=current_user,
    )
    delete_stored_file(path=documento.caminhoArquivo)
    delete_document(db, documento)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/", response_model=DocumentoResponse)
async def upload_document(
    arquivo: UploadFile = File(...),
    nome_doc: str = Form(..., alias="nomeDoc"),
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

    if db.get(TipoDocumento, nome_doc) is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "INVALID_DOCUMENT_TYPE",
                "message": f"Tipo de documento '{nome_doc}' nao encontrado.",
            },
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
        id_usuario_rh=current_user.idUsuario,
    )
