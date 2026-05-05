import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from google import genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini API using the new google-genai SDK
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = None
if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY not found in environment variables.")
else:
    print(f"Gemini API Key loaded: {GEMINI_API_KEY[:8]}...{GEMINI_API_KEY[-4:]}")
    client = genai.Client(api_key=GEMINI_API_KEY)

app = FastAPI(title="MIKKA AI AI Tutor API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@app.get("/")
async def root():
    return {"message": "Welcome to MIKKA AI AI Tutor API"}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not client:
        print("Error: Gemini API Client not initialized")
        raise HTTPException(status_code=500, detail="Gemini API Key not configured")

    try:
        print(f"Received message: {request.message}")
        
        # Add a system prompt to define the character
        system_prompt = "You are MIKKA AI, a friendly and helpful AI holographic tutor. Your goal is to help students with their studies, especially mathematics. Keep your responses engaging, clear, and encouraging.Respond with text that can be easily pronounced by tts without emoji and formatting"
        
        # New SDK generate content call
        print("Calling Gemini API via google-genai...")
        response = client.models.generate_content(
            model='gemini-flash-latest',
            contents=f"{system_prompt}\n\nStudent: {request.message}\nMIKKA AI:"
        )
        
        if response.text:
            return {"response": response.text}
        else:
            print(f"Gemini response structure unexpected: {response}")
            return {"response": "I'm sorry, I couldn't generate a response. Please try again."}
            
    except Exception as e:
        import traceback
        print(f"CRITICAL ERROR in /chat: {e}")
        print(traceback.format_exc())
        
        # Handle specific error messages if needed
        error_msg = str(e)
        if "safety" in error_msg.lower():
            return {"response": "I'm sorry, I cannot respond to that message due to safety guidelines. How else can I help you?"}
            
        raise HTTPException(status_code=500, detail=error_msg)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
