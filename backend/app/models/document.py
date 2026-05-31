from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class TipoDocumento(Base):
    __tablename__ = "tipo_documento"

    nomeDoc: Mapped[str] = mapped_column(String(100), primary_key=True)
    descricao: Mapped[str] = mapped_column(String(255), nullable=False)
    obrigatorio: Mapped[bool] = mapped_column(Boolean, nullable=False)

    documentos: Mapped[list["Documento"]] = relationship(
        back_populates="tipoDocumento",
    )


class StatusDocumento(Base):
    __tablename__ = "status_documento"

    nomeStatus: Mapped[str] = mapped_column(String(50), primary_key=True)
    descricao: Mapped[str] = mapped_column(String(255), nullable=False)

    documentos: Mapped[list["Documento"]] = relationship(
        back_populates="statusDocumento",
    )


class Documento(Base):
    __tablename__ = "documento"

    idDoc: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    caminhoArquivo: Mapped[str] = mapped_column(String(255), nullable=False)
    dataEnvio: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    nomeArquivo: Mapped[str] = mapped_column(String(255), nullable=False)
    cpf: Mapped[str] = mapped_column(
        ForeignKey("colaborador.cpf"),
        nullable=False,
    )
    idUsuario: Mapped[int] = mapped_column(
        ForeignKey("usuario.idUsuario"),
        nullable=False,
    )
    nomeDoc: Mapped[str] = mapped_column(
        ForeignKey("tipo_documento.nomeDoc"),
        nullable=False,
    )
    nomeStatus: Mapped[str] = mapped_column(
        ForeignKey("status_documento.nomeStatus"),
        nullable=False,
    )

    colaborador: Mapped["Colaborador"] = relationship(back_populates="documentos")
    usuario: Mapped["Usuario"] = relationship(back_populates="documentos")
    tipoDocumento: Mapped["TipoDocumento"] = relationship(back_populates="documentos")
    statusDocumento: Mapped["StatusDocumento"] = relationship(
        back_populates="documentos",
    )
    logsAuditoria: Mapped[list["LogAuditoria"]] = relationship(
        back_populates="documento",
    )
