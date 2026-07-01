import logging
import smtplib
from email.message import EmailMessage

from app.core.config import settings


logger = logging.getLogger(__name__)


def send_email(to_email: str, subject: str, body: str) -> None:
    from_email = settings.EMAIL_FROM or settings.SMTP_USER

    if not settings.SMTP_HOST or not from_email:
        logger.info(
            "SMTP nao configurado. Email para %s | Assunto: %s | Corpo: %s",
            to_email,
            subject,
            body,
        )
        return

    message = EmailMessage()
    message["From"] = from_email
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body)

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as smtp:
            if settings.SMTP_USE_TLS:
                smtp.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            smtp.send_message(message)
    except (smtplib.SMTPException, OSError):
        logger.exception("Falha ao enviar email para %s.", to_email)
