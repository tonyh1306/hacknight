from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import cv2
import tempfile
import os
from services.gemini import analyze_food, analyze_meds

app = FastAPI()

# CORS so Next.js (localhost:3000) can talk to FastAPI (localhost:8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],  # allow frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class AnalyzeResponse(BaseModel):
    text: dict
    raw_output: dict


@app.post("/analyze-food", response_model=AnalyzeResponse)
async def analyze_food_endpoint(file: UploadFile = File(None), capture: bool = False):
    """
    Either take an uploaded image file from Next.js,
    OR capture a photo directly with OpenCV if `capture=true`.
    """

    if capture:
        # Capture a frame using OpenCV
        cap = cv2.VideoCapture(0)
        ret, frame = cap.read()
        cap.release()
        if not ret:
            return {"text": "Camera error", "raw_output": {}}
        
        # Save temp file
        tmp_path = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg").name
        cv2.imwrite(tmp_path, frame)
        image_path = tmp_path
    else:
        # Save uploaded file
        contents = await file.read()
        tmp_path = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg").name
        with open(tmp_path, "wb") as f:
            f.write(contents)
        image_path = tmp_path

    # Call Gemini analysis service
    result = await analyze_food(image_path)

    # cleanup
    os.remove(image_path)

    return result


@app.post("/analyze-meds")
async def analyze_meds_endpoint(file: UploadFile = File(None), capture: bool = False, format: str = "full"):
    """
    Analyze a medication label image. If `format=json_only` is provided, return only the
    parsed medication object when available; otherwise return the full analyzer result.
    """

    if capture:
        # Capture a frame using OpenCV
        cap = cv2.VideoCapture(0)
        ret, frame = cap.read()
        cap.release()
        if not ret:
            return {"error": "Camera error"}
        tmp_path = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg").name
        cv2.imwrite(tmp_path, frame)
        image_path = tmp_path
    else:
        contents = await file.read()
        tmp_path = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg").name
        with open(tmp_path, "wb") as f:
            f.write(contents)
        image_path = tmp_path

    result = await analyze_meds(image_path)

    # cleanup
    try:
        os.remove(image_path)
    except Exception:
        pass

    if format == "json_only":
        # If analyzer returned a parsed object under `text`, return it; otherwise return an error with diagnostics
        parsed = result.get("text") if isinstance(result, dict) else None
        if parsed and isinstance(parsed, dict) and any(k in parsed for k in ("medicationName", "dosage", "instructions")):
            return parsed
        return {"error": "no parsed medication data", "diagnostics": result}

    return result
