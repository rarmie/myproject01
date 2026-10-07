import httpx
from bs4 import BeautifulSoup
from urllib.parse import urlparse
import socket
import ipaddress
import asyncio

class BlockedURL(Exception):
    "The link can't be fetched safely."

class Unusable(Exception):
    "Content extracted is not usable."

async def check_redirect(request: httpx.Request) -> None:
    await check_url(str(request.url))
    return

async def check_url(url: str) -> None:
    p = urlparse(url)

    if p.scheme not in ("http", "https"):
        raise BlockedURL("Link must start with http or https.")

    if not p.hostname:
        raise BlockedURL("Link submitted has no hostname.")

    try:
        address_info = await asyncio.get_running_loop().getaddrinfo(p.hostname, None)
    except socket.gaierror as e:
        raise BlockedURL("Couldn't find that site.") from e

    for info in address_info:
        ip = info[4][0] 
        if not ipaddress.ip_address(ip).is_global:
            raise BlockedURL("IP address is not public.")
    
    return

def clean_page(html: str) -> str:
    soup = BeautifulSoup(html, "lxml")
    
    for tag in soup(["script", "style", "noscript", "nav", "header", "footer"]):
        tag.decompose()

    return soup.get_text(separator="\n", strip=True)

async def fetch_posting(link: str) -> str:
    await check_url(link)

    async with httpx.AsyncClient(follow_redirects=True, timeout=10.0, event_hooks={"request": [check_redirect]}) as client:
        resp = await client.get(link)

    if not resp.is_success:
        raise Unusable(f"Site returned {resp.status_code}.")

    if "text/html" not in resp.headers.get("content-type", "").lower():
        raise Unusable("Link isn't a web page.")

    cleaned_resp = clean_page(resp.text)

    if len(cleaned_resp) < 200:
        raise Unusable("Returned text is unreadable.")
    elif len(cleaned_resp) > 50_000:
        raise Unusable("Returned text is too long.")

    return cleaned_resp







