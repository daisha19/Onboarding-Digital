from fastapi import HTTPException, status


def invalid_login_error():
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={
            "code": "INVALID_LOGIN",
            "message": "E-mail ou senha inválidos."
        },
        headers={"WWW-Authenticate": "Bearer"},
    )


def missing_token_error():
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={
            "code": "MISSING_TOKEN",
            "message": "Token de autenticação não enviado."
        },
        headers={"WWW-Authenticate": "Bearer"},
    )


def invalid_token_error():
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={
            "code": "INVALID_TOKEN",
            "message": "Token inválido ou expirado."
        },
        headers={"WWW-Authenticate": "Bearer"},
    )


def insufficient_permission_error():
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail={
            "code": "INSUFFICIENT_PERMISSION",
            "message": "Permissão insuficiente para acessar este recurso."
        },
    )