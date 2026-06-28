from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_documentos_routes_registered_in_openapi():
    paths = client.get("/openapi.json").json()["paths"]

    assert "/documentos/" in paths
    assert "get" in paths["/documentos/"]
    assert "post" in paths["/documentos/"]


def test_documentos_routes_require_authentication():
    assert client.get("/documentos/").status_code == 401

    response = client.post(
        "/documentos/",
        data={"nome_doc": "rg"},
        files={"arquivo": ("doc.txt", b"conteudo", "text/plain")},
    )

    assert response.status_code == 401