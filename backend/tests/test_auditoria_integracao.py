from datetime import date, datetime
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
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
from app.services.audit_service import (
    ACCESS_DENIED,
    APPROVE_DOCUMENT,
    CREATE_COLLABORATOR,
    DELETE_DOCUMENT,
    DOWNLOAD_DOCUMENT,
    LOGIN_FAILURE,
    LOGIN_SUCCESS,
    LOGOUT,
    REJECT_DOCUMENT,
    REVIEW_DOCUMENT,
    UPLOAD_DOCUMENT,
)
from app.services.document_service import create_document


@pytest.fixture()
def test_client():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    @event.listens_for(engine, "connect")
    def enable_foreign_keys(dbapi_connection, _connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
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


def auth_headers(user: Usuario) -> dict[str, str]:
    return {"Authorization": f"Bearer {create_access_token(str(user.idUsuario))}"}


def seed_audit_actions(db) -> None:
    descriptions = {
        UPLOAD_DOCUMENT: "Upload de documento",
        APPROVE_DOCUMENT: "Aprovação de documento",
        REJECT_DOCUMENT: "Rejeição de documento",
        REVIEW_DOCUMENT: "Documento colocado em análise",
        CREATE_COLLABORATOR: "Cadastro de colaborador",
        LOGIN_SUCCESS: "Login bem-sucedido",
        LOGIN_FAILURE: "Falha de login",
        LOGOUT: "Logout",
        DOWNLOAD_DOCUMENT: "Download de documento",
        DELETE_DOCUMENT: "Exclusão de documento",
        ACCESS_DENIED: "Acesso negado",
    }
    db.add_all(
        [
            AcaoAuditoria(nomeAcao=name, descricao=description)
            for name, description in descriptions.items()
        ]
    )

def create_rh(db) -> Usuario:
    user = Usuario(nome="RH", email="rh@example.com", senha="hash")
    db.add(user)
    db.flush()
    db.add(RH(matricula=101, cargo="Analista", idUsuario=user.idUsuario))
    db.commit()
    db.refresh(user)
    return user


def create_collaborator(db) -> Usuario:
    user = Usuario(nome="Colaborador", email="colab@example.com", senha="hash")
    db.add(user)
    db.flush()
    db.add(
        Colaborador(
            cpf="12345678901",
            dataNascimento=date(1995, 1, 1),
            idUsuario=user.idUsuario,
        )
    )
    db.commit()
    db.refresh(user)
    return user


def seed_document_data(db, collaborator: Usuario) -> Documento:
    db.add(TipoDocumento(nomeDoc="RG_CNH", descricao="Identidade", obrigatorio=True))
    db.add_all(
        [
            StatusDocumento(nomeStatus="pendente", descricao="Pendente"),
            StatusDocumento(nomeStatus="em_analise", descricao="Em análise"),
            StatusDocumento(nomeStatus="aprovado", descricao="Aprovado"),
            StatusDocumento(nomeStatus="rejeitado", descricao="Rejeitado"),
        ]
    )
    documento = Documento(
        caminhoArquivo="uploads/documento.pdf",
        dataEnvio=datetime(2026, 7, 5, 12, 0, 0),
        nomeArquivo="documento.pdf",
        cpf=collaborator.colaborador.cpf,
        idUsuario=collaborator.idUsuario,
        nomeDoc="RG_CNH",
        nomeStatus="pendente",
    )
    db.add(documento)
    db.commit()
    db.refresh(documento)
    return documento


def test_upload_creates_audit_log(test_client, monkeypatch):
    client, db = test_client
    collaborator = create_collaborator(db)
    seed_audit_actions(db)
    db.add(TipoDocumento(nomeDoc="RG_CNH", descricao="Identidade", obrigatorio=True))
    db.add(StatusDocumento(nomeStatus="pendente", descricao="Pendente"))
    db.commit()

    import app.api.routes.documento as documento_route

    monkeypatch.setattr(
        documento_route,
        "save_upload_file",
        lambda **_kwargs: SimpleNamespace(path="uploads/rg.pdf", original_filename="rg.pdf"),
    )

    response = client.post(
        "/documentos/",
        headers=auth_headers(collaborator),
        data={"nomeDoc": "RG_CNH"},
        files={"arquivo": ("rg.pdf", b"pdf", "application/pdf")},
    )

    assert response.status_code == 200
    log = db.query(LogAuditoria).one()
    assert log.nomeAcao == UPLOAD_DOCUMENT
    assert log.idUsuario == collaborator.idUsuario
    assert log.idDoc == response.json()["idDoc"]

    monkeypatch.setattr(documento_route, "delete_stored_file", lambda **_kwargs: None)
    deleted = client.delete(
        f"/documentos/{response.json()['idDoc']}",
        headers=auth_headers(collaborator),
    )
    db.refresh(log)
    assert deleted.status_code == 204
    assert log.idDoc is None


@pytest.mark.parametrize(
    ("new_status", "expected_action"),
    [
        ("em_analise", REVIEW_DOCUMENT),
        ("aprovado", APPROVE_DOCUMENT),
        ("rejeitado", REJECT_DOCUMENT),
    ],
)
def test_status_changes_create_specific_audit_logs(
    test_client,
    new_status,
    expected_action,
):
    client, db = test_client
    rh = create_rh(db)
    collaborator = create_collaborator(db)
    seed_audit_actions(db)
    document = seed_document_data(db, collaborator)

    response = client.patch(
        f"/documentos/{document.idDoc}/status",
        headers=auth_headers(rh),
        json={"nomeStatus": new_status},
    )

    assert response.status_code == 200
    log = db.query(LogAuditoria).one()
    assert log.nomeAcao == expected_action
    assert log.idUsuario == rh.idUsuario
    assert log.idDoc == document.idDoc


def test_rh_created_collaborator_is_audited_without_document(test_client):
    client, db = test_client
    rh = create_rh(db)
    seed_audit_actions(db)
    db.commit()

    response = client.post(
        "/usuarios/colaboradores",
        headers=auth_headers(rh),
        json={
            "nome": "Nova Pessoa",
            "email": "nova@example.com",
            "senha": "senha-segura",
            "cpf": "98765432100",
            "dataNascimento": "1994-05-10",
        },
    )

    assert response.status_code == 201
    log = db.query(LogAuditoria).one()
    assert log.nomeAcao == CREATE_COLLABORATOR
    assert log.idUsuario == rh.idUsuario
    assert log.idDoc is None

    audit_response = client.get("/auditoria/", headers=auth_headers(rh))
    assert audit_response.status_code == 200
    assert audit_response.json()[0]["idDoc"] is None


def test_approved_registration_is_audited(test_client, monkeypatch):
    client, db = test_client
    rh = create_rh(db)
    seed_audit_actions(db)
    db.commit()
    monkeypatch.setattr("app.services.user_service.send_email", lambda **_kwargs: None)

    created = client.post(
        "/auth/register-request",
        json={
            "nome": "Pessoa Solicitante",
            "email": "solicitante@example.com",
            "cpf": "74185296300",
            "dataNascimento": "1992-08-14",
        },
    )
    approved = client.post(
        f"/usuarios/solicitacoes-cadastro/{created.json()['idSolicitacao']}/aprovar",
        headers=auth_headers(rh),
    )

    assert created.status_code == 201
    assert approved.status_code == 200
    log = db.query(LogAuditoria).one()
    assert log.nomeAcao == CREATE_COLLABORATOR
    assert log.idUsuario == rh.idUsuario
    assert log.idDoc is None


def test_audit_failure_rolls_back_document_creation(test_client, monkeypatch):
    _client, db = test_client
    collaborator = create_collaborator(db)
    db.add(TipoDocumento(nomeDoc="RG_CNH", descricao="Identidade", obrigatorio=True))
    db.add(StatusDocumento(nomeStatus="pendente", descricao="Pendente"))
    db.commit()

    import app.services.document_service as document_service

    monkeypatch.setattr(
        document_service,
        "register_audit_log",
        lambda *_args, **_kwargs: (_ for _ in ()).throw(RuntimeError("audit unavailable")),
    )

    with pytest.raises(RuntimeError, match="audit unavailable"):
        create_document(
            db,
            caminho_arquivo="uploads/rg.pdf",
            nome_arquivo="rg.pdf",
            cpf=collaborator.colaborador.cpf,
            id_usuario=collaborator.idUsuario,
            nome_doc="RG_CNH",
        )

    assert db.query(Documento).count() == 0

    
def test_audit_logs_are_available_only_for_rh(test_client):
    client, db = test_client
    collaborator = create_collaborator(db)
    seed_audit_actions(db)
    db.commit()

    response = client.get(
        "/auditoria/",
        headers=auth_headers(collaborator),
    )

    assert response.status_code == 403