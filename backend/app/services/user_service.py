from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.models import Colaborador, RH, Usuario
from app.schemas.user import ColaboradorCreate, RHCreate


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


def create_rh(db: Session, data: RHCreate) -> RH:
    usuario = Usuario(
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
