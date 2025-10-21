from fastapi import FastAPI, HTTPException, UploadFile
import os
import tempfile
from app.transcriber import transcribe_audio, load_model as load_transcriber_model
from app.summarizer import summarize_text, load_model as load_summarizer_model
import logging

# Initialize FastAPI app
app = FastAPI()
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    """Load the ML models on server startup."""

    logger.info("Server starting up, loading models...")
    load_summarizer_model()
    load_transcriber_model()
    logger.info("Models loaded successfully.")

# Health check route
@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Transcribe and summarize route
@app.post("/transcribe")
async def transcribe_audio_endpoint(file: UploadFile):
    try:
        # Save the uploaded file to a temporary path
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            temp_file.write(await file.read())
            temp_path = temp_file.name

        # Call the transcriber
        transcript = transcribe_audio(temp_path)

        # Call the summarizer
        summary = summarize_text(transcript)

        # Clean up the temporary file
        os.remove(temp_path)

        # Return the transcript and summary
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