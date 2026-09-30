from fastapi import FastAPI, HTTPException
from backend.schemas import ExtractRequest, ExtractResponse, HealthResponse
from google.genai import errors
from backend.extractor import extract

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Job Tracker API"}

@app.post("/extract")
async def extract_job(payload: ExtractRequest) -> ExtractResponse:
    try: 
        return await extract(payload.text)
    except errors.ServerError as e:
        raise HTTPException(
            status_code=503,
            detail="Gemini is unavailable. Try again."
        ) from e
    except errors.ClientError as e:
        if e.code == 429:
            raise HTTPException(
                status_code=429,
                detail="Rate limit reached. Try again later."
            ) from e

        raise


@app.get("/health")
def check_health() -> HealthResponse:
    return HealthResponse(
        status="ok"
    )