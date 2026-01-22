import os
import uuid
import tempfile
import shutil
import logging
import torch
import soundfile as sf
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Security, Depends
from fastapi.security import APIKeyHeader
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

# Attempt to load the production cloning engine
try:
    from f5_tts.api import F5TTS
except ImportError:
    F5TTS = None

# --- PRODUCTION LOGGING ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("MIRROR_ENGINE")

# --- SECURITY PROTOCOL ---
# Set via environment: export MIRROR_API_KEY="your-secret-password"
API_KEY = os.getenv("MIRROR_API_KEY", "MIRROR_DEFAULT_KEY_99")
api_key_header = APIKeyHeader(name="X-MIRROR-KEY")

async def verify_api_key(api_key: str = Security(api_key_header)):
    if api_key != API_KEY:
        logger.warning("UNAUTHORIZED_ACCESS_ATTEMPT: Connection rejected.")
        raise HTTPException(status_code=403, detail="ACCESS_DENIED: Invalid Mirror Protocol Key.")
    return api_key

# --- HARDWARE DETECTION ---
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
logger.info(f"⚡ HARDWARE DETECTED: {DEVICE.upper()}")

app = FastAPI(title="Operation MIRROR | Production Core v1.2.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ENGINE INITIALIZATION ---
engine = None
if F5TTS:
    logger.info("⚡ LOADING F5-TTS ENGINE (Caching weights)...")
    try:
        engine = F5TTS(model_type="F5-TTS", device=DEVICE)
        logger.info("✅ F5-TTS ONLINE: Zero-Shot Cloning Ready.")
    except Exception as e:
        logger.error(f"❌ ENGINE_LOAD_FAILURE: {e}")
else:
    logger.error("❌ F5-TTS LIBRARY NOT FOUND. Run: pip install git+https://github.com/SWivid/F5-TTS.git")

@app.get("/health")
async def health_check():
    return {"status": "ONLINE", "engine": "READY" if engine else "OFFLINE", "device": DEVICE}

@app.post("/clone_audio", dependencies=[Depends(verify_api_key)])
async def clone_audio(
    text: str = Form(...),
    voice_sample: UploadFile = File(...), # Mandatory audio clip (5-10s)
    speed: float = Form(1.0)
):
    if not engine:
        raise HTTPException(status_code=503, detail="ENGINE_OFFLINE: GPU weights not initialized.")

    session_id = uuid.uuid4().hex
    logger.info(f"[*] SESSION_{session_id}: Cloning from biometric reference '{voice_sample.filename}'")
    
    try:
        # 1. Secure the biometric reference audio
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as ref_audio_file:
            shutil.copyfileobj(voice_sample.file, ref_audio_file)
            ref_path = ref_audio_file.name

        logger.info("🧬 EXTRACTING VOICE DNA...")
        # 2. Execute Zero-Shot Synthesis
        wav, sample_rate, spect = engine.infer(
            ref_file=ref_path,
            ref_text="", 
            gen_text=text,
        )

        # 3. Stream back the mastered clone
        output_path = os.path.join(tempfile.gettempdir(), f"mirror_clone_{session_id}.wav")
        sf.write(output_path, wav, sample_rate)
            
        logger.info(f"✅ SESSION_{session_id}: Clone successfully weaponized.")
        
        # Cleanup
        os.unlink(ref_path)
        return FileResponse(output_path, media_type="audio/wav")

    except Exception as e:
        logger.error(f"[-] SESSION_{session_id}: Synthesis Failure: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    logger.info(f"MIRROR_SERVER_ACTIVE: Listening on port 8000. Device: {DEVICE}")
    uvicorn.run(app, host="0.0.0.0", port=8000)