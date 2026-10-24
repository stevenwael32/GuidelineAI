"""Structural tests for the chunking pipeline (app.rag.chunking)."""

from app.rag.chunking import count_tokens, create_chunks, detect_section


def test_detect_section_matches_known_section():
    assert detect_section("1.2 Diagnosing hypertension") == "1.2 Diagnosing hypertension"
    assert detect_section("Something unrelated") is None


def test_create_chunks_respects_token_budget():
    tagged = [
        {"text": "1.1 Measuring blood pressure", "type": "Title", "page": 5, "section": "1.1 Measuring blood pressure"},
        {"text": "word " * 300, "type": "NarrativeText", "page": 5, "section": "1.1 Measuring blood pressure"},
        {"text": "word " * 300, "type": "NarrativeText", "page": 6, "section": "1.1 Measuring blood pressure"},
    ]

    chunks = create_chunks(tagged, chunk_size=400, overlap=50)

    assert len(chunks) >= 2
    for chunk in chunks:
        assert count_tokens(chunk["text"]) <= 400
        assert chunk["section"] == "1.1 Measuring blood pressure"


def test_create_chunks_splits_on_section_change():
    tagged = [
        {"text": "Some intro text.", "type": "NarrativeText", "page": 5, "section": "1.1 Measuring blood pressure"},
        {"text": "Some diagnosing text.", "type": "NarrativeText", "page": 8, "section": "1.2 Diagnosing hypertension"},
    ]

    chunks = create_chunks(tagged, chunk_size=400, overlap=50)

    sections = [c["section"] for c in chunks]
    assert "1.1 Measuring blood pressure" in sections
    assert "1.2 Diagnosing hypertension" in sections
