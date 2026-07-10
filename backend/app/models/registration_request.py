from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class SolicitacaoCadastroColaborador(Base):
    __tablename__ = "solicitacoes_cadastro"

    idSolicitacao: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nome: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    cpf: Mapped[str] = mapped_column(String(11), nullable=False, index=True)
    dataNascimento: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pendente")
    motivoRecusa: Mapped[str | None] = mapped_column(String(255), nullable=True)
    criadoEm: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    avaliadoEm: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    avaliadoPorRhId: Mapped[int | None] = mapped_column(
        ForeignKey("usuario.idUsuario"),
        nullable=True,
    )

    avaliadoPorRh: Mapped["Usuario | None"] = relationship()
