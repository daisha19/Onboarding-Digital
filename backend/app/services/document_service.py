from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.audit import LogAuditoria
from app.models.document import Documento, StatusDocumento, TipoDocumento


def get_all_documents(db: Session) -> list[Documento]:
    return db.query(Documento).all()


def get_documents_by_user(db: Session, id_usuario: int) -> list[Documento]:
    return db.query(Documento).filter(Documento.idUsuario == id_usuario).all()


def get_document_by_id(db: Session, id_doc: int) -> Documento | None:
    return db.get(Documento, id_doc)


def create_document(
    db: Session,
    *,
    caminho_arquivo: str,
    nome_arquivo: str,
    cpf: str,
    id_usuario: int,
    nome_doc: str,
    nome_status: str = "pendente",
) -> Documento:
    tipo_documento = db.get(TipoDocumento, nome_doc)
    if tipo_documento is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "INVALID_DOCUMENT_TYPE",
                "message": f"Tipo de documento '{nome_doc}' nao encontrado.",
            },
        )

    status_documento = db.get(StatusDocumento, nome_status)
    if status_documento is None:
        status_documento = StatusDocumento(
            nomeStatus=nome_status,
            descricao="Documento pendente de analise",
        )
        db.add(status_documento)
        db.flush()

    documento = Documento(
        caminhoArquivo=caminho_arquivo,
        dataEnvio=datetime.now(timezone.utc),
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


def update_document_status(
    db: Session,
    *,
    id_doc: int,
    nome_status: str,
    id_usuario_rh: int,
) -> Documento:
    documento = db.get(Documento, id_doc)
    if documento is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento não encontrado.",
        )

    status_documento = db.get(StatusDocumento, nome_status)
    if status_documento is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Status de documento inválido: {nome_status}",
        )

    status_anterior = documento.nomeStatus
    documento.nomeStatus = nome_status

    log = LogAuditoria(
        descricao=f"Status do documento alterado de {status_anterior} para {nome_status}.",
        dataHora=datetime.utcnow(),
        idUsuario=id_usuario_rh,
        idDoc=documento.idDoc,
        nomeAcao="alterar_status_documento",
    )

    db.add(log)
    db.commit()
    db.refresh(documento)

    return documento


def delete_document(db: Session, documento: Documento) -> None:
    db.delete(documento)
    db.commit()
