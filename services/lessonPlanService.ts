
import { createAI, getAiModel } from "./aiConfig";
import { LessonFormData, GroundingSource } from "../types";

export const generateLessonPlan = async (formData: LessonFormData): Promise<{ text: string, sources: GroundingSource[] }> => {
  try {
    const ai = createAI();
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    
    // KALKULASI DURASI PRESISI
    const totalJP = parseInt(formData.alokasiWaktu) || 2;
    const durationPerJP = parseInt(formData.jamPelajaran) || 35;
    const jmlPertemuan = parseInt(formData.jumlahPertemuan) || 1;
    
    // Total menit seluruh modul (misal 2 JP * 35 mnt = 70 mnt)
    const totalMinutesAll = totalJP * durationPerJP;
    // Menit per satu kali pertemuan (misal 70 mnt / 1 pertemuan = 70 mnt)
    const minutesPerSession = Math.floor(totalMinutesAll / jmlPertemuan);

    /**
     * DISTRIBUSI WAKTU STANDAR (FIXED SUM)
     * Kita hitung di sini agar AI tidak salah hitung.
     * Aturan: Awal 15%, Penutup 15%, Inti sisanya.
     */
    const awalDur = Math.max(5, Math.round(minutesPerSession * 0.15));
    const penutupDur = Math.max(5, Math.round(minutesPerSession * 0.15));
    const intiDur = minutesPerSession - awalDur - penutupDur;

    const nameParts = formData.namaNIP.split('/');
    const cleanName = nameParts[0].trim();
    const cleanNIP = nameParts.length > 1 ? nameParts[nameParts.length - 1].trim() : (formData.namaNIP.match(/\d+/) ? formData.namaNIP.match(/\d+/)![0] : '');

    const prompt = `Anda adalah pakar kurikulum "Deep Learning" yang ahli dalam menyusun Modul Ajar Kurikulum Merdeka. 

TUGAS UTAMA:
Hasilkan Modul Ajar yang sangat profesional, padat, dan terstruktur. Ikuti protokol output berikut:

1. ATURAN TANPA PEMANASAN: DILARANG memberikan kalimat pembuka atau penutup. Output langsung dimulai dengan judul utama (#).
2. ATURAN STRUKTUR TABEL: SEMUA BAGIAN WAJIB disajikan dalam format TABEL Markdown (| Kolom |). Gunakan ## untuk Judul Bagian di luar tabel.
3. LARANGAN LIST: DILARANG KERAS menggunakan bullet points (- atau *) atau penomoran di dalam sel tabel. Gunakan tanda koma (,) atau narasi mengalir.

DATA INPUT:
- Nama/NIP: ${formData.namaNIP}
- Sekolah: ${formData.sekolah}
- Mapel: ${formData.mataPelajaran}
- Kelas/Fase: ${formData.kelasFase}
- Semester: ${formData.semester}
- Alokasi: ${formData.alokasiWaktu} JP (${jmlPertemuan} Pertemuan)
- Materi: ${formData.materipokok}
- Tujuan Pembelajaran (TP): ${formData.tujuanpembelajaran}
- Strategi: ${formData.strategiPenerapan}

FILOSOFI KONTEN:
- Gunakan pendekatan "Deep Learning" (Mindful, Meaningful, Joyful).
- Pastikan seluruh "Tujuan Pembelajaran" di atas tercapai melalui aktivitas yang dirancang.
- PID (Papan Interaktif Digital): Gunakan PID DALAM aktivitas guru HANYA jika materi membutuhkan visualisasi konkret yang sulit didapat di lingkungan siswa.

URUTAN OUTPUT:
# MODUL AJAR: ${formData.materipokok.toUpperCase()}

## INFORMASI UMUM
| Komponen | Keterangan |
| :--- | :--- |
| Nama Pengajar / NIP | ${formData.namaNIP} |
| Kelas / Semester | ${formData.kelasFase} / ${formData.semester} |
| Mata Pelajaran | ${formData.mataPelajaran} |
| Alokasi Waktu / Pertemuan | ${formData.alokasiWaktu} JP / ${jmlPertemuan} Pertemuan |
| Durasi Per Pertemuan | ${minutesPerSession} Menit |

## A. CAPAIAN PEMBELAJARAN
| Deskripsi Capaian Pembelajaran |
| :--- |
| ${formData.capaianPembelajaran} |

## B. TUJUAN PEMBELAJARAN (TP)
| Daftar Tujuan Pembelajaran yang Dicapai |
| :--- |
| ${formData.tujuanpembelajaran.replace(/\n/g, ', ')} |

## C. DIMENSI PROFIL LULUSAN (DPL)
| Dimensi Profil Lulusan | Implementasi Strategis dalam Materi |
| :--- | :--- |
| (Sebutkan 2-4 DPL) | (Narasi aksi nyata Deep Learning) |

## D. RUANG LINGKUP MATERI
| Topik Utama | Rincian Materi Spesifik |
| :--- | :--- |
| ${formData.materipokok} | (Gunakan koma sebagai pemisah) |

## E. DESIGN PEMBELAJARAN
| Komponen | Penjelasan |
| :--- | :--- |
| Tujuan SMART | (Tujuan terukur yang diturunkan dari TP) |
| Praktik Pedagogis | (Strategi pendukung ${formData.strategiPenerapan}) |
| Kemitraan | (Sekolah, orang tua, atau masyarakat) |
| Lingkungan | (Pengaturan ruang belajar) |
| Pemanfaatan Digital | (Integrasi PID jika relevan & 1 Link Youtube) |

## F. LANGKAH-LANGKAH PEMBELAJARAN
WAJIB hasilkan rincian untuk TOTAL ${jmlPertemuan} PERTEMUAN.
DILARANG merubah angka durasi yang diberikan di bawah ini.

DATA DURASI PER PERTEMUAN (WAJIB):
- Awal: ${awalDur} Menit
- Inti: ${intiDur} Menit
- Penutup: ${penutupDur} Menit
(Total: ${awalDur + intiDur + penutupDur} Menit)

ATURAN TABEL: Tulis nomor pertemuan HANYA pada baris 'Awal'. Kosongkan kolom pertemuan untuk baris 'Inti' dan 'Penutup' pada pertemuan yang sama.
| Pertemuan | Tahap | Deskripsi Aktivitas | Durasi |
| :--- | :--- | :--- | :--- |
${Array.from({ length: jmlPertemuan }).map((_, i) => `| ${i + 1} | Awal | (Apersepsi Mindful) | ${awalDur} Menit |\n| | Inti | (Eksplorasi Meaningful - Integrasi TP) | ${intiDur} Menit |\n| | Penutup | (Refleksi Joyful) | ${penutupDur} Menit |`).join('\n')}

## G. ASESMEN
| Jenis | Teknik Tes | Teknik Non-Tes |
| :--- | :--- | :--- |
| Formatif | (Deskripsi instrumen berdasarkan TP) | (Observasi/Jurnal) |
| Sumatif | (Soal penguasaan materi ${formData.materipokok}) | (Produk/Proyek) |

## H. MEDIA & SUMBER BELAJAR
| Alat & Bahan | Sumber Referensi |
| :--- | :--- |
| (Media fisik/digital) | (Buku, Internet, Alam) |

## I. REFLEKSI
| Subjek | Pertanyaan Penggerak |
| :--- | :--- |
| Guru | (Evaluasi efektivitas metode ${formData.modelPembelajaran}) |
| Siswa | (Pemahaman bermakna terkait materi) |

## J. LAMPIRAN
WAJIB menuliskan DRAF KONTEN LENGKAP & SIAP PAKAI (Bukan deskripsi singkat).
| Item Lampiran | Konten Draf LENGKAP & SIAP PAKAI |
| :--- | :--- |
| Lembar Kerja (LKPD) | (Tuliskan draf tugas dan soal nyata di sini) |
| Rubrik Penilaian | (Tuliskan kriteria skor di sini) |
| Glosarium | (Daftar istilah dan artinya) |
| Bahan Bacaan | (Ringkasan materi untuk siswa) |

Bondowoso, ${today}
Guru ${formData.kelasFase.split('/')[0].trim()}

[KOSONG]

${cleanName}
NIP. ${cleanNIP}`;

    const response = await ai.models.generateContent({
      model: getAiModel(),
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }] 
      }
    });

    const text = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({ title: chunk.web.title, uri: chunk.web.uri }));

    return { text, sources };
  } catch (e: any) {
    throw e;
  }
};
