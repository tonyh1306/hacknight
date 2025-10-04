import google.generativeai as genai
import base64
import os
import json
import re
from typing import Any, Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Access the API key
api_key = os.getenv("API_KEY")

# You can now use api_key in your code
# print(f"Your API Key: {api_key}")

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

    # Prompt Gemini to output strict JSON with the fields we expect.
    prompt = (
        "You are given an image of a medication label. Extract the following fields and return ONLY a JSON object:\n"
        "{\n"
        "  \"medicationName\": string,\n"
        "  \"genericName\": string,\n"
        "  \"dosage\": string,\n"
        "  \"frequency\": string,\n"
        "  \"instructions\": [string],\n"
        "  \"warnings\": [string],\n"
        "  \"sideEffects\": [string],\n"
        "  \"plainLanguage\": string\n"
        "}\n"
        "If any field is missing, return an empty string or empty list for that field. Output valid JSON only."
    )

    try:
        response = model.generate_content(
            [
                prompt,
                {"mime_type": "image/jpeg", "data": image_bytes},
            ]
        )
    except Exception as e:
        # If the model name is invalid for this API version, return helpful diagnostics
        try:
            from google.api_core import exceptions as google_exceptions
        except Exception:
            google_exceptions = None

        if google_exceptions and isinstance(e, google_exceptions.NotFound):
            # Attempt to list available models using the GenerativeServiceClient
            try:
                from google.ai.generativelanguage_v1beta.services.generative_service import (
                    GenerativeServiceClient,
                )

                client = GenerativeServiceClient()
                models = [m.name for m in client.list_models()]
            except Exception:
                models = None

            # Try OCR fallback since multimodal model is not available
            ocr_text = None
            ocr_error = None
            heuristic_parsed = None
            try:
                from PIL import Image
                import pytesseract

                img = Image.open(image_path)
                ocr_text = pytesseract.image_to_string(img)
            except Exception as oe:
                ocr_error = str(oe)

            # local heuristic parser
            def _heuristic_parse(text: str):
                import re
                out = {
                    "medicationName": "",
                    "genericName": "",
                    "dosage": "",
                    "frequency": "",
                    "instructions": [],
                    "warnings": [],
                    "sideEffects": [],
                    "plainLanguage": "",
                }
                if not text:
                    return out
                lines = [l.strip() for l in text.splitlines() if l.strip()]
                if not lines:
                    return out
                out["medicationName"] = lines[0]
                dose_rx = re.search(r"(\d+\s?(mg|ml|mcg|g)\b|\d+\s?units)", text, re.I)
                if dose_rx:
                    out["dosage"] = dose_rx.group(0)
                freq_rx = re.search(r"(once daily|twice daily|every \d+ (hours|hrs)|daily|every day|at bedtime|as needed|prn|weekly|monthly)", text, re.I)
                if freq_rx:
                    out["frequency"] = freq_rx.group(0)
                instr = []
                for l in lines[1:8]:
                    if re.match(r"^\d+\.|^-|^•|^\*", l) or len(l.split()) > 3:
                        instr.append(l)
                out["instructions"] = instr
                for l in lines:
                    if re.search(r"(warning|caution|avoid|do not|risk|contraindicat)", l, re.I):
                        out["warnings"].append(l)
                    if re.search(r"(side effect|nausea|dizziness|headache|rash|allergic)", l, re.I):
                        out["sideEffects"].append(l)
                out["plainLanguage"] = " ".join(lines[:2])
                return out

            if ocr_text:
                heuristic_parsed = _heuristic_parse(ocr_text)

            # Try calling a text-capable model on OCR text to get strict JSON
            text_model_output = None
            text_model_error = None
            parsed_from_text = None
            if ocr_text:
                try:
                    text_model = genai.GenerativeModel()
                    text_prompt = (
                        "You are given extracted text from a medication label. "
                        "Extract the following fields and return ONLY a JSON object with these keys:\n"
                        "{\n"
                        "  \"medicationName\": string,\n"
                        "  \"genericName\": string,\n"
                        "  \"dosage\": string,\n"
                        "  \"frequency\": string,\n"
                        "  \"instructions\": [string],\n"
                        "  \"warnings\": [string],\n"
                        "  \"sideEffects\": [string],\n"
                        "  \"plainLanguage\": string\n"
                        "}\n"
                        "If a field is missing, return an empty string or empty list. Output valid JSON only.\n\n"
                        "Here is the extracted text:\n\n"
                    ) + ocr_text

                    text_response = text_model.generate_content(text_prompt)
                    text_model_output = getattr(text_response, "text", None) or str(text_response)

                    try:
                        parsed_from_text = json.loads(text_model_output)
                    except Exception:
                        m2 = re.search(r"\{[\s\S]*\}", text_model_output)
                        if m2:
                            try:
                                parsed_from_text = json.loads(m2.group(0))
                            except Exception:
                                parsed_from_text = None
                except Exception as tex:
                    text_model_error = str(tex)

            # prefer parsed_from_text, then heuristic_parsed
            final_parsed = parsed_from_text or heuristic_parsed

            return {
                "text": {
                    "error": str(e),
                    "available_models": models,
                    "ocr_text": ocr_text,
                    "ocr_error": ocr_error,
                    "ocr_parsed": final_parsed,
                    "text_model_output": text_model_output,
                    "text_model_error": text_model_error,
                },
                "raw_output": {"error": str(e)},
            }
        # Other exceptions - re-raise
        raise

    # Grab a dict representation if possible for diagnostics
    try:
        resp_dict = response.to_dict()
    except Exception:
        resp_dict = None

    # Helper: find the first non-empty string in nested structures
    def _find_first_string(obj: Any) -> Optional[str]:
        if obj is None:
            return None
        if isinstance(obj, str):
            s = obj.strip()
            return s if s else None
        if isinstance(obj, list):
            for item in obj:
                found = _find_first_string(item)
                if found:
                    return found
        if isinstance(obj, dict):
            for v in obj.values():
                found = _find_first_string(v)
                if found:
                    return found
        return None

    raw_text: str = ""
    # Preferred: response.text attribute
    try:
        raw_text_candidate = getattr(response, "text", None)
        if raw_text_candidate and isinstance(raw_text_candidate, str) and raw_text_candidate.strip():
            raw_text = raw_text_candidate
    except Exception:
        raw_text = ""

    # Fallback: search the response dict for any string content
    if not raw_text and resp_dict is not None:
        found = _find_first_string(resp_dict)
        if found:
            raw_text = found

    # Final fallback: stringified response
    if not raw_text:
        try:
            raw_text = str(response)
        except Exception:
            raw_text = ""

    # Try to parse JSON from the model output. If parsing fails, try to extract a JSON block.
    parsed = None
    try:
        parsed = json.loads(raw_text)
    except Exception:
        m = re.search(r"\{[\s\S]*\}", raw_text)
        if m:
            try:
                parsed = json.loads(m.group(0))
            except Exception:
                parsed = None

    if parsed is None:
        parsed = {"plain": raw_text}

    # Build diagnostics summary
    diagnostics = {
        "has_text_attr": bool(getattr(response, "text", None)),
        "resp_dict_keys": list(resp_dict.keys()) if isinstance(resp_dict, dict) else None,
    }

    # If parsed JSON is only a plain text fallback or empty, attempt OCR fallback
    ocr_text = None
    ocr_error = None
    heuristic_parsed = None

    only_plain = parsed.keys() == {"plain"} or (isinstance(parsed, dict) and parsed.get("plain") and len(parsed.keys()) == 1)
    if only_plain or (resp_dict is None and not raw_text):
        try:
            from PIL import Image
            import pytesseract

            img = Image.open(image_path)
            ocr_text = pytesseract.image_to_string(img)
        except Exception as e:
            ocr_error = str(e)

        # Simple heuristic parser for medication fields from OCR text
        def heuristic_parse(text: str):
            out = {
                "medicationName": "",
                "genericName": "",
                "dosage": "",
                "frequency": "",
                "instructions": [],
                "warnings": [],
                "sideEffects": [],
                "plainLanguage": "",
            }
            if not text:
                return out

            lines = [l.strip() for l in text.splitlines() if l.strip()]
            if not lines:
                return out

            # First non-empty line as medication name candidate
            out["medicationName"] = lines[0]

            # Find dosage patterns
            import re
            dose_rx = re.search(r"(\d+\s?(mg|ml|mcg|g)\b|\d+\s?units)", text, re.I)
            if dose_rx:
                out["dosage"] = dose_rx.group(0)

            # Frequency keywords
            freq_rx = re.search(r"(once daily|twice daily|every \d+ (hours|hrs)|daily|every day|at bedtime|as needed|prn|weekly|monthly)", text, re.I)
            if freq_rx:
                out["frequency"] = freq_rx.group(0)

            # Instructions: lines that look like steps or start with numbers/bullets
            instr = []
            for l in lines[1:8]:
                if re.match(r"^\d+\.|^-|^•|^\*", l) or len(l.split()) > 3:
                    instr.append(l)
            out["instructions"] = instr

            # Warnings / side effects heuristics
            for l in lines:
                if re.search(r"(warning|caution|avoid|do not|risk|contraindicat)", l, re.I):
                    out["warnings"].append(l)
                if re.search(r"(side effect|nausea|dizziness|headache|rash|allergic)", l, re.I):
                    out["sideEffects"].append(l)

            # Plain language: summarize first 2 lines as plain language fallback
            out["plainLanguage"] = " ".join(lines[:2])
            return out

        if ocr_text:
            heuristic_parsed = heuristic_parse(ocr_text)

            # Try to call a text-capable Gemini model on the OCR text to produce strict JSON
            try:
                # Use default text-capable model (SDK default) which typically supports text generation
                text_model = genai.GenerativeModel()
                text_prompt = (
                    "You are given extracted text from a medication label. "
                    "Extract the following fields and return ONLY a JSON object with these keys:\n"
                    "{\n"
                    "  \"medicationName\": string,\n"
                    "  \"genericName\": string,\n"
                    "  \"dosage\": string,\n"
                    "  \"frequency\": string,\n"
                    "  \"instructions\": [string],\n"
                    "  \"warnings\": [string],\n"
                    "  \"sideEffects\": [string],\n"
                    "  \"plainLanguage\": string\n"
                    "}\n"
                    "If a field is missing, return an empty string or empty list. Output valid JSON only.\n\n"
                    "Here is the extracted text:\n\n"
                ) + ocr_text

                text_response = text_model.generate_content(text_prompt)
                # Prefer text attribute
                text_raw = getattr(text_response, "text", None) or str(text_response)

                # Attempt to parse the model's output as JSON
                parsed_from_text = None
                try:
                    parsed_from_text = json.loads(text_raw)
                except Exception:
                    m2 = re.search(r"\{[\s\S]*\}", text_raw)
                    if m2:
                        try:
                            parsed_from_text = json.loads(m2.group(0))
                        except Exception:
                            parsed_from_text = None

                if parsed_from_text:
                    heuristic_parsed = parsed_from_text
                    # include the text model raw output into diagnostics
                    resp_dict = resp_dict or {}
                    resp_dict["text_model_output"] = text_raw
            except Exception as tex:
                # If text model fails, keep heuristic_parsed and note the error in diagnostics
                resp_dict = resp_dict or {}
                resp_dict["text_model_error"] = str(tex)

    result_obj = {
        "text": parsed if not (heuristic_parsed and not parsed.get("medicationName")) else heuristic_parsed,
        "raw_output": {
            "multimodal": resp_dict if resp_dict is not None else {"repr": str(response)},
            "raw_text": raw_text,
            "ocr_text": ocr_text,
            "ocr_error": ocr_error,
        },
        "diagnostics": diagnostics,
    }

    return result_obj
