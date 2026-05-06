
export const handleAiGenerationError = (err: any, context: string = 'merakit karya') => {
  console.error(`AI Generation Error [${context}]:`, err);

  const errorMsg = err?.message || String(err);
  
  // 0. Missing API Key
  if (errorMsg === 'API_KEY_MISSING' || errorMsg.includes('API key not found')) {
    alert(`🔑 KUNCI AI TIDAK DITEMUKAN\n\nSistem AI memerlukan "Kunci API Gemini" untuk bekerja.\n\nSolusi:\n1. Masuk ke Tab Konfigurasi.\n2. Masukkan Kunci API Gemini Anda di bagian Hubungkan Sistem.\n3. Jika Anda siswa, mintalah guru untuk membagikan Link Login terbaru.`);
    return;
  }

  // 1. Rate Limit / Quota
  if (errorMsg.includes('429') || errorMsg.includes('Quota') || errorMsg.includes('limit')) {
    alert(`⚠️ ENGINE AI TERLALU PADAT (LIMIT)\n\nMaaf, permintaan ${context} sedang sangat tinggi. \n\nSolusi:\n1. Tunggu sekitar 1 menit sebelum mencoba lagi.\n2. Jika Anda sedang menggunakan engine 'Flash', cobalah istirahatkan sistem sejenak.\n3. Pastikan koneksi internet Anda stabil.`);
    return;
  }

  // 2. Safety Filter
  if (errorMsg.includes('safety') || errorMsg.includes('blocked') || errorMsg.includes('SAFETY')) {
    alert(`💡 FILTER KEAMANAN AKTIF\n\nWah, AI kami mendeteksi konten yang Anda masukkan mungkin melanggar kebijakan keamanan atau terlalu sensitif untuk diolah secara otomatis.\n\nSolusi:\n- Coba ubah bahasa atau kurangi detail yang mungkin dianggap sensitif.\n- Hindari kata-kata yang mengandung unsur kekerasan atau konten tidak pantas.`);
    return;
  }

  // 3. Network / Timeout
  if (errorMsg.includes('fetch') || errorMsg.includes('Network') || errorMsg.includes('timeout')) {
    alert(`🌐 GANGGUAN KONEKSI\n\nTerdapat masalah saat menghubungkan ke server AI Mentari.\n\nSolusi:\n- Periksa koneksi internet Anda.\n- Nyalakan ulang (refresh) halaman ini.\n- Coba gunakan jaringan yang berbeda.`);
    return;
  }

  // 4. Bad Request / Content too long
  if (errorMsg.includes('400') || errorMsg.includes('TooManyTokens')) {
    alert(`📝 INPUT TERLALU PANJANG\n\nSepertinya materi atau instruksi yang Anda berikan terlalu banyak untuk dipahami AI dalam satu waktu.\n\nSolusi:\n- Ringkas materi atau instruksi Anda.\n- Bagi materi menjadi beberapa bagian kecil.`);
    return;
  }

  // Generic Error
  alert(`❌ GAGAL MERAKIT KARYA\n\nTerjadi kesalahan teknis yang tidak terduga saat ${context}.\n\nSaran: Periksa kembali input Anda atau coba lagi beberapa saat lagi.`);
};
