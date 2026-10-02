from fastapi import FastAPI, HTTPException
from backend.schemas import ExtractRequest, ExtractResponse, HealthResponse
from google.genai import errors
from backend.extractor import extract
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s"
)

logger = logging.getLogger(__name__)

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Job Tracker API"}

@app.post("/extract")
async def extract_job(payload: ExtractRequest) -> ExtractResponse:
    try: 
        return await extract(payload.text)
    except errors.ServerError as e:
        logger.warning("Gemini is unavailable (503):%s", e)
        raise HTTPException(
            status_code=503,
            detail="Gemini is unavailable. Try again."
        ) from e

        
    except errors.ClientError as e:
        if e.code == 429:
            logger.warning("Rate limit reached (429):%s", e)
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