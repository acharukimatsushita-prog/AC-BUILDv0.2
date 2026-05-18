# my-template — Full Stack

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| API | FastAPI (Python) |
| Database | PostgreSQL |
| Runtime | Docker Compose |

## Local development

```powershell
# 1. Database
docker compose up db -d

# 2. FastAPI (from repo root)
cd backend
pip install -r requirements.txt
$env:DATABASE_URL="postgres://postgres:postgres@localhost:5432/ac_builde"
uvicorn app.main:app --reload --port 8000

# 3. Next.js
cd my-template
npm.cmd install
$env:INTERNAL_API_URL="http://127.0.0.1:8000"
npm.cmd run dev
```

Open http://localhost:3000

## Docker (full stack)

From repository root:

```powershell
docker compose up --build
```

- Web (Next.js): http://localhost:3000
- API (FastAPI): http://localhost:8000/docs
- PostgreSQL: localhost:5432

Legacy Vite app:

```powershell
docker compose -f docker-compose.vite.yml up --build
```
