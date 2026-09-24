from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Job Tracker API"}

class ExtractRequest(BaseModel):
    text: str = Field(min_length = 20)

class ExtractResponse(BaseModel):
    company: str
    role: str
    salary: str | None = None
    link: str | None = None

@app.post("/extract")
async def extract_job(payload: ExtractRequest)->ExtractResponse:

    return ExtractResponse(
        company="Stub Company",
        role="Stub role",
        link=None,
        salary=None
    )

class HealthResponse(BaseModel):
    status: str

@app.get("/health")
def check_health()->HealthResponse:
    return HealthResponse(
        status="ok"
    )