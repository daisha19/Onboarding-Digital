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
from app.models import Colaborador, RH, Usuario


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


def create_rh(db) -> Usuario:
    usuario = Usuario(nome="Profissional de RH", email="rh@example.com", senha="hash")
    db.add(usuario)
    db.flush()
    db.add(RH(matricula=1001, cargo="Analista de RH", idUsuario=usuario.idUsuario))
    db.commit()
    db.refresh(usuario)
    return usuario


def create_colaborador(db) -> Usuario:
    usuario = Usuario(nome="Colaborador Exemplo", email="colab@example.com", senha="hash")
    db.add(usuario)
    db.flush()
    db.add(
        Colaborador(
            cpf="12345678901",
            dataNascimento=date(1995, 3, 20),
            idUsuario=usuario.idUsuario,
        ),
    )
    db.commit()
    db.refresh(usuario)
    return usuario


def test_get_my_profile_requires_authentication():
    client = TestClient(app)

    response = client.get("/usuarios/me/perfil")

    assert response.status_code == 401


def test_get_my_profile_returns_colaborador_data(test_client):
    client, db = test_client
    colaborador = create_colaborador(db)

    response = client.get("/usuarios/me/perfil", headers=auth_headers(colaborador))

    assert response.status_code == 200
    body = response.json()
    assert body["nome"] == "Colaborador Exemplo"
    assert body["email"] == "colab@example.com"
    assert body["cpf"] == "12345678901"
    assert body["dataNascimento"] == "1995-03-20"


def test_get_my_profile_rejects_rh_user(test_client):
    client, db = test_client
    rh = create_rh(db)

    response = client.get("/usuarios/me/perfil", headers=auth_headers(rh))

    assert response.status_code == 403
