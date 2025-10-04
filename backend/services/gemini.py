import google.generativeai as genai
import base64
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Access the API key
api_key = os.getenv("API_KEY")

# You can now use api_key in your code
print(f"Your API Key: {api_key}")

# Initialize Gemini client

genai.configure(api_key=api_key)

async def analyze_meds(image_path: str):
    """
    Send an image of medication to Gemini API.
    Returns extracted text and plain-language explanation.
    """
    with open(image_path, "rb") as f:
        image_bytes = f.read()

    # Call Gemini multimodal
    model = genai.GenerativeModel("gemini-1.5-flash")

    response = model.generate_content(
        [
            "Extract the medication name, dosage, and instructions from this label. "
            "Then explain it in plain English.",
            {"mime_type": "image/jpeg", "data": image_bytes},
        ]
    )

    return {
        "text": response.text,
        "raw_output": response.to_dict(),
    }
