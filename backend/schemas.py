from pydantic import BaseModel, Field, field_validator

class HealthResponse(BaseModel):
    status: str

class ExtractRequest(BaseModel):
    text: str = Field(min_length=20, max_length=50_000)

    @field_validator("text", mode="before")
    @classmethod
    def trim_text(cls, value: object) -> object: 
        if isinstance(value, str):
            value = value.strip()

        return value

class ExtractResponse(BaseModel):
    company: str | None = Field(
        default=None,
        description="The name of the company or organization offering the job."
    )
    role: str | None = Field(
        default=None,
        description="The exact job title or position being advertised."
    )
    salary: str | None = Field(
        default=None,
        description="The salary or compensation offered for the position, preserving the amount, currency, and pay period exactly as stated."
    )
    notes: str | None = Field(
        default="None",
        description="Extra information that may be useful to job applicant."
    )
    requirements: list[str] | None = Field(
        default=None,
        description="A list of explicit qualifications, skills, experience, education, certifications, or other requirements that applicants must or should have."
    )
    link: str | None = Field(
        default=None,
        description="The URL associated with the job posting or application, if explicitly provided in the input."
    )