"""
Safety + refusal gates.

Direct port of the notebook's final refusal-test logic (cells 2 and 3:
"FINAL RAG REFUSAL TEST" / "FINAL RAG REFUSAL + QUESTION REFORMULATION
TEST"). The four gates, their detection rules, and their response
wording are preserved verbatim from the notebook — this module does
not change the medical/safety logic, only wraps it for reuse in the
API.
"""

import re
from typing import Dict, List, Optional

EMERGENCY_TERMS = [
    "severe headache",
    "blurred vision",
    "vision changes",
    "chest pain",
    "shortness of breath",
    "confusion",
    "loss of consciousness",
    "fainting",
    "weakness",
    "signs of heart failure",
    "acute kidney injury",
]

SEVERE_BP_PATTERN = re.compile(r"\b(?:18\d|19\d|2\d\d)/1[12]\d\b")
AGE_PATTERN = re.compile(r"\b(\d{1,2})[- ]?year[- ]?old\b")

EXACT_DOSE_TERMS = [
    "exact starting dose",
    "starting dose",
    "dose in milligrams",
    "dose in mg",
    "how many mg",
    "milligrams",
    "mg",
]

SPIRONOLACTONE_DOSE_PATTERNS = [
    re.compile(r"spironolactone.{0,150}\b\d+(?:\.\d+)?\s*(?:mg|milligrams)\b", re.IGNORECASE | re.DOTALL),
    re.compile(r"\b\d+(?:\.\d+)?\s*(?:mg|milligrams)\b.{0,150}spironolactone", re.IGNORECASE | re.DOTALL),
]

ADULT_SCOPE_PHRASES = [
    "hypertension in adults",
    "adults with hypertension",
    "adults",
    "adult",
    "aged 18 years",
    "18 years and over",
]


def evaluate_refusal_gates(
    query: str,
    retrieved_text: str,
    top_distance: float,
    distance_threshold: float,
) -> List[str]:
    """Returns the list of triggered refusal reason codes."""
    query_lower = query.lower()
    retrieved_lower = retrieved_text.lower()

    has_red_flags = any(term in query_lower for term in EMERGENCY_TERMS)
    has_severe_bp = bool(SEVERE_BP_PATTERN.search(query_lower))

    age_match = AGE_PATTERN.search(query_lower)
    is_pediatric = bool(age_match) and int(age_match.group(1)) < 18

    asks_exact_dose = any(term in query_lower for term in EXACT_DOSE_TERMS)
    asks_spironolactone = "spironolactone" in query_lower

    has_spironolactone_dose = False
    if asks_spironolactone:
        has_spironolactone_dose = any(p.search(retrieved_text) for p in SPIRONOLACTONE_DOSE_PATTERNS)

    guideline_is_adult_only = any(phrase in retrieved_lower for phrase in ADULT_SCOPE_PHRASES)

    reasons: List[str] = []

    # Gate A: weak retrieval
    if top_distance > distance_threshold:
        reasons.append("retrieval_similarity_insufficient")

    # Gate B: urgent clinical red flags
    if has_severe_bp and has_red_flags:
        reasons.append("urgent_clinical_red_flags")

    # Gate C: pediatric vs adult guideline
    if is_pediatric and guideline_is_adult_only:
        reasons.append("pediatric_scope_mismatch")

    # Gate D: exact dose not supported
    if asks_exact_dose and asks_spironolactone and not has_spironolactone_dose:
        reasons.append("exact_dose_not_supported")

    return reasons


def build_refusal_response(refusal_reasons: List[str]) -> str:
    response = (
        "I couldn't find enough information in the indexed guideline to answer this confidently."
    )

    if "urgent_clinical_red_flags" in refusal_reasons:
        response += (
            " I searched the highest-ranked sections of the indexed guideline, including the "
            "section on same-day specialist review. However, the retrieved evidence does not "
            "support making an individualized decision to take an extra dose of an "
            "antihypertensive medication in this clinical situation."
        )
    elif "pediatric_scope_mismatch" in refusal_reasons:
        response += (
            " I searched the highest-ranked treatment sections of the indexed guideline, but the "
            "retrieved material is focused on adults and does not provide sufficient evidence for "
            "selecting step 1 antihypertensive treatment for this age group."
        )
    elif "exact_dose_not_supported" in refusal_reasons:
        response += (
            " I searched the highest-ranked step 4 resistant-hypertension sections, including the "
            "material discussing spironolactone, but the retrieved evidence does not contain the "
            "exact starting dose in milligrams needed to answer this question."
        )
    elif "retrieval_similarity_insufficient" in refusal_reasons:
        response += (
            " I searched the top-ranked chunks from the indexed guideline, but their similarity "
            "to the question was not strong enough to establish that the guideline directly "
            "covers the requested information."
        )
    else:
        response += (
            " I searched the highest-ranked chunks from the indexed guideline, but the retrieved "
            "evidence does not directly support the requested information."
        )

    if "urgent_clinical_red_flags" in refusal_reasons:
        response += (
            " Because the question includes potentially urgent symptoms, seek prompt clinical "
            "assessment rather than relying on an unsupported medication change."
        )
    elif "pediatric_scope_mismatch" in refusal_reasons:
        response += (
            " A better next step is to use a pediatric hypertension guideline or consult a "
            "clinician experienced in pediatric hypertension."
        )
    elif "exact_dose_not_supported" in refusal_reasons:
        response += (
            " A better next step is to retrieve the specific dosing recommendation before giving "
            "an exact dose, or consult a clinician."
        )
    else:
        response += " A better next step is to rephrase the question or consult a clinician directly."

    return response


def suggest_better_question(refusal_reasons: List[str]) -> Optional[str]:
    if "pediatric_scope_mismatch" in refusal_reasons:
        return (
            'What step 1 antihypertensive treatment does this guideline recommend for adults '
            'with hypertension? — The indexed guideline is focused on adult hypertension, so the '
            'original question is outside the supported age scope.'
        )
    if "exact_dose_not_supported" in refusal_reasons:
        return (
            'What does this guideline recommend for step 4 treatment of resistant hypertension, '
            'including any specific dosing information stated in the guideline? — The retrieved '
            'evidence discusses low-dose spironolactone but does not provide an exact starting '
            'dose in milligrams.'
        )
    if "urgent_clinical_red_flags" in refusal_reasons:
        return (
            'What does the guideline recommend for people with blood pressure of 180/120 mmHg or '
            'higher who have symptoms requiring same-day specialist assessment? — This version '
            'asks directly about the guideline recommendation instead of requesting an '
            'individualized medication-dose decision.'
        )
    if "retrieval_similarity_insufficient" in refusal_reasons:
        return (
            'What does the indexed guideline specifically recommend about this topic? Please '
            'answer only using information stated in the guideline. — The original question did '
            'not retrieve sufficiently relevant evidence, so making it more directly focused on '
            'the indexed guideline may improve retrieval.'
        )
    return None


REFUSAL_QUALITY = {
    "states_insufficiency": True,
    "explains_search_and_gap": True,
    "offers_next_step": True,
}
