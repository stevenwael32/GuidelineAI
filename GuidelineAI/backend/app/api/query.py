from typing import List

from fastapi import APIRouter, HTTPException

from app.config import settings
from app.core.exceptions import GuidelineNotIndexedError
from app.rag.pipeline import run_query
from app.schemas import HistoryItem, QueryRequest, QueryResponse
from app.services import analytics_service
from app.services.guideline_service import app_state

router = APIRouter(tags=["query"])


@router.post("/api/query", response_model=QueryResponse)
def post_query(payload: QueryRequest):
    if not payload.query.strip():
        raise HTTPException(status_code=422, detail="Query must not be empty.")

    if not app_state.is_indexed or app_state.embedding_model is None:
        raise GuidelineNotIndexedError()

    result = run_query(
        query=payload.query.strip(),
        collection=app_state.collection,
        embedding_model=app_state.embedding_model,
        llm_client=app_state.llm_client,
        top_k=settings.RETRIEVAL_TOP_K,
        distance_threshold=settings.DISTANCE_THRESHOLD,
    )

    analytics_service.record_query(result)
    return QueryResponse(**result)


@router.get("/api/query/history", response_model=List[HistoryItem])
def get_history(limit: int = 25):
    return [HistoryItem(**item) for item in analytics_service.get_history(limit=limit)]


@router.get("/api/query/{query_id}", response_model=QueryResponse)
def get_query_result(query_id: str):
    result = analytics_service.get_query(query_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Question not found.")
    return QueryResponse(**result)
