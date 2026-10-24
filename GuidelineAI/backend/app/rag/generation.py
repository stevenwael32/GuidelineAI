"""
Grounded LLM answer generation.

Direct port of the notebook's LLM cells (4 and 5): Hugging Face
Inference API chat completion, restricted to the retrieved evidence,
with an explicit instruction to refuse rather than invent facts.

This is only called by the pipeline when the safety/refusal gates
(app.rag.refusal) have already determined the evidence is sufficient
-- it never runs when refused=True.
"""

from typing import Dict, List, Optional


class GenerationUnavailable(Exception):
    pass


SYSTEM_PROMPT = (
    "You are a careful RAG assistant. Answer only from the supplied retrieved context. "
    "If the context does not support the answer, say that the information is not available "
    "in the provided sources. Do not invent facts or citations."
)


def _build_prompt(question: str, retrieved_docs: List[Dict]) -> str:
    context_parts = []
    for i, doc in enumerate(retrieved_docs, start=1):
        section = doc.get("metadata", {}).get("section", "")
        context_parts.append(f"[Source {i}] (Section: {section})\n{doc['text']}")
    context = "\n\n".join(context_parts)

    return f"""You are a medical RAG assistant.

You MUST answer ONLY using the retrieved evidence below.

User question:
{question}

Retrieved evidence:
{context}

Your task:
1. Answer the question using ONLY the retrieved evidence.
2. Do not invent information beyond what is stated.
3. Reference the relevant source numbers (e.g. [1]) when possible.
4. Keep the answer concise and clear.
5. Never fabricate a source or claim the guideline says something it does not.
"""


class LLMClient:
    def __init__(self, model_name: str, hf_token: str, max_tokens: int, temperature: float):
        if not hf_token:
            raise GenerationUnavailable("HF_TOKEN is not configured.")

        from huggingface_hub import InferenceClient

        self.model_name = model_name
        self.max_tokens = max_tokens
        self.temperature = temperature
        self._client = InferenceClient(model=model_name, token=hf_token)

    def generate(self, question: str, retrieved_docs: List[Dict]) -> str:
        prompt = _build_prompt(question, retrieved_docs)
        try:
            response = self._client.chat.completions.create(
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                max_tokens=self.max_tokens,
                temperature=self.temperature,
            )
            return response.choices[0].message.content.strip()
        except Exception as exc:  # network / provider error
            raise GenerationUnavailable(str(exc)) from exc


def get_llm_client(model_name: str, hf_token: str, max_tokens: int, temperature: float) -> Optional[LLMClient]:
    if not hf_token:
        return None
    try:
        return LLMClient(model_name, hf_token, max_tokens, temperature)
    except GenerationUnavailable:
        return None
