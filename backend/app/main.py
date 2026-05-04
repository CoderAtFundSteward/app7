from __future__ import annotations

import os
import re
from typing import Dict, List, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="app7 API", version="0.1.0")


def _cors_allow_origins() -> List[str]:
    raw = os.getenv("FRONTEND_URL", "http://localhost:3000")
    out = [o.strip() for o in raw.split(",") if o.strip()]
    return out or ["http://localhost:3000"]


def _cors_origin_regex() -> Optional[str]:
    pat = os.getenv("CORS_ORIGIN_REGEX", "").strip()
    if not pat:
        return None
    try:
        re.compile(pat)
    except re.error:
        return None
    return pat


app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_allow_origins(),
    allow_origin_regex=_cors_origin_regex(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.get("/api/hello")
def hello() -> Dict[str, str]:
    return {"message": "Hello from app7 backend"}
