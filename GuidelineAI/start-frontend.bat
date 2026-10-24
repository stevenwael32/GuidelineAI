@echo off
cd /d "%~dp0frontend"

if not exist ".env" (
  echo VITE_API_BASE_URL=http://localhost:8000> .env
)

npm install
npm run dev
