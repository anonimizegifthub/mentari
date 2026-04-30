
import { createAI, getAiModel, cleanOutput } from "./aiConfig";
import { GameFormData, AssessmentFormData } from "../types";

export const generateGameQuick = async (materi: string, kelas: string, questionCount: number, gameType: string, isDuel: boolean = false, platform: string = 'Mobile', isExamMode: boolean = false, minScore: number = 70): Promise<string> => {
  try {
    const ai = createAI();
    
    const genreInstruction = gameType.toLowerCase().includes("otomatis")
      ? `Tentukan genre yang paling pas untuk materi '${materi}' (misal: Platformer, Quiz, atau Catching Game).`
      : `Genre Utama: ${gameType}.`;

    const precisionLogicProtocol = `
      **PRECISION & FAIRNESS PROTOCOL (VERSI 2.1):**
      
      - SCORING SYSTEM (KRITIKAL):
        * Skor akhir yang dikirim melalui window.parent.postMessage WAJIB dalam skala 0-100 (Persentase).
        * Rumus: (Jumlah_Benar / Total_Soal) * 100.
        * DILARANG mengirim skor mentah (seperti 10) atau skor akumulatif ribuan (seperti 1000). 
        * Jika benar semua, skor HARUS 100. Ini penting agar perhitungan hadiah di sistem induk (multiplier = score/100) menjadi 100% akurat.
      
      - MANUAL TRIGGER ONLY: 
        * DILARANG keras membuat sistem 'auto-fire' atau tembakan otomatis.
        * Setiap aksi (tembak, pilih, lompat) HANYA boleh dipicu oleh event 'pointerdown' manual dari pemain secara sadar.
        * Gunakan flag 'isReloading' atau 'cooldown' (minimal 300ms) untuk mencegah spamming aksi yang tidak disengaja.

      - ADAPTIVE BALANCING:
        * Kecepatan objek (musuh/jawaban) HARUS menggunakan Delta Time agar konsisten di semua perangkat.
        * Kecepatan maksimal: Batasi hingga 10-15% dari tinggi/lebar layar per detik agar manusiawi dan bisa dipilih.
        * Safe Zone: Berikan jeda minimal 2 detik tanpa gerakan objek saat soal pertama kali muncul agar siswa sempat membaca.

      - INPUT HYGIENE:
        * Semua elemen latar belakang/hiasan WAJIB menggunakan CSS 'pointer-events: none'.
        * Semua objek interaktif WAJIB 'pointer-events: auto' dengan z-index >= 1000.
        * Hapus/Sembunyikan total elemen SplashScreen (display: none) segera setelah tombol START ditekan agar tidak menghalangi area klik.
        
      - SYSTEM INTEGRITY:
        * DILARANG KERAS menimpa/mengubah 'window.fetch'. Jangan gunakan polyfill fetch apapun.
        * Gunakan AudioContext untuk suara, jangan gunakan elemen <audio> yang butuh interaksi user eksplisit di awal.
    `;

    let layoutStandard = "";
    if (isDuel) {
       layoutStandard = `**DISPLAY: VERTICAL SPLIT-SCREEN DUEL (1:1 per Player)**
         - WAJIB: Bagi layar menjadi DUA bagian vertikal (Kiri: Player 1, Kanan: Player 2).
         - Garis pemisah vertikal tepat di tengah layar (x=50%).
         - KONTROL SENTUH (WAJIB): Sediakan tombol kontrol virtual (D-Pad/Joystick & Action Button) di masing-masing area (Kiri bawah untuk P1, Kanan bawah untuk P2) agar bisa dimainkan di layar sentuh (Interactive Flat Panel).
         - KONTROL KEYBOARD (OPSIONAL): Player 1 (WASD), Player 2 (Arrow Keys).
         - ORIENTASI: Landscape (16:9).
         - UI: Skor P1 di kiri atas, Skor P2 di kanan atas.`;
    } else if (platform === 'Mobile') {
       layoutStandard = `**DISPLAY: MOBILE PORTRAIT (9:16)**
         - Unit: Gunakan 'dvmin' untuk responsivitas total elemen UI.
         - Kontrol: Tombol interaksi minimal berukuran 15dvmin agar mudah ditekan jari.`;
    } else {
       layoutStandard = `**DISPLAY: UNIVERSAL LANDSCAPE (16:9)**
         - Optimalkan untuk Layar Besar, Laptop, dan Papan Tulis Interaktif.`;
    }

    const prompt = `Rakit Gim Edukasi Premium Level Industri.
    Materi: ${materi} | Kelas: ${kelas} | Total Soal: ${questionCount}.
    Target Lulus: ${minScore} (Skala 0-100).
    ${genreInstruction}
    ${precisionLogicProtocol}
    ${layoutStandard}

    **FITUR WAJIB:**
    1. Sistem Nyawa (3 Hearts) & Skor Persentase Real-time (Tampilkan 0-100).
    2. Feedback Visual Instan: Hijau jika benar, Merah jika salah.
    3. UI/UX Modern: Gunakan Tailwind CSS & GSAP untuk animasi halus.
    4. Audio: Efek suara (Correct, Wrong, Click) menggunakan AudioContext.
    5. DATA SYNC: Panggil window.parent.postMessage({ type: 'GAME_COMPLETE', score: [0-100] }, '*') tepat saat game berakhir.
    
    HANYA hasilkan 1 file HTML mandiri lengkap (<!DOCTYPE html>).`;

    const response = await ai.models.generateContent({
      model: getAiModel(),
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "Anda adalah Senior Game Architect. Anda menjamin mekanik game tidak rusak, input sentuh responsif (terutama untuk Interactive Flat Panel), dan sistem penilaian akurat berbasis persentase (0-100). DILARANG KERAS menimpa window.fetch.",
        temperature: 0.7
      }
    });
    return cleanOutput(response.text || "");
  } catch (e: any) {
    throw e;
  }
};

export const generateGame = async (formData: GameFormData): Promise<string> => {
  try {
    const ai = createAI();
    
    const precisionLogicProtocol = `
      **STRICT PRODUCTION RULES:**
      - SCORE SCALE: Skor akhir yang dikirim ke parent wajib skala 0-100. (Benar_Semua = 100).
      - NO AUTO-ACTION: Pemain wajib klik manual untuk melakukan aksi tembak atau pilih jawaban.
      - SPEED CONTROL: Kecepatan objek harus adil, gunakan Delta Time untuk mencegah objek melesat terlalu cepat di layar HP.
      - TOUCH OPTIMIZATION: Gunakan 'pointerdown' dan CSS 'touch-action: none'.
      - CLEAN DOM: Pastikan layer overlay 'Loading/Start' dihilangkan total setelah game dimulai.
      - NO FETCH OVERWRITE: Dilarang keras menimpa/mengubah 'window.fetch'. Jangan gunakan polyfill fetch.
    `;

    const duelInstruction = formData.isDuel 
        ? `**MODE DUEL (BATTLE):** Game WAJIB Split-Screen Vertikal (Layar dibagi dua: Kiri vs Kanan). Garis pemisah vertikal di tengah. 
           - KONTROL SENTUH (WAJIB): Sediakan tombol kontrol virtual (Joystick/D-Pad & Action Button) di masing-masing area (Kiri untuk P1, Kanan untuk P2) agar mendukung Interactive Flat Panel.
           - KONTROL KEYBOARD: Player 1 (WASD) di Kiri, Player 2 (Arrow Keys) di Kanan.` 
        : "";

    const prompt = `Bangun Proyek Gim Edukasi Kustom.
    Judul: ${formData.judul} | Genre: ${formData.genre} | Konten: ${formData.kontenNarasi} | Tema: ${formData.temaVisual}.
    MinScore: ${formData.minScore} | Platform: ${formData.platform}.
    
    ${duelInstruction}
    ${precisionLogicProtocol}

    **TEKNIS PRODUKSI:**
    - Library: GSAP (Animation) & Tailwind CSS (UI).
    - Kontrol Input: ${formData.kendali}.
    - Komunikasi: window.parent.postMessage({ type: 'GAME_COMPLETE', score: [0-100] }, '*').
    
    HANYA hasilkan kode HTML lengkap tanpa teks tambahan.`;

    const response = await ai.models.generateContent({
      model: getAiModel(),
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "Anda adalah Lead Game Developer. Fokus utama Anda adalah stabilitas input (terutama sentuhan pada Interactive Flat Panel), balancing kesulitan yang adil, dan akurasi skor persentase. DILARANG KERAS menimpa window.fetch."
      }
    });
    return cleanOutput(response.text || "");
  } catch (e: any) {
    throw e;
  }
};

export const generateInteractiveQuiz = async (formData: AssessmentFormData, minScore: number): Promise<string> => {
  try {
    const ai = createAI();
    
    const activeFormats = formData.formats.filter(f => parseInt(f.count) > 0);
    const activeTopics = formData.topics.filter(t => t.materi.trim() !== '');

    const prompt = `Rakit Aplikasi KUIS INTERAKTIF OTOMATIS (HTML5).
    Judul: ${formData.judulAsesmen}
    Target Lulus: ${minScore}/100
    Struktur Soal: ${activeFormats.map(f => `${f.count} ${f.type}`).join(', ')}
    Materi: ${activeTopics.map(t => `${t.materi} (${t.bobot}%)`).join(', ')}

    **PERSYARATAN TEKNIS (MUTLAK):**
    1. UI: Gunakan Tailwind CSS. Tema warna: Violet/Indigo. Desain Modern (Rounded 2xl, Shadow).
    2. NAVIGATION: Tampilkan soal satu per satu (Single Page Application style).
    3. SCORING SYSTEM: Hitung skor akhir dalam persentase (0-100).
    4. DATA REPORTING: Wajib panggil: window.parent.postMessage({ type: 'GAME_COMPLETE', score: finalScore }, '*') saat kuis selesai.
    5. INTERACTION: Gunakan JavaScript murni untuk logika kuis (next question, result screen).
    6. RESPONSIVE: Harus bekerja sempurna di Mobile (Touch) dan PC.
    7. SYSTEM: DILARANG menimpa 'window.fetch'. Jangan gunakan polyfill.

    HANYA hasilkan kode HTML mandiri lengkap (<!DOCTYPE html>) tanpa penjelasan apapun.`;

    const response = await ai.models.generateContent({
      model: getAiModel(),
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "Anda adalah Senior Frontend Developer. Anda membuat aplikasi kuis interaktif yang sangat stabil, indah secara visual, dan memiliki logika penilaian persentase yang akurat. DILARANG KERAS menimpa window.fetch."
      }
    });
    return cleanOutput(response.text || "");
  } catch (e: any) {
    throw e;
  }
};
