"""
Unit tests for the safety/refusal gates (app.rag.refusal), exercised
against real NICE guideline text (see tests/fixtures.py) exactly as
the notebook's own refusal tests do. These gates are pure functions,
so they run without needing the embedding model, Chroma, or an LLM.
"""

from app.rag.refusal import build_refusal_response, evaluate_refusal_gates
from tests.fixtures import SAME_DAY_REFERRAL_CHUNK, STEP_4_TREATMENT_CHUNK

DISTANCE_THRESHOLD = 0.65


def test_urgent_clinical_red_flags_triggers_refusal():
    query = (
        "My blood pressure right now is 210/125 and I have a severe headache and blurred "
        "vision — should I just take an extra dose of my ACE inhibitor now, or wait until "
        "morning to see my doctor?"
    )
    reasons = evaluate_refusal_gates(
        query=query,
        retrieved_text=SAME_DAY_REFERRAL_CHUNK["text"],
        top_distance=0.30,  # well within the similarity threshold
        distance_threshold=DISTANCE_THRESHOLD,
    )
    assert "urgent_clinical_red_flags" in reasons

    response = build_refusal_response(reasons)
    assert "seek prompt clinical assessment" in response


def test_pediatric_scope_mismatch_triggers_refusal():
    query = (
        "My 15-year-old daughter has been diagnosed with high blood pressure — what step 1 "
        "antihypertensive drug does this guideline recommend starting her on?"
    )
    reasons = evaluate_refusal_gates(
        query=query,
        retrieved_text=STEP_4_TREATMENT_CHUNK["text"],
        top_distance=0.30,
        distance_threshold=DISTANCE_THRESHOLD,
    )
    assert "pediatric_scope_mismatch" in reasons


def test_exact_dose_not_supported_triggers_refusal():
    query = (
        "What exact starting dose of spironolactone in milligrams does this guideline "
        "recommend for step 4 resistant hypertension treatment?"
    )
    # The real retrieved chunk discusses spironolactone but never states an exact mg dose.
    reasons = evaluate_refusal_gates(
        query=query,
        retrieved_text=STEP_4_TREATMENT_CHUNK["text"],
        top_distance=0.30,
        distance_threshold=DISTANCE_THRESHOLD,
    )
    assert "exact_dose_not_supported" in reasons


def test_weak_retrieval_triggers_refusal():
    reasons = evaluate_refusal_gates(
        query="What is the capital of France?",
        retrieved_text=SAME_DAY_REFERRAL_CHUNK["text"],
        top_distance=0.90,  # distance above the threshold -> insufficient similarity
        distance_threshold=DISTANCE_THRESHOLD,
    )
    assert "retrieval_similarity_insufficient" in reasons


def test_supported_question_does_not_trigger_any_gate():
    reasons = evaluate_refusal_gates(
        query="What is the clinic blood pressure threshold for same-day specialist referral?",
        retrieved_text=SAME_DAY_REFERRAL_CHUNK["text"],
        top_distance=0.30,
        distance_threshold=DISTANCE_THRESHOLD,
    )
    assert reasons == []
