import os
import io
import logging
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
import PyPDF2

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    logger.warning("GEMINI_API_KEY is not set in .env")

genai.configure(api_key=api_key)

# We will try to use Gemma 4 31B, falling back to Gemini 1.5 if the string isn't available yet in the local SDK
def get_model():
    try:
        return genai.GenerativeModel("gemma-4-31b-it")
    except Exception as e:
        logger.error(f"Gemma 4 model string not found, falling back. Error: {e}")
        return genai.GenerativeModel("gemini-1.5-flash")

app = FastAPI(title="Lumina Study - Gemma 4 Powered")

# Create static directory if it doesn't exist
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

class ChatRequest(BaseModel):
    message: str
    context: str = ""

@app.get("/", response_class=HTMLResponse)
async def read_index():
    with open("static/index.html", "r", encoding="utf-8") as f:
        return f.read()

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.lower().endswith('.pdf') and not file.filename.lower().endswith('.txt'):
        raise HTTPException(status_code=400, detail="Only PDF and TXT files are supported")
    
    text = ""
    try:
        contents = await file.read()
        if file.filename.lower().endswith('.pdf'):
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(contents))
            for page in pdf_reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        else:
            text = contents.decode('utf-8')
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")
        
    return {"message": "Document processed successfully", "extracted_text": text[:100000]} # Limit to 100k chars for Gemma 4 128k context

def extract_text(response):
    try:
        return response.text
    except ValueError:
        parts_text = []
        if getattr(response, "candidates", None):
            for candidate in response.candidates:
                if getattr(candidate, "content", None) and getattr(candidate.content, "parts", None):
                    for part in candidate.content.parts:
                        if getattr(part, "text", None):
                            parts_text.append(part.text)
        if parts_text:
            return "".join(parts_text)
        return "Sorry, I couldn't generate a response. The content may have been blocked by safety filters."

@app.post("/api/chat")
async def chat(request: ChatRequest):
    prompt = f"Context Document:\n{request.context}\n\nUser Question: {request.message}\n\nYou are Lumina, a highly intelligent study assistant powered by Gemma 4. Provide a helpful, educational response using the context if relevant."
    try:
        model = get_model()
        response = model.generate_content(prompt)
        return {"response": extract_text(response)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate_quiz")
async def generate_quiz(request: ChatRequest):
    prompt = f"Context Document:\n{request.context}\n\nYou are Lumina, powered by Gemma 4. Generate a 3-question multiple choice quiz based strictly on the provided context material. Format it cleanly with the answers at the very bottom."
    try:
        model = get_model()
        response = model.generate_content(prompt)
        return {"response": extract_text(response)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/summarize")
async def summarize(request: ChatRequest):
    prompt = f"Context Document:\n{request.context}\n\nYou are Lumina, powered by Gemma 4. Provide a comprehensive, well-structured, and easy-to-read summary of this material using bullet points and headings."
    try:
        model = get_model()
        response = model.generate_content(prompt)
        return {"response": extract_text(response)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)