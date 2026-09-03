from __future__ import annotations

from typing import Any, Dict, Union

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, Response

from app.config import get_settings

app = FastAPI(title="DETech CRM API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> Dict[str, Union[str, int]]:
    settings = get_settings()
    return {
        "status": "ok",
        "app": settings.app_name,
        "port": settings.backend_port,
    }


@app.get("/", response_class=HTMLResponse)
def root() -> str:
    return """
    <html>
        <head>
            <title>DETech CRM API</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background: #0f172a;
                    color: #e2e8f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    margin: 0;
                }
                .card {
                    background: #111827;
                    border: 1px solid #334155;
                    padding: 32px 40px;
                    border-radius: 14px;
                    box-shadow: 0 12px 30px rgba(0,0,0,0.25);
                    max-width: 700px;
                    text-align: center;
                }
                a {
                    color: #7dd3fc;
                }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>DETech CRM API</h1>
                <p>Welcome to the backend for the DETech CRM rebuild.</p>
                <p>API docs: <a href="/docs">/docs</a></p>
                <p>Health check: <a href="/health">/health</a></p>
            </div>
        </body>
    </html>
    """


@app.get("/favicon.ico")
def favicon() -> Response:
    svg = b"""
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>
      <rect width='64' height='64' rx='14' fill='#0f172a'/>
      <path d='M18 44V20h9l9 12V20h10v24H36L27 32v12H18Z' fill='#7dd3fc'/>
    </svg>
    """
    return Response(content=svg, media_type="image/svg+xml")
