from datetime import datetime
import secrets

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.models import Colaborador, RH, SolicitacaoCadastroColaborador, Usuario
from app.schemas.user import ColaboradorCreate, PromoverColaboradorRH, RHCreate, SolicitacaoCadastroCreate
from app.services.email_service import send_email


def get_user_by_email(db: Session, email: str) -> Usuario | None:
    return db.query(Usuario).filter(Usuario.email == email).first()


def authenticate_user(db: Session, email: str, senha: str) -> Usuario | None:
    usuario = get_user_by_email(db, email)
    if usuario is None:
        return None
    if not verify_password(senha, usuario.senha):
        return None
    return usuario


def create_colaborador(db: Session, data: ColaboradorCreate) -> Colaborador:
    usuario = Usuario(
        nome=data.nome,
        email=data.email,
        senha=get_password_hash(data.senha),
    )
    db.add(usuario)
    db.flush()

    colaborador = Colaborador(
        cpf=data.cpf,
        dataNascimento=data.dataNascimento,
        idUsuario=usuario.idUsuario,
    )
    db.add(colaborador)
    db.commit()
    db.refresh(colaborador)
    return colaborador


def create_registration_request(
    db: Session,
    data: SolicitacaoCadastroCreate,
) -> SolicitacaoCadastroColaborador:
    existing_user = db.query(Usuario).filter(Usuario.email == data.email).first()
    existing_colaborador = db.get(Colaborador, data.cpf)
    if existing_user is not None or existing_colaborador is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="E-mail ou CPF ja cadastrado.",
        )

    pending_request = (
        db.query(SolicitacaoCadastroColaborador)
        .filter(
            SolicitacaoCadastroColaborador.status == "pendente",
            (
                (SolicitacaoCadastroColaborador.email == data.email)
                | (SolicitacaoCadastroColaborador.cpf == data.cpf)
            ),
        )
        .first()
    )
    if pending_request is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ja existe uma solicitacao pendente para este e-mail ou CPF.",
        )

    request = SolicitacaoCadastroColaborador(
        nome=data.nome,
        email=data.email,
        cpf=data.cpf,
        dataNascimento=data.dataNascimento,
        status="pendente",
    )
    db.add(request)
    db.commit()
    db.refresh(request)
    return request


def get_registration_requests(
    db: Session,
    status_filter: str | None = None,
) -> list[SolicitacaoCadastroColaborador]:
    query = db.query(SolicitacaoCadastroColaborador)
    if status_filter is not None:
        query = query.filter(SolicitacaoCadastroColaborador.status == status_filter)
    return query.order_by(SolicitacaoCadastroColaborador.criadoEm.desc()).all()


def approve_registration_request(
    db: Session,
    request_id: int,
    rh_user: Usuario,
) -> SolicitacaoCadastroColaborador:
    request = db.get(SolicitacaoCadastroColaborador, request_id)
    if request is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Solicitacao nao encontrada.")
    if request.status != "pendente":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Solicitacao ja avaliada.")

    existing_user = db.query(Usuario).filter(Usuario.email == request.email).first()
    existing_colaborador = db.get(Colaborador, request.cpf)
    if existing_user is not None or existing_colaborador is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="E-mail ou CPF ja cadastrado.")

    temporary_password = secrets.token_urlsafe(9)
    usuario = Usuario(
        nome=request.nome,
        email=request.email,
        senha=get_password_hash(temporary_password),
    )
    db.add(usuario)
    db.flush()

    colaborador = Colaborador(
        cpf=request.cpf,
        dataNascimento=request.dataNascimento,
        idUsuario=usuario.idUsuario,
    )
    db.add(colaborador)

    request.status = "aprovado"
    request.avaliadoEm = datetime.utcnow()
    request.avaliadoPorRhId = rh_user.idUsuario
    db.commit()
    db.refresh(request)

    send_email(
        to_email=request.email,
        subject="Seu cadastro no OnBoarding Digital foi aprovado",
        body=(
            f"Ola, {request.nome}.\n\n"
            "Seu cadastro no OnBoarding Digital foi aprovado pelo RH.\n\n"
            f"Login: {request.email}\n"
            f"Senha temporaria: {temporary_password}\n\n"
            "Acesse a plataforma e altere sua senha assim que possivel."
        ),
    )
    return request


def reject_registration_request(
    db: Session,
    request_id: int,
    rh_user: Usuario,
    motivo_recusa: str | None = None,
) -> SolicitacaoCadastroColaborador:
    request = db.get(SolicitacaoCadastroColaborador, request_id)
    if request is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Solicitacao nao encontrada.")
    if request.status != "pendente":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Solicitacao ja avaliada.")

    request.status = "recusado"
    request.motivoRecusa = motivo_recusa
    request.avaliadoEm = datetime.utcnow()
    request.avaliadoPorRhId = rh_user.idUsuario
    db.commit()
    db.refresh(request)

    body = "Ola,\n\nSua solicitacao de cadastro no OnBoarding Digital foi recusada pelo RH."
    if motivo_recusa:
        body = f"{body}\n\nMotivo: {motivo_recusa}"

    send_email(
        to_email=request.email,
        subject="Sua solicitacao de cadastro foi recusada",
        body=body,
    )
    return request


def create_rh(db: Session, data: RHCreate) -> RH:
    usuario = Usuario(
        nome=data.nome,
        email=data.email,
        senha=get_password_hash(data.senha),
    )
    db.add(usuario)
    db.flush()

    rh = RH(
        matricula=data.matricula,
        cargo=data.cargo,
        idUsuario=usuario.idUsuario,
    )
    db.add(rh)
    db.commit()
    db.refresh(rh)
    return rh


def promote_colaborador_to_rh(
    db: Session,
    user_id: int,
    data: PromoverColaboradorRH,
) -> RH:
    usuario = db.get(Usuario, user_id)
    if usuario is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario nao encontrado.")
    if usuario.colaborador is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Usuario nao e colaborador.")
    if usuario.rh is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Usuario ja possui perfil RH.")

    existing_matricula = db.get(RH, data.matricula)
    if existing_matricula is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Matricula de RH ja cadastrada.")

    rh = RH(
        matricula=data.matricula,
        cargo=data.cargo,
        idUsuario=usuario.idUsuario,
    )
    db.add(rh)
    db.commit()
    db.refresh(rh)
    return rh


def promote_registration_request_to_rh(
    db: Session,
    request_id: int,
    data: PromoverColaboradorRH,
) -> RH:
    request = db.get(SolicitacaoCadastroColaborador, request_id)
    if request is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Solicitacao nao encontrada.")
    if request.status != "aprovado":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Apenas solicitacoes aprovadas podem virar RH.")

    usuario = get_user_by_email(db, request.email)
    if usuario is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario aprovado nao encontrado.")

    return promote_colaborador_to_rh(db, usuario.idUsuario, data)


def get_all_rh(db: Session) -> list[RH]:
    """Return all RH entries from the database."""
    return db.query(RH).join(Usuario).all()
