
import React, { useState } from 'react';

interface FullTutorialOverlayProps {
  onClose: () => void;
}

const FullTutorialOverlay: React.FC<FullTutorialOverlayProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Selamat Datang di Beranda Guru",
      subtitle: "Pusat Kendali Ekosistem Mentari",
      icon: "fa-chalkboard-user",
      color: "bg-blue-600",
      content: (
        <div className="space-y-6">
          <p className="text-sm font-bold text-slate-500 leading-relaxed uppercase">
            Bapak/Ibu Guru, Anda telah berada di Dashboard Utama. Halaman ini adalah tempat Anda memonitor progres siswa dan mempublikasikan materi belajar.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="p-5 bg-blue-50 rounded-2xl border-2 border-blue-100">
                <i className="fas fa-chart-line text-blue-600 mb-2"></i>
                <h4 className="text-[10px] font-black uppercase text-slate-800">Monitoring Real-Time</h4>
                <p className="text-[9px] font-bold text-slate-400 leading-relaxed">Lihat peringkat harian dan rata-rata skor akademik siswa secara instan.</p>
             </div>
             <div className="p-5 bg-indigo-50 rounded-2xl border-2 border-indigo-100">
                <i className="fas fa-wand-magic-sparkles text-indigo-600 mb-2"></i>
                <h4 className="text-[10px] font-black uppercase text-slate-800">Akses Generator AI</h4>
                <p className="text-[9px] font-bold text-slate-400 leading-relaxed">Gunakan 4 kartu aksi utama untuk merakit Modul, Soal, Game, atau Lab Maya.</p>
             </div>
          </div>
        </div>
      )
    },
    {
      title: "1. Merakit Administrasi (AI)",
      subtitle: "Pembuatan Modul & Soal Instan",
      icon: "fa-file-pen",
      color: "bg-indigo-600",
      content: (
        <div className="space-y-4">
          <div className="p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl">
             <h4 className="text-xs font-black uppercase text-indigo-600 mb-3 flex items-center gap-2"><i className="fas fa-book"></i> Buat Modul Ajar</h4>
             <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed mb-2">Isi form identitas dan materi pokok. AI akan menyusun langkah pembelajaran Deep Learning yang bisa Bapak/Ibu salin ke Word atau cetak langsung.</p>
          </div>
          <div className="p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl">
             <h4 className="text-xs font-black uppercase text-blue-600 mb-3 flex items-center gap-2"><i className="fas fa-file-signature"></i> Buat Soal Asesmen</h4>
             <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed">Tentukan jumlah soal dan bobot materi. Gunakan fitur PRO untuk menambahkan ilustrasi gambar AI otomatis pada naskah ujian.</p>
          </div>
        </div>
      )
    },
    {
      title: "2. Merakit Media Belajar (HP)",
      subtitle: "Produksi Gim & Lab Interaktif",
      icon: "fa-gamepad",
      color: "bg-emerald-600",
      content: (
        <div className="space-y-6">
          <div className="p-6 bg-emerald-50 border-2 border-emerald-100 rounded-3xl">
             <h4 className="text-xs font-black uppercase text-emerald-700 mb-3 flex items-center gap-2"><i className="fas fa-rocket"></i> Distribusi ke HP Siswa</h4>
             <ol className="text-[10px] font-bold text-slate-600 uppercase space-y-2 leading-relaxed">
                <li>1. Pilih menu <b>"Buat Gim"</b> atau <b>"Buat Lab"</b>.</li>
                <li>2. Ketik topik belajar dan klik <b>"Rakit AI"</b>.</li>
                <li>3. Atur koin hadiah dan klik <b>"Terbitkan Misi"</b>.</li>
                <li>4. Konten akan otomatis muncul di HP siswa sebagai tugas interaktif.</li>
             </ol>
          </div>
        </div>
      )
    },
    {
      title: "3. Panel Kendali Guru",
      subtitle: "Manajemen Cloud & Validasi Siswa",
      icon: "fa-gears",
      color: "bg-slate-800",
      content: (
        <div className="space-y-6">
          <p className="text-[11px] font-bold text-slate-500 uppercase leading-relaxed">
             Menu <b>PANEL GURU</b> adalah jantung operasional aplikasi:
          </p>
          <div className="grid grid-cols-2 gap-4">
             <div className="flex gap-4 items-start p-3 bg-slate-50 rounded-2xl">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 text-xs"><i className="fas fa-sync"></i></div>
                <div><h5 className="text-[9px] font-black uppercase">Sync Cloud</h5><p className="text-[7px] font-bold text-slate-400">Menarik data terbaru dari Google Spreadsheet.</p></div>
             </div>
             <div className="flex gap-4 items-start p-3 bg-slate-50 rounded-2xl">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 text-xs"><i className="fas fa-check-double"></i></div>
                <div><h5 className="text-[9px] font-black uppercase">Validasi</h5><p className="text-[7px] font-bold text-slate-400">Beri nilai tugas yang masuk untuk mencairkan poin siswa.</p></div>
             </div>
             <div className="flex gap-4 items-start p-3 bg-slate-50 rounded-2xl">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 text-xs"><i className="fas fa-user-plus"></i></div>
                <div><h5 className="text-[9px] font-black uppercase">Data Siswa</h5><p className="text-[7px] font-bold text-slate-400">Tambah nama siswa baru dan atur PIN akses mereka.</p></div>
             </div>
             <div className="flex gap-4 items-start p-3 bg-slate-50 rounded-2xl">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 text-xs"><i className="fas fa-link"></i></div>
                <div><h5 className="text-[9px] font-black uppercase">Akses Siswa</h5><p className="text-[7px] font-bold text-slate-400">Salin link kelas untuk dibagikan di grup WA kelas.</p></div>
             </div>
          </div>
        </div>
      )
    },
    {
      title: "Siap Menginspirasi!",
      subtitle: "Operasi Sistem Telah Dipelajari",
      icon: "fa-flag-checkered",
      color: "bg-blue-700",
      content: (
        <div className="text-center space-y-8 py-4">
          <div className="relative">
             <div className="absolute inset-0 bg-blue-400 blur-[60px] opacity-20 animate-pulse"></div>
             <p className="relative z-10 text-base font-black text-slate-700 Museum-Text uppercase tracking-tight leading-relaxed px-4">
               Tutorial Selesai! Bapak/Ibu Guru sekarang memiliki kendali penuh atas sistem pembelajaran berbasis AI ini.
             </p>
          </div>
          
          <div className="p-6 bg-amber-50 rounded-3xl border-2 border-amber-100">
             <p className="text-[10px] font-bold text-amber-700 uppercase leading-loose">
               <i className="fas fa-info-circle mr-2"></i> Jika lupa cara mengoperasikan fitur tertentu, klik <b>"Menu Aksi"</b> (Ikon Grid) di bagian Header atas, tepat di samping tombol Logout.
             </p>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[160000] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-4 md:p-10 animate-in fade-in zoom-in-95 duration-500">
      <div className="w-full max-w-4xl bg-white rounded-[3.5rem] md:rounded-[4.5rem] shadow-2xl flex flex-col h-auto max-h-[90vh] overflow-hidden border-8 border-white relative">
        
        <div className="absolute top-0 left-0 right-0 h-2 bg-slate-100 flex">
           {steps.map((_, i) => (
             <div key={i} className={`flex-1 h-full transition-all duration-700 ${i <= currentStep ? step.color : 'bg-transparent'}`}></div>
           ))}
        </div>

        <div className="p-8 md:p-14 flex flex-col md:flex-row gap-12 flex-grow overflow-y-auto no-scrollbar">
           <div className={`w-full md:w-72 shrink-0 ${step.color} rounded-[3rem] p-12 flex flex-col items-center justify-center text-white relative shadow-2xl`}>
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              <i className={`fas ${step.icon} text-[6rem] md:text-[8rem] floating`}></i>
              <div className="mt-10 px-6 py-2 bg-white/20 rounded-full backdrop-blur-md border border-white/20">
                 <span className="text-[10px] font-black uppercase tracking-[0.4em]">Panduan {currentStep + 1}</span>
              </div>
           </div>

           <div className="flex-grow flex flex-col justify-center">
              <div className="mb-10">
                 <h2 className={`text-3xl md:text-5xl font-black Museum-Text uppercase leading-none tracking-tight mb-3 text-slate-800`}>
                    {step.title}
                 </h2>
                 <p className="text-[10px] md:text-[12px] font-black text-blue-600 uppercase tracking-[0.4em] Museum-Text">
                    {step.subtitle}
                 </p>
              </div>

              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                {step.content}
              </div>

              <div className="mt-12 flex items-center justify-between">
                 <div className="flex gap-2">
                    {steps.map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === currentStep ? 'w-8 ' + step.color : 'bg-slate-200'}`}></div>
                    ))}
                 </div>
                 
                 <div className="flex gap-4">
                    {currentStep > 0 && (
                      <button onClick={() => setCurrentStep(currentStep - 1)} className="px-6 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all active:scale-95">Kembali</button>
                    )}
                    <button 
                      onClick={handleNext} 
                      className={`px-10 py-4 ${step.color} text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all joyful-shadow`}
                    >
                      {currentStep === steps.length - 1 ? 'Selesai & Bekerja' : 'Lanjutkan'}
                    </button>
                 </div>
              </div>
           </div>
        </div>

        <button onClick={onClose} className="absolute top-8 right-8 text-slate-300 hover:text-red-500 transition-all active:scale-90"><i className="fas fa-times-circle text-2xl"></i></button>
      </div>
    </div>
  );
};

export default FullTutorialOverlay;
