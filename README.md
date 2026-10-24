## GuidelineAI 🩺

**Clinical Answers, Grounded in Evidence.**

GuidelineAI is a full-stack AI-powered clinical guideline assistant that uses Retrieval-Augmented Generation (RAG) to answer medical guideline questions based on retrieved evidence.

Unlike a general-purpose medical chatbot, GuidelineAI evaluates the relevance and sufficiency of retrieved evidence and applies safety and refusal rules before generating an answer.

## ✨ Key Features

- **Retrieval-Augmented Generation (RAG):** Grounds answers in indexed clinical guidelines.
- **Semantic Search:** Retrieves relevant text using vector embeddings and ChromaDB.
- **Evidence Evaluation:** Assesses whether the retrieved information is sufficient to answer a question.
- **Safety Guardrails:** Refuses unsupported answers and handles urgent clinical red flags, pediatric scope mismatches, and unsupported exact-dose requests.
- **Evidence Transparency:** Displays retrieved evidence and retrieval details.
- **Analytics & Evaluation:** Provides query history, usage analytics, and evaluation endpoints.
- **Full-Stack Interface:** Includes a React-based frontend and a FastAPI backend.

## 🛠️ Tech Stack

**AI & Retrieval**
- Retrieval-Augmented Generation (RAG)
- Sentence Transformers
- ChromaDB
- Hugging Face Inference API
- Llama 3.1 8B Instruct

**Backend**
- Python
- FastAPI
- Pydantic
- SQLite

**Frontend**
- React
- TypeScript
- Vite
- Tailwind CSS

## 🏗️ Architecture

1. Load and process a clinical guideline PDF.
2. Split the document into overlapping text chunks.
3. Generate embeddings for semantic representation.
4. Store the embeddings in a persistent ChromaDB collection.
5. Retrieve relevant chunks for a user query.
6. Evaluate evidence relevance and sufficiency.
7. Apply safety and refusal rules.
8. Generate an evidence-grounded response when the available evidence is sufficient and generation is available.

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- A Hugging Face access token for response generation
- A clinical guideline PDF

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd GuidelineAI
```

### 2. Configure the Backend

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment:

**Windows**
```powershell
.venv\Scripts\activate
```

**Linux / macOS**
```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create the environment configuration file by copying `.env.example` to the appropriate `.env` location, then configure the required settings, including `HF_TOKEN` and `GUIDELINE_PDF_PATH`.

### 3. Index a Clinical Guideline

Place your guideline PDF at the configured path. By default, the project expects:

```text
data/guidelines/hypertension.pdf
```

Build the vector index:

```bash
python scripts/build_index.py
```

Run this command from the backend directory.

### 4. Start the Backend

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API documentation:

`http://localhost:8000/docs`

### 5. Start the Frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file containing:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Start the development server:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/system/status` | Component status |
| GET | `/api/guideline` | Indexed guideline information |
| POST | `/api/query` | Submit a clinical guideline question |
| GET | `/api/query/history` | Retrieve recent query history |
| GET | `/api/analytics` | Usage analytics |
| GET | `/api/evaluation` | Evaluation and safety-gate results |

## 🧪 Testing

Run the backend test suite:

```bash
cd backend
pytest
```

Some full-pipeline tests require an indexed clinical guideline.

## ⚠️ Important Notes

- The repository does not include the source clinical guideline PDF or a prebuilt vector index.
- A guideline must be indexed before the system can retrieve real clinical evidence.
- Response generation requires a valid Hugging Face token and access to the configured model.
- If evidence is insufficient or a safety rule is triggered, the system may refuse to answer.

**Disclaimer:** GuidelineAI is an educational and research project. It supports access to clinical guideline evidence and is not a substitute for professional medical judgment or clinical care.

## 👥 Team

- Ahmed Hamada
- Steven Wael
- Mina Melad
- Rowaida Baher
- Rania Sherif

---

*Built to explore evidence-grounded AI, healthcare applications, and responsible LLM system design.*
