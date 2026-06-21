from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.errors import (
    invalid_token_error,
    insufficient_permission_error,
    missing_token_error,
)
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models import Usuario


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login",
    auto_error=False,
)


def get_user_role(usuario: Usuario) -> str:
    if usuario.rh is not None:
        return "rh"
    if usuario.colaborador is not None:
        return "colaborador"
    return "indefinido"


def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Usuario:
    if token is None:
        raise missing_token_error()

    credentials_exception = invalid_token_error()

    try:
        payload = decode_access_token(token)
        user_id = int(payload.get("sub"))
    except (TypeError, ValueError):
        raise credentials_exception

    usuario = db.get(Usuario, user_id)
    if usuario is None:
        raise credentials_exception

    return usuario


def require_rh(current_user: Usuario = Depends(get_current_user)) -> Usuario:
    if get_user_role(current_user) != "rh":
        raise insufficient_permission_error()

    return current_user
