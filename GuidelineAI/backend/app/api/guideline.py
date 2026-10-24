from fastapi import APIRouter

from app.schemas import GuidelineInfo
from app.services.guideline_service import app_state

router = APIRouter(tags=["guideline"])


@router.get("/api/guideline", response_model=GuidelineInfo)
def get_guideline():
    return GuidelineInfo(**app_state.guideline_info())
