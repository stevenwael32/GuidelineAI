from fastapi import APIRouter

from app.schemas import AnalyticsSummary
from app.services import analytics_service

router = APIRouter(tags=["analytics"])


@router.get("/api/analytics", response_model=AnalyticsSummary)
def get_analytics():
    return AnalyticsSummary(**analytics_service.get_summary())
