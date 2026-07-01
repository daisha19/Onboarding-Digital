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
from app.services.user_service import (
    create_colaborador,
    create_rh,
    get_all_colaboradores,
    get_all_rh,
)

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


@router.get("/colaboradores", response_model=list[ColaboradorResponse])
def list_colaborador_users(
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_rh),
):
    colaboradores = get_all_colaboradores(db)
    return [
        ColaboradorResponse(
            cpf=c.cpf,
            dataNascimento=c.dataNascimento,
            idUsuario=c.idUsuario,
            email=c.usuario.email,
        )
        for c in colaboradores
    ]


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


@router.get("/rh", response_model=list[RHResponse])
def list_rh_users(db: Session = Depends(get_db), _: Usuario = Depends(require_rh)):
    rhs = get_all_rh(db)
    return [
        RHResponse(
            matricula=r.matricula,
            cargo=r.cargo,
            idUsuario=r.idUsuario,
            email=r.usuario.email,
        )
        for r in rhs
    ]
