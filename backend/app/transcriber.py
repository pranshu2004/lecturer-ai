from faster_whisper import WhisperModel
import logging
import os

logger = logging.getLogger(__name__)

# Initialize model as None
model = None
MODEL_NAME = "base.en" # Using the .en-only model is even smaller/faster

def load_model():
    """Load the Whisper model into memory."""
    global model
    if model is None:
        logger.info(f"Loading Whisper model: {MODEL_NAME} (device=cpu)...")
        # Use "base.en" for a smaller, faster English-only model
        model = WhisperModel(MODEL_NAME, device="cpu", compute_type="int8")
        logger.info("Whisper model loaded successfully.")

def transcribe_audio(file_path: str) -> str:
    """
    Transcribe audio from a file path.

    Args:
        file_path (str): Path to the audio file.

    Returns:
        str: Transcribed text.
    """
    if model is None:
        logger.warning("Transcriber model was not pre-loaded. Loading now...")
        load_model()
        
    try:
        # Perform transcription
        segments, _ = model.transcribe(file_path, beam_size=5, language="en")
        
        # Combine segments into a single transcript
        transcript = " ".join([segment.text for segment in segments])

        # Normalize text (basic cleanup)
        transcript = transcript.strip()
        return transcript

    except Exception as e:
        raise RuntimeError(f"Error during transcription: {str(e)}")