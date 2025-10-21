import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))

from app import transcriber

def test_transcribe_audio():
    # Test the transcribe_audio function with a sample audio file
    audio_file = "../../audio_samples/sample_audio.wav"
    transcript = transcriber.transcribe_audio(audio_file)
    print(transcript)
    assert transcript is not None
    assert isinstance(transcript, str)
    assert len(transcript) > 0