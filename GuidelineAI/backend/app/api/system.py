from datetime import datetime, timezone

from fastapi import APIRouter

from app.config import settings
from app.schemas import ComponentStatus, SystemStatus
from app.services.guideline_service import app_state

router = APIRouter(tags=["system"])


@router.get("/api/system/status", response_model=SystemStatus)
def system_status():
    components = []

    # Guideline
    if app_state.is_indexed:
        components.append(
            ComponentStatus(name="Guideline", status="ready", detail=f"{app_state.collection.count()} chunks indexed")
        )
    else:
        components.append(
            ComponentStatus(name="Guideline", status="unavailable", detail="No guideline is currently indexed")
        )

    # Embedding model
    if app_state.embedding_model is not None:
        components.append(
            ComponentStatus(name="Embedding Model", status="ready", detail=settings.EMBEDDING_MODEL_NAME)
        )
    else:
        components.append(
            ComponentStatus(
                name="Embedding Model", status="unavailable", detail=app_state.embedding_model_error or "Not loaded"
            )
        )

    # Vector database
    if app_state.collection is not None:
        components.append(ComponentStatus(name="Vector Database", status="ready", detail="Chroma (persistent)"))
    else:
        components.append(
            ComponentStatus(
                name="Vector Database", status="unavailable", detail=app_state.vector_db_error or "Not connected"
            )
        )

    # Retrieval engine
    retrieval_ready = app_state.embedding_model is not None and app_state.collection is not None
    components.append(
        ComponentStatus(
            name="Retrieval Engine",
            status="ready" if retrieval_ready else "unavailable",
            detail="Semantic retrieval over the indexed guideline" if retrieval_ready else "Requires embedding model + vector database",
        )
    )

    # Evidence evaluation (pure logic, ready whenever retrieval is ready)
    components.append(
        ComponentStatus(
            name="Evidence Evaluation",
            status="ready" if retrieval_ready else "warning",
            detail="Similarity + faithfulness checks" if retrieval_ready else "Waiting on retrieval engine",
        )
    )

    # Refusal / safety layer (pure logic, always available)
    components.append(
        ComponentStatus(name="Refusal Layer", status="ready", detail="Deterministic safety + evidence-boundary gates")
    )

    # LLM
    if app_state.llm_client is not None:
        components.append(ComponentStatus(name="LLM", status="ready", detail=settings.LLM_MODEL))
    else:
        components.append(
            ComponentStatus(name="LLM", status="unavailable", detail=app_state.llm_error or "Not configured")
        )

    statuses = [c.status for c in components]
    if "unavailable" in statuses:
        overall = "warning" if any(s == "ready" for s in statuses) else "unavailable"
    elif "warning" in statuses:
        overall = "warning"
    else:
        overall = "ready"

    return SystemStatus(overall=overall, components=components, checked_at=datetime.now(timezone.utc).isoformat())
