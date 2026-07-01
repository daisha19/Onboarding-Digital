from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


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
