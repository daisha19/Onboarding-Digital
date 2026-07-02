from datetime import date

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import create_access_token
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models import RH, SolicitacaoCadastroColaborador, Usuario
from app.services.email_service import EmailDeliveryError


client = TestClient(app)


@pytest.fixture()
def registration_client():
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
    with TestClient(app) as test_client:
        yield test_client, db

    db.close()
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


def create_rh(db) -> Usuario:
    user = Usuario(nome="Ana RH", email="rh@example.com", senha="hash")
    db.add(user)
    db.flush()
    db.add(RH(matricula=1001, cargo="Analista de RH", idUsuario=user.idUsuario))
    db.commit()
    db.refresh(user)
    return user


def auth_headers(user: Usuario) -> dict[str, str]:
    return {"Authorization": f"Bearer {create_access_token(str(user.idUsuario))}"}


def registration_payload() -> dict[str, str]:
    return {
        "nome": "Maria Silva",
        "email": "maria@example.com",
        "cpf": "12345678901",
        "dataNascimento": date(1995, 4, 10).isoformat(),
    }


def test_registration_request_routes_registered_in_openapi():
    paths = client.get("/openapi.json").json()["paths"]

    assert "/auth/register-request" in paths
    assert "post" in paths["/auth/register-request"]

    assert "/usuarios/solicitacoes-cadastro" in paths
    assert "get" in paths["/usuarios/solicitacoes-cadastro"]

    assert "/usuarios/solicitacoes-cadastro/{request_id}/aprovar" in paths
    assert "post" in paths["/usuarios/solicitacoes-cadastro/{request_id}/aprovar"]

    assert "/usuarios/solicitacoes-cadastro/{request_id}/recusar" in paths
    assert "post" in paths["/usuarios/solicitacoes-cadastro/{request_id}/recusar"]

    assert "/usuarios/solicitacoes-cadastro/{request_id}/promover-rh" in paths
    assert "post" in paths["/usuarios/solicitacoes-cadastro/{request_id}/promover-rh"]


def test_registration_review_routes_require_authentication():
    assert client.get("/usuarios/solicitacoes-cadastro").status_code == 401
    assert client.post("/usuarios/solicitacoes-cadastro/1/aprovar").status_code == 401
    assert client.post("/usuarios/solicitacoes-cadastro/1/recusar").status_code == 401
    assert client.post("/usuarios/solicitacoes-cadastro/1/promover-rh").status_code == 401


def test_public_registration_and_rh_approval_send_credentials(
    registration_client,
    monkeypatch,
):
    test_client, db = registration_client
    rh = create_rh(db)
    sent_messages: list[tuple[str, str, str]] = []
    monkeypatch.setattr(
        "app.services.user_service.send_email",
        lambda to_email, subject, body: sent_messages.append((to_email, subject, body)),
    )

    created = test_client.post("/auth/register-request", json=registration_payload())
    request_id = created.json()["idSolicitacao"]
    approved = test_client.post(
        f"/usuarios/solicitacoes-cadastro/{request_id}/aprovar",
        headers=auth_headers(rh),
    )

    assert created.status_code == 201
    assert approved.status_code == 200
    assert approved.json()["status"] == "aprovado"
    assert db.query(Usuario).filter(Usuario.email == "maria@example.com").one().nome == "Maria Silva"
    assert sent_messages[0][0] == "maria@example.com"
    assert "Senha inicial:" in sent_messages[0][2]


def test_approval_rolls_back_when_email_delivery_fails(registration_client, monkeypatch):
    test_client, db = registration_client
    rh = create_rh(db)
    created = test_client.post("/auth/register-request", json=registration_payload())
    request_id = created.json()["idSolicitacao"]

    def fail_email(*_args, **_kwargs):
        raise EmailDeliveryError("SMTP indisponivel")

    monkeypatch.setattr("app.services.user_service.send_email", fail_email)
    response = test_client.post(
        f"/usuarios/solicitacoes-cadastro/{request_id}/aprovar",
        headers=auth_headers(rh),
    )

    db.expire_all()
    request = db.get(SolicitacaoCadastroColaborador, request_id)
    assert response.status_code == 503
    assert request.status == "pendente"
    assert db.query(Usuario).filter(Usuario.email == "maria@example.com").first() is None


def test_rh_can_reject_registration_request(registration_client, monkeypatch):
    test_client, db = registration_client
    rh = create_rh(db)
    monkeypatch.setattr("app.services.user_service.send_email", lambda **_kwargs: None)
    created = test_client.post("/auth/register-request", json=registration_payload())
    request_id = created.json()["idSolicitacao"]

    response = test_client.post(
        f"/usuarios/solicitacoes-cadastro/{request_id}/recusar",
        headers=auth_headers(rh),
        json={"motivoRecusa": "Dados incompletos"},
    )

    assert response.status_code == 200
    assert response.json()["status"] == "recusado"
    assert response.json()["motivoRecusa"] == "Dados incompletos"
