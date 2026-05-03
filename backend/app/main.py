import inspect
import logging
import os
import time

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.routers import members, quickbooks

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("membership-api")

APP_VERSION = "1.0.0"
ENVIRONMENT = os.getenv("ENVIRONMENT", "development").strip().lower()
PORT = int(os.getenv("PORT", "8000"))


def _allowed_cors_origins() -> list[str]:
    """Collect browser origins allowed to call this API (credentials: include)."""
    origins: list[str] = []
    for raw in os.getenv("FRONTEND_URL", "http://localhost:3000").split(","):
        url = raw.strip().rstrip("/")
        if url and url not in origins:
            origins.append(url)
    if "http://localhost:3000" not in origins:
        origins.insert(0, "http://localhost:3000")
    return origins


def _cors_origin_regex() -> str | None:
    """Optional regex for extra origins (e.g. all Vercel previews). Must full-match Origin."""
    raw = os.getenv("CORS_ORIGIN_REGEX", "").strip()
    return raw or None


app = FastAPI(title="Membership App API", version=APP_VERSION)

allowed_origins = _allowed_cors_origins()
origin_regex = _cors_origin_regex()
logger.info("CORS allow_origins: %s", allowed_origins)
if origin_regex:
    logger.info("CORS allow_origin_regex: %s", origin_regex)

_cors_kw: dict = {
    "allow_origins": allowed_origins,
    "allow_origin_regex": origin_regex,
    "allow_credentials": True,
    "allow_methods": ["*"],
    "allow_headers": ["*"],
}
# Newer Starlette checks Access-Control-Request-Private-Network on preflight.
if "allow_private_network" in inspect.signature(CORSMiddleware.__init__).parameters:
    _cors_kw["allow_private_network"] = True

app.add_middleware(CORSMiddleware, **_cors_kw)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "version": APP_VERSION}

# Request logging middleware.
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000
    logger.info(
        "%s %s -> %s (%.2fms)",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    return response


@app.exception_handler(ValueError)
async def handle_value_error(_: Request, exc: ValueError) -> JSONResponse:
    return JSONResponse(status_code=400, content={"detail": str(exc)})


@app.exception_handler(PermissionError)
async def handle_permission_error(_: Request, exc: PermissionError) -> JSONResponse:
    return JSONResponse(status_code=403, content={"detail": str(exc)})


@app.exception_handler(Exception)
async def handle_unexpected_error(_: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled server error: %s", exc)
    if ENVIRONMENT == "production":
        message = "Internal server error."
    else:
        message = f"Internal server error: {exc}"
    return JSONResponse(status_code=500, content={"detail": message})


app.include_router(members.router, prefix="/api/members", tags=["members"])
app.include_router(quickbooks.router, prefix="/api/qb", tags=["quickbooks"])


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=PORT)
