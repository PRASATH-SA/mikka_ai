import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def test_gemini():
    client = genai.Client(api_key=GEMINI_API_KEY)
    try:
        print("Sending test request with gemini-flash-latest...")
        response = client.models.generate_content(
            model='gemini-flash-latest',
            contents="Say 'Hello MIKKA AI'"
        )
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_gemini()
