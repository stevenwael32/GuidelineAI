"""
Real guideline text fixtures for tests.

Both chunks below are copied verbatim from the source notebook's own
recorded execution output (RAG_HuggingFace_all_MiniLM_L6_v2_quality_
gates_with_LLM.ipynb, cells 2 and 104) -- i.e. real NICE NG136
"Hypertension in adults" guideline text that the notebook itself
retrieved from the indexed PDF. They are used here only so the
refusal-gate logic can be exercised deterministically in CI without
requiring the original PDF file and its heavy parsing dependencies.
No guideline content is invented.
"""

SAME_DAY_REFERRAL_CHUNK = {
    "id": "chunk_0020",
    "text": (
        "1.5 Identifying who to refer for same-day specialist review\n"
        "1.5.1\n"
        "If a person has severe hypertension (clinic blood pressure of 180/120 mmHg or\n"
        "higher), but no symptoms or signs indicating same-day referral (see\n"
        "recommendation 1.5.2), carry out investigations for target organ damage (see\n"
        "recommendation 1.3.3) as soon as possible:\n"
        "If target organ damage is identified, consider starting antihypertensive drug\n"
        "treatment immediately, without waiting for the results of ABPM or HBPM.\n"
        "If no target organ damage is identified, confirm diagnosis by:\n"
        "- repeating clinic blood pressure measurement within 7 days, or\n"
        "- considering monitoring using ABPM (or HBPM if ABPM is not suitable or\n"
        "not tolerated), following recommendations 1.2.6 and 1.2.7, and ensuring a\n"
        "clinical review within 7 days. [2019]\n"
        "1.5.2\n"
        "Refer people for specialist assessment, carried out on the same day, if they have\n"
        "a clinic blood pressure of 180/120 mmHg and higher with:\n"
        "signs of retinal haemorrhage or papilloedema (accelerated hypertension) or\n"
        "life-threatening symptoms such as new onset confusion, chest pain, signs of\n"
        "heart failure, or acute kidney injury. [2019]\n"
        "1.5.3\n"
        "Refer people for specialist assessment, carried out on the same day, if they have\n"
        "suspected phaeochromocytoma (for example, labile or postural hypotension,\n"
        "headache, palpitations, pallor, abdominal pain or diaphoresis). [2019]"
    ),
    "metadata": {
        "document": "NICE_Hypertension_Guideline",
        "section": "1.5 Identifying who to refer for same-day specialist review",
        "start_page": 24,
        "end_page": 24,
    },
}

STEP_4_TREATMENT_CHUNK = {
    "id": "chunk_0018",
    "text": (
        "Step 4 treatment\n"
        "1.4.46\n"
        "If hypertension is not controlled in adults taking the optimal tolerated doses of "
        "an ACE inhibitor or an ARB plus a CCB and a thiazide-like diuretic, regard them as\n"
        "having resistant hypertension. [2019]\n"
        "1.4.47\n"
        "Before considering further treatment for a person with resistant hypertension:\n"
        "Confirm elevated clinic blood pressure measurements using ambulatory or\n"
        "home blood pressure recordings.\n"
        "Assess for postural hypotension.\n"
        "Discuss adherence (see recommendation 1.4.40). [2019]\n"
        "1.4.48\n"
        "For people with confirmed resistant hypertension, consider adding a fourth\n"
        "antihypertensive drug as step 4 treatment or seeking specialist advice. [2019]\n"
        "1.4.49\n"
        "Consider further diuretic therapy with low-dose spironolactone for adults with\n"
        "resistant hypertension starting step 4 treatment who have a blood potassium\n"
        "level of 4.5 mmol/l or less. Use particular caution in people with a reduced\n"
        "estimated glomerular filtration rate because they are at increased risk of\n"
        "hyperkalaemia."
    ),
    "metadata": {
        "document": "NICE_Hypertension_Guideline",
        "section": "1.4 Treating and monitoring hypertension",
        "start_page": 22,
        "end_page": 23,
    },
}
