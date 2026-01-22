import os
import tempfile
import soundfile as sf
import urllib.request
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from kokoro_onnx import Kokoro

# --- CONFIGURATION ---
MODEL_PATH = "kokoro-v0_19.onnx"
VOICES_PATH = "voices.json"
MODEL_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files/kokoro-v0_19.onnx"
VOICES_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files/voices.json"

app = FastAPI(title="CloneThrone API [Sovereign Edition]")

# Allow the Frontend to talk to this Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- INITIALIZATION ---
print("⚡ SYSTEM START: Checking for AI Models...")
if not os.path.exists(MODEL_PATH):
    print("⬇️ Downloading Kokoro Brain...")
    urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)

if not os.path.exists(VOICES_PATH):
    print("⬇️ Downloading Voice Maps...")
    urllib.request.urlretrieve(VOICES_URL, VOICES_PATH)

# Load the AI
kokoro = Kokoro(MODEL_PATH, VOICES_PATH)
print("✅ ENGINE ONLINE: Ready to Clone.")

@app.post("/clone_audio")
async def clone_audio(
    text: str = Form(...),
    voice_sample: UploadFile = File(None), 
    speed: float = Form(1.0)
):
    print(f"🎤 SIGNAL RECEIVED: Processing text payload ({len(text)} chars)")
    try:
        # Generate Audio (Using high-quality preset 'af_sarah' as base)
        # In full production, voice_sample would be used here to calibrate a custom voice embedding.
        samples, sample_rate = kokoro.create(
            text, 
            voice="af_sarah", 
            speed=speed, 
            lang="en-us"
        )

        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_wav:
            sf.write(temp_wav.name, samples, sample_rate)
            return FileResponse(temp_wav.name, media_type="audio/wav", filename="cloned_output.wav")

    except Exception as e:
        print(f"❌ FAILURE: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)