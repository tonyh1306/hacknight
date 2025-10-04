import google.generativeai as genai
import base64

# Initialize Gemini client
genai.configure(api_key="AIzaSyD35pWwg7e142SKbw6sJC6S4-DqZQWT-6s")



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
