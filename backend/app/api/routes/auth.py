from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_user_role
from app.core.security import create_access_token
from app.db.session import get_db
from app.models import Usuario
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UsuarioMe
from app.services.user_service import authenticate_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    usuario = authenticate_user(db, payload.email, payload.senha)
    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha inválidos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return TokenResponse(
        accessToken=create_access_token(str(usuario.idUsuario)),
    )


@router.get("/me", response_model=UsuarioMe)
def read_me(current_user: Usuario = Depends(get_current_user)):
    return UsuarioMe(
        idUsuario=current_user.idUsuario,
        email=current_user.email,
        perfil=get_user_role(current_user),
    )
