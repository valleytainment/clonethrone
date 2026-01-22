import { VoiceEngine } from '../types';

interface RemoteBrainResponse {
  video_url?: string;
  error?: string;
  logs?: string[];
  audioBlob?: Blob;
}

/**
 * Service to communicate with the Principal's "Remote Brain" (FastAPI or Gradio).
 */
export const triggerMirrorEngine = async (
  endpoint: string,
  payload: {
    script: string;
    image: string; // base64 string
    voice: VoiceEngine;
  }
): Promise<RemoteBrainResponse> => {
  if (!endpoint) {
    throw new Error("REMOTE_BRAIN_OFFLINE: No endpoint URL configured in System Settings.");
  }

  const cleanEndpoint = endpoint.replace(/\/$/, '');
  
  // Detect if we are using the sovereign FastAPI backend or the Gradio bridge
  const isGradio = cleanEndpoint.includes('gradio.live') || cleanEndpoint.includes('7860');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); 

    if (isGradio) {
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
      if (!response.ok) throw new Error(`GRADIO_BRIDGE_FAILURE: ${response.status}`);
      const result = await response.json();
      const data = result.data;
      if (!data || !Array.isArray(data)) throw new Error("GRADIO_MALFORMED_RESPONSE");

      return {
        video_url: typeof data[0] === 'string' ? data[0] : undefined,
        logs: Array.isArray(data[1]) ? data[1] : ["HANDSHAKE: Payload delivered."]
      };

    } else {
      // SOVEREIGN FASTAPI PROTOCOL (/clone_audio)
      const formData = new FormData();
      formData.append('text', payload.script);
      
      // Convert base64 likeness to Blob
      const imgRes = await fetch(payload.image);
      const imgBlob = await imgRes.blob();
      formData.append('voice_sample', imgBlob, "likeness.png");

      const response = await fetch(`${cleanEndpoint}/clone_audio`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(`REMOTE_NODE_FAILURE: ${errJson.detail}`);
      }
      
      const audioBlob = await response.blob();
      return {
        audioBlob,
        logs: ["SIGNAL_ACQUIRED: Audio stream cloned from remote node."]
      };
    }
  } catch (err: any) {
    if (err.name === 'AbortError') throw new Error("TIMEOUT: Remote node failed to respond.");
    throw new Error(`SIGNAL_LOST: ${err.message}`);
  }
};

/**
 * Verifies the integrity of the Remote Brain link.
 */
export const testRemoteLink = async (endpoint: string): Promise<boolean> => {
  if (!endpoint) return false;
  try {
    const cleanEndpoint = endpoint.replace(/\/$/, '');
    const testUrl = cleanEndpoint.includes('gradio.live') ? `${cleanEndpoint}/config` : cleanEndpoint;
    const response = await fetch(testUrl, { method: 'GET', mode: 'no-cors' });
    return true; 
  } catch (e) {
    return false;
  }
};