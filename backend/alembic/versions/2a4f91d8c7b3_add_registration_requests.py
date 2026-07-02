"""add registration requests

Revision ID: 2a4f91d8c7b3
Revises: 80b27029bf5e
Create Date: 2026-06-24 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "2a4f91d8c7b3"
down_revision: Union[str, None] = "2724a8d2c9c6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "solicitacoes_cadastro",
        sa.Column("idSolicitacao", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("cpf", sa.String(length=11), nullable=False),
        sa.Column("dataNascimento", sa.Date(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("motivoRecusa", sa.String(length=255), nullable=True),
        sa.Column("criadoEm", sa.DateTime(), nullable=False),
        sa.Column("avaliadoEm", sa.DateTime(), nullable=True),
        sa.Column("avaliadoPorRhId", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["avaliadoPorRhId"], ["usuario.idUsuario"]),
        sa.PrimaryKeyConstraint("idSolicitacao"),
    )
    op.create_index(
        op.f("ix_solicitacoes_cadastro_idSolicitacao"),
        "solicitacoes_cadastro",
        ["idSolicitacao"],
        unique=False,
    )
    op.create_index(
        op.f("ix_solicitacoes_cadastro_email"),
        "solicitacoes_cadastro",
        ["email"],
        unique=False,
    )
    op.create_index(
        op.f("ix_solicitacoes_cadastro_cpf"),
        "solicitacoes_cadastro",
        ["cpf"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_solicitacoes_cadastro_cpf"),
        table_name="solicitacoes_cadastro",
    )
    op.drop_index(
        op.f("ix_solicitacoes_cadastro_email"),
        table_name="solicitacoes_cadastro",
    )
    op.drop_index(
        op.f("ix_solicitacoes_cadastro_idSolicitacao"),
        table_name="solicitacoes_cadastro",
    )
    op.drop_table("solicitacoes_cadastro")
