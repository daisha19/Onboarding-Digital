from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_update_document_status_route_registered_in_openapi():
    paths = client.get("/openapi.json").json()["paths"]

    assert "/documentos/{id_doc}/status" in paths
    assert "patch" in paths["/documentos/{id_doc}/status"]


def test_update_document_status_requires_authentication():
    response = client.patch(
        "/documentos/1/status",
        json={"nomeStatus": "APROVADO"},
    )

    assert response.status_code == 401