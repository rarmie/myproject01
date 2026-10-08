from pydantic import BaseModel, Field, field_validator, HttpUrl, model_validator
from typing import Self

class HealthResponse(BaseModel):
    status: str

class ExtractRequest(BaseModel):
    text: str | None = Field(default=None, min_length=20, max_length=50_000)
    url: HttpUrl | None = None

    @field_validator("text", mode="before")
    @classmethod
    def trim_text(cls, value: object) -> object: 
        if isinstance(value, str):
            value = value.strip()

        return value
    
    @model_validator(mode="after")
    def check_value(self) -> Self:
        if self.text is None and self.url is None:
            raise ValueError("Send either text or url.")
        elif self.text is not None and self.url is not None:
            raise ValueError("Send either text or url, not both.")

        return self

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
        default=None,
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