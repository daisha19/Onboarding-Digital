"""add nome to registration requests

Revision ID: 6c1f8d7a9e21
Revises: 2a4f91d8c7b3
Create Date: 2026-06-25 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "6c1f8d7a9e21"
down_revision: Union[str, None] = "2a4f91d8c7b3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "solicitacoes_cadastro",
        sa.Column("nome", sa.String(length=150), nullable=False, server_default="Nome nao informado"),
    )
    op.alter_column("solicitacoes_cadastro", "nome", server_default=None)


def downgrade() -> None:
    op.drop_column("solicitacoes_cadastro", "nome")
