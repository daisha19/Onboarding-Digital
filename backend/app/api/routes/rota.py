from datetime import datetime
from pathlib import Path
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models import Documento, Usuario
from app.services.servico_auditoria import registrar_log

router = APIRouter(
    prefix="/rota",
    tags=["rota"],
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/upload")
async def upload_documento(
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):

    extensao = Path(arquivo.filename).suffix.lower()

    extensoes_permitidas = {
        ".pdf",
        ".png",
        ".jpg",
        ".jpeg",
    }

    if extensao not in extensoes_permitidas:
        raise HTTPException(
            status_code=400,
            detail="Tipo de arquivo não permitido.",
        )

    conteudo = await arquivo.read()

    if len(conteudo) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Arquivo maior que 10MB.",
        )

    nome_unico = f"{uuid.uuid4()}{extensao}"

    caminho = UPLOAD_DIR / nome_unico

    with open(caminho, "wb") as buffer:
        buffer.write(conteudo)

    if usuario.colaborador is None:
        raise HTTPException(
            status_code=403,
            detail="Apenas colaboradores podem enviar documentos.",
        )

    documento = Documento(
        caminhoArquivo=str(caminho),
        dataEnvio=datetime.now(),
        nomeArquivo=arquivo.filename,
        cpf=usuario.colaborador.cpf,
        idUsuario=usuario.idUsuario,
        nomeDoc="Exemplo",
        nomeStatus="EM_ANALISE",
    )

    db.add(documento)
    db.commit()
    db.refresh(documento)

    registrar_log(
        db=db,
        id_usuario=usuario.idUsuario,
        id_documento=documento.idDoc,
        nome_acao="UPLOAD_DOCUMENTO",
        descricao=f"Upload do documento {documento.nomeArquivo}",
    )

    return {
        "success": True,
        "id": documento.idDoc,
        "nome": documento.nomeArquivo,
    }