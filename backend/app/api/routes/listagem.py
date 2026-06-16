from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models import Documento, User
from database import get_db
from auth import get_current_user  

app = FastAPI()

@app.get("/documentos")
def listar_documentos(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Token de autenticação inválido"
        )

    if user.role == "colaborador":
        documentos = db.query(Documento).filter(Documento.usuario_id == user.id).all()
    elif user.role == "RH":
        documentos = db.query(Documento).all()
    else:
        raise HTTPException(status_code=403, detail="Acesso não autorizado")

    return [
        {
            "id": doc.id,
            "nome": doc.nome,
            "tipo": doc.tipo,
            "status": doc.status,
            "data_envio": doc.data_envio,
            "usuario_id": doc.usuario_id
        }
        for doc in documentos
    ]