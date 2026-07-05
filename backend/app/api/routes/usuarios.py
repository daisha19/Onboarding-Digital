from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_rh
from app.db.session import get_db
from app.models import Usuario
from app.schemas.user import (
    ColaboradorCreate,
    ColaboradorPerfilResponse,
    ColaboradorResponse,
    PromoverColaboradorRH,
    RHCreate,
    RHResponse,
    SolicitacaoCadastroRecusa,
    SolicitacaoCadastroResponse,
)
from app.services.user_service import (
    approve_registration_request,
    create_colaborador,
    create_rh,
    get_all_colaboradores,
    get_all_rh,
    get_registration_requests,
    promote_registration_request_to_rh,
    reject_registration_request,
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
            nome=c.usuario.nome,
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
        nome=colaborador.usuario.nome,
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
        nome=rh.usuario.nome,
        email=rh.usuario.email,
    )


@router.get("/me/perfil", response_model=ColaboradorPerfilResponse)
def get_my_profile(current_user: Usuario = Depends(get_current_user)):
    colaborador = current_user.colaborador
    if colaborador is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Usuário não é um colaborador.")
    return ColaboradorPerfilResponse(
        idUsuario=current_user.idUsuario,
        nome=current_user.nome,
        email=current_user.email,
        cpf=colaborador.cpf,
        dataNascimento=colaborador.dataNascimento,
    )


@router.get("/rh", response_model=list[RHResponse])
def list_rh_users(db: Session = Depends(get_db), _: Usuario = Depends(require_rh)):
    rhs = get_all_rh(db)
    return [
        RHResponse(
            matricula=r.matricula,
            cargo=r.cargo,
            idUsuario=r.idUsuario,
            nome=r.usuario.nome,
            email=r.usuario.email,
        )
        for r in rhs
    ]


@router.get("/solicitacoes-cadastro", response_model=list[SolicitacaoCadastroResponse])
def list_registration_requests(
    status: str | None = None,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_rh),
):
    return get_registration_requests(db, status)


@router.post(
    "/solicitacoes-cadastro/{request_id}/aprovar",
    response_model=SolicitacaoCadastroResponse,
)
def approve_registration(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_rh),
):
    return approve_registration_request(db, request_id, current_user)


@router.post(
    "/solicitacoes-cadastro/{request_id}/recusar",
    response_model=SolicitacaoCadastroResponse,
)
def reject_registration(
    request_id: int,
    payload: SolicitacaoCadastroRecusa | None = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(require_rh),
):
    return reject_registration_request(
        db,
        request_id,
        current_user,
        payload.motivoRecusa if payload else None,
    )


@router.post(
    "/solicitacoes-cadastro/{request_id}/promover-rh",
    response_model=RHResponse,
)
def promote_registration_to_rh(
    request_id: int,
    payload: PromoverColaboradorRH,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_rh),
):
    rh = promote_registration_request_to_rh(db, request_id, payload)
    return RHResponse(
        matricula=rh.matricula,
        cargo=rh.cargo,
        idUsuario=rh.idUsuario,
        nome=rh.usuario.nome,
        email=rh.usuario.email,
    )
