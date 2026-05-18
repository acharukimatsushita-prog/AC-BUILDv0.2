from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel, Field

from app.config import settings
from app.db import check_db, close_pool


@asynccontextmanager
async def lifespan(_: FastAPI):
    yield
    await close_pool()


app = FastAPI(title="AC-BUILDE API", version="0.2.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class OpenAIRequest(BaseModel):
    input: str = Field(min_length=1)
    instructions: str | None = None
    model: str | None = None


@app.get("/health")
async def health() -> dict:
    return {"ok": True, "service": "fastapi"}


@app.get("/db/health")
async def db_health() -> dict:
    try:
        return await check_db()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/openai/respond")
async def openai_respond(body: OpenAIRequest) -> dict:
    if not settings.openai_api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY is not set.")

    client = OpenAI(api_key=settings.openai_api_key)
    response = client.responses.create(
        model=body.model or settings.openai_model,
        instructions=body.instructions,
        input=body.input.strip(),
    )

    return {
        "id": response.id,
        "model": response.model,
        "text": response.output_text,
    }
