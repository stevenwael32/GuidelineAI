"""
Real analytics + recent-questions storage.

Every /api/query call is persisted to a local SQLite database. All
analytics and "recent questions" data is derived from these rows --
nothing is fabricated. If no queries have been made yet, callers get
an explicit "no data" state rather than invented numbers.
"""

import json
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Dict, List, Optional

from app.config import settings

_SCHEMA = """
CREATE TABLE IF NOT EXISTS queries (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    query TEXT NOT NULL,
    status TEXT NOT NULL,
    refused INTEGER NOT NULL,
    confidence TEXT NOT NULL,
    top_similarity_percent REAL,
    refusal_reasons TEXT,
    answer TEXT,
    recommendation TEXT,
    evidence TEXT,
    retrieval TEXT
);
"""


def _db_path() -> Path:
    path = Path(settings.ANALYTICS_DB_PATH)
    path.parent.mkdir(parents=True, exist_ok=True)
    return path


@contextmanager
def _connection():
    conn = sqlite3.connect(_db_path())
    try:
        conn.execute(_SCHEMA)
        yield conn
        conn.commit()
    finally:
        conn.close()


def record_query(result: Dict) -> None:
    with _connection() as conn:
        conn.execute(
            """
            INSERT INTO queries (
                id, created_at, query, status, refused, confidence,
                top_similarity_percent, refusal_reasons, answer,
                recommendation, evidence, retrieval
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                result["id"],
                result["created_at"],
                result["query"],
                result["status"],
                int(result["refused"]),
                result["confidence"],
                (result.get("retrieval") or {}).get("top_similarity_percent"),
                json.dumps(result.get("refusal_reasons") or []),
                result.get("answer"),
                result.get("recommendation"),
                json.dumps(result.get("evidence") or []),
                json.dumps(result.get("retrieval") or {}),
            ),
        )


def get_query(query_id: str) -> Optional[Dict]:
    with _connection() as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute("SELECT * FROM queries WHERE id = ?", (query_id,)).fetchone()
        if not row:
            return None
        return _row_to_full(row)


def get_history(limit: int = 25) -> List[Dict]:
    with _connection() as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            "SELECT * FROM queries ORDER BY created_at DESC LIMIT ?", (limit,)
        ).fetchall()
        return [
            {
                "id": row["id"],
                "query": row["query"],
                "status": row["status"],
                "refused": bool(row["refused"]),
                "confidence": row["confidence"],
                "top_similarity_percent": row["top_similarity_percent"],
                "created_at": row["created_at"],
            }
            for row in rows
        ]


def _row_to_full(row: sqlite3.Row) -> Dict:
    return {
        "id": row["id"],
        "query": row["query"],
        "status": row["status"],
        "refused": bool(row["refused"]),
        "confidence": row["confidence"],
        "refusal_reasons": json.loads(row["refusal_reasons"] or "[]"),
        "answer": row["answer"],
        "recommendation": row["recommendation"],
        "question_suggestion": None,
        "evidence": json.loads(row["evidence"] or "[]"),
        "retrieval": json.loads(row["retrieval"] or "{}") or None,
        "created_at": row["created_at"],
    }


def get_summary() -> Dict:
    with _connection() as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute("SELECT * FROM queries ORDER BY created_at ASC").fetchall()

    if not rows:
        return {"has_data": False}

    total = len(rows)
    answered = sum(1 for r in rows if r["status"] == "answered")
    refused = sum(1 for r in rows if r["status"] == "refused")
    gen_unavailable = sum(1 for r in rows if r["status"] == "generation_unavailable")

    similarities = [r["top_similarity_percent"] for r in rows if r["top_similarity_percent"] is not None]
    avg_similarity = sum(similarities) / len(similarities) if similarities else None

    evidence_supported = sum(1 for r in rows if not r["refused"] and r["status"] != "not_indexed")
    evidence_supported_rate = (evidence_supported / total * 100) if total else None

    # Questions over time (grouped by date)
    by_day: Dict[str, int] = {}
    for r in rows:
        day = r["created_at"][:10]
        by_day[day] = by_day.get(day, 0) + 1
    questions_over_time = [{"date": day, "count": count} for day, count in sorted(by_day.items())]

    # Status distribution
    status_counts: Dict[str, int] = {}
    for r in rows:
        status_counts[r["status"]] = status_counts.get(r["status"], 0) + 1
    status_distribution = [{"status": k, "count": v} for k, v in status_counts.items()]

    # Similarity distribution (10-point buckets)
    buckets: Dict[str, int] = {}
    for sim in similarities:
        bucket_start = int(sim // 10) * 10
        label = f"{bucket_start}-{bucket_start + 10}%"
        buckets[label] = buckets.get(label, 0) + 1
    similarity_distribution = [
        {"bucket": k, "count": v} for k, v in sorted(buckets.items(), key=lambda kv: int(kv[0].split("-")[0]))
    ]

    # Refusal reason distribution
    reason_counts: Dict[str, int] = {}
    for r in rows:
        for reason in json.loads(r["refusal_reasons"] or "[]"):
            reason_counts[reason] = reason_counts.get(reason, 0) + 1
    refusal_reason_distribution = [{"reason": k, "count": v} for k, v in reason_counts.items()]

    return {
        "has_data": True,
        "total_questions": total,
        "answered": answered,
        "refused": refused,
        "generation_unavailable": gen_unavailable,
        "average_similarity_percent": avg_similarity,
        "evidence_supported_rate": evidence_supported_rate,
        "questions_over_time": questions_over_time,
        "status_distribution": status_distribution,
        "similarity_distribution": similarity_distribution,
        "refusal_reason_distribution": refusal_reason_distribution,
    }
