
import { GoogleGenAI } from "@google/genai";

// Fungsi untuk mendapatkan model AI yang dipilih oleh guru dari localStorage
export const getAiModel = (): string => {
  try {
    const saved = localStorage.getItem('teacher_settings');
    if (saved) {
      const settings = JSON.parse(saved);
      return settings.aiModel || 'gemini-1.5-flash';
    }
  } catch (e) {}
  return 'gemini-1.5-flash';
};

// Deprecated constant, please use getAiModel()
export const OPTIMIZED_MODEL = getAiModel();

export const createAI = () => {
  const userKey = localStorage.getItem('USER_API_KEY');
  const envKey = process.env.API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  
  // Prioritas: Manual User Key > GEMINI_API_KEY (Platform) > API_KEY (Fallback)
  const finalKey = (userKey && userKey.trim() !== "") 
    ? userKey.trim() 
    : (geminiKey && geminiKey.trim() !== "") 
      ? geminiKey.trim() 
      : envKey;

  if (!finalKey || finalKey === "undefined" || finalKey === "") {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey: finalKey });
};

export const cleanHtmlOutput = (text: string): string => {
  let clean = text.replace(/```html/gi, '').replace(/```/g, '').trim();
  
  const startTag = "<!DOCTYPE html";
  const startTagLower = clean.toLowerCase();
  const startIndex = startTagLower.indexOf(startTag.toLowerCase());
  
  const endTag = "</html>";
  const endIndex = startTagLower.lastIndexOf(endTag.toLowerCase());
  
  if (startIndex !== -1 && endIndex !== -1) {
    return clean.substring(startIndex, endIndex + endTag.length);
  } else if (startIndex !== -1) {
    return clean.substring(startIndex);
  }
  
  return clean;
};

export const cleanOutput = cleanHtmlOutput;
