from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_documentos_routes_registered_in_openapi():
    paths = client.get("/openapi.json").json()["paths"]

    assert "/documentos/tipos" in paths
    assert "get" in paths["/documentos/tipos"]

    assert "/documentos/upload" in paths
    assert "post" in paths["/documentos/upload"]


def test_documentos_routes_require_authentication():
    assert client.get("/documentos/tipos").status_code == 401

    response = client.post(
        "/documentos/upload",
        data={"nomeDoc": "rg"},
        files={"arquivo": ("doc.txt", b"conteudo", "text/plain")},
    )
    assert response.status_code == 401