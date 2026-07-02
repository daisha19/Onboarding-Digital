"""add nome to usuario

Revision ID: 9f3a2d1c8b45
Revises: 6c1f8d7a9e21
Create Date: 2026-07-01 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "9f3a2d1c8b45"
down_revision: Union[str, None] = "6c1f8d7a9e21"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "usuario",
        sa.Column("nome", sa.String(length=255), nullable=False, server_default="Nome nao informado"),
    )
    op.alter_column("usuario", "nome", server_default=None)


def downgrade() -> None:
    op.drop_column("usuario", "nome")
