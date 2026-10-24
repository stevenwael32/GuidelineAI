#!/usr/bin/env python3
"""
Build the real Chroma index from the guideline PDF.

Run this once (or whenever the source PDF changes) before starting the
API server:

    python scripts/build_index.py

It performs the exact pipeline validated in the notebook:
  PDF -> unstructured partition -> clean -> section-tag -> chunk
       -> sentence-transformers/all-MiniLM-L6-v2 embeddings
       -> persistent Chroma collection "nice_hypertension"

No guideline content is invented: everything indexed comes from the
PDF at GUIDELINE_PDF_PATH (see backend/.env).
"""

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import settings  # noqa: E402
from app.rag.chunking import build_guideline_chunks  # noqa: E402


def main() -> None:
    pdf_path = Path(settings.GUIDELINE_PDF_PATH)
    if not pdf_path.exists():
        print(f"ERROR: guideline PDF not found at {pdf_path}")
        print("Place your clinical guideline PDF at that path (or set GUIDELINE_PDF_PATH in .env) and re-run.")
        sys.exit(1)

    print(f"Parsing and chunking: {pdf_path}")
    chunks = build_guideline_chunks(
        str(pdf_path),
        chunk_size=settings.CHUNK_SIZE_TOKENS,
        overlap=settings.CHUNK_OVERLAP_TOKENS,
    )
    print(f"Built {len(chunks)} chunks.")

    if not chunks:
        print("ERROR: no chunks were produced from the PDF. Aborting -- nothing will be indexed.")
        sys.exit(1)

    print(f"Loading embedding model: {settings.EMBEDDING_MODEL_NAME}")
    from sentence_transformers import SentenceTransformer

    model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)

    texts = [c["text"] for c in chunks]
    print("Encoding chunks...")
    embeddings = model.encode(texts, normalize_embeddings=True, show_progress_bar=True)

    ids = [c["chunk_id"] for c in chunks]
    metadatas = [
        {
            "document": settings.GUIDELINE_DOCUMENT_NAME,
            "section": c["section"] or "Unknown",
            "start_page": c["start_page"] if c["start_page"] is not None else -1,
            "end_page": c["end_page"] if c["end_page"] is not None else -1,
        }
        for c in chunks
    ]

    import chromadb

    Path(settings.CHROMA_PERSIST_DIR).mkdir(parents=True, exist_ok=True)
    client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)

    existing = [c.name for c in client.list_collections()]
    if settings.CHROMA_COLLECTION_NAME in existing:
        client.delete_collection(settings.CHROMA_COLLECTION_NAME)

    collection = client.create_collection(settings.CHROMA_COLLECTION_NAME)
    collection.add(ids=ids, documents=texts, metadatas=metadatas, embeddings=embeddings.tolist())

    print(f"Stored {collection.count()} chunks in Chroma collection '{settings.CHROMA_COLLECTION_NAME}'.")

    sections = sorted({c["section"] for c in chunks if c["section"]})
    manifest = {
        "document_name": settings.GUIDELINE_DOCUMENT_NAME,
        "display_title": settings.GUIDELINE_DISPLAY_TITLE,
        "source_pdf": pdf_path.name,
        "chunk_count": len(chunks),
        "sections": sections,
        "embedding_model": settings.EMBEDDING_MODEL_NAME,
        "embedding_dimension": int(embeddings.shape[1]),
        "chunk_size_tokens": settings.CHUNK_SIZE_TOKENS,
        "chunk_overlap_tokens": settings.CHUNK_OVERLAP_TOKENS,
        "indexed_at": datetime.now(timezone.utc).isoformat(),
    }

    manifest_path = Path(settings.INDEX_MANIFEST_PATH)
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(manifest, indent=2))
    print(f"Wrote index manifest: {manifest_path}")
    print("Done.")


if __name__ == "__main__":
    main()
