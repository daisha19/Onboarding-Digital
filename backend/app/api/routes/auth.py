from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_user_role
from app.core.errors import invalid_login_error
from app.core.security import create_access_token
from app.db.session import get_db
from app.models import Usuario
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import SolicitacaoCadastroCreate, SolicitacaoCadastroResponse, UsuarioMe
from app.services.audit_service import (
    LOGIN_FAILURE,
    LOGIN_SUCCESS,
    register_audit_log,
)
from app.services.user_service import authenticate_user, create_registration_request

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    usuario = authenticate_user(db, payload.email, payload.senha)

    if usuario is None:
        register_audit_log(
            db=db,
            action=LOGIN_FAILURE,
            description=f"Tentativa de login inválida para o e-mail {payload.email}.",
            user_id=None,
        )
        db.commit()
        raise invalid_login_error()

    register_audit_log(
        db=db,
        action=LOGIN_SUCCESS,
        description=f"Login bem-sucedido para o usuário {usuario.email}.",
        user_id=usuario.idUsuario,
    )
    db.commit()

    return TokenResponse(
        accessToken=create_access_token(str(usuario.idUsuario)),
    )


@router.post("/register-request", response_model=SolicitacaoCadastroResponse, status_code=201)
def request_registration(payload: SolicitacaoCadastroCreate, db: Session = Depends(get_db)):
    return create_registration_request(db, payload)


@router.get("/me", response_model=UsuarioMe)
def read_me(current_user: Usuario = Depends(get_current_user)):
    return UsuarioMe(
        idUsuario=current_user.idUsuario,
        nome=current_user.nome,
        email=current_user.email,
        perfil=get_user_role(current_user),
    )