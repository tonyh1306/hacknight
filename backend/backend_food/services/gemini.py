import cv2
import numpy as np
from google import genai
from google.genai.types import Part # Import the Part type for binary data
from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("API_KEY")

# --- 1. API Client Setup (Same as before) ---
try:
    client = genai.Client(api_key=api_key)
except Exception as e:
    print(f"Error initializing client. Check if GEMINI_API_KEY is set: {e}")
    exit()


def analyze_food(image_name):
    #initialize image
    image_path = ".\\Backend\\services\\" + image_name
    image_np = cv2.imread(image_path) # Read the image into a NumPy array (BGR format)
    
    if image_np is None:
        print(f"Error: Could not load image from '{image_path}'. Check path/integrity.")
        exit()

    try:

        ret,buffer = cv2.imencode('.jpg',image_np)
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

    prompt_text = "What is the name of this food? Calories of Food in Picture? Protein amount in food? Carbs? Fat? Fiber? Sodium? Insights? ReccomendationsOnly answer the questions specifically. No need to repeat response questions."
    multimodal_prompt = [prompt_text, image_part]

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

analyze_food("Banana.jpg")