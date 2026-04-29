import { createAI, getAiModel } from "./aiConfig";
import { Type } from "@google/genai";
import { VisualDesign } from "../types";

export const generateTeacherTool = async (type: string, data: any): Promise<{ text: string }> => {
  const ai = createAI();
  let prompt = "";

  const globalRules = `
    ATURAN TEKNIS WAJIB:
    1. DILARANG KERAS menggunakan karakter "-" (strip/dash) di seluruh output.
    2. DILARANG menggunakan karakter simbol Markdown (#, *, -, >).
    3. SEMUA DAFTAR ATAU PENOMORAN WAJIB disajikan dalam format TABEL MARKDOWN.
    4. DILARANG membuat baris judul/header tabel. Langsung masukkan data angkanya.
    5. Gunakan Huruf Kapital untuk Judul Utama dan Sub Judul.
    6. GUNAKAN TABEL untuk bagian KOP identitas di awal dokumen.
    7. Identitas Wajib: Sekolah: ${data.sekolah}, Guru: ${data.guru}, Kelas: ${data.kelas}.
  `;

  switch (type) {
    case 'lkpd':
      prompt = `Anda adalah pakar desain LKPD Kurikulum Merdeka. Buatlah LKPD yang menantang dan rapi.
      MATERI: ${data.materi}
      KELAS: ${data.kelas}
      ${globalRules}
      STRUKTUR LKPD:
      1. KOP IDENTITAS (Tabel: Nama Sekolah, Mapel, Materi, Nama Guru, Kelas).
      2. STIMULUS: Narasi pengantar materi yang mendalam.
      3. PERTANYAAN PEMANTIK (Tampilkan dalam tabel penomoran langsung isi).
      4. LANGKAH KERJA (Tampilkan dalam tabel penomoran langsung isi).
      5. TUGAS MANDIRI/DISKUSI: 5 Soal analisis (Tampilkan dalam tabel penomoran langsung isi).
      6. REFLEKSI (Tampilkan dalam tabel penomoran langsung isi).`;
      break;

    case 'summary':
      prompt = `Buatlah Ringkasan Materi Sistematis.
      Sekolah: ${data.sekolah}
      Materi: ${data.materi}
      Kelas: ${data.kelas}
      ${globalRules}
      - Gunakan TABEL untuk memisahkan poin-poin materi utama tanpa header.
      - Kata kunci penting menggunakan HURUF KAPITAL.`;
      break;

    case 'rubric':
      prompt = `Buatlah Rubrik Penilaian Proyek dalam format TABEL.
      Sekolah: ${data.sekolah}
      Judul Proyek: ${data.materi}
      ${globalRules}
      - Header Tabel Rubrik tetap diperbolehkan: | KRITERIA | SANGAT BAIK | BAIK | CUKUP | PERLU BIMBINGAN |`;
      break;

    case 'simplifier':
      prompt = `Sederhanakan teks materi berikut untuk siswa ${data.phase}.
      Teks Asli: ${data.text}
      Target: ${data.phase}
      ${globalRules}`;
      break;
  }

  const response = await ai.models.generateContent({
    model: getAiModel(),
    contents: prompt,
    config: {
      systemInstruction: "Anda adalah asisten admin guru profesional yang mahir menyajikan data dalam tabel Markdown untuk kerapian maksimal."
    }
  });

  return { text: response.text || "" };
};

export const generateVisualPoster = async (materi: string, type: string = "Educational Poster"): Promise<string> => {
    const ai = createAI();
    // Prompt diperkuat untuk memaksa AI menyertakan teks judul langsung pada gambar
    const prompt = `Create a professional high-quality educational ${type} poster for the subject: "${materi.toUpperCase()}".
    INTEGRATED TEXT REQUIREMENT: Write the text "${materi.toUpperCase()}" clearly and artistically inside the poster design using bold professional typography.
    STYLE: High-quality minimalist vector art, educational aesthetic, soft professional colors, cinematic lighting, ultra-detailed 4K.
    CONTENT FOCUS: Academic, inspirational, and classroom-ready.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: [{ text: prompt }],
        config: { 
            imageConfig: { 
                aspectRatio: "3:4",
                imageSize: "2K"
            } 
        }
    });
    let imageUrl = "";
    if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) { 
                imageUrl = `data:image/png;base64,${part.inlineData.data}`; 
            }
        }
    }
    return imageUrl;
};

export const generateVisualLayout = async (materi: string, content: string, type: string = "Poster"): Promise<VisualDesign> => {
    const ai = createAI();
    const prompt = `Extract exactly 3 most important educational points from this text for a ${type} layout. 
    CONTENT: ${content.substring(0, 1500)}
    TASK: Return a JSON object with:
    - headline: A short professional title.
    - points: Array of 3 key takeaways (max 10 words each).
    - footer: A motivational quote or school tagline.
    
    IMPORTANT: Use ONLY professional Indonesian text without any special characters, markdown symbols, or formatting codes.`;

    const response = await ai.models.generateContent({
        model: getAiModel(),
        contents: prompt,
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
    return { ...layout, imageUrl };
};

/**
 * GENERATOR PROMPT CANVA UNIVERSAL (CLEAN VERSION)
 * Membersihkan seluruh simbol markdown dan menghasilkan narasi murni untuk Canva AI tanpa karakter aneh.
 */
export const buildCanvaPrompt = (type: string, materi: string, content: string, school: string): string => {
  // Membersihkan karakter khusus secara total: hapus #, *, |, -, >, _, :, [, ], (, )
  const cleanContent = content
    .replace(/[#*|>\-_:\[\]()]/g, ' ') 
    .replace(/\n+/g, ' ')             
    .replace(/\s\s+/g, ' ')           
    .trim()
    .substring(0, 700);

  return `CREATE A PROFESSIONAL EDUCATIONAL ${type.toUpperCase()} DESIGN FOR ${school.toUpperCase()}. 
  TOPIC: ${materi.toUpperCase()}. 
  MAIN INFORMATION TO INCLUDE: ${cleanContent}. 
  DESIGN GUIDELINES: Use a clean modern classroom style with high-quality educational illustrations. 
  Apply premium typography and a logical layout hierarchy. 
  Ensure the result is visually appealing for students and teachers.`.replace(/\s\s+/g, ' ').trim();
};
