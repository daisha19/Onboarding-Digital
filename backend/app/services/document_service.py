from datetime import datetime

from sqlalchemy.orm import Session

from app.models.document import Documento


def get_all_documents(db: Session) -> list[Documento]:
    return db.query(Documento).all()


def create_document(
    db: Session,
    *,
    caminho_arquivo: str,
    nome_arquivo: str,
    cpf: str,
    id_usuario: int,
    nome_doc: str,
    nome_status: str = "ENVIADO",
) -> Documento:
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