
import { GoogleGenAI } from "@google/genai";

// Fungsi untuk mendapatkan model AI yang dipilih oleh guru dari localStorage
export const getAiModel = (): string => {
  try {
    const saved = localStorage.getItem('teacher_settings');
    if (saved) {
      const settings = JSON.parse(saved);
      const model = settings.aiModel || 'gemini-1.5-flash';
      return model;
    }
  } catch (e) {}
  return 'gemini-1.5-flash';
};

// Deprecated constant, please use getAiModel()
export const OPTIMIZED_MODEL = getAiModel();

export const createAI = () => {
  // 1. Ambil dari input manual Guru di Pengaturan (Prioritas Utama)
  let userKey = localStorage.getItem('USER_API_KEY');
  
  // Fallback: Coba ambil dari inside teacher_settings jika USER_API_KEY kosong
  if (!userKey || userKey.trim() === "" || userKey === "undefined") {
    try {
      const saved = localStorage.getItem('teacher_settings');
      if (saved) {
        const settings = JSON.parse(saved);
        if (settings.manualApiKey && settings.manualApiKey.trim() !== "") {
          userKey = settings.manualApiKey.trim();
        }
      }
    } catch (e) {}
  }
  
  // 2. Ambil dari variabel lingkungan (Vercel/Vite/Local)
  // Vite menggunakan import.meta.env
  // Google AI Studio menggunakan process.env yang di-inject via define
  
  const finalKey = (userKey && userKey.trim() !== "" && userKey !== "undefined") 
    ? userKey.trim() 
    : (import.meta as any).env?.VITE_GEMINI_API_KEY || 
      (import.meta as any).env?.VITE_API_KEY ||
      (process.env as any).GEMINI_API_KEY ||
      (process.env as any).API_KEY;

  if (!finalKey || finalKey === "undefined" || String(finalKey).trim() === "") {
    console.error("DEBUG AI: API Key missing.");
    throw new Error("API_KEY_MISSING");
  }
  
  return new GoogleGenAI({ apiKey: String(finalKey).trim() });
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
