from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import videos

app = FastAPI(title="AI Clipping Backend", version="0.1.0")

# CORS: allow local dev frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:8081",
        "http://127.0.0.1:8081",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(videos.router, prefix="/api", tags=["videos"])

@app.get("/health")
def health():
    return {"status": "ok"}


