from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    HTTPException,
    status
)

from sqlalchemy.orm import Session
from pathlib import Path
from uuid import uuid4
import shutil

from database import get_db
from auth import get_current_user
from models import Documento, Usuario

router = APIRouter(prefix="/documentos", tags=["Documentos"])

ALLOWED_EXTENSIONS = {
    ".pdf",
    ".png",
    ".jpg",
    ".jpeg"
}


MAX_FILE_SIZE = 10 * 1024 * 1024


UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/upload")
async def upload_documento(
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):

    try:


        extensao = Path(arquivo.filename).suffix.lower()

        if extensao not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail="Tipo de arquivo não permitido"
            )


        conteudo = await arquivo.read()

        if len(conteudo) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail="Arquivo excede o tamanho máximo permitido"
            )


        nome_unico = f"{uuid4()}{extensao}"

        caminho_arquivo = UPLOAD_DIR / nome_unico


        with open(caminho_arquivo, "wb") as buffer:
            buffer.write(conteudo)


        documento = Documento(
            nome_original=arquivo.filename,
            nome_armazenado=nome_unico,
            tipo=extensao.replace(".", ""),
            tamanho=len(conteudo),
            status="PENDENTE",
            usuario_id=usuario.id
        )

        db.add(documento)
        db.commit()
        db.refresh(documento)


        return {
            "success": True,
            "message": "Documento enviado com sucesso",
            "data": {
                "id": documento.id,
                "nome": documento.nome_original,
                "status": documento.status
            }
        }

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao processar upload"
        )