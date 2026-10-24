"""
Embedding model wrapper.

Same model as the notebook: sentence-transformers/all-MiniLM-L6-v2,
loaded once and reused (Phase 38 — do not reload per request).
"""

from functools import lru_cache
from typing import List

import numpy as np


class EmbeddingModel:
    def __init__(self, model_name: str):
        from sentence_transformers import SentenceTransformer

        self.model_name = model_name
        self._model = SentenceTransformer(model_name)

    @property
    def dimension(self) -> int:
        return int(self._model.get_sentence_embedding_dimension())

    def encode_one(self, text: str) -> np.ndarray:
        return self._model.encode([text], normalize_embeddings=True)[0]

    def encode_many(self, texts: List[str]) -> np.ndarray:
        return self._model.encode(texts, normalize_embeddings=True, show_progress_bar=False)


@lru_cache(maxsize=1)
def _cached_model(model_name: str) -> EmbeddingModel:
    return EmbeddingModel(model_name)


def get_embedding_model(model_name: str) -> EmbeddingModel:
    """Loads the embedding model once per process and reuses it."""
    return _cached_model(model_name)
