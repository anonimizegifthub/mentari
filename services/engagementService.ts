import { createAI, getAiModel } from "./aiConfig";
import { Type } from "@google/genai";
import { VisualDesign } from "../types";
import { generateVisualPoster } from "./teacherToolsService";

export const generateEngagementContent = async (type: string, data: any): Promise<{ text: string }> => {
  const ai = createAI();
  let prompt = "";

  switch (type) {
    case 'certificate':
      prompt = `Buatlah naskah Sertifikat Penghargaan Siswa yang Unik dan Memotivasi.
      Nama Siswa: ${data.namaSiswa || '[Nama Siswa]'}
      Milestone/Pencapaian: ${data.capaian || 'Peserta Teraktif'}
      Nama Guru: ${data.namaGuru}
      Nama Sekolah: ${data.sekolah}
      
      ATURAN OUTPUT PROFESIONAL:
      - DILARANG menggunakan simbol Markdown (#, *, -, >).
      - GUNAKAN TABEL MARKDOWN borderless untuk KOP SERTIFIKAT.
      - Gunakan Huruf Kapital untuk Nama dan Gelar.
      - Berikan 2-3 kalimat apresiasi formal inspiratif.
      
      Gunakan gaya bahasa yang bangga dan penuh penghargaan.`;
      break;

    case 'homeproject':
      prompt = `Buatlah Panduan Tantangan "Home Project" (Eksperimen di Rumah).
      Topik/Materi: ${data.topik}
      Target Kelas: ${data.kelas}
      
      ATURAN OUTPUT PROFESIONAL:
      - DILARANG menggunakan simbol Markdown (#, *, -, >).
      - GUNAKAN TABEL MARKDOWN borderless untuk Judul Proyek dan Identitas Misi.
      - Gunakan penomoran angka saja untuk instruksi.
      - Sertakan: Bahan, Langkah-langkah, dan Fakta Sains.
      - Gunakan bahasa yang ceria namun formal.`;
      break;

    case 'mystery':
      prompt = `Buatlah cerita Detektif Literasi Pendek (Misteri) untuk siswa.
      Tema/Latar: ${data.tema || 'Sekolah'}
      Target Kelas: ${data.kelas}
      
      ATURAN OUTPUT PROFESIONAL:
      - DILARANG menggunakan simbol Markdown (#, *, -, >).
      - GUNAKAN TABEL MARKDOWN borderless untuk Judul Kasus.
      - Cerita harus rapi dengan paragraf naratif yang bersih.
      - Gunakan HURUF KAPITAL untuk petunjuk kunci (clues).
      
      Output harus melatih ketelitian membaca tanpa karakter Markdown yang mengganggu.`;
      break;
  }

  const response = await ai.models.generateContent({
    model: getAiModel(),
    contents: [{ 
      role: 'user', 
      parts: [{ 
        text: `SISTEM INSTRUKSI: Anda adalah desainer gamifikasi pendidikan. Anda menghasilkan teks murni tanpa simbol Markdown (#, *) dan menggunakan tabel Markdown hanya untuk struktur formal yang sangat rapi.\n\n${prompt}` 
      }] 
    }]
  });

  return { text: response.text || "" };
};

export const generateVisualLayout = async (materi: string, content: string, type: string = "Achievement"): Promise<VisualDesign> => {
    const ai = createAI();
    const prompt = `Summarize this appreciation text into a clean 'Award Certificate' or educational layout.
    CONTENT: ${content.substring(0, 1500)}
    TASK: Return JSON with:
    - headline: A short professional title (Capitalized).
    - points: Array of 3 short professional phrases (No symbols).
    - footer: A motivational quote.
    
    IMPORTANT: DONT USE MARKDOWN SYMBOLS. ONLY TEXT.`;

    const response = await ai.models.generateContent({
        model: getAiModel(),
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    headline: { type: Type.STRING },
                    points: { type: Type.ARRAY, items: { type: Type.STRING } },
                    footer: { type: Type.STRING }
                },
                required: ["headline", "points", "footer"]
            }
        }
    });

    const layout = JSON.parse(response.text || "{}");
    const imageUrl = await generateVisualPoster(materi, type);

    return {
        ...layout,
        imageUrl
    };
};
