"""
Application state: loads the embedding model, the persistent Chroma
collection, and the LLM client once at startup (Phase 38 — avoid
reloading expensive models per request), and exposes real status /
metadata about what is actually indexed.
"""

import json
from pathlib import Path
from typing import Optional

from app.config import settings
from app.core.logging import get_logger
from app.rag.embeddings import EmbeddingModel, get_embedding_model
from app.rag.generation import LLMClient, get_llm_client

logger = get_logger(__name__)


class AppState:
    def __init__(self) -> None:
        self.embedding_model: Optional[EmbeddingModel] = None
        self.embedding_model_error: Optional[str] = None

        self.chroma_client = None
        self.collection = None
        self.vector_db_error: Optional[str] = None

        self.llm_client: Optional[LLMClient] = None
        self.llm_error: Optional[str] = None

        self.manifest: dict = {}

    def startup(self) -> None:
        self._load_embedding_model()
        self._load_vector_db()
        self._load_llm_client()
        self._load_manifest()

    def _load_embedding_model(self) -> None:
        try:
            self.embedding_model = get_embedding_model(settings.EMBEDDING_MODEL_NAME)
            logger.info("Embedding model loaded: %s", settings.EMBEDDING_MODEL_NAME)
        except Exception as exc:  # noqa: BLE001
            self.embedding_model_error = str(exc)
            logger.warning("Embedding model failed to load: %s", exc)

    def _load_vector_db(self) -> None:
        try:
            import chromadb

            Path(settings.CHROMA_PERSIST_DIR).mkdir(parents=True, exist_ok=True)
            self.chroma_client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)

            existing = [c.name for c in self.chroma_client.list_collections()]
            if settings.CHROMA_COLLECTION_NAME in existing:
                self.collection = self.chroma_client.get_collection(settings.CHROMA_COLLECTION_NAME)
                logger.info(
                    "Chroma collection '%s' loaded (%d chunks)",
                    settings.CHROMA_COLLECTION_NAME,
                    self.collection.count(),
                )
            else:
                self.vector_db_error = "No guideline has been indexed yet."
                logger.warning(self.vector_db_error)
        except Exception as exc:  # noqa: BLE001
            self.vector_db_error = str(exc)
            logger.warning("Chroma failed to load: %s", exc)

    def _load_llm_client(self) -> None:
        self.llm_client = get_llm_client(
            model_name=settings.LLM_MODEL,
            hf_token=settings.HF_TOKEN,
            max_tokens=settings.LLM_MAX_TOKENS,
            temperature=settings.LLM_TEMPERATURE,
        )
        if self.llm_client is None:
            self.llm_error = "HF_TOKEN is not configured."
            logger.warning("LLM client unavailable: %s", self.llm_error)

    def _load_manifest(self) -> None:
        path = Path(settings.INDEX_MANIFEST_PATH)
        if path.exists():
            try:
                self.manifest = json.loads(path.read_text())
            except Exception as exc:  # noqa: BLE001
                logger.warning("Failed to read index manifest: %s", exc)
                self.manifest = {}

    @property
    def is_indexed(self) -> bool:
        return self.collection is not None and self.collection.count() > 0

    def guideline_info(self) -> dict:
        if not self.is_indexed:
            return {"indexed": False}

        sections = self.manifest.get("sections", [])
        return {
            "indexed": True,
            "document_name": self.manifest.get("document_name", settings.GUIDELINE_DOCUMENT_NAME),
            "display_title": self.manifest.get("display_title", settings.GUIDELINE_DISPLAY_TITLE),
            "chunk_count": self.collection.count(),
            "embedding_model": settings.EMBEDDING_MODEL_NAME,
            "embedding_dimension": self.embedding_model.dimension if self.embedding_model else None,
            "vector_database": "Chroma",
            "collection": settings.CHROMA_COLLECTION_NAME,
            "chunk_size_tokens": settings.CHUNK_SIZE_TOKENS,
            "chunk_overlap_tokens": settings.CHUNK_OVERLAP_TOKENS,
            "source_pdf": self.manifest.get("source_pdf"),
            "sections": sections,
            "last_indexed_at": self.manifest.get("indexed_at"),
        }


app_state = AppState()
