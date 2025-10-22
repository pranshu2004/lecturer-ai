from fastapi import FastAPI, HTTPException, UploadFile
import os
import tempfile
# --- We will NOT use the summarizer for this test ---
from app.transcriber import transcribe_audio, load_model as load_transcriber_model
# from app.summarizer import summarize_text, load_model as load_summarizer_model
import logging

# Initialize FastAPI app
app = FastAPI()
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    try:
        logger.info("Instance started/created.")
    except Exception as e:
        logger.error(f"Error during startup: {str(e)}")

# Health check route
@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Transcribe and summarize route
@app.post("/transcribe")
async def transcribe_audio_endpoint(file: UploadFile):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            temp_file.write(await file.read())
            temp_path = temp_file.name

        # Call the transcriber
        transcript = transcribe_audio(temp_path)

        # --- For this test, DO NOT call the summarizer ---
        # summary = summarize_text(transcript)
        summary = "Summary is currently disabled for testing." # Return a placeholder

        os.remove(temp_path)

        # Return the transcript and a placeholder summary
        return {"transcript": transcript, "summary": summary}

    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process the file: {str(e)}")

# ... (rest of your routes are fine) ...
@app.get("/")
async def root():
    return {"message": "Welcome to the Audio Transcription and Summarization API"}

@app.get("/favicon.ico")
async def favicon():
    return {"message": "Favicon not present for now."}
