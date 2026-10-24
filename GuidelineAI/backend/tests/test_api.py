"""
API-level tests using FastAPI's TestClient against the real app.

These do not mock the RAG pipeline. When no guideline PDF has been
indexed in this environment, the app is still expected to start
cleanly and report an honest "not indexed" / "unavailable" state
rather than fabricating data (Phase 32 / Phase 36 of the spec). If a
real guideline has been indexed (scripts/build_index.py has been
run), the full-pipeline tests exercise the actual retrieval + refusal
+ generation flow end to end.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.guideline_service import app_state

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_system_status_shape():
    response = client.get("/api/system/status")
    assert response.status_code == 200
    body = response.json()
    assert "overall" in body
    names = {c["name"] for c in body["components"]}
    assert {"Guideline", "Embedding Model", "Vector Database", "Retrieval Engine", "Refusal Layer", "LLM"} <= names


def test_guideline_endpoint_reflects_real_index_state():
    response = client.get("/api/guideline")
    assert response.status_code == 200
    body = response.json()
    assert body["indexed"] == app_state.is_indexed
    if not app_state.is_indexed:
        assert body["chunk_count"] is None


def test_empty_query_is_rejected():
    response = client.post("/api/query", json={"query": "   "})
    assert response.status_code == 422


def test_query_without_indexed_guideline_returns_honest_unavailable_error():
    if app_state.is_indexed:
        pytest.skip("A guideline is indexed in this environment; unavailable-path not applicable.")

    response = client.post("/api/query", json={"query": "What is the target blood pressure?"})
    assert response.status_code == 503
    assert response.json()["detail"] == "No clinical guideline is currently indexed."


def test_analytics_reports_no_data_state_when_empty():
    response = client.get("/api/analytics")
    assert response.status_code == 200
    body = response.json()
    assert "has_data" in body


@pytest.mark.skipif(not app_state.is_indexed, reason="Requires a real indexed guideline (run scripts/build_index.py).")
def test_valid_query_runs_the_real_pipeline():
    response = client.post(
        "/api/query", json={"query": "What is the clinic blood pressure threshold for diagnosing hypertension?"}
    )
    assert response.status_code == 200
    body = response.json()
    assert body["query"]
    assert body["status"] in {"answered", "refused", "generation_unavailable"}
    assert isinstance(body["evidence"], list)


@pytest.mark.skipif(not app_state.is_indexed, reason="Requires a real indexed guideline (run scripts/build_index.py).")
def test_urgent_red_flag_query_is_refused_by_the_real_pipeline():
    response = client.post(
        "/api/query",
        json={
            "query": (
                "My blood pressure right now is 210/125 and I have a severe headache and "
                "blurred vision — should I just take an extra dose of my ACE inhibitor now?"
            )
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["refused"] is True
    assert "urgent_clinical_red_flags" in body["refusal_reasons"]
