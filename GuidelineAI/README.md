# GuidelineAI

**"Clinical Answers, Grounded in Evidence."**

GuidelineAI is a full-stack evidence retrieval and support system for clinical guidelines. It is not a general
medical chatbot: every answer is produced by a real Retrieval-Augmented Generation (RAG) pipeline that retrieves
guideline evidence, evaluates whether that evidence is sufficient, applies deterministic safety/refusal gates, and
only then generates a grounded response — or explains why it refuses to answer.

The backend is a direct refactor of the source notebook
(`RAG_HuggingFace_all_MiniLM_L6_v2_quality_gates_with_LLM.ipynb`): the same embedding model, the same Chroma
collection name, the same chunking parameters, and the same four safety gates
(`retrieval_similarity_insufficient`, `urgent_clinical_red_flags`, `pediatric_scope_mismatch`,
`exact_dose_not_supported`).

---

## Architecture

```
Clinical Guideline PDF
        |
PDF / Text Processing (unstructured)
        |
Chunking (tiktoken, 400 tokens / 50 overlap)
        |
Embeddings (sentence-transformers/all-MiniLM-L6-v2)
        |
Chroma Vector Database (persistent, collection "nice_hypertension")
        |
Semantic Retrieval (top-k, cosine similarity)
        |
Similarity / Relevance Evaluation
        |
Evidence Evaluation
        |
Safety + Refusal Logic (4 deterministic gates)
        |
LLM Response Generation (Hugging Face Inference API) -- only if not refused
        |
Evidence-Grounded Answer
```

```
GuidelineAI/
  backend/            FastAPI app + RAG pipeline (ported from the notebook)
    app/
      api/            query, guideline, health, analytics, evaluation, system
      rag/            chunking, embeddings, retrieval, refusal, evidence, generation, pipeline
      services/       guideline_service (app state), analytics_service, evaluation_service
      core/           logging, exceptions
      config.py       environment-driven settings
      schemas.py      Pydantic response models
      main.py         FastAPI app factory
    scripts/
      build_index.py  builds the real Chroma index from your guideline PDF
    tests/            pytest suite (real refusal-gate + API tests)
  frontend/           React + TypeScript + Vite + Tailwind
    src/
      components/     Navbar, Sidebar, QueryComposer, PipelineLoader, AnswerCard,
                       EvidenceCard, EvidenceDrawer, RefusalCard, RetrievalDetails,
                       StatusCard, TeamCard, Footer, ...
      pages/           Home, Ask, Guideline, Analytics, Evaluation, Team, Status, Settings
  data/
    guidelines/       put your source guideline PDF here
    chroma/           persistent vector index (built by build_index.py)
    analytics.sqlite3 real query history / analytics (created automatically)
  .env.example
  start-backend.sh / .bat
  start-frontend.sh / .bat
```

---

## Important: no fake data

GuidelineAI ships with **no bundled guideline content**. The source notebook parses a NICE hypertension guideline
PDF that lives on the notebook author's machine (`/content/hypertension.pdf` in Colab) — that PDF file itself was
not attached anywhere in this project. To respect the "no fake data" requirement, this project does **not** invent
or hardcode any guideline text, chunks, or embeddings.

To get real answers:

1. Place your clinical guideline PDF at `data/guidelines/hypertension.pdf` (or point `GUIDELINE_PDF_PATH` at another
   file).
2. Run `python backend/scripts/build_index.py` to build a real Chroma index from that PDF using the exact pipeline
   from the notebook.
3. Start the backend and frontend as usual.

Until a guideline is indexed, the API and UI honestly report "No clinical guideline is currently indexed" instead of
fabricating a response — this is a first-class, intentionally designed state (see `/guideline`, `/status`, and the
`/app` workspace).

---

## Backend setup

Requirements: Python 3.10+.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env          # then edit backend/.env
```

Edit `backend/.env`:

- `GUIDELINE_PDF_PATH` — path to your guideline PDF (default `../data/guidelines/hypertension.pdf`)
- `HF_TOKEN` — a Hugging Face access token, required for grounded answer generation via
  `meta-llama/Llama-3.1-8B-Instruct` (same model as the notebook). Without it, GuidelineAI still retrieves and
  evaluates evidence and applies safety gates, but reports generation as unavailable instead of faking an answer.
- `DISTANCE_THRESHOLD` — the retrieval refusal gate (default `0.65`, matching the notebook's refusal tests)

Build the index (once, or whenever the PDF changes):

```bash
python scripts/build_index.py
```

Start the API:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API is now at `http://localhost:8000` (docs at `/docs`).

Or simply run, from the project root:

```bash
./start-backend.sh     # Linux/macOS
start-backend.bat      # Windows
```

### RAG configuration reference

| Setting | Default | Source |
|---|---|---|
| Embedding model | `sentence-transformers/all-MiniLM-L6-v2` | notebook cell 37 |
| Chunk size / overlap | 400 tokens / 50 tokens | notebook cell 71 |
| Vector database | Chroma (persistent client) | notebook cell 81 |
| Collection name | `nice_hypertension` | notebook cell 81 |
| Retrieval top-k | 5 | notebook refusal tests |
| Distance threshold (refusal gate A) | 0.65 | notebook cells 2/3 |
| LLM | `meta-llama/Llama-3.1-8B-Instruct` via HF Inference API | notebook cell 4 |

---

## Frontend setup

Requirements: Node.js 18+.

```bash
cd frontend
echo "VITE_API_BASE_URL=http://localhost:8000" > .env
npm install
npm run dev
```

The app is now at `http://localhost:5173`.

Or, from the project root:

```bash
./start-frontend.sh    # Linux/macOS
start-frontend.bat     # Windows
```

Build for production:

```bash
npm run build
```

---

## Running tests

```bash
cd backend
source .venv/bin/activate
pytest
```

The suite includes:

- Unit tests for the four safety/refusal gates, run against real NICE guideline text copied verbatim from the
  notebook's own recorded output (`tests/fixtures.py`) — no PDF or model download required.
- Structural tests for the chunking pipeline.
- API-level tests (empty query rejection, honest "not indexed" error, system status shape, analytics empty state).
- Full-pipeline tests (`test_valid_query_runs_the_real_pipeline`,
  `test_urgent_red_flag_query_is_refused_by_the_real_pipeline`) that automatically run once a real guideline has
  been indexed via `scripts/build_index.py`, and are honestly skipped otherwise.

---

## API reference

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Liveness check |
| GET | `/api/system/status` | Real per-component health (guideline, embedding model, vector DB, retrieval, evidence evaluation, refusal layer, LLM) |
| GET | `/api/guideline` | Indexed guideline metadata (or `indexed: false`) |
| POST | `/api/query` | Runs the real RAG pipeline for a question |
| GET | `/api/query/history` | Recent questions (from real query history) |
| GET | `/api/query/{id}` | Re-fetch a stored result |
| GET | `/api/analytics` | Real usage analytics (or `has_data: false`) |
| GET | `/api/evaluation` | Real refusal tests + quality-gate benchmarks against the live index |

`POST /api/query` request/response:

```json
// Request
{ "query": "What is the target blood pressure for people aged 80 and over?" }

// Response (evidence sufficient, answered)
{
  "id": "…",
  "query": "…",
  "status": "answered",
  "answer": "…",
  "refused": false,
  "confidence": "sufficient",
  "refusal_reasons": [],
  "evidence": [ { "rank": 1, "chunk_id": "chunk_0009", "section": "...", "similarity_percent": 71.2, "text": "..." } ],
  "retrieval": { "top_k": 5, "retrieved_chunks": 5, "distance_threshold": 0.65, "embedding_model": "...", "collection": "nice_hypertension" }
}

// Response (refused)
{
  "status": "refused",
  "refused": true,
  "refusal_reasons": ["urgent_clinical_red_flags"],
  "recommendation": "I couldn't find enough information ... seek prompt clinical assessment ...",
  "question_suggestion": "..."
}
```

---

## Troubleshooting

- **"No clinical guideline is currently indexed"** — you haven't run `scripts/build_index.py` yet, or the PDF path
  is wrong. Check `GUIDELINE_PDF_PATH` in `backend/.env`.
- **"Response generation is currently unavailable"** — `HF_TOKEN` is missing/invalid, or the configured model
  requires access approval on Hugging Face. Retrieval, evidence evaluation, and refusal gates still work without it.
- **Backend takes a while to start the first time** — the embedding model (~90 MB) downloads from Hugging Face on
  first use and is cached afterwards.
- **CORS errors in the browser** — make sure `CORS_ORIGINS` in `backend/.env` includes your frontend's origin
  (default `http://localhost:5173`).

---

## Team

Ahmed Hamada · Steven Wael · Mina Melad · Rowaida Baher · Rania Sherif

---

*GuidelineAI provides evidence retrieval and support from indexed clinical guidelines. It is not a substitute for
professional clinical judgment.*
