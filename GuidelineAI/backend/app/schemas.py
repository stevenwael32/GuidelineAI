"""Pydantic response/request models for the GuidelineAI API.

Every field here is populated from real backend computation — either
the RAG pipeline (retrieval, refusal gates, generation) or genuine
system/analytics state. No field is fabricated; fields that have no
real value are omitted or returned as null / empty collections.
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# ------------------------------------------------------------------
# Query
# ------------------------------------------------------------------

class QueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000)


class EvidenceItem(BaseModel):
    rank: int
    chunk_id: str
    section: Optional[str] = None
    start_page: Optional[int] = None
    end_page: Optional[int] = None
    similarity: float
    similarity_percent: float
    distance: float
    text: str


class RetrievalDetails(BaseModel):
    top_k: int
    retrieved_chunks: int
    top_similarity_percent: Optional[float] = None
    top_distance: Optional[float] = None
    distance_threshold: float
    embedding_model: str
    collection: str


class QueryResponse(BaseModel):
    id: str
    query: str
    status: str  # "answered" | "refused" | "generation_unavailable" | "not_indexed"
    answer: Optional[str] = None
    refused: bool
    confidence: str  # "sufficient" | "insufficient"
    refusal_reasons: List[str] = Field(default_factory=list)
    recommendation: Optional[str] = None
    question_suggestion: Optional[str] = None
    evidence: List[EvidenceItem] = Field(default_factory=list)
    retrieval: Optional[RetrievalDetails] = None
    created_at: str


class HistoryItem(BaseModel):
    id: str
    query: str
    status: str
    refused: bool
    confidence: str
    top_similarity_percent: Optional[float] = None
    created_at: str


# ------------------------------------------------------------------
# Guideline
# ------------------------------------------------------------------

class GuidelineInfo(BaseModel):
    indexed: bool
    document_name: Optional[str] = None
    display_title: Optional[str] = None
    chunk_count: Optional[int] = None
    embedding_model: Optional[str] = None
    embedding_dimension: Optional[int] = None
    vector_database: Optional[str] = None
    collection: Optional[str] = None
    chunk_size_tokens: Optional[int] = None
    chunk_overlap_tokens: Optional[int] = None
    source_pdf: Optional[str] = None
    sections: List[str] = Field(default_factory=list)
    last_indexed_at: Optional[str] = None


# ------------------------------------------------------------------
# System status
# ------------------------------------------------------------------

class ComponentStatus(BaseModel):
    name: str
    status: str  # "ready" | "warning" | "unavailable"
    detail: str


class SystemStatus(BaseModel):
    overall: str
    components: List[ComponentStatus]
    checked_at: str


# ------------------------------------------------------------------
# Analytics
# ------------------------------------------------------------------

class AnalyticsSummary(BaseModel):
    has_data: bool
    total_questions: int = 0
    answered: int = 0
    refused: int = 0
    generation_unavailable: int = 0
    average_similarity_percent: Optional[float] = None
    evidence_supported_rate: Optional[float] = None
    questions_over_time: List[Dict[str, Any]] = Field(default_factory=list)
    status_distribution: List[Dict[str, Any]] = Field(default_factory=list)
    similarity_distribution: List[Dict[str, Any]] = Field(default_factory=list)
    refusal_reason_distribution: List[Dict[str, Any]] = Field(default_factory=list)


# ------------------------------------------------------------------
# Evaluation
# ------------------------------------------------------------------

class EvaluationTestResult(BaseModel):
    name: str
    query: str
    expected_behavior: str
    refused: bool
    refusal_reasons: List[str]
    passed: bool
    detail: str


class EvaluationReport(BaseModel):
    available: bool
    tests: List[EvaluationTestResult] = Field(default_factory=list)
    quality_gate_1: Optional[Dict[str, Any]] = None
    quality_gate_2: Optional[Dict[str, Any]] = None
    quality_gate_3: Optional[Dict[str, Any]] = None
