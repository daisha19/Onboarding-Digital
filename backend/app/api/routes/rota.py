from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from models.document import Documento  # Importa o modelo existente
from database import get_db
from auth import get_current_user
from datetime import datetime
from pathlib import Path
import shutil
import uuid

router = APIRouter(prefix="/rota", tags=["rota"])

UPLOAD_DIR = Path("routes")


@router.post("/upload")
async def upload_documento(
    arquivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    usuario: dict = Depends(get_current_user),
):
    
    extensao = Path(arquivo.filename).suffix.lower()
    extensoes_permitidas = {".pdf", ".png", ".jpg", ".jpeg"}
    tamanho_maximo = 10 * 1024 * 1024  # 10 MB

    if extensao not in extensoes_permitidas:
        raise HTTPException(
            status_code=400, detail="Tipo de arquivo não permitido"
        )
    
    conteudo = await arquivo.read()
    if len(conteudo) > tamanho_maximo:
        raise HTTPException(
            status_code=400, detail="Arquivo excede o tamanho máximo permitido"
        )
    
    nome_unico = f"{uuid.uuid4()}{extensao}"
    caminho_arquivo = UPLOAD_DIR / nome_unico

   
    with open(caminho_arquivo, "wb") as buffer:
        buffer.write(conteudo)

    
    documento = Documento(
        caminhoArquivo=str(caminho_arquivo),
        nomeArquivo=arquivo.filename,
        dataEnvio=datetime.now(),
        idUsuario=usuario['id'],
        nomeDoc="Exemplo", 
        cpf=usuario['cpf']  
    )

    db.add(documento)
    db.commit()
    db.refresh(documento)

    return {"success": True, "id": documento.id, "nome": documento.nomeArquivo}