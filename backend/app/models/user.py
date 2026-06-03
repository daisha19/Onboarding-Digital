from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Usuario(Base):
    __tablename__ = "usuario"

    idUsuario: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    senha: Mapped[str] = mapped_column(String(255), nullable=False)

    colaborador: Mapped["Colaborador | None"] = relationship(
        back_populates="usuario",
        uselist=False,
    )
    rh: Mapped["RH | None"] = relationship(
        back_populates="usuario",
        uselist=False,
    )
    telefones: Mapped[list["Telefone"]] = relationship(
        back_populates="usuario",
    )
    documentos: Mapped[list["Documento"]] = relationship(
        back_populates="usuario",
    )
    logsAuditoria: Mapped[list["LogAuditoria"]] = relationship(
        back_populates="usuario",
    )


class Colaborador(Base):
    __tablename__ = "colaborador"

    cpf: Mapped[str] = mapped_column(String(11), primary_key=True)
    dataNascimento: Mapped[date] = mapped_column(Date, nullable=False)
    idUsuario: Mapped[int] = mapped_column(
        ForeignKey("usuario.idUsuario"),
        unique=True,
        nullable=False,
    )

    usuario: Mapped["Usuario"] = relationship(back_populates="colaborador")
    documentos: Mapped[list["Documento"]] = relationship(back_populates="colaborador")


class RH(Base):
    __tablename__ = "rh"

    matricula: Mapped[int] = mapped_column(Integer, primary_key=True)
    cargo: Mapped[str] = mapped_column(String(100), nullable=False)
    idUsuario: Mapped[int] = mapped_column(
        ForeignKey("usuario.idUsuario"),
        unique=True,
        nullable=False,
    )

    usuario: Mapped["Usuario"] = relationship(back_populates="rh")


class Telefone(Base):
    __tablename__ = "telefone"

    numeroTelefone: Mapped[str] = mapped_column(String(20), primary_key=True)
    idUsuario: Mapped[int] = mapped_column(
        ForeignKey("usuario.idUsuario"),
        primary_key=True,
    )

    usuario: Mapped["Usuario"] = relationship(back_populates="telefones")
