from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import analytics, evaluation, guideline, health, query, system
from app.config import settings
from app.core.exceptions import GuidelineAIError
from app.core.logging import configure_logging, get_logger
from app.services.guideline_service import app_state

configure_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting %s...", settings.APP_NAME)
    app_state.startup()
    logger.info("Startup complete. Guideline indexed: %s", app_state.is_indexed)
    yield


app = FastAPI(title=settings.APP_NAME, version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(GuidelineAIError)
def handle_guideline_ai_error(request: Request, exc: GuidelineAIError):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(Exception)
def handle_unexpected_error(request: Request, exc: Exception):
    logger.exception("Unhandled error while processing %s", request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "Something went wrong while processing the request."},
    )


app.include_router(health.router)
app.include_router(system.router)
app.include_router(guideline.router)
app.include_router(query.router)
app.include_router(analytics.router)
app.include_router(evaluation.router)
