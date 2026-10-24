@echo off
cd /d "%~dp0backend"

if not exist ".venv" (
  python -m venv .venv
)

call .venv\Scripts\activate.bat
pip install -q -r requirements.txt

if not exist ".env" (
  copy ..\.env.example .env
  echo Created backend\.env from .env.example -- edit it with your HF_TOKEN before generating answers.
)

if not exist "..\data\guidelines\hypertension.pdf" (
  echo No guideline PDF found at data\guidelines\hypertension.pdf -- starting without an index.
  echo Add your PDF and run: python backend\scripts\build_index.py
) else (
  echo Building guideline index...
  python scripts\build_index.py
)

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
