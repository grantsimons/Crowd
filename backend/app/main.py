from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.settings import get_settings
from .api.v1.health import router as health_router
from .api.v1.ideas import router as ideas_router


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.APP_NAME)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    api = FastAPI()
    app.include_router(health_router, prefix="/api/v1")
    app.include_router(ideas_router, prefix="/api/v1")

    return app


app = create_app()

