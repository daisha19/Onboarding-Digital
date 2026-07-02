from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_documentos_routes_registered_in_openapi():
    paths = client.get("/openapi.json").json()["paths"]

    assert "/documentos/" in paths
    assert "get" in paths["/documentos/"]
    assert "post" in paths["/documentos/"]

    assert "/documentos/{id_doc}" in paths
    assert "get" in paths["/documentos/{id_doc}"]
    assert "delete" in paths["/documentos/{id_doc}"]

    assert "/documentos/{id_doc}/download" in paths
    assert "get" in paths["/documentos/{id_doc}/download"]
    assert "/documentos/{id_doc}/status" in paths
    assert "patch" in paths["/documentos/{id_doc}/status"]


def test_swagger_uses_bearer_authentication():
    components = client.get("/openapi.json").json()["components"]

    assert "BearerAuth" in components["securitySchemes"]
    assert components["securitySchemes"]["BearerAuth"]["type"] == "http"
    assert components["securitySchemes"]["BearerAuth"]["scheme"] == "bearer"


def test_documentos_routes_require_authentication():
    assert client.get("/documentos/").status_code == 401

    response = client.post(
        "/documentos/",
        data={"nome_doc": "rg"},
        files={"arquivo": ("doc.txt", b"conteudo", "text/plain")},
    )

    assert response.status_code == 401
