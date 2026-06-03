import argparse

from sqlalchemy.exc import IntegrityError

from app.db.session import SessionLocal
from app.schemas.user import RHCreate
from app.services.user_service import create_rh, get_user_by_email


def main() -> None:
    parser = argparse.ArgumentParser(description="Cria o primeiro usuário RH.")
    parser.add_argument("--email", required=True)
    parser.add_argument("--senha", required=True)
    parser.add_argument("--matricula", required=True, type=int)
    parser.add_argument("--cargo", required=True)
    args = parser.parse_args()

    db = SessionLocal()
    try:
        if get_user_by_email(db, args.email) is not None:
            raise SystemExit("Já existe um usuário com esse e-mail.")

        rh = create_rh(
            db,
            RHCreate(
                email=args.email,
                senha=args.senha,
                matricula=args.matricula,
                cargo=args.cargo,
            ),
        )
        print(f"RH inicial criado: idUsuario={rh.idUsuario}, matricula={rh.matricula}")
    except IntegrityError as exc:
        db.rollback()
        raise SystemExit("Não foi possível criar o RH inicial: dados duplicados.") from exc
    finally:
        db.close()


if __name__ == "__main__":
    main()
