from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UsuarioBase(BaseModel):
    email: EmailStr


class ColaboradorCreate(UsuarioBase):
    nome: str = Field(min_length=2, max_length=255)
    senha: str = Field(min_length=6)
    cpf: str = Field(min_length=11, max_length=11)
    dataNascimento: date


class RHCreate(UsuarioBase):
    nome: str = Field(min_length=2, max_length=255)
    senha: str = Field(min_length=6)
    matricula: int
    cargo: str = Field(min_length=2, max_length=100)


class UsuarioMe(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idUsuario: int
    nome: str
    email: EmailStr
    perfil: str


class ColaboradorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    cpf: str
    dataNascimento: date
    idUsuario: int
    nome: str
    email: EmailStr


class SolicitacaoCadastroCreate(UsuarioBase):
    nome: str = Field(min_length=2, max_length=150)
    cpf: str = Field(min_length=11, max_length=11)
    dataNascimento: date


class SolicitacaoCadastroResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idSolicitacao: int
    nome: str
    email: EmailStr
    cpf: str
    dataNascimento: date
    status: str
    motivoRecusa: str | None = None
    criadoEm: datetime
    avaliadoEm: datetime | None = None
    avaliadoPorRhId: int | None = None


class SolicitacaoCadastroRecusa(BaseModel):
    motivoRecusa: str | None = Field(default=None, max_length=255)


class PromoverColaboradorRH(BaseModel):
    matricula: int
    cargo: str = Field(min_length=2, max_length=100)


class RHResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    matricula: int
    cargo: str
    idUsuario: int
    nome: str
    email: EmailStr


class ColaboradorPerfilResponse(BaseModel):
    idUsuario: int
    nome: str
    email: EmailStr
    cpf: str
    dataNascimento: date
