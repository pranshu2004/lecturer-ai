from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware # Import CORS
import os
import tempfile
from app.transcriber import transcribe_audio, load_model as load_transcriber_model
from app.summarizer import summarize_text, load_model as load_summarizer_model
import logging

# Initialize FastAPI app
app = FastAPI()
logger = logging.getLogger(__name__)

# --- ADD THIS MIDDLEWARE SECTION ---
# Allow all origins (for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)
# --- END OF MIDDLEWARE SECTION ---

@app.on_event("startup")
async def startup_event():
    """Load all ML models on server startup."""
    logger.info("Server starting up, loading models...")
    load_summarizer_model()
    load_transcriber_model()
    logger.info("All models loaded successfully.")

# ... (Rest of your app routes /health, /transcribe, etc. are unchanged) ...

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/transcribe")
async def transcribe_audio_endpoint(file: UploadFile):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            temp_file.write(await file.read())
            temp_path = temp_file.name

        transcript = transcribe_audio(temp_path)
        summary = summarize_text(transcript)
        os.remove(temp_path)
        return {"transcript": transcript, "summary": summary}

    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process the file: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Welcome to the Audio Transcription and Summarization API"}

@app.get("/favicon.ico")
async def favicon():
    return {"message": "Favicon not present for now."}
