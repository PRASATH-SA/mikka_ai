import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def list_models():
    client = genai.Client(api_key=GEMINI_API_KEY)
    print("Available models:")
    try:
        for m in client.models.list():
            print(f"Name: {m.name}")
    except Exception as e:
        print(f"Error listing models: {e}")

if __name__ == "__main__":
    list_models()
