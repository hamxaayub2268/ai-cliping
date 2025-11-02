AI Clipping Backend (FastAPI)

Setup

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Prerequisites
- Install FFmpeg and ensure the `ffmpeg` command is available on your PATH.
- yt-dlp is included in requirements.txt for URL video downloading.

Health check:
- GET http://127.0.0.1:8000/health

APIs (prefixed with /api):
- POST /api/upload (form-data: file)
- POST /api/import (form-data: url)
- GET /api/projects/{project_id}/clips
- GET /api/clips/{project_id}/{clip_file}

CORS allows localhost:5173 by default. Adjust in `main.py` as needed.

