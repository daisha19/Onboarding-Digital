"""add default document status

Revision ID: 2724a8d2c9c6
Revises: 80b27029bf5e
Create Date: 2026-06-28

"""
from typing import Sequence, Union

from alembic import op


revision: str = "2724a8d2c9c6"
down_revision: Union[str, None] = "80b27029bf5e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        INSERT INTO status_documento ("nomeStatus", descricao)
        VALUES
        ('EM_ANALISE', 'Documento em análise'),
        ('APROVADO', 'Documento aprovado'),
        ('REJEITADO', 'Documento rejeitado')
        ON CONFLICT ("nomeStatus") DO NOTHING;
    """)


def downgrade() -> None:
    op.execute("""
        DELETE FROM status_documento
        WHERE "nomeStatus" IN ('EM_ANALISE', 'APROVADO', 'REJEITADO');
    """)