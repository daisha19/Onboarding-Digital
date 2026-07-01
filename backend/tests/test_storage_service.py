from io import BytesIO
from pathlib import Path

import pytest
from fastapi import HTTPException
from fastapi import UploadFile
from starlette.datastructures import Headers

from app.core.config import settings
from app.services import storage
from app.services.storage import (
    build_download_response,
    delete_stored_file,
    save_upload_file,
)


class FakeBlob:
    def __init__(self, name):
        self.name = name
        self.uploaded = None
        self.deleted = False
        self.content_type = "application/pdf"

    def upload_from_string(self, contents, content_type, if_generation_match):
        self.uploaded = {
            "contents": contents,
            "content_type": content_type,
            "if_generation_match": if_generation_match,
        }

    def download_as_bytes(self):
        return b"conteudo-gcs"

    def delete(self):
        self.deleted = True


class FakeBucket:
    def __init__(self):
        self.blobs = {}

    def blob(self, name):
        blob = self.blobs.setdefault(name, FakeBlob(name))
        return blob


class FakeClient:
    def __init__(self):
        self.bucket_names = []
        self.fake_bucket = FakeBucket()

    def bucket(self, name):
        self.bucket_names.append(name)
        return self.fake_bucket


def test_save_upload_file_local_backend(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "DOCUMENT_STORAGE_BACKEND", "local")
    monkeypatch.setattr(settings, "LOCAL_UPLOAD_DIR", str(tmp_path))

    upload = UploadFile(
        filename="../rg.pdf",
        file=BytesIO(b"conteudo"),
    )

    stored_file = save_upload_file(
        arquivo=upload,
        contents=b"conteudo",
        cpf="12345678900",
    )

    stored_path = Path(stored_file.path)
    assert stored_path.exists()
    assert stored_path.read_bytes() == b"conteudo"
    assert stored_path.parent == tmp_path / "12345678900"
    assert stored_file.original_filename == "rg.pdf"


def test_save_upload_file_rejects_large_file(monkeypatch):
    monkeypatch.setattr(settings, "UPLOAD_MAX_SIZE_MB", 1)

    upload = UploadFile(
        filename="grande.pdf",
        file=BytesIO(b"x"),
    )

    with pytest.raises(HTTPException) as exc_info:
        save_upload_file(
            arquivo=upload,
            contents=b"x" * ((1024 * 1024) + 1),
            cpf="12345678900",
        )

    assert exc_info.value.status_code == 400
    assert exc_info.value.detail["code"] == "FILE_TOO_LARGE"


def test_local_download_and_delete(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "DOCUMENT_STORAGE_BACKEND", "local")
    file_path = tmp_path / "rg.pdf"
    file_path.write_bytes(b"conteudo")

    response = build_download_response(
        path=str(file_path),
        filename="rg.pdf",
    )

    assert Path(response.path) == file_path
    assert response.media_type == "application/pdf"

    delete_stored_file(path=str(file_path))
    assert not file_path.exists()


def test_save_upload_file_gcs_backend_uses_bucket_object_and_content_type(monkeypatch):
    fake_client = FakeClient()
    monkeypatch.setattr(settings, "DOCUMENT_STORAGE_BACKEND", "gcs")
    monkeypatch.setattr(settings, "GCS_BUCKET_NAME", "bucket-teste")
    monkeypatch.setattr(settings, "GCS_UPLOAD_PREFIX", "documentos")
    monkeypatch.setattr(storage, "_gcs_client", lambda: fake_client)

    upload = UploadFile(
        filename="../rg.pdf",
        file=BytesIO(b"conteudo"),
        headers=Headers({"content-type": "application/pdf"}),
    )

    stored_file = save_upload_file(
        arquivo=upload,
        contents=b"conteudo",
        cpf="12345678900",
    )

    assert fake_client.bucket_names == ["bucket-teste"]
    object_name = stored_file.path.removeprefix("gs://bucket-teste/")
    blob = fake_client.fake_bucket.blobs[object_name]
    assert object_name.startswith("documentos/12345678900/")
    assert object_name.endswith("_rg.pdf")
    assert blob.uploaded == {
        "contents": b"conteudo",
        "content_type": "application/pdf",
        "if_generation_match": 0,
    }
    assert stored_file.original_filename == "rg.pdf"


def test_save_upload_file_gcs_backend_requires_bucket(monkeypatch):
    monkeypatch.setattr(settings, "DOCUMENT_STORAGE_BACKEND", "gcs")
    monkeypatch.setattr(settings, "GCS_BUCKET_NAME", "")

    upload = UploadFile(
        filename="rg.pdf",
        file=BytesIO(b"conteudo"),
    )

    with pytest.raises(HTTPException) as exc_info:
        save_upload_file(
            arquivo=upload,
            contents=b"conteudo",
            cpf="12345678900",
        )

    assert exc_info.value.status_code == 500
    assert exc_info.value.detail == "GCS_BUCKET_NAME nao configurado."


def test_gcs_download_and_delete_use_configured_bucket(monkeypatch):
    fake_client = FakeClient()
    monkeypatch.setattr(settings, "GCS_BUCKET_NAME", "bucket-teste")
    monkeypatch.setattr(storage, "_gcs_client", lambda: fake_client)
    path = "gs://bucket-teste/documentos/12345678900/rg.pdf"

    response = build_download_response(
        path=path,
        filename="rg.pdf",
    )
    delete_stored_file(path=path)

    blob = fake_client.fake_bucket.blobs["documentos/12345678900/rg.pdf"]
    assert response.media_type == "application/pdf"
    assert response.headers["content-disposition"] == 'attachment; filename="rg.pdf"'
    assert blob.deleted is True
