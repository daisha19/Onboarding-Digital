from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models import Usuario


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_user_role(usuario: Usuario) -> str:
    if usuario.rh is not None:
        return "rh"
    if usuario.colaborador is not None:
        return "colaborador"
    return "indefinido"


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Usuario:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )

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
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso permitido apenas para RH",
        )

    return current_user
