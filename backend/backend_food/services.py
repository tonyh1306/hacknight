import os
import cv2
import numpy as np
from google import genai
from google.genai.types import Part # Import the Part type for binary data

API_KEY = "AIzaSyD35pWwg7e142SKbw6sJC6S4-DqZQWT-6s" 

# --- 1. API Client Setup (Same as before) ---
try:
    client = genai.Client(api_key=API_KEY)
except Exception as e:
    print(f"Error initializing client. Check if GEMINI_API_KEY is set: {e}")
    exit()

# --- 2. Load Image with OpenCV ---
image_path = ".\Backend\Banana.jpg"
image_np = cv2.imread(image_path) # Read the image into a NumPy array (BGR format)

if image_np is None:
    print(f"Error: Could not load image from '{image_path}'. Check path/integrity.")
    exit()

# --- 3. Convert OpenCV Image to Bytes for Gemini ---
# The best way to pass cv2 images is to encode them into a standard format (like JPEG)
# and then pass the resulting byte data directly to the Gemini SDK.
try:
    # Encode the NumPy array into JPEG format, resulting in a byte array
    ret, buffer = cv2.imencode('.jpg', image_np)
    if not ret:
        raise ValueError("Failed to encode image to buffer.")
        
    image_bytes = buffer.tobytes()

    # Create a Part object to wrap the image data and MIME type
    image_part = Part.from_bytes(
        data=image_bytes, 
        mime_type='image/jpeg'
    )
    
except Exception as e:
    print(f"Error processing image with OpenCV: {e}")
    exit()


# --- 4. Define the Multimodal Prompt ---
prompt_text = "What is the name of this food? Amount seen? "

multimodal_prompt = [
    prompt_text,
    image_part  # Pass the Part object
]

# print("Sending multimodal prompt with OpenCV image data...")

# --- 5. Call the API ---
try:
    response = client.models.generate_content(
        model="gemini-2.5-flash", 
        contents=multimodal_prompt
    )

    print("\n--- Gemini Response ---")
    print(response.text)
    print("-------------------------\n")

except Exception as e:
    print(f"An error occurred during API call: {e}")