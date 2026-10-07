import asyncio
import httpx
from bs4 import BeautifulSoup
from backend.extractor import extract

async def fetch_posting(link: str) -> httpx.Response:
    async with httpx.AsyncClient(follow_redirects=True, timeout=10.0) as client:
        resp = await client.get(link)

        return resp

def clean(html: str) -> str:
    soup = BeautifulSoup(html, "lxml")

    for tag in soup(["script", "style", "noscript", "nav", "header", "footer"]):
        tag.decompose()
    
    return soup.get_text(separator="\n", strip=True)

async def main():
    resp = await fetch_posting(url)

    print(f"{resp.status_code}\n{resp.url}\n{len(resp.text)}\n \n")
    with open(f"backend/scratch/out/{resp.url.host}.html", "w", encoding="utf-8") as f:
        f.write(resp.text)

    cleaned_resp = clean(resp.text)

    with open(f"backend/scratch/out/{resp.url.host}_cleaned.txt", "w", encoding="utf-8") as f:
        f.write(cleaned_resp)

    print(len(cleaned_resp))

asyncio.run(main())