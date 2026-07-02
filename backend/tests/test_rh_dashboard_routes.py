from datetime import date, datetime, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import create_access_token
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models import (
    AcaoAuditoria,
    Colaborador,
    Documento,
    LogAuditoria,
    RH,
    StatusDocumento,
    TipoDocumento,
    Usuario,
)


@pytest.fixture()
def test_client():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    testing_session_local = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    db = testing_session_local()

    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as client:
        yield client, db

    db.close()
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


def auth_headers(usuario: Usuario) -> dict[str, str]:
    return {"Authorization": f"Bearer {create_access_token(str(usuario.idUsuario))}"}


def create_rh(db, email: str = "rh@example.com", matricula: int = 1001) -> Usuario:
    usuario = Usuario(email=email, senha="hash")
    db.add(usuario)
    db.flush()
    db.add(RH(matricula=matricula, cargo="Analista de RH", idUsuario=usuario.idUsuario))
    db.commit()
    db.refresh(usuario)
    return usuario


def create_colaborador(
    db,
    email: str = "colaborador@example.com",
    cpf: str = "12345678901",
) -> Usuario:
    usuario = Usuario(email=email, senha="hash")
    db.add(usuario)
    db.flush()
    db.add(
        Colaborador(
            cpf=cpf,
            dataNascimento=date(1990, 1, 1),
            idUsuario=usuario.idUsuario,
        ),
    )
    db.commit()
    db.refresh(usuario)
    return usuario


def create_document_with_audit_data(db, usuario: Usuario) -> Documento:
    db.add(TipoDocumento(nomeDoc="rg", descricao="Documento de identidade", obrigatorio=True))
    db.add(StatusDocumento(nomeStatus="pendente", descricao="Pendente de analise"))
    db.add(AcaoAuditoria(nomeAcao="UPLOAD", descricao="Upload de documento"))
    db.flush()

    documento = Documento(
        caminhoArquivo="uploads/rg.pdf",
        dataEnvio=datetime(2026, 6, 1, 9, 0, 0),
        nomeArquivo="rg.pdf",
        cpf=usuario.colaborador.cpf,
        idUsuario=usuario.idUsuario,
        nomeDoc="rg",
        nomeStatus="pendente",
    )
    db.add(documento)
    db.commit()
    db.refresh(documento)
    return documento


def test_list_colaboradores_requires_authentication():
    client = TestClient(app)

    response = client.get("/usuarios/colaboradores")

    assert response.status_code == 401


def test_list_colaboradores_requires_rh(test_client):
    client, db = test_client
    colaborador = create_colaborador(db)

    response = client.get("/usuarios/colaboradores", headers=auth_headers(colaborador))

    assert response.status_code == 403


def test_list_colaboradores_returns_collaborators_not_rh(test_client):
    client, db = test_client
    rh = create_rh(db)
    colaborador_1 = create_colaborador(db, "ana@example.com", "11111111111")
    colaborador_2 = create_colaborador(db, "bruno@example.com", "22222222222")

    response = client.get("/usuarios/colaboradores", headers=auth_headers(rh))

    assert response.status_code == 200
    data = response.json()
    assert {item["idUsuario"] for item in data} == {
        colaborador_1.idUsuario,
        colaborador_2.idUsuario,
    }
    assert "rh@example.com" not in {item["email"] for item in data}


def test_auditoria_requires_authentication():
    client = TestClient(app)

    response = client.get("/auditoria/")

    assert response.status_code == 401


def test_auditoria_requires_rh(test_client):
    client, db = test_client
    colaborador = create_colaborador(db)

    response = client.get("/auditoria/", headers=auth_headers(colaborador))

    assert response.status_code == 403


def test_auditoria_returns_empty_list_when_no_logs(test_client):
    client, db = test_client
    rh = create_rh(db)

    response = client.get("/auditoria/", headers=auth_headers(rh))

    assert response.status_code == 200
    assert response.json() == []


def test_auditoria_returns_logs_ordered_by_data_hora(test_client):
    client, db = test_client
    rh = create_rh(db)
    colaborador = create_colaborador(db)
    documento = create_document_with_audit_data(db, colaborador)
    base_date = datetime(2026, 6, 1, 10, 0, 0)
    older_log = LogAuditoria(
        descricao="Documento enviado",
        dataHora=base_date,
        idUsuario=colaborador.idUsuario,
        idDoc=documento.idDoc,
        nomeAcao="UPLOAD",
    )
    newer_log = LogAuditoria(
        descricao="Documento reenviado",
        dataHora=base_date + timedelta(hours=2),
        idUsuario=colaborador.idUsuario,
        idDoc=documento.idDoc,
        nomeAcao="UPLOAD",
    )
    db.add_all([older_log, newer_log])
    db.commit()
    db.refresh(older_log)
    db.refresh(newer_log)

    response = client.get("/auditoria/", headers=auth_headers(rh))

    assert response.status_code == 200
    data = response.json()
    assert [item["idAuditoria"] for item in data] == [
        newer_log.idAuditoria,
        older_log.idAuditoria,
    ]
