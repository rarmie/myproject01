from google import genai
from google.genai import types
from dotenv import load_dotenv
from backend.main import ExtractResponse
from pathlib import Path
from pydantic import ValidationError
from google.genai import errors
import time

load_dotenv(Path(__file__).resolve().parents[1] / ".env")
client = genai.Client()

POSTINGS_DIR = (Path(__file__).resolve().parents[1] / "evals" / "fixtures" / "postings")
paths = sorted(POSTINGS_DIR.glob("*.txt"))

def extract(text: str, schema_mode: bool):
    generation_config = types.GenerateContentConfig(
            system_instruction="""
                Extract the following information from the job posting:
                - company
                - role
                - salary
                - link
                - requirements

                Return the information using the provided schema.
                """,
            temperature=0,
            response_mime_type="application/json",
            response_schema=ExtractResponse,
            thinking_config=types.ThinkingConfig(thinking_budget=0),
            seed=42
        )

    if schema_mode != True:
        generation_config = types.GenerateContentConfig(
            system_instruction="""
                Extract the following information from the job posting:
                - company (required)
                - role (required)
                - salary 
                - link
                - requirements
                
                If salary, link, or requirements are not specified, use null.
                Return only JSON.
                """,
            temperature=0,
            response_mime_type="application/json",
            thinking_config=types.ThinkingConfig(thinking_budget=0),
            seed=42
        )

    resp = client.models.generate_content(
        model='gemini-3.7-flash',
        contents=text,
        config=generation_config
    )

    return resp

results = []

for path in paths:
    text = path.read_text(encoding="utf-8")
    for schema_mode in [True, False]:
        mode = "schema" if schema_mode else "json"   
        resp = None
        try:
            resp = extract(text, schema_mode)
            print(resp.text)
        except errors.ServerError as e:
            results.append({
                "posting": path.name,
                "mode": mode,
                "status": "SKIP",
                "error": str(e),
            })
            continue
        finally:
            time.sleep(13)

        usage = resp.usage_metadata
        tokens = {
            "prompt_tokens": usage.prompt_token_count or 0,
            "output_tokens": usage.candidates_token_count or 0,
            "thoughts_tokens": usage.thoughts_token_count or 0,
            "total_tokens": usage.total_token_count or 0,
        }

        try:
            parsed = ExtractResponse.model_validate_json(resp.text)
            results.append({
                "posting": path.name,
                "mode": mode,
                "status": "PASS",
                "parsed": parsed,
                **tokens,
            })
        except ValidationError as e:
            results.append({
                "posting": path.name,
                "mode": mode,
                "status": "FAIL",
                "error": str(e),
                "raw": resp.text,
                **tokens,
            })

            
    