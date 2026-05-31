from datetime import date

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UsuarioBase(BaseModel):
    email: EmailStr


class ColaboradorCreate(UsuarioBase):
    senha: str = Field(min_length=6)
    cpf: str = Field(min_length=11, max_length=11)
    dataNascimento: date


class RHCreate(UsuarioBase):
    senha: str = Field(min_length=6)
    matricula: int
    cargo: str = Field(min_length=2, max_length=100)


class UsuarioMe(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idUsuario: int
    email: EmailStr
    perfil: str


class ColaboradorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    cpf: str
    dataNascimento: date
    idUsuario: int
    email: EmailStr


class RHResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    matricula: int
    cargo: str
    idUsuario: int
    email: EmailStr
