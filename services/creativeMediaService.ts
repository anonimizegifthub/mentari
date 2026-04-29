
import { createAI, getAiModel } from "./aiConfig";
import { Type } from "@google/genai";

export interface CreativeMediaResponse {
  draft: string;
  source: string;
}

export const generateCreativeMedia = async (type: string, data: any): Promise<CreativeMediaResponse> => {
  const ai = createAI();
  
  const identitasStr = `INSTITUSI: ${data.sekolah} | PENYUSUN: ${data.guru} | TARGET: ${data.kelas}`;
  const materiHeader = `SUBJEK UTAMA: ${data.materi}\nDETAIL KONTEKS: ${data.text}\nLEVEL AKADEMIK: ${data.kelas}`;

  const prompt = `Anda adalah Spesialis Konten Edukasi Digital. Tugas Anda adalah merakit materi '${type}' berdasarkan input berikut:
  
  ${materiHeader}
  ${identitasStr}

  PERSYARATAN OUTPUT (WAJIB DIPATUHI):
  1. DILARANG KERAS menggunakan simbol Markdown seperti tanda bintang (*), pagar (#), strip (-), garis bawah (_), atau kurung siku.
  2. DILARANG menggunakan tag HTML seperti <br>.
  3. Gunakan HURUF KAPITAL untuk Judul dan Sub-Judul.
  4. Gunakan spasi baris ganda sebagai pemisah paragraf agar teks bersih.

  FORMAT JSON YANG HARUS DIHASILKAN:
  {
    "draft": "Teks terstruktur yang akan ditampilkan di aplikasi. Gunakan penomoran angka (1., 2., dst) dan judul bagian dalam ALL-CAPS. Sajikan materi dalam poin-poin deskriptif tanpa simbol.",
    "source": "Teks deskripsi naratif yang SANGAT RINCI, LENGKAP, DAN FAKTUAL untuk dijadikan sumber pengetahuan di NotebookLM. Gunakan gaya bahasa ensiklopedia. Teks ini harus mencakup seluruh aspek materi secara mendalam agar AI di NotebookLM memiliki basis data yang kuat."
  }

  PANDUAN KHUSUS TIAP ALAT:
  - INFOGRAPHIC: Fokus pada ringkasan visual, statistik, dan fakta kunci.
  - PRESENTATION: Buat outline slide per slide (SLIDE 1, SLIDE 2, dst) dengan poin konten utama.
  - MINDMAP: Gunakan hierarki konsep dari TINGKAT PUSAT ke CABANG UTAMA lalu SUB-CABANG.
  - TABLE: Sajikan data perbandingan dengan format: NAMA ITEM | KATEGORI | DESKRIPSI.
  - VIDEO_SCRIPT: Buat skenario visual dan dialog narasi.

  Hasilkan HANYA objek JSON.`;

  const response = await ai.models.generateContent({
    model: getAiModel(),
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          draft: { type: Type.STRING },
          source: { type: Type.STRING }
        },
        required: ["draft", "source"]
      },
      systemInstruction: "Anda adalah asisten cerdas yang mahir menghasilkan data JSON bersih tanpa karakter format markdown apa pun."
    }
  });

  try {
    const rawText = response.text || "{}";
    // Extra safety cleaning if AI fails to follow instructions
    const parsed = JSON.parse(rawText) as CreativeMediaResponse;
    const cleaner = (str: string) => str.replace(/[#*_\-<>]/g, '').trim();
    
    return {
      draft: cleaner(parsed.draft),
      source: cleaner(parsed.source)
    };
  } catch (e) {
    return { 
      draft: "Gagal memproses draft materi.", 
      source: "Gagal memproses sumber materi." 
    };
  }
};
