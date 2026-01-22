import { VoiceEngine } from '../types';

interface RemoteBrainResponse {
  video_url?: string;
  error?: string;
  logs?: string[];
  audioBlob?: Blob;
}

/**
 * Service to communicate with the Principal's "Remote Brain".
 * Supports both Gradio tunnels and Sovereign FastAPI backends with X-MIRROR-KEY security.
 */
export const triggerMirrorEngine = async (
  endpoint: string,
  apiKey: string,
  payload: {
    script: string;
    image: string; // base64 string
    voice: VoiceEngine;
  }
): Promise<RemoteBrainResponse> => {
  if (!endpoint) {
    throw new Error("REMOTE_BRAIN_OFFLINE: No endpoint URL configured.");
  }

  const cleanEndpoint = endpoint.replace(/\/$/, '');
  const isGradio = cleanEndpoint.includes('gradio.live') || cleanEndpoint.includes('7860');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minute timeout for production rendering

    if (isGradio) {
      // GRADIO TUNNEL (For testing/Colab)
      const response = await fetch(`${cleanEndpoint}/api/predict`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: controller.signal,
        body: JSON.stringify({
          data: [payload.script, payload.image, payload.voice],
          fn_index: 0
        })
      });

      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`GRADIO_FAILURE: ${response.status}`);
      const result = await response.json();
      return {
        video_url: result.data?.[0],
        logs: ["SIGNAL_ACQUIRED: Gradio node processed payload."]
      };

    } else {
      // SOVEREIGN PRODUCTION (FastAPI + API Key)
      const formData = new FormData();
      formData.append('text', payload.script);
      
      // Convert base64 likeness to Blob for transport
      const imgRes = await fetch(payload.image);
      const imgBlob = await imgRes.blob();
      formData.append('voice_sample', imgBlob, "biometric_sample.png"); // Using image as voice sample for zero-shot testing
      formData.append('speed', "1.0");

      const response = await fetch(`${cleanEndpoint}/clone_audio`, {
        method: 'POST',
        headers: {
          'X-MIRROR-KEY': apiKey || 'MIRROR_DEFAULT_KEY_99'
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({ detail: "Protocol Rejection" }));
        throw new Error(`REMOTE_NODE_FAILURE: ${errJson.detail}`);
      }
      
      const audioBlob = await response.blob();
      return {
        audioBlob,
        logs: ["SIGNAL_ACQUIRED: Real-time cloning successful."]
      };
    }
  } catch (err: any) {
    if (err.name === 'AbortError') throw new Error("TIMEOUT: Remote node failed to respond.");
    throw new Error(`SIGNAL_LOST: ${err.message}`);
  }
};

export const testRemoteLink = async (endpoint: string, apiKey: string): Promise<boolean> => {
  if (!endpoint) return false;
  try {
    const cleanEndpoint = endpoint.replace(/\/$/, '');
    // Simple reachability check
    const response = await fetch(`${cleanEndpoint}/docs`, { 
        method: 'GET',
        mode: 'no-cors'
    });
    return true; 
  } catch (e) {
    return false;
  }
};
