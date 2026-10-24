# GuidelineAI 🩺
### AI-Powered Clinical Guideline Assistant

**Evidence-Based Answers. Responsible AI.**

## 👥 Meet the Team

- Ahmed Hamada
- Steven Wael
- Mina Melad
- Rowaida Baher
- Rania Sherif

## 🏆 Project Context

GuidelineAI was developed as part of an **AI Hackathon** in collaboration with:

- **Orange Digital Center**
- **Instant Software Solutions**
- **Creativa**
- **Technology Innovation and Entrepreneurship Center (TIEC)** — ITIDA

## 📌 About the Project

GuidelineAI is an AI-powered clinical guideline assistant focused on blood pressure and hypertension guidelines.

The project uses **Retrieval-Augmented Generation (RAG)** to retrieve relevant evidence from clinical guideline documents and generate answers grounded in the available information.

It incorporates evidence-sufficiency checks and safety guardrails to help prevent unsupported answers and handle cases that require caution.

## ✨ Key Features

- **RAG Pipeline:** Retrieves relevant clinical evidence before generating answers.
- **Semantic Search:** Finds relevant guideline passages using vector embeddings.
- **Evidence-Based Responses:** Grounds answers in retrieved clinical text.
- **Safety Guardrails:** Handles insufficient evidence, clinical red flags, pediatric scope mismatches, and unsupported exact-dose requests.
- **Refusal Mechanism:** Avoids answering when the available evidence does not meet the required criteria.
- **Query History and Analytics:** Supports reviewing queries and evaluating system behavior.

## 🛠️ Tech Stack

### AI & Retrieval
- Retrieval-Augmented Generation (RAG)
- Text Embeddings
- ChromaDB
- Hugging Face Inference API
- LLM-based response generation

### Backend
- Python
- FastAPI
- Pydantic
- SQLite

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS

## 🏗️ How It Works

1. **Document Processing:** Loads and processes clinical guideline documents.
2. **Chunking:** Splits documents into overlapping text segments.
3. **Embedding Generation:** Converts text segments into vector representations.
4. **Vector Storage:** Stores embeddings in ChromaDB.
5. **Evidence Retrieval:** Retrieves relevant passages based on the user's question.
6. **Evidence Evaluation:** Checks whether the retrieved information is sufficiently relevant.
7. **Safety Validation:** Applies safety rules and refusal conditions.
8. **Answer Generation:** Generates an evidence-grounded response when the available evidence is sufficient.

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- A Hugging Face access token
- A clinical guideline PDF

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd GuidelineAI
```

### 2. Set Up the Backend

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment.

**Windows:**

```powershell
.venv\Scripts\activate
```

**Linux / macOS:**

```bash
source .venv/bin/activate
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

Configure the required environment variables using the project's `.env.example` file, including the Hugging Face token and clinical guideline PDF path.

### 3. Build the Clinical Guideline Index

Place the guideline PDF at the configured location. The default expected path is:

```text
data/guidelines/hypertension.pdf
```

Build the vector index:

```bash
python scripts/build_index.py
```

Run the command from the backend directory.

### 4. Run the Backend

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API documentation:

`http://localhost:8000/docs`

### 5. Run the Frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file with the backend URL:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Start the development server:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

> **Note:** Follow the repository's actual configuration and folder structure if any of these paths differ.

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/system/status` | System component status |
| GET | `/api/guideline` | Guideline information |
| POST | `/api/query` | Submit a clinical question |
| GET | `/api/query/history` | Retrieve query history |
| GET | `/api/analytics` | Usage analytics |
| GET | `/api/evaluation` | Evaluation and safety-gate results |

## 🧪 Testing

Run the backend tests:

```bash
cd backend
pytest
```

Some tests may require an indexed guideline and appropriate environment configuration.

## ⚠️ Limitations & Disclaimer

- The original clinical guideline PDF and prebuilt vector index may need to be supplied separately.
- Answer generation requires access to the configured language model.
- Responses depend on the quality and coverage of the indexed clinical evidence.
- GuidelineAI is an educational and research project, not a replacement for qualified healthcare professionals or individualized medical advice.

## 🎯 Project Goal

To explore how Retrieval-Augmented Generation, semantic search, and safety guardrails can support reliable access to clinical guideline information.

---

**Built with a focus on evidence-grounded AI, healthcare technology, and responsible AI systems.**
