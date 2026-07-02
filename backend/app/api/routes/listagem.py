from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_user_role
from app.db.session import get_db
from app.models import Documento, Usuario

router = APIRouter(
    prefix="/listagem",
    tags=["listagem"],
)


@router.get("/")
def listar_documentos(
    db: Session = Depends(get_db),
    user: Usuario = Depends(get_current_user),
):
    perfil = get_user_role(user)

    if perfil == "colaborador":

        documentos = (
            db.query(Documento)
            .filter(Documento.idUsuario == user.idUsuario)
            .all()
        )

    elif perfil == "rh":

        documentos = db.query(Documento).all()

    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso não autorizado.",
        )

    return [
        {
            "id": doc.idDoc,
            "nome": doc.nomeArquivo,
            "tipo": doc.nomeDoc,
            "status": doc.nomeStatus,
            "data_envio": doc.dataEnvio,
            "usuario_id": doc.idUsuario,
        }
        for doc in documentos
    ]