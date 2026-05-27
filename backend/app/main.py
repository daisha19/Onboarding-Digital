from fastapi import FastAPI

app = FastAPI(
    title="Onboarding Digital API",
    description="API inicial do sistema de onboarding digital",
    version="1.0.0"
)

@app.get("/")
def read_root():
    return {
        "message": "Backend do Onboarding Digital funcionando"
    }

@app.get("/health")
def health_check():
    return {
        "status": "ok"
    }