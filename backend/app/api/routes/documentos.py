from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.errors import invalid_token_error
from app.db.session import get_db
from app.models import Documento, StatusDocumento, TipoDocumento, Usuario
from app.schemas.document import DocumentoUploadResponse, TipoDocumentoResponse

router = APIRouter(prefix="/documentos", tags=["documentos"])


@router.get("/tipos", response_model=list[TipoDocumentoResponse])
def listar_tipos(
    db: Session = Depends(get_db),
    _current_user: Usuario = Depends(get_current_user),
):
    """Retorna a lista de tipos de documento disponíveis para upload."""
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
    """Recebe um arquivo e um tipo de documento, salva em disco e registra no banco."""

    # 1. Validar se o tipo de documento existe
    tipo = db.get(TipoDocumento, nomeDoc)
    if tipo is None:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "INVALID_DOCUMENT_TYPE",
                "message": f"Tipo de documento '{nomeDoc}' não encontrado.",
            },
        )

    # 2. Validar tamanho do arquivo
    MAX_SIZE = settings.UPLOAD_MAX_SIZE_MB * 1024 * 1024

    contents = arquivo.file.read()
    arquivo.file.seek(0)

    if len(contents) > MAX_SIZE:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "FILE_TOO_LARGE",
                "message": f"O arquivo excede o limite de {settings.UPLOAD_MAX_SIZE_MB} MB.",
            },
        )

    # 3. Obter CPF do colaborador logado
    colaborador = current_user.colaborador
    if colaborador is None:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "USER_NOT_COLLABORATOR",
                "message": "Usuário não é um colaborador.",
            },
        )

    cpf = colaborador.cpf

    # 4. Salvar arquivo em disco
    import os
    from pathlib import Path

    # Diretório: backend/uploads/{cpf}/
    upload_dir = Path(__file__).resolve().parents[3] / "uploads" / cpf
    upload_dir.mkdir(parents=True, exist_ok=True)

    # Nome único para evitar sobrescrita
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    safe_filename = f"{timestamp}_{arquivo.filename}"
    file_path = upload_dir / safe_filename

    with open(file_path, "wb") as f:
        f.write(contents)

    # 5. Buscar status inicial "pendente"
    status_pendente = db.get(StatusDocumento, "pendente")
    if status_pendente is None:
        # Caso não exista, cria o status automaticamente
        status_pendente = StatusDocumento(
            nomeStatus="pendente",
            descricao="Documento pendente de análise",
        )
        db.add(status_pendente)
        db.flush()

    # 6. Registrar no banco de dados
    documento = Documento(
        caminhoArquivo=str(file_path),
        dataEnvio=datetime.now(timezone.utc),
        nomeArquivo=arquivo.filename or safe_filename,
        cpf=cpf,
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