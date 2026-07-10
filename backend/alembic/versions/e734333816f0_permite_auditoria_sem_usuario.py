"""permite auditoria sem usuario

Revision ID: e73a33316f0
Revises: c4d9e8f7a6b5
Create Date: 2026-07-09

"""
from typing import Sequence, Union

from alembic import op


revision: str = "e73a33316f0"
down_revision: Union[str, None] = "c4d9e8f7a6b5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "log_auditoria",
        "idUsuario",
        nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "log_auditoria",
        "idUsuario",
        nullable=False,
    )