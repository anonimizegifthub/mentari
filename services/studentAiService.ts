
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
    let systemInstruction = `Anda adalah Pemandu Belajar AI untuk aplikasi 'Mentari'. 
    Tugas Anda adalah membuat petualangan interaktif berbasis HTML/JS yang mendidik dan seru.
    Gunakan Bahasa Indonesia yang ramah anak dan inspiratif.
    Hasilkan HANYA kode HTML mandiri (Single File) yang sudah termasuk CSS (Tailwind via CDN) dan JS.
    DILARANG menyertakan teks penjelasan, pembuka, atau penutup di luar tag HTML.
    DILARANG KERAS menimpa window.fetch atau memodifikasi objek global aplikasi induk.`;

    const userPrompt = `Buatlah sebuah PETUALANGAN INTERAKTIF DIGITAL untuk siswa bernama ${profile.name} (Level ${profile.level}).
    
    TEMA MISI: '${input || 'Petualangan Karakter'}'
    KATEGORI DIMENSI: ${type}
    
    Persyaratan Teknis:
    1. Gunakan Tailwind CSS untuk desain yang modern, ceria, dan bersih (Modern Edutech).
    2. Gunakan font 'Fredoka' dari Google Fonts untuk kesan bersahabat.
    3. Gunakan FontAwesome (CDN) untuk ikon-ikon menarik.
    4. Konten harus berupa mini-game sederhana, narasi pilihan ganda (Choose Your Own Adventure), atau simulasi laboratorium mini.
    5. Di akhir petualangan, WAJIB panggil: window.parent.postMessage({ type: 'ADVENTURE_COMPLETE' }, '*');
    6. Pastikan responsif di layar HP (Mobile Friendly).
    7. Sertakan tombol "SELESAIKAN MISI" di bagian akhir yang memicu postMessage di atas.
    
    Hasilkan HANYA kode HTML lengkap dimulai dengan <!DOCTYPE html>.`;

    const response = await ai.models.generateContent({
      model: getAiModel(),
      contents: userPrompt,
      config: { 
        systemInstruction, 
        temperature: 0.9,
        topP: 0.95
      }
    });

    const text = response.text;
    if (!text || text.trim().length < 100) {
       throw new Error("AI_RESPONSE_EMPTY_OR_TOO_SHORT");
    }
    return cleanOutput(text);
  } catch (e: any) {
    console.error("Adventure Generation Error:", e);
    throw e;
  }
};
