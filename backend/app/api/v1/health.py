from fastapi import APIRouter
from ...core.settings import get_settings

router = APIRouter()


@router.get("/health")
def health() -> dict[str, str]:
    s = get_settings()
    return {"status": "ok", "app": s.APP_NAME}

