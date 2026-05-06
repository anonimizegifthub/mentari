
import { createAI, getAiModel, cleanOutput } from "./aiConfig";

export const generateVirtualLab = async (materi: string, kelas: string, platform: string = 'Mobile', isAdventureMode: boolean = false): Promise<string> => {
  try {
    const ai = createAI();

    const precisionLogicProtocol = `
      **STRICT SIMULATION INTERACTION PROTOCOL (MANDATORY):**
      - Input: Gunakan 'pointerdown', 'pointermove', dan 'pointerup' secara eksklusif. Ini menjamin fungsionalitas 100% pada mouse dan layar sentuh.
      - CSS Reset: html, body { overflow: hidden; touch-action: none; overscroll-behavior: none; }
      - UI Layering: Instrumen lab (slider, drag-items, switcher) WAJIB memiliki 'pointer-events: auto' dan z-index minimal 500. Elemen background WAJIB 'pointer-events: none'.
      - Interaction Buffers: Tambahkan delay visual singkat saat transisi antar instrumen untuk mencegah input ganda yang tidak sengaja.
      - Mobile Scaling: Gunakan unit 'dvmin' untuk memastikan instrumen lab tidak terlalu kecil di layar HP.
      - SYSTEM INTEGRITY: DILARANG KERAS menimpa/mengubah 'window.fetch'. Jangan gunakan polyfill fetch apapun.
    `;

    const layoutStandard = platform === 'Mobile' 
      ? `**DISPLAY: MOBILE PORTRAIT (9:16)**
         - Aspect-ratio: 9/16; width: 100vw; height: auto; max-height: 100vh;
         - UI Scaling: Gunakan unit 'dvmin' for all fonts and simulation objects.`
      : `**DISPLAY: DESKTOP RESPONSIVE (16:9)**
         - Layout gaya dashboard laboratorium modern dengan sidebar control yang luas.`;

    const adventureInstruction = isAdventureMode 
      ? `**ALUR PETUALANGAN (CHAPTERED):**
         - Chapter 1: Materi Literasi Mendalam (Eksplorasi Konsep). Gunakan kartu narasi yang indah.
         - Chapter 2: Simulasi Interaktif (Eksperimen STEM).
         - Transisi: Gunakan GSAP untuk animasi perpindahan bab yang halus.`
      : `Langsung tampilkan area simulasi interaktif yang fungsional.`;

    const prompt = `Buat Simulasi Lab Maya (STEM) tentang ${materi} untuk ${kelas}. 
    
    ${layoutStandard}
    ${adventureInstruction}
    ${precisionLogicProtocol}

    **KUALITAS VISUAL:**
    - Estetika: Glassmorphism / Modern Clean Lab UI.
    - Animasi: GSAP untuk pergerakan elemen lab (cairan, magnet, arus listrik) yang realistis.
    - Data Real-time: Sertakan panel indikator angka atau gauge dinamis yang merespons aksi simulasi.
    
    HANYA hasilkan kode HTML mandiri lengkap (<!DOCTYPE html>).`;

    const response = await ai.models.generateContent({
      model: getAiModel(),
      contents: [{ 
        role: 'user', 
        parts: [{ 
          text: `SISTEM INSTRUKSI: Anda adalah Software Engineer & Ilmuwan Simulasi. Keahlian Anda adalah menciptakan simulasi STEM yang akurat secara ilmiah dan memiliki antarmuka pengguna yang sangat responsif di perangkat touchscreen.\n\n${prompt}` 
        }] 
      }],
      config: { 
        temperature: 0.7 
      }
    });
    return cleanOutput(response.text || "");
  } catch (e: any) {
    throw e;
  }
};

export const generateLiteracyAdventure = async (materi: string, subMateri: string, tujuan: string, kelas: string, includeImages: boolean = false): Promise<string> => {
  try {
    const ai = createAI();

    const visualInstruction = includeImages 
      ? "Sertakan placeholder gambar ilustrasi menggunakan <img> tag dengan src dari Unsplash API (https://source.unsplash.com/featured/?...) yang relevan dengan tiap bab."
      : "Fokus pada tipografi yang indah dan kartu-kartu narasi tanpa gambar.";

    const prompt = `Bangun Aplikasi "MATERI EKSPLORASI LITERASI" Interaktif yang Kompleks.
    
    DATA MATERI:
    - Judul Utama: ${materi}
    - Sub-Topik: ${subMateri || 'Terintegrasi'}
    - Tujuan Belajar: ${tujuan || 'Penguasaan Konsep Mendalam'}
    - Target Pembaca: Siswa ${kelas}
    
    STRUKTUR APLIKASI (WAJIB ADA):
    1. PROGRESS TRACKER: Tampilkan progres baca (misal: Bab 1/5).
    2. MULTI-CHAPTER NAVIGATION: Gunakan alur cerita (Storytelling) untuk menyampaikan materi.
    3. INTERAKTIVITAS: Sertakan elemen "Klik untuk Mengetahui Lebih Lanjut", "Pop-up Fakta Unik", atau "Mini Quiz Refleksi" di setiap bab.
    4. TEKNIS: Gunakan Tailwind CSS, GSAP untuk animasi transisi antar halaman (Fade-in/Slide), dan font Fredoka (Google Font).
    5. DATA SYNC: Pastikan UI responsif di HP & Laptop.
    6. SYSTEM: DILARANG menimpa 'window.fetch'. Jangan gunakan polyfill.
    
    ${visualInstruction}

    Tujuan Utama: Menciptakan pengalaman membaca materi yang sangat menarik (Joyful Reading) sehingga siswa tidak bosan dan merasa sedang berpetualang.
    
    HANYA hasilkan 1 file HTML mandiri lengkap (<!DOCTYPE html>).`;

    const response = await ai.models.generateContent({
      model: getAiModel(), // Dinamis berdasarkan setting guru
      contents: [{ 
        role: 'user', 
        parts: [{ 
          text: `SISTEM INSTRUKSI: Anda adalah Lead EdTech Developer & Specialist Kurikulum Literasi. Anda mahir mengubah materi pelajaran yang kaku menjadi petualangan digital interaktif yang memikat perhatian siswa.\n\n${prompt}` 
        }] 
      }],
      config: {
        temperature: 0.8
      }
    });
    return cleanOutput(response.text || "");
  } catch (e: any) {
    throw e;
  }
};
