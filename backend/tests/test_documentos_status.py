from types import SimpleNamespace
from unittest.mock import Mock

from fastapi import HTTPException, status
from fastapi.testclient import TestClient

from app.api.deps import get_current_user, get_db
from app.main import app
from app.services.document_service import update_document_status

client = TestClient(app)


def test_update_document_status_route_registered_in_openapi():
    paths = client.get("/openapi.json").json()["paths"]

    assert "/documentos/{id_doc}/status" in paths
    assert "patch" in paths["/documentos/{id_doc}/status"]


def test_update_document_status_requires_authentication():
    response = client.patch(
        "/documentos/1/status",
        json={"nomeStatus": "aprovado"},
    )

    assert response.status_code == 401


def test_update_document_status_rh_can_approve(monkeypatch):
    fake_db = Mock()
    fake_user = SimpleNamespace(idUsuario=1, rh=SimpleNamespace(), colaborador=None)

    fake_document = {
        "idDoc": 1,
        "caminhoArquivo": "uploads/doc.txt",
        "dataEnvio": "2026-06-28T00:00:00",
        "nomeArquivo": "doc.txt",
        "cpf": "12345678901",
        "idUsuario": 2,
        "nomeDoc": "rg",
        "nomeStatus": "aprovado",
    }

    def fake_update_document_status(**kwargs):
        assert kwargs["id_doc"] == 1
        assert kwargs["nome_status"] == "aprovado"
        assert kwargs["id_usuario_rh"] == 1
        return fake_document

    app.dependency_overrides[get_db] = lambda: fake_db
    app.dependency_overrides[get_current_user] = lambda: fake_user

    import app.api.routes.documento as documento_route

    monkeypatch.setattr(
        documento_route,
        "update_document_status",
        fake_update_document_status,
    )

    response = client.patch(
        "/documentos/1/status",
        json={"nomeStatus": "aprovado"},
    )

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["nomeStatus"] == "aprovado"


def test_update_document_status_rh_can_reject(monkeypatch):
    fake_db = Mock()
    fake_user = SimpleNamespace(idUsuario=1, rh=SimpleNamespace(), colaborador=None)

    fake_document = {
        "idDoc": 1,
        "caminhoArquivo": "uploads/doc.txt",
        "dataEnvio": "2026-06-28T00:00:00",
        "nomeArquivo": "doc.txt",
        "cpf": "12345678901",
        "idUsuario": 2,
        "nomeDoc": "rg",
        "nomeStatus": "rejeitado",
    }

    def fake_update_document_status(**kwargs):
        assert kwargs["id_doc"] == 1
        assert kwargs["nome_status"] == "rejeitado"
        assert kwargs["id_usuario_rh"] == 1
        return fake_document

    app.dependency_overrides[get_db] = lambda: fake_db
    app.dependency_overrides[get_current_user] = lambda: fake_user

    import app.api.routes.documento as documento_route

    monkeypatch.setattr(
        documento_route,
        "update_document_status",
        fake_update_document_status,
    )

    response = client.patch(
        "/documentos/1/status",
        json={"nomeStatus": "rejeitado"},
    )

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["nomeStatus"] == "rejeitado"


def test_update_document_status_collaborator_receives_403():
    fake_db = Mock()
    fake_user = SimpleNamespace(idUsuario=2, rh=None, colaborador=SimpleNamespace())

    app.dependency_overrides[get_db] = lambda: fake_db
    app.dependency_overrides[get_current_user] = lambda: fake_user

    response = client.patch(
        "/documentos/1/status",
        json={"nomeStatus": "aprovado"},
    )

    app.dependency_overrides.clear()

    assert response.status_code == 403


def test_update_document_status_document_not_found():
    fake_db = Mock()
    fake_db.get.return_value = None

    try:
        update_document_status(
            db=fake_db,
            id_doc=999,
            nome_status="aprovado",
            id_usuario_rh=1,
        )
    except HTTPException as exc:
        assert exc.status_code == status.HTTP_404_NOT_FOUND
        assert exc.detail == "Documento não encontrado."


def test_update_document_status_invalid_status():
    fake_document = SimpleNamespace(idDoc=1, nomeStatus="pendente")
    fake_db = Mock()
    fake_db.get.side_effect = [fake_document, None]

    try:
        update_document_status(
            db=fake_db,
            id_doc=1,
            nome_status="qualquer_coisa",
            id_usuario_rh=1,
        )
    except HTTPException as exc:
        assert exc.status_code == status.HTTP_400_BAD_REQUEST
        assert exc.detail == "Status de documento inválido: qualquer_coisa"