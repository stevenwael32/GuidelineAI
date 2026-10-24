"""
RAG pipeline orchestration.

  query
    -> embed query
    -> retrieve top_k from Chroma (retrieval.py)
    -> evaluate safety / refusal gates (refusal.py)
    -> if refused: return grounded refusal (NO generation call)
    -> if sufficient: generate grounded answer (generation.py)
    -> structured response

The backend is the single source of truth: if refused=True, no answer
is generated. The frontend only renders what this pipeline returns.
"""

import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional

from app.rag import refusal as refusal_module
from app.rag.generation import GenerationUnavailable, LLMClient
from app.rag.retrieval import retrieve


def run_query(
    query: str,
    collection,
    embedding_model,
    llm_client: Optional[LLMClient],
    top_k: int,
    distance_threshold: float,
) -> Dict:
    query_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()

    retrieved = retrieve(collection, embedding_model, query, top_k)

    if not retrieved:
        return {
            "id": query_id,
            "query": query,
            "status": "refused",
            "answer": None,
            "refused": True,
            "confidence": "insufficient",
            "refusal_reasons": ["no_retrieval"],
            "recommendation": (
                "I couldn't find enough information in the indexed guideline to answer this "
                "confidently. The search did not return usable evidence. Try rephrasing the "
                "question or consult a clinician directly."
            ),
            "question_suggestion": None,
            "evidence": [],
            "retrieval": {
                "top_k": top_k,
                "retrieved_chunks": 0,
                "top_similarity_percent": None,
                "top_distance": None,
                "distance_threshold": distance_threshold,
                "embedding_model": embedding_model.model_name,
                "collection": collection.name,
            },
            "created_at": created_at,
        }

    top = retrieved[0]
    retrieved_text = "\n\n".join(doc["text"] for doc in retrieved)

    refusal_reasons = refusal_module.evaluate_refusal_gates(
        query=query,
        retrieved_text=retrieved_text,
        top_distance=top["distance"],
        distance_threshold=distance_threshold,
    )
    refused = len(refusal_reasons) > 0

    evidence = _build_evidence(retrieved)
    retrieval_details = {
        "top_k": top_k,
        "retrieved_chunks": len(retrieved),
        "top_similarity_percent": top["similarity_percent"],
        "top_distance": top["distance"],
        "distance_threshold": distance_threshold,
        "embedding_model": embedding_model.model_name,
        "collection": collection.name,
    }

    if refused:
        recommendation = refusal_module.build_refusal_response(refusal_reasons)
        suggestion = refusal_module.suggest_better_question(refusal_reasons)
        return {
            "id": query_id,
            "query": query,
            "status": "refused",
            "answer": None,
            "refused": True,
            "confidence": "insufficient",
            "refusal_reasons": refusal_reasons,
            "recommendation": recommendation,
            "question_suggestion": suggestion,
            "evidence": evidence,
            "retrieval": retrieval_details,
            "created_at": created_at,
        }

    # Evidence is sufficient -- attempt grounded generation.
    if llm_client is None:
        return {
            "id": query_id,
            "query": query,
            "status": "generation_unavailable",
            "answer": None,
            "refused": False,
            "confidence": "sufficient",
            "refusal_reasons": [],
            "recommendation": (
                "The indexed guideline contains sufficiently relevant evidence to support this "
                "question, but response generation is currently unavailable."
            ),
            "question_suggestion": None,
            "evidence": evidence,
            "retrieval": retrieval_details,
            "created_at": created_at,
        }

    try:
        answer = llm_client.generate(query, retrieved)
        status = "answered"
        recommendation = None
    except GenerationUnavailable:
        answer = None
        status = "generation_unavailable"
        recommendation = (
            "The indexed guideline contains sufficiently relevant evidence to support this "
            "question, but response generation is currently unavailable."
        )

    return {
        "id": query_id,
        "query": query,
        "status": status,
        "answer": answer,
        "refused": False,
        "confidence": "sufficient",
        "refusal_reasons": [],
        "recommendation": recommendation,
        "question_suggestion": None,
        "evidence": evidence,
        "retrieval": retrieval_details,
        "created_at": created_at,
    }


def _build_evidence(retrieved: List[Dict]) -> List[Dict]:
    evidence = []
    for rank, doc in enumerate(retrieved, start=1):
        metadata = doc.get("metadata", {}) or {}
        evidence.append(
            {
                "rank": rank,
                "chunk_id": doc["id"],
                "section": metadata.get("section"),
                "start_page": metadata.get("start_page"),
                "end_page": metadata.get("end_page"),
                "similarity": doc["similarity"],
                "similarity_percent": doc["similarity_percent"],
                "distance": doc["distance"],
                "text": doc["text"],
            }
        )
    return evidence
