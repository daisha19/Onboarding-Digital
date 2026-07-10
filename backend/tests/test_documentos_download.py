from datetime import date, datetime

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import create_access_token
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models import Colaborador, Documento, RH, StatusDocumento, TipoDocumento, Usuario


@pytest.fixture()
def test_client(tmp_path):
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
        yield client, db, tmp_path

    db.close()
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


def auth_headers(usuario: Usuario) -> dict[str, str]:
    return {"Authorization": f"Bearer {create_access_token(str(usuario.idUsuario))}"}


def create_rh(db, email: str = "rh@example.com", matricula: int = 1001) -> Usuario:
    usuario = Usuario(nome="Profissional de RH", email=email, senha="hash")
    db.add(usuario)
    db.flush()
    db.add(RH(matricula=matricula, cargo="Analista de RH", idUsuario=usuario.idUsuario))
    db.commit()
    db.refresh(usuario)
    return usuario


def create_colaborador(db, email: str, cpf: str) -> Usuario:
    usuario = Usuario(nome="Colaborador", email=email, senha="hash")
    db.add(usuario)
    db.flush()
    db.add(Colaborador(cpf=cpf, dataNascimento=date(1990, 1, 1), idUsuario=usuario.idUsuario))
    db.commit()
    db.refresh(usuario)
    return usuario


def create_document(db, tmp_path, usuario: Usuario, *, nome_doc="rg", nome_status="pendente") -> Documento:
    if db.get(TipoDocumento, nome_doc) is None:
        db.add(TipoDocumento(nomeDoc=nome_doc, descricao="Documento", obrigatorio=True))
    if db.get(StatusDocumento, nome_status) is None:
        db.add(StatusDocumento(nomeStatus=nome_status, descricao="Status"))
    db.flush()

    file_path = tmp_path / f"{usuario.colaborador.cpf}.pdf"
    file_path.write_bytes(b"conteudo do documento")

    documento = Documento(
        caminhoArquivo=str(file_path),
        dataEnvio=datetime(2026, 6, 1, 9, 0, 0),
        nomeArquivo="documento.pdf",
        cpf=usuario.colaborador.cpf,
        idUsuario=usuario.idUsuario,
        nomeDoc=nome_doc,
        nomeStatus=nome_status,
    )
    db.add(documento)
    db.commit()
    db.refresh(documento)
    return documento


def test_download_requires_authentication():
    client = TestClient(app)

    response = client.get("/documentos/1/download")

    assert response.status_code == 401


def test_download_rejects_invalid_token():
    client = TestClient(app)

    response = client.get(
        "/documentos/1/download",
        headers={"Authorization": "Bearer token-invalido"},
    )

    assert response.status_code == 401


def test_download_owner_can_download_own_document(test_client):
    client, db, tmp_path = test_client
    colaborador = create_colaborador(db, "colab@example.com", "11122233344")
    documento = create_document(db, tmp_path, colaborador)

    response = client.get(
        f"/documentos/{documento.idDoc}/download",
        headers=auth_headers(colaborador),
    )

    assert response.status_code == 200
    assert response.content == b"conteudo do documento"


def test_download_other_collaborator_is_forbidden(test_client):
    client, db, tmp_path = test_client
    owner = create_colaborador(db, "dono@example.com", "11122233344")
    other = create_colaborador(db, "outro@example.com", "55566677788")
    documento = create_document(db, tmp_path, owner)

    response = client.get(
        f"/documentos/{documento.idDoc}/download",
        headers=auth_headers(other),
    )

    assert response.status_code == 403


def test_download_rh_can_download_any_document(test_client):
    client, db, tmp_path = test_client
    rh = create_rh(db)
    colaborador = create_colaborador(db, "colab2@example.com", "99988877766")
    documento = create_document(db, tmp_path, colaborador)

    response = client.get(
        f"/documentos/{documento.idDoc}/download",
        headers=auth_headers(rh),
    )

    assert response.status_code == 200
    assert response.content == b"conteudo do documento"


def test_download_nonexistent_document_returns_404(test_client):
    client, db, _tmp_path = test_client
    colaborador = create_colaborador(db, "colab3@example.com", "12312312312")

    response = client.get(
        "/documentos/999999/download",
        headers=auth_headers(colaborador),
    )

    assert response.status_code == 404
