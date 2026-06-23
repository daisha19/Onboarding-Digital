from io import BytesIO
from pathlib import Path

from fastapi import UploadFile

from app.core.config import settings
from app.services.storage import save_upload_file


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
