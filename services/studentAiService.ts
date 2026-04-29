
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
      contents: prompt,
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
      contents: prompt,
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
      contents: `Siswa merasa ${mood}. Berikan 1 kalimat penyemangat (maks 15 kata).`,
    });
    return response.text || "Tetap semangat ya!";
  } catch (e) {
    return "Tetap semangat belajar!";
  }
};

export const generateAdventureContent = async (type: string, profile: StudentProfile, input?: string): Promise<string> => {
  try {
    const ai = createAI();
    let systemInstruction = "Anda adalah Pemandu Belajar AI yang kreatif. Hasilkan HANYA kode HTML mandiri tanpa teks pembuka, penutup, atau penjelasan apa pun. DILARANG KERAS menimpa window.fetch.";
    const userPrompt = `Buat petualangan interaktif (Gamified) tentang '${input || 'Umum'}'. 
    Gunakan Tailwind CSS, Fredoka font, FontAwesome. 
    WAJIB panggil window.parent.postMessage({ type: 'ADVENTURE_COMPLETE' }, '*') saat selesai.
    DILARANG menimpa window.fetch.
    Hasilkan HANYA kode HTML lengkap.`;

    const response = await ai.models.generateContent({
      model: getAiModel(),
      contents: userPrompt,
      config: { systemInstruction, temperature: 1.0 }
    });

    return cleanOutput(response.text || "");
  } catch (e: any) {
    throw e;
  }
};
