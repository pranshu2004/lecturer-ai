from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Load a small, instruction-tuned model ---
# This happens once when the server starts
MODEL_NAME = "google/flan-t5-small" 
tokenizer = None
model = None

def load_model():
    """Load the model and tokenizer into memory."""
    global tokenizer, model
    if model is None:
        logger.info(f"Loading model: {MODEL_NAME}...")
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)
        logger.info("Model loaded successfully.")
    return tokenizer, model

def summarize_text(text: str) -> str:
    """Summarize text using the self-hosted FLAN-T5 model."""
    try:
        tokenizer, model = load_model()
        
        # --- Because it's an instruction model, we can tell it what to do ---
        prompt = f"""
Summarize the following text into concise bullet points:

{text}

Summary:
"""
        
        inputs = tokenizer(prompt, return_tensors="pt", max_length=512, truncation=True)
        outputs = model.generate(
            **inputs, 
            max_new_tokens=150, 
            num_beams=4, # Helps with quality
            early_stopping=True
        )
        
        summary = tokenizer.decode(outputs[0], skip_special_tokens=True)
        logger.info("Summarization completed successfully.")
        return summary

    except Exception as e:
        logger.error(f"Summarization failed: {e}")
        raise ValueError(f"Summarization failed: {e}")

# This is what you would call from your web server (e.g., Flask)
if __name__ == "__main__":
    text = "Chemistry is the study of matter. Matter is anything that has mass and takes up space. Organic chemistry is the study of carbon-containing compounds, which are the basis of all life."
    summary = summarize_text(text)
    print("--- Summary ---")
    print(summary)