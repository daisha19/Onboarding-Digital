"""add default tipo_documento

Revision ID: 8b1c4e6f2a9d
Revises: 9f3a2d1c8b45
Create Date: 2026-07-02

"""
from typing import Sequence, Union

from alembic import op


revision: str = "8b1c4e6f2a9d"
down_revision: Union[str, None] = "9f3a2d1c8b45"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_TIPOS_DOCUMENTO = [
    ("RG_CNH", "Documento de Identidade (RG ou CNH)", True),
    ("CPF", "Inscrição do CPF", True),
    ("RESIDENCIA", "Comprovante de Residência", True),
    ("CTPS", "Carteira de Trabalho (CTPS)", True),
    ("PIS_PASEP", "PIS/PASEP", False),
    ("TITULO_ELEITOR", "Título de Eleitor", False),
    ("DIPLOMA", "Diploma ou Histórico Escolar", False),
    ("EXAME_ADMISSIONAL", "Exame Admissional", True),
]


def upgrade() -> None:
    for nome_doc, descricao, obrigatorio in _TIPOS_DOCUMENTO:
        op.execute(
            f"""
            INSERT INTO tipo_documento ("nomeDoc", descricao, obrigatorio)
            VALUES ('{nome_doc}', '{descricao}', {obrigatorio})
            ON CONFLICT ("nomeDoc") DO NOTHING;
            """
        )


def downgrade() -> None:
    nomes = ", ".join(f"'{nome_doc}'" for nome_doc, _, _ in _TIPOS_DOCUMENTO)
    op.execute(f'DELETE FROM tipo_documento WHERE "nomeDoc" IN ({nomes});')
