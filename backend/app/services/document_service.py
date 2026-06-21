from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.document import Documento, StatusDocumento, TipoDocumento


def get_all_documents(db: Session) -> list[Documento]:
    return db.query(Documento).all()


def get_documents_by_user(db: Session, id_usuario: int) -> list[Documento]:
    return db.query(Documento).filter(Documento.idUsuario == id_usuario).all()


def create_document(
    db: Session,
    *,
    caminho_arquivo: str,
    nome_arquivo: str,
    cpf: str,
    id_usuario: int,
    nome_doc: str,
    nome_status: str = "PENDENTE",
) -> Documento:
    tipo_documento = db.get(TipoDocumento, nome_doc)
    if tipo_documento is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo de documento inválido: {nome_doc}",
        )

    status_documento = db.get(StatusDocumento, nome_status)
    if status_documento is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Status de documento inválido: {nome_status}",
        )

    documento = Documento(
        caminhoArquivo=caminho_arquivo,
        dataEnvio=datetime.utcnow(),
        nomeArquivo=nome_arquivo,
        cpf=cpf,
        idUsuario=id_usuario,
        nomeDoc=nome_doc,
        nomeStatus=nome_status,
    )

    db.add(documento)
    db.commit()
    db.refresh(documento)

    return documento