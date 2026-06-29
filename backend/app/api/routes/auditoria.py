from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models import Documento, Usuario
from app.db.session import get_db
from app.api.deps import get_current_user, require_rh

router = APIRouter(prefix="/listagem", tags=["listagem"])

@router.get("/")
def listar_documentos(
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
):
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Token de autenticação inválido"
        )

    if user.role == "colaborador":
        documentos = db.query(Documento).filter(Documento.idUsuario == user.id).all()
    elif user.role == "RH":
        documentos = db.query(Documento).all()
    else:
        raise HTTPException(status_code=403, detail="Acesso não autorizado")

    if user.role != "RH":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso não autorizado"
        )
    
    return [
        {
            "id": doc.idDoc,
            "nome": doc.nomeArquivo,
            "tipo": doc.nomeDoc,
            "status": doc.nomeStatus,
            "data_envio": doc.dataEnvio,
            "usuario_id": doc.idUsuario
        }
        for doc in documentos
    ]