from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class AcaoAuditoria(Base):
    __tablename__ = "acao_auditoria"

    nomeAcao: Mapped[str] = mapped_column(String(50), primary_key=True)
    descricao: Mapped[str] = mapped_column(String(255), nullable=False)

    logsAuditoria: Mapped[list["LogAuditoria"]] = relationship(
        back_populates="acaoAuditoria",
    )


class LogAuditoria(Base):
    __tablename__ = "log_auditoria"

    idAuditoria: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    descricao: Mapped[str] = mapped_column(String(255), nullable=False)
    dataHora: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    idUsuario: Mapped[int] = mapped_column(
        ForeignKey("usuario.idUsuario"),
        nullable=False,
    )
    idDoc: Mapped[int] = mapped_column(
        ForeignKey("documento.idDoc"),
        nullable=False,
    )
    nomeAcao: Mapped[str] = mapped_column(
        ForeignKey("acao_auditoria.nomeAcao"),
        nullable=False,
    )

    usuario: Mapped["Usuario"] = relationship(back_populates="logsAuditoria")
    documento: Mapped["Documento"] = relationship(back_populates="logsAuditoria")
    acaoAuditoria: Mapped["AcaoAuditoria"] = relationship(
        back_populates="logsAuditoria",
    )
