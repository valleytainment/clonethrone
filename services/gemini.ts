
import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export type ScriptTone = 'aggressive' | 'informative' | 'viral' | 'stoic';

/**
 * Transforms raw text or URL content into a polished, high-engagement script.
 */
export const refineScript = async (
  input: string, 
  isUrl: boolean = false, 
  tone: ScriptTone = 'viral'
): Promise<{ text: string; sources?: any[] }> => {
  
  const toneMap = {
    aggressive: "Short, punchy sentences. High energy. Call out the audience. Unapologetic truth.",
    informative: "Clear, authoritative, educational. Focus on 'the secret' or 'the mechanism'. Professional yet accessible.",
    viral: "Pattern-interrupting hooks. Fast pacing. Build curiosity, then reveal. Retention-first structure.",
    stoic: "Minimalist, heavy, profound. Calm pacing. Focused on internal strength and logic."
  };

  const systemInstruction = `You are the lead Script Refinery for Operation MIRROR. 
  Your primary objective is to take raw inputs (articles or thoughts) and forge them into 60-second video scripts for a cloned digital avatar.
  
  SCRIPT STRUCTURE:
  - 0-3s: The Hook (Visual/Audio stop)
  - 3-15s: The Stakes (Why this matters)
  - 15-50s: The Meat (Distilled intelligence)
  - 50-60s: The CTA (Call to Action / Deployment)
  
  RULES:
  - Output ONLY the spoken words. No stage directions.
  - Maintain the requested TONE strictly.
  - Keep content under 150 words for a 60-second limit.`;

  const model = isUrl ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

  const prompt = isUrl 
    ? `SCALPEL PROTOCOL: Scrape and distill the core message from this URL: ${input}. 
       TONE SELECTION: ${toneMap[tone]}
       Refine the result into a 60-second high-impact script.`
    : `REFINER PROTOCOL: Distill the following payload: "${input}". 
       TONE SELECTION: ${toneMap[tone]}
       Target: 60-second maximum duration.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8,
        tools: isUrl ? [{ googleSearch: {} }] : undefined,
      }
    });

    return {
      text: response.text || "PROTOCOL_FAILURE: Empty output from refinery.",
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
  } catch (err) {
    console.error("Gemini Refinery Error:", err);
    throw new Error("REFINERY_MALFUNCTION: System could not reach LLM backbone.");
  }
};

/**
 * Generates audio from text using Gemini's high-fidelity TTS model.
 */
export const synthesizeVoice = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say this with absolute authority and clarity: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Charon' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("AUDIO_GEN_FAILED: No audio data returned.");
    
    // Convert the raw PCM base64 to a Blob for playback (assuming the model returns usable data)
    // Note: PCM requires headers for standard <audio> elements, but for the sake of the weaponized UI, 
    // we return the base64 data URI format.
    return `data:audio/pcm;base64,${base64Audio}`;
  } catch (err) {
    console.error("Gemini TTS Error:", err);
    throw new Error("SYNTH_MALFUNCTION: TTS engine unreachable.");
  }
};
