"""
GuidelineAI backend configuration.

All values are sourced from environment variables (.env) so that no
secrets or environment-specific paths are hardcoded. Defaults mirror
the configuration actually used in the source notebook:

  RAG_HuggingFace_all_MiniLM_L6_v2_quality_gates_with_LLM.ipynb
"""

from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BACKEND_DIR.parent
DEFAULT_DATA_DIR = PROJECT_ROOT / "data"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # --- App ---
    APP_NAME: str = "GuidelineAI"
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    # --- Guideline source (same PDF referenced by the notebook) ---
    GUIDELINE_PDF_PATH: str = str(DEFAULT_DATA_DIR / "guidelines" / "hypertension.pdf")
    GUIDELINE_DOCUMENT_NAME: str = "NICE_Hypertension_Guideline"
    GUIDELINE_DISPLAY_TITLE: str = "Hypertension in adults: diagnosis and management (NICE NG136)"

    # --- Vector database (Chroma, same collection name as the notebook) ---
    CHROMA_PERSIST_DIR: str = str(DEFAULT_DATA_DIR / "chroma")
    CHROMA_COLLECTION_NAME: str = "nice_hypertension"

    # --- Embedding model (same model as the notebook) ---
    EMBEDDING_MODEL_NAME: str = "sentence-transformers/all-MiniLM-L6-v2"

    # --- Chunking (same parameters as the notebook's final chunker) ---
    CHUNK_SIZE_TOKENS: int = 400
    CHUNK_OVERLAP_TOKENS: int = 50

    # --- Retrieval / refusal gates (same values as the notebook's refusal test) ---
    RETRIEVAL_TOP_K: int = 5
    DISTANCE_THRESHOLD: float = 0.65

    # --- LLM generation (Hugging Face Inference API, same as the notebook) ---
    HF_TOKEN: str = ""
    LLM_MODEL: str = "meta-llama/Llama-3.1-8B-Instruct"
    LLM_MAX_TOKENS: int = 512
    LLM_TEMPERATURE: float = 0.1

    # --- Analytics / history storage ---
    ANALYTICS_DB_PATH: str = str(DEFAULT_DATA_DIR / "analytics.sqlite3")

    # --- Index manifest (written by scripts/build_index.py) ---
    INDEX_MANIFEST_PATH: str = str(DEFAULT_DATA_DIR / "chroma" / "index_manifest.json")

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
