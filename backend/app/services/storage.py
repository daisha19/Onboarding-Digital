from datetime import datetime, timezone
from mimetypes import guess_type
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status
from fastapi.responses import FileResponse, Response, StreamingResponse

from app.core.config import settings


BACKEND_DIR = Path(__file__).resolve().parents[2]


class StoredFile:
    def __init__(self, path: str, original_filename: str) -> None:
        self.path = path
        self.original_filename = original_filename


class PreparedUpload:
    def __init__(
        self,
        *,
        contents: bytes,
        filename: str,
        content_type: str,
    ) -> None:
        self.contents = contents
        self.filename = filename
        self.content_type = content_type


def _storage_backend() -> str:
    backend = settings.DOCUMENT_STORAGE_BACKEND.lower().strip()
    if backend not in {"local", "gcs"}:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"DOCUMENT_STORAGE_BACKEND invalido: {settings.DOCUMENT_STORAGE_BACKEND}",
        )
    return backend


def _safe_filename(filename: str) -> str:
    return Path(filename).name.replace("\\", "_").replace("/", "_")


def _build_object_name(*, cpf: str, filename: str) -> str:
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    prefix = settings.GCS_UPLOAD_PREFIX.strip("/")
    object_name = f"{cpf}/{timestamp}_{uuid4().hex}_{_safe_filename(filename)}"
    if not prefix:
        return object_name
    return f"{prefix}/{object_name}"


def _save_local(*, contents: bytes, cpf: str, filename: str) -> str:
    upload_dir = BACKEND_DIR / settings.LOCAL_UPLOAD_DIR / cpf
    upload_dir.mkdir(parents=True, exist_ok=True)

    object_name = _build_object_name(cpf=cpf, filename=filename).split("/", 1)[1]
    file_path = upload_dir / Path(object_name).name
    file_path.write_bytes(contents)

    return str(file_path)


def _gcs_client():
    try:
        from google.cloud import storage
    except ImportError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Dependencia google-cloud-storage nao instalada.",
        ) from exc

    return storage.Client()


def _gcs_blob(path: str):
    if not settings.GCS_BUCKET_NAME:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GCS_BUCKET_NAME nao configurado.",
        )

    if not path.startswith("gs://"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Caminho GCS invalido.",
        )

    prefix = f"gs://{settings.GCS_BUCKET_NAME}/"
    if not path.startswith(prefix):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Arquivo nao pertence ao bucket configurado.",
        )

    object_name = path.removeprefix(prefix)
    client = _gcs_client()
    bucket = client.bucket(settings.GCS_BUCKET_NAME)
    return bucket.blob(object_name)


def _save_gcs(*, contents: bytes, cpf: str, filename: str, content_type: str) -> str:
    if not settings.GCS_BUCKET_NAME:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GCS_BUCKET_NAME nao configurado.",
        )

    object_name = _build_object_name(cpf=cpf, filename=filename)
    client = _gcs_client()
    bucket = client.bucket(settings.GCS_BUCKET_NAME)
    blob = bucket.blob(object_name)
    blob.upload_from_string(
        contents,
        content_type=content_type,
        if_generation_match=0,
    )

    return f"gs://{settings.GCS_BUCKET_NAME}/{object_name}"


def prepare_upload_file(*, arquivo: UploadFile, contents: bytes) -> PreparedUpload:
    if not arquivo.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Arquivo invalido.",
        )

    max_size = settings.UPLOAD_MAX_SIZE_MB * 1024 * 1024
    if len(contents) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "FILE_TOO_LARGE",
                "message": f"O arquivo excede o limite de {settings.UPLOAD_MAX_SIZE_MB} MB.",
            },
        )

    filename = _safe_filename(arquivo.filename)
    content_type = (
        arquivo.content_type or guess_type(filename)[0] or "application/octet-stream"
    )

    return PreparedUpload(
        contents=contents,
        filename=filename,
        content_type=content_type,
    )


def save_prepared_upload(*, upload: PreparedUpload, cpf: str) -> StoredFile:
    backend = _storage_backend()

    if backend == "local":
        path = _save_local(contents=upload.contents, cpf=cpf, filename=upload.filename)
    else:
        path = _save_gcs(
            contents=upload.contents,
            cpf=cpf,
            filename=upload.filename,
            content_type=upload.content_type,
        )

    return StoredFile(path=path, original_filename=upload.filename)


def save_upload_file(*, arquivo: UploadFile, contents: bytes, cpf: str) -> StoredFile:
    upload = prepare_upload_file(arquivo=arquivo, contents=contents)
    return save_prepared_upload(upload=upload, cpf=cpf)


def build_download_response(*, path: str, filename: str) -> Response:
    if path.startswith("gs://"):
        blob = _gcs_blob(path)
        try:
            contents = blob.download_as_bytes()
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Arquivo nao encontrado no storage.",
            ) from exc

        media_type = (
            getattr(blob, "content_type", None)
            or guess_type(filename)[0]
            or "application/octet-stream"
        )
        headers = {
            "Content-Disposition": f'attachment; filename="{_safe_filename(filename)}"'
        }
        return StreamingResponse(
            iter([contents]),
            media_type=media_type,
            headers=headers,
        )

    file_path = Path(path)
    if not file_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Arquivo nao encontrado no storage.",
        )

    media_type = guess_type(filename)[0] or "application/octet-stream"
    return FileResponse(
        file_path,
        media_type=media_type,
        filename=_safe_filename(filename),
    )


def delete_stored_file(*, path: str) -> None:
    if path.startswith("gs://"):
        blob = _gcs_blob(path)
        blob.delete()
        return

    file_path = Path(path)
    if file_path.exists():
        file_path.unlink()
