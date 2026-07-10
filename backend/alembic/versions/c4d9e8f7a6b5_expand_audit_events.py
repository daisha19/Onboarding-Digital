"""expand audit events

Revision ID: c4d9e8f7a6b5
Revises: 8b1c4e6f2a9d
Create Date: 2026-07-05

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "c4d9e8f7a6b5"
down_revision: Union[str, None] = "8b1c4e6f2a9d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


_ACTIONS = (
    ("upload_documento", "Upload de documento"),
    ("aprovar_documento", "Aprovação de documento"),
    ("rejeitar_documento", "Rejeição de documento"),
    ("marcar_documento_em_analise", "Documento colocado em análise"),
    ("cadastrar_colaborador", "Cadastro de colaborador"),
    ("login_sucesso", "Login bem-sucedido"),
    ("login_falha", "Falha de login"),
    ("logout", "Logout"),
    ("download_documento", "Download de documento"),
    ("excluir_documento", "Exclusao de documento"),
    ("acesso_negado", "Acesso negado"),
)


def upgrade() -> None:
    op.drop_constraint(
        "log_auditoria_idDoc_fkey",
        "log_auditoria",
        type_="foreignkey",
    )
    op.alter_column(
        "log_auditoria",
        "idDoc",
        existing_type=sa.Integer(),
        nullable=True,
    )
    op.create_foreign_key(
        "fk_log_auditoria_documento",
        "log_auditoria",
        "documento",
        ["idDoc"],
        ["idDoc"],
        ondelete="SET NULL",
    )

    for name, description in _ACTIONS:
        op.execute(
            sa.text(
                """
                INSERT INTO acao_auditoria ("nomeAcao", descricao)
                VALUES (:name, :description)
                ON CONFLICT ("nomeAcao") DO UPDATE
                SET descricao = EXCLUDED.descricao
                """
            ).bindparams(name=name, description=description)
        )


def downgrade() -> None:
    action_names = ", ".join(f"'{name}'" for name, _ in _ACTIONS)
    op.execute(f'DELETE FROM log_auditoria WHERE "nomeAcao" IN ({action_names})')
    op.execute(f'DELETE FROM acao_auditoria WHERE "nomeAcao" IN ({action_names})')
    op.drop_constraint(
        "fk_log_auditoria_documento",
        "log_auditoria",
        type_="foreignkey",
    )
    op.alter_column(
        "log_auditoria",
        "idDoc",
        existing_type=sa.Integer(),
        nullable=False,
    )
    op.create_foreign_key(
        "log_auditoria_idDoc_fkey",
        "log_auditoria",
        "documento",
        ["idDoc"],
        ["idDoc"],
    )
