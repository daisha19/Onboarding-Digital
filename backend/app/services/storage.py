from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status

from app.core.config import settings


BACKEND_DIR = Path(__file__).resolve().parents[2]


class StoredFile:
    def __init__(self, path: str, original_filename: str) -> None:
        self.path = path
        self.original_filename = original_filename


def _safe_filename(filename: str) -> str:
    return Path(filename).name.replace("\\", "_").replace("/", "_")


def _build_object_name(*, cpf: str, filename: str) -> str:
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    return f"{settings.GCS_UPLOAD_PREFIX.strip('/')}/{cpf}/{timestamp}_{uuid4().hex}_{_safe_filename(filename)}"


def _save_local(*, contents: bytes, cpf: str, filename: str) -> str:
    upload_dir = BACKEND_DIR / settings.LOCAL_UPLOAD_DIR / cpf
    upload_dir.mkdir(parents=True, exist_ok=True)

    object_name = _build_object_name(cpf=cpf, filename=filename).split("/", 1)[1]
    file_path = upload_dir / Path(object_name).name
    file_path.write_bytes(contents)

    return str(file_path)


def _save_gcs(*, contents: bytes, cpf: str, filename: str, content_type: str | None) -> str:
    if not settings.GCS_BUCKET_NAME:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GCS_BUCKET_NAME nao configurado.",
        )

    try:
        from google.cloud import storage
    except ImportError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Dependencia google-cloud-storage nao instalada.",
        ) from exc

    object_name = _build_object_name(cpf=cpf, filename=filename)
    client = storage.Client()
    bucket = client.bucket(settings.GCS_BUCKET_NAME)
    blob = bucket.blob(object_name)
    blob.upload_from_string(
        contents,
        content_type=content_type or "application/octet-stream",
        if_generation_match=0,
    )

    return f"gs://{settings.GCS_BUCKET_NAME}/{object_name}"


def save_upload_file(*, arquivo: UploadFile, contents: bytes, cpf: str) -> StoredFile:
    if not arquivo.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Arquivo invalido.",
        )

    filename = _safe_filename(arquivo.filename)
    backend = settings.DOCUMENT_STORAGE_BACKEND.lower().strip()

    if backend == "local":
        path = _save_local(contents=contents, cpf=cpf, filename=filename)
    elif backend == "gcs":
        path = _save_gcs(
            contents=contents,
            cpf=cpf,
            filename=filename,
            content_type=arquivo.content_type,
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"DOCUMENT_STORAGE_BACKEND invalido: {settings.DOCUMENT_STORAGE_BACKEND}",
        )

    return StoredFile(path=path, original_filename=filename)
