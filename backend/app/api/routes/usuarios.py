from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import require_rh
from app.db.session import get_db
from app.models import Usuario
from app.schemas.user import (
    ColaboradorCreate,
    ColaboradorResponse,
    RHCreate,
    RHResponse,
)
from app.services.user_service import create_colaborador, create_rh

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


@router.post(
    "/colaboradores",
    response_model=ColaboradorResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_colaborador_user(
    payload: ColaboradorCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_rh),
):
    try:
        colaborador = create_colaborador(db, payload)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="E-mail, CPF ou usuário já cadastrado",
        ) from exc

    return ColaboradorResponse(
        cpf=colaborador.cpf,
        dataNascimento=colaborador.dataNascimento,
        idUsuario=colaborador.idUsuario,
        email=colaborador.usuario.email,
    )


@router.post("/rh", response_model=RHResponse, status_code=status.HTTP_201_CREATED)
def create_rh_user(
    payload: RHCreate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_rh),
):
    try:
        rh = create_rh(db, payload)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="E-mail, matrícula ou usuário já cadastrado",
        ) from exc

    return RHResponse(
        matricula=rh.matricula,
        cargo=rh.cargo,
        idUsuario=rh.idUsuario,
        email=rh.usuario.email,
    )
