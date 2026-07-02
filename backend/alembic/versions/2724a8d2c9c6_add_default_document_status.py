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
        ('pendente', 'Documento aguardando análise'),
        ('em_analise', 'Documento em análise'),
        ('aprovado', 'Documento aprovado'),
        ('rejeitado', 'Documento rejeitado')
        ON CONFLICT ("nomeStatus") DO NOTHING;
    """)

    op.execute("""
        INSERT INTO acao_auditoria ("nomeAcao", descricao)
        VALUES
        ('alterar_status_documento', 'Alteração de status de documento')
        ON CONFLICT ("nomeAcao") DO NOTHING;
    """)


def downgrade() -> None:
    op.execute("""
        DELETE FROM acao_auditoria
        WHERE "nomeAcao" = 'alterar_status_documento';
    """)

    op.execute("""
        DELETE FROM status_documento
        WHERE "nomeStatus" IN ('pendente', 'em_analise', 'aprovado', 'rejeitado');
    """)