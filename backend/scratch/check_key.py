from dotenv import load_dotenv
from google import genai

load_dotenv(".env")
client = genai.Client()  # reads GEMINI_API_KEY from the environment

for m in client.models.list():
    print(m.name)