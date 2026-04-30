
import { createAI, getAiModel } from "./aiConfig";
import { AssessmentFormData } from "../types";

export const generateAssessment = async (formData: AssessmentFormData): Promise<{ text: string }> => {
  try {
    const ai = createAI();
    
    const activeFormats = formData.formats.filter(f => parseInt(f.count) > 0);
    const activeTopics = formData.topics.filter(t => t.materi.trim() !== '');

    const imageInstructions = formData.includeImages ? `
**7. VISUALISASI GAMBAR:**
- Pilih tepat ${formData.imageCount} nomor soal yang paling membutuhkan bantuan visual (misal: soal tentang siklus, anatomi, diagram, atau pemandangan).
- Di atas teks soal tersebut, sertakan gambar menggunakan format: 
  <img src="https://picsum.photos/seed/[KATA_KUNCI_DISINI]/800/450" alt="[DESKRIPSI GAMBAR DETIL DALAM BAHASA INGGRIS]" referrerPolicy="no-referrer" style="width: 100%; border-radius: 8px; margin-bottom: 15px; border: 1px solid #ddd;" />
- Ganti [KATA_KUNCI_DISINI] dengan satu kata kunci unik (misal: "leaf", "circuits", "galaxy").
- Ganti [DESKRIPSI GAMBAR DETIL] dengan prompt deskriptif untuk AI generator.` : '';

    const arabicInstructions = formData.includeArabic ? `
**8. TEKS ARAB / AYAT:**
- Pilih tepat ${formData.arabicCount} nomor soal yang membutuhkan kutipan Ayat Al-Qur'an atau Hadist.
- Gunakan font standar yang jelas dengan harakat lengkap.
- Tuliskan teks Arab di dalam blok kutipan atau rata tengah agar terlihat rapi.` : '';

    const formatRules = [];
    if (activeFormats.some(f => f.type === 'Benar/Salah')) {
      formatRules.push("- **Benar/Salah**: WAJIB disajikan dalam format TABEL Markdown dengan kolom: [No | Pernyataan | Benar | Salah]. Kosongkan sel Benar/Salah agar bisa dicentang siswa.");
    }
    if (activeFormats.some(f => f.type === 'Menjodohkan')) {
      formatRules.push("- **Menjodohkan**: WAJIB disajikan dalam format TABEL Markdown dengan kolom: [No | Pernyataan (Bagian A) | Pilihan Jawaban (Bagian B)]. Acak urutan bagian B.");
    }
    if (activeFormats.some(f => f.type === 'Pilihan Ganda')) {
      formatRules.push("- **Pilihan Ganda**: Gunakan format standar (a-d) di bawah soal.");
    }
    if (activeFormats.some(f => f.type === 'Isian Short' || f.type === 'Melengkapi')) {
      formatRules.push("- **Isian/Melengkapi**: Berikan titik-titik (..........) untuk tempat mengisi jawaban.");
    }

    const prompt = `Hasilkan naskah soal asesmen profesional dengan instruksi KETAT sebagai berikut:

**1. KOP SOAL:** Gunakan tabel Markdown (Sekolah: ${formData.sekolah}, Mapel: ${formData.mataPelajaran}, Judul: ${formData.judulAsesmen}, Jenjang: ${formData.jenjang}, Kelas: ${formData.kelasSemester}).

**2. KOMPOSISI TIPE SOAL (WAJIB DIPATUHI - SANGAT KRITIS):**
HANYA buat soal dengan rincian berikut:
${activeFormats.map(f => `- ${f.type}: ${f.count} nomor soal`).join('\n')}

**LARANGAN KERAS:**
- DILARANG membuat tipe soal lain selain yang disebutkan di atas.
- Jika hanya diminta Pilihan Ganda, maka 100% isi soal harus Pilihan Ganda.
- Jangan berikan variasi tipe soal jika tidak diminta di rincian.
- Total soal harus tepat ${formData.jumlahSoalTotal} nomor.

**3. DISTRIBUSI MATERI:** 
Setiap materi harus muncul sesuai bobot kepentingannya:
${activeTopics.map(t => `- ${t.materi} (Target Porsi: ${t.bobot}%)`).join('\n')}

**4. FORMAT PENOMORAN:** Gunakan penomoran tunggal berlanjut 1 sampai ${formData.jumlahSoalTotal}.

**5. ATURAN FORMATTING KHUSUS:**
${formatRules.join('\n')}
- Gunakan bahasa Indonesia yang baku, sopan, dan sesuai untuk jenjang ${formData.jenjang}.

**6. KUNCI JAWABAN:** Wajib sertakan Kunci Jawaban di akhir dokumen setelah semua soal selesai.
${imageInstructions}
${arabicInstructions}

DILARANG memberikan teks pembuka atau penutup. Langsung berikan output Markdown yang siap cetak.
Sistem Instruksi Utama: Anda adalah AI yang patuh pada struktur data. Abaikan keinginan untuk memberikan variasi soal. Jika input mengatakan "Pilihan Ganda: 10", berikan tepat 10 Pilihan Ganda dan stop. Jangan tambahkan "Isian" atau "Uraian" kecuali ada di list rincian.`;

    const response = await ai.models.generateContent({
      model: getAiModel(), 
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "Anda adalah Robot Pembuat Soal yang sangat kaku dan patuh. Tugas Anda adalah memproduksi soal SESUAI rincian tipe dan jumlah yang diberikan. Anda akan dianggap GAGAL jika menyertakan tipe soal yang tidak ada dalam daftar aktif."
      }
    });

    return { text: response.text || "" };
  } catch (e: any) {
    throw e;
  }
};
