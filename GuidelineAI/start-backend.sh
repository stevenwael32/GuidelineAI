#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/backend"

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi

source .venv/bin/activate
pip install -q -r requirements.txt

if [ ! -f ".env" ]; then
  cp ../.env.example .env
  echo "Created backend/.env from .env.example -- edit it with your HF_TOKEN before generating answers."
fi

if [ ! -d "../data/chroma" ] || [ -z "$(ls -A ../data/chroma 2>/dev/null)" ]; then
  if [ -f "../data/guidelines/hypertension.pdf" ]; then
    echo "Building guideline index..."
    python scripts/build_index.py
  else
    echo "No guideline PDF found at data/guidelines/hypertension.pdf -- starting without an index."
    echo "Add your PDF and run: python backend/scripts/build_index.py"
  fi
fi

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
