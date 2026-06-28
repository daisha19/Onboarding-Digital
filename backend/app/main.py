from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.api.routes import auth, documento, documentos, health, usuarios
from app.core.config import settings
from app.db.session import engine
from app.models.document import StatusDocumento, TipoDocumento

_TIPOS_DOCUMENTO = [
    {"nomeDoc": "RG_CNH", "descricao": "Documento de Identidade (RG ou CNH)", "obrigatorio": True},
    {"nomeDoc": "CPF", "descricao": "Inscrição do CPF", "obrigatorio": True},
    {"nomeDoc": "RESIDENCIA", "descricao": "Comprovante de Residência", "obrigatorio": True},
    {"nomeDoc": "CTPS", "descricao": "Carteira de Trabalho (CTPS)", "obrigatorio": True},
    {"nomeDoc": "PIS_PASEP", "descricao": "PIS/PASEP", "obrigatorio": False},
    {"nomeDoc": "TITULO_ELEITOR", "descricao": "Título de Eleitor", "obrigatorio": False},
    {"nomeDoc": "DIPLOMA", "descricao": "Diploma ou Histórico Escolar", "obrigatorio": False},
    {"nomeDoc": "EXAME_ADMISSIONAL", "descricao": "Exame Admissional", "obrigatorio": True},
]

_STATUS_DOCUMENTO = [
    {"nomeStatus": "pendente", "descricao": "Documento pendente de envio"},
    {"nomeStatus": "PENDENTE", "descricao": "Documento pendente de envio"},
    {"nomeStatus": "em_analise", "descricao": "Documento em análise pelo RH"},
    {"nomeStatus": "aprovado", "descricao": "Documento aprovado pelo RH"},
    {"nomeStatus": "rejeitado", "descricao": "Documento rejeitado pelo RH"},
]


def _seed_db() -> None:
    with Session(engine) as db:
        for t in _TIPOS_DOCUMENTO:
            if db.get(TipoDocumento, t["nomeDoc"]) is None:
                db.add(TipoDocumento(**t))
        for s in _STATUS_DOCUMENTO:
            if db.get(StatusDocumento, s["nomeStatus"]) is None:
                db.add(StatusDocumento(**s))
        db.commit()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    _seed_db()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        description=settings.PROJECT_DESCRIPTION,
        version=settings.API_VERSION,
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router)
    app.include_router(health.router)
    app.include_router(usuarios.router)
    app.include_router(documentos.router)
    app.include_router(documento.router)

    return app


app = create_app()
