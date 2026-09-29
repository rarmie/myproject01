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

try:
    for path in paths:
        text = path.read_text(encoding="utf-8")
        for schema_mode in [True, False]:
            mode = "schema" if schema_mode else "freeform"   
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
except errors.ClientError as e:
    print(f"Path: {path.name}, Error: {e.message}")
    if e.code != 429:
        raise
finally:
    print(f"{'Posting':<8} {'Mode':<8} Status")

    for r in results:
        print(f"{r['posting']:<8} {r['mode']:<8} {r['status']}")

    pass_count_schema = sum(1 for r in results if r['mode'] == "schema" and r['status'] == "PASS")
    pass_count_free  = sum(1 for r in results if r['mode'] == "freeform" and r['status'] == "PASS")

    print(f"Passed for Schema mode: {pass_count_schema}")
    print(f"Passed for Freeform mode: {pass_count_free}")

    total_tokens = sum(r.get("total_tokens", 0) for r in results)

    print(f"Total tokens used: {total_tokens}")
    
    # Input and output are priced separately (output ~5x input, thinking billed as
    # output), so step G needs each averaged, not just the total. SKIP rows were
    # never billed and have no token keys, so they are left out.
    for mode in ["schema", "freeform"]:
        rows = [r for r in results if r['mode'] == mode and r['status'] != "SKIP"]

        if rows:
            for key in ["prompt_tokens", "output_tokens", "thoughts_tokens", "total_tokens"]:
                average = sum(r[key] for r in rows) / len(rows)
                print(f"Average {key} for {mode} mode: {average:.1f}")
        else:
            print(f"No completed calls for {mode} mode")

    thinking = any(r.get('thoughts_tokens', 0) > 0 for r in results)
    print(f"Any thought tokens used: {thinking}")

            
    