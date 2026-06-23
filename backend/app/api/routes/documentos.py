from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models import Documento, StatusDocumento, TipoDocumento, Usuario
from app.schemas.document import DocumentoUploadResponse, TipoDocumentoResponse
from app.services.storage import save_upload_file

router = APIRouter(prefix="/documentos", tags=["documentos"])


@router.get("/tipos", response_model=list[TipoDocumentoResponse])
def listar_tipos(
    db: Session = Depends(get_db),
    _current_user: Usuario = Depends(get_current_user),
):
    """Retorna a lista de tipos de documento disponiveis para upload."""
    tipos = db.query(TipoDocumento).all()
    return [
        TipoDocumentoResponse(
            nomeDoc=t.nomeDoc,
            descricao=t.descricao,
            obrigatorio=t.obrigatorio,
        )
        for t in tipos
    ]


@router.post(
    "/upload",
    response_model=DocumentoUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
def upload_documento(
    nomeDoc: str = Form(...),
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Recebe um arquivo e um tipo de documento, salva e registra no banco."""

    tipo = db.get(TipoDocumento, nomeDoc)
    if tipo is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "INVALID_DOCUMENT_TYPE",
                "message": f"Tipo de documento '{nomeDoc}' nao encontrado.",
            },
        )

    max_size = settings.UPLOAD_MAX_SIZE_MB * 1024 * 1024
    contents = arquivo.file.read()
    arquivo.file.seek(0)

    if len(contents) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "FILE_TOO_LARGE",
                "message": f"O arquivo excede o limite de {settings.UPLOAD_MAX_SIZE_MB} MB.",
            },
        )

    colaborador = current_user.colaborador
    if colaborador is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "USER_NOT_COLLABORATOR",
                "message": "Usuario nao e um colaborador.",
            },
        )

    stored_file = save_upload_file(
        arquivo=arquivo,
        contents=contents,
        cpf=colaborador.cpf,
    )

    status_pendente = db.get(StatusDocumento, "pendente")
    if status_pendente is None:
        status_pendente = StatusDocumento(
            nomeStatus="pendente",
            descricao="Documento pendente de analise",
        )
        db.add(status_pendente)
        db.flush()

    documento = Documento(
        caminhoArquivo=stored_file.path,
        dataEnvio=datetime.now(timezone.utc),
        nomeArquivo=stored_file.original_filename,
        cpf=colaborador.cpf,
        idUsuario=current_user.idUsuario,
        nomeDoc=nomeDoc,
        nomeStatus="pendente",
    )
    db.add(documento)
    db.commit()
    db.refresh(documento)

    return DocumentoUploadResponse(
        idDoc=documento.idDoc,
        nomeArquivo=documento.nomeArquivo,
        nomeDoc=documento.nomeDoc,
        dataEnvio=documento.dataEnvio,
        nomeStatus=documento.nomeStatus,
        mensagem="Documento enviado com sucesso!",
    )
