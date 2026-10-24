"""
Evidence quality gates: unsupported-claim detection + citation validation.

Direct port of the notebook's "Quality Gate 2" cell (123): a claim is
considered supported when its embedding is sufficiently similar to at
least one retrieved chunk; a citation is accurate when the cited
source is the strongest semantic match for the claim containing it.
"""

import re
from typing import Dict, List

import numpy as np


def split_claims(answer: str) -> List[str]:
    if not isinstance(answer, str):
        return []

    text = re.sub(r"^\s*[-*]\s+", "", answer, flags=re.MULTILINE)
    parts = re.split(r"(?<=[.!?])\s+|\n+", text)

    claims = []
    for part in parts:
        claim = re.sub(r"\s+", " ", part.strip())
        if claim:
            claims.append(claim)
    return claims


def detect_unsupported_claims(answer: str, retrieved_docs: List[Dict], embedding_model, claim_threshold: float) -> Dict:
    if not retrieved_docs:
        return {
            "faithfulness": 0.0,
            "supported_claims": [],
            "unsupported_claims": split_claims(answer),
            "claims": [],
        }

    claims = split_claims(answer)
    if not claims:
        return {"faithfulness": 0.0, "supported_claims": [], "unsupported_claims": [], "claims": []}

    context_texts = [doc["text"] for doc in retrieved_docs]
    context_embeddings = embedding_model.encode_many(context_texts)
    claim_embeddings = embedding_model.encode_many(claims)

    evaluations = []
    for claim, claim_embedding in zip(claims, claim_embeddings):
        similarities = np.dot(context_embeddings, claim_embedding)
        best_idx = int(np.argmax(similarities))
        best_similarity = float(similarities[best_idx])
        citation_numbers = [int(x) for x in re.findall(r"\[(\d+)\]", claim)]

        evaluations.append(
            {
                "claim": claim,
                "supported": best_similarity >= claim_threshold,
                "best_similarity": best_similarity,
                "best_doc_id": retrieved_docs[best_idx]["id"],
                "citations": citation_numbers,
            }
        )

    supported_count = sum(item["supported"] for item in evaluations)
    faithfulness = supported_count / len(evaluations) if evaluations else 0.0

    return {
        "faithfulness": faithfulness,
        "supported_claims": [e for e in evaluations if e["supported"]],
        "unsupported_claims": [e for e in evaluations if not e["supported"]],
        "claims": evaluations,
    }


def validate_citations(answer: str, retrieved_docs: List[Dict], embedding_model) -> Dict:
    claims = split_claims(answer)
    if not retrieved_docs:
        return {"citation_accuracy": 0.0, "valid_citations": 0, "total_citations": 0, "details": []}

    context_embeddings = embedding_model.encode_many([doc["text"] for doc in retrieved_docs])
    evaluations = []

    for claim in claims:
        cited = [int(x) for x in re.findall(r"\[(\d+)\]", claim)]
        if not cited:
            continue

        claim_embedding = embedding_model.encode_one(claim)
        similarities = np.dot(context_embeddings, claim_embedding)
        best_idx = int(np.argmax(similarities)) + 1

        for citation_number in cited:
            valid_range = 1 <= citation_number <= len(retrieved_docs)
            accurate = bool(valid_range and citation_number == best_idx)
            evaluations.append(
                {
                    "claim": claim,
                    "citation": citation_number,
                    "best_matching_source": best_idx,
                    "accurate": accurate,
                }
            )

    total = len(evaluations)
    valid = sum(item["accurate"] for item in evaluations)
    return {
        "citation_accuracy": valid / total if total else 0.0,
        "valid_citations": valid,
        "total_citations": total,
        "details": evaluations,
    }
