import logging
import smtplib
from email.message import EmailMessage

from app.core.config import settings


logger = logging.getLogger(__name__)


class EmailDeliveryError(RuntimeError):
    """Raised when a transactional email cannot be delivered."""


def send_email(to_email: str, subject: str, body: str) -> None:
    from_email = settings.EMAIL_FROM or settings.SMTP_USER

    if not settings.SMTP_HOST or not from_email:
        logger.warning("SMTP nao configurado; email para %s nao foi enviado.", to_email)
        raise EmailDeliveryError("Servico de e-mail nao configurado.")

    message = EmailMessage()
    message["From"] = from_email
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body)

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as smtp:
            if settings.SMTP_USE_TLS:
                smtp.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            smtp.send_message(message)
    except (smtplib.SMTPException, OSError) as exc:
        logger.exception("Falha ao enviar email para %s.", to_email)
        raise EmailDeliveryError("Nao foi possivel enviar o e-mail.") from exc
