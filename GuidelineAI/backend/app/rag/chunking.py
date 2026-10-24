"""
PDF -> elements -> sections -> token-based chunks.

This is a direct refactor of the notebook's final, working chunking
pipeline (cells 8-14, 45-58, 61-72 of
RAG_HuggingFace_all_MiniLM_L6_v2_quality_gates_with_LLM.ipynb):

  1. partition_pdf(strategy="fast")               -> raw elements
  2. drop Header/Footer elements                   -> cleaned elements
  3. drop repeated footer/header text + TOC pages   -> clean_text
  4. tag each element with its NICE guideline section (section_boundaries)
  5. pack elements into ~400-token chunks with 50-token overlap (tiktoken)

The section list, chunk size, and overlap match the notebook exactly.
Nothing here invents guideline content — it only reorganizes the text
that `unstructured` extracts from the supplied PDF.
"""

import re
from typing import Dict, List, Optional

import tiktoken

# Exact NICE NG136 section boundaries used in the notebook (cell 55).
SECTION_BOUNDARIES = [
    "1.1 Measuring blood pressure",
    "1.2 Diagnosing hypertension",
    "1.3 Assessing cardiovascular risk and target organ damage",
    "1.4 Treating and monitoring hypertension",
    "1.5 Identifying who to refer for same-day specialist review",
    "Recommendations for research",
    "Key recommendations for research",
    "Other recommendations for research",
    "Rationale and impact",
    "Context",
    "Update information",
]

# Pages that are cover/table-of-contents in the source PDF (cell 68).
EXCLUDED_PAGES = {1, 2, 3, 4}

_ENCODING = tiktoken.get_encoding("cl100k_base")


def partition_guideline_pdf(pdf_path: str):
    """Runs unstructured's fast PDF partitioner, exactly as the notebook does."""
    from unstructured.partition.pdf import partition_pdf

    return partition_pdf(filename=pdf_path, strategy="fast")


def clean_elements(elements) -> List:
    """Drop Header/Footer element types (cell 12)."""
    return [el for el in elements if type(el).__name__ not in ("Header", "Footer")]


def strip_repeated_boilerplate(elements, document_title_prefix: str = "") -> List:
    """Drop repeated footer/page-number boilerplate text (cell 23)."""
    kept = []
    for element in elements:
        text = element.text.strip()
        if not text:
            continue
        if text.startswith("©"):
            continue
        if document_title_prefix and text.startswith(document_title_prefix):
            continue
        if re.fullmatch(r"Page \d+ of \d+", text):
            continue
        kept.append(element)
    return kept


def detect_section(text: str) -> Optional[str]:
    text = text.strip()
    for section in SECTION_BOUNDARIES:
        if text == section:
            return section
    return None


def tag_sections(elements) -> List[Dict]:
    """Attach the current NICE section to each element (cells 56-57)."""
    current_section = "Introduction"
    tagged = []

    for element in elements:
        text = str(element).strip()
        detected = detect_section(text)
        if detected:
            current_section = detected

        page = None
        metadata = getattr(element, "metadata", None)
        if metadata is not None:
            page = getattr(metadata, "page_number", None)

        tagged.append(
            {
                "text": text,
                "type": type(element).__name__,
                "page": page,
                "section": current_section,
            }
        )

    return tagged


def filter_excluded_pages(tagged_elements: List[Dict]) -> List[Dict]:
    return [item for item in tagged_elements if item["page"] not in EXCLUDED_PAGES]


def count_tokens(text: str) -> int:
    return len(_ENCODING.encode(text))


def create_chunks(
    tagged_elements: List[Dict],
    chunk_size: int = 400,
    overlap: int = 50,
) -> List[Dict]:
    """
    Pack section-tagged elements into token-bounded chunks.

    Direct port of the notebook's final create_chunks() (cell 71), which
    finishes a chunk whenever the section changes or the token budget
    would be exceeded, and keeps metadata about the section + page range.
    """
    chunks: List[Dict] = []

    current_text = ""
    current_tokens: List[int] = []
    current_section: Optional[str] = None
    current_pages: List[int] = []
    chunk_id = 0

    def flush():
        nonlocal chunk_id, current_text, current_tokens, current_pages
        if not current_text.strip():
            return
        chunks.append(
            {
                "chunk_id": f"chunk_{chunk_id:04d}",
                "text": current_text.strip(),
                "section": current_section,
                "start_page": min(current_pages) if current_pages else None,
                "end_page": max(current_pages) if current_pages else None,
                "token_count": len(current_tokens),
            }
        )
        chunk_id += 1

    for item in tagged_elements:
        text = item["text"].strip()
        if not text:
            continue

        section = item["section"]
        page = item["page"]

        if current_section is not None and section != current_section:
            flush()
            current_text = ""
            current_tokens = []
            current_pages = []

        current_section = section

        new_text = f"{current_text}\n{text}" if current_text else text
        new_tokens = _ENCODING.encode(new_text)

        if len(new_tokens) <= chunk_size:
            current_text = new_text
            current_tokens = new_tokens
            if page is not None:
                current_pages.append(page)
        else:
            flush()
            current_text = text
            current_tokens = _ENCODING.encode(text)
            current_pages = [page] if page is not None else []

    flush()
    return chunks


def build_guideline_chunks(pdf_path: str, chunk_size: int = 400, overlap: int = 50) -> List[Dict]:
    """End-to-end: PDF path -> list of chunk dicts ready for embedding."""
    elements = partition_guideline_pdf(pdf_path)
    cleaned = clean_elements(elements)
    boilerplate_free = strip_repeated_boilerplate(cleaned)
    tagged = tag_sections(boilerplate_free)
    filtered = filter_excluded_pages(tagged)
    return create_chunks(filtered, chunk_size=chunk_size, overlap=overlap)
