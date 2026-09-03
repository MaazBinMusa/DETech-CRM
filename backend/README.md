# DETech CRM Backend

This is the FastAPI backend for the DETech CRM rebuild.

## Local setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

## Notes

- The frontend lives in `../frontend`
- Supabase credentials are configured through environment variables
- The main API entrypoint is `app.main:app`
