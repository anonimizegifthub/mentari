
import { Type } from "@google/genai";
import { createAI, getAiModel, cleanOutput } from "./aiConfig";
import { StudentProfile } from "../types";

export const getDailyInspiration = async (subjects: string[]): Promise<{category: string, title: string, content: string}> => {
  try {
    const ai = createAI();
    const categories = ["Astronomi", "Biologi", "Sejarah", "Teknologi", "Psikologi Belajar", "Matematika", "Geografi", "Inovasi"];
    const selectedCategory = categories[Math.floor(Math.random() * categories.length)];

    const prompt = `Berikan satu wawasan harian UNIK untuk siswa. Kategori: '${selectedCategory}'. Mapel relevan: ${subjects.join(', ')}. Format JSON. Teks Indonesia elegan.`;
    
    const response = await ai.models.generateContent({
      model: getAiModel(),
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            title: { type: Type.STRING },
            content: { type: Type.STRING }
          },
          required: ["category", "title", "content"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (e: any) {
    return { category: "Sains", title: "Kecepatan Cahaya", content: "Cahaya bisa mengelilingi bumi 7,5 kali dalam satu detik!" };
  }
};

export const getWordOfDay = async (studentName: string): Promise<{word: string, meaning: string, example: string}> => {
  try {
    const ai = createAI();
    const prompt = `Berikan satu kosakata Bahasa Indonesia yang INDAH untuk siswa. Nama siswa: ${studentName}. Format JSON: {"word": "...", "meaning": "...", "example": "..."}`;
    const response = await ai.models.generateContent({
      model: getAiModel(),
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (e: any) {
    return { word: "Eksplorasi", meaning: "Kegiatan menjelajahi tempat baru.", example: `${studentName} sedang bereksplorasi.` };
  }
};

export const getMoodResponse = async (mood: string): Promise<string> => {
  try {
    const ai = createAI();
    const response = await ai.models.generateContent({
      model: getAiModel(),
      contents: [{ role: 'user', parts: [{ text: `Siswa merasa ${mood}. Berikan 1 kalimat penyemangat (maks 15 kata). Jawab dalam Bahasa Indonesia.` }] }],
    });
    return response.text || "Tetap semangat ya!";
  } catch (e) {
    return "Tetap semangat belajar!";
  }
};

export const generateAdventureContent = async (type: string, profile: StudentProfile, input?: string): Promise<string> => {
  try {
    const ai = createAI();
    const systemText = `Anda adalah Pemandu Belajar AI untuk aplikasi 'Mentari'. 
    Tugas Anda adalah membuat petualangan interaktif berbasis HTML/JS yang mendidik dan seru.
    Hasilkan HANYA kode HTML mandiri (Single File) yang sudah termasuk CSS (Tailwind via CDN) dan JS.
    DILARANG menyertakan teks penjelasan di luar tag HTML.
    WAJIB menyertakan tombol "SELESAIKAN MISI" yang memicu: window.parent.postMessage({ type: 'ADVENTURE_COMPLETE' }, '*');`;

    const userPrompt = `Buatlah PETUALANGAN INTERAKTIF DIGITAL untuk siswa bernama ${profile.name} (Level ${profile.level}).
    TEMA MISI: '${input || 'Petualangan Karakter'}'
    KATEGORI DIMENSI: ${type}
    Hasilkan HANYA kode HTML lengkap dimulai dengan <!DOCTYPE html>.`;

    const response = await ai.models.generateContent({
      model: getAiModel(),
      contents: [
        { role: 'user', parts: [{ text: systemText + "\n\n" + userPrompt }] }
      ],
      config: { 
        temperature: 0.9,
        topP: 0.95
      }
    });

    const text = response.text;
    if (!text || text.trim().length < 50) {
       throw new Error("AI_RESPONSE_EMPTY_OR_TOO_SHORT");
    }
    return cleanOutput(text);
  } catch (e: any) {
    console.error("Adventure Generation Error:", e);
    throw e;
  }
};
