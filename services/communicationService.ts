
import { createAI, getAiModel } from "./aiConfig";

export const generateCommunicationContent = async (type: string, data: any): Promise<{ text: string }> => {
  const ai = createAI();
  let prompt = "";

  switch (type) {
    case 'bulletin':
      prompt = `Buatlah naskah Buletin Mingguan Kelas (Surat Kabar Kelas) yang sangat menarik untuk WhatsApp orang tua.
      Nama Sekolah: ${data.sekolah}
      Nama Kelas: ${data.kelas}
      Rangkuman Aktivitas: ${data.aktivitas}
      Juara Kelas Mingguan: ${data.champions}
      
      ATURAN OUTPUT WAJIB:
      1. DILARANG KERAS menggunakan format TABEL Markdown.
      2. DILARANG menggunakan karakter titik dua (:), koma (,), dan strip atau dash (-).
      3. Gunakan baris baru (Enter) atau EMOJI atau SPASI sebagai pemisah informasi.
      4. Gunakan HURUF KAPITAL untuk Judul dan poin penting sebagai pengganti tanda baca.
      5. NARASI harus ceria dan ramah.
      6. DILARANG menggunakan simbol Markdown seperti # atau * atau >.
      
      Tujuan: Pesan yang sangat bersih dan unik untuk layar smartphone.`;
      break;

    case 'parent_msg':
      prompt = `Buatlah pesan apresiasi singkat dan profesional untuk orang tua siswa tentang kemajuan anak mereka.
      Nama Siswa: ${data.namaSiswa}
      Kabar Baik/Pencapaian: ${data.pencapaian}
      Nama Guru: ${data.namaGuru}
      
      ATURAN OUTPUT PROFESIONAL:
      - DILARANG menggunakan simbol Markdown (#, *, -, >).
      - Narasi hangat, formal, dan suportif.
      - Gunakan HURUF KAPITAL untuk bagian terpenting.
      
      Output: Teks siap kirim ke WhatsApp tanpa simbol aneh.`;
      break;
  }

  const response = await ai.models.generateContent({
    model: getAiModel(),
    contents: [{ 
      role: 'user', 
      parts: [{ 
        text: `SISTEM INSTRUKSI: Anda adalah pakar komunikasi sekolah yang kreatif. Anda menghasilkan pesan tanpa simbol Markdown dan mematuhi batasan tanda baca yang ketat sesuai instruksi pengguna.\n\n${prompt}` 
      }] 
    }]
  });

  return { text: response.text || "" };
};
