from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_user_role
from app.core.errors import invalid_login_error
from app.core.security import create_access_token
from app.db.session import get_db
from app.models import Usuario
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import ColaboradorCreate, ColaboradorResponse, UsuarioMe
from app.services.user_service import authenticate_user, create_colaborador

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=ColaboradorResponse, status_code=status.HTTP_201_CREATED)
def register(payload: ColaboradorCreate, db: Session = Depends(get_db)):
    try:
        colaborador = create_colaborador(db, payload)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="E-mail ou CPF já cadastrado.",
        ) from exc

    return ColaboradorResponse(
        cpf=colaborador.cpf,
        dataNascimento=colaborador.dataNascimento,
        idUsuario=colaborador.idUsuario,
        email=colaborador.usuario.email,
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    usuario = authenticate_user(db, payload.email, payload.senha)

    if usuario is None:
        raise invalid_login_error()

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