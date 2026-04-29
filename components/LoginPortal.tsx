import React, { useState, useEffect } from 'react';
import { Student, TeacherSettings, StudentProfile } from '../types';

interface LoginPortalProps {
  students: Student[];
  teacherSettings: TeacherSettings;
  setTeacherSettings: (s: TeacherSettings) => void;
  syncTeacherData: (overrideUrl?: string) => Promise<void>;
  handleUpdateStudentProfile: (newProfile: StudentProfile) => Promise<void>;
  setIsLoggedIn: (val: boolean) => void;
  setUserRole: (role: 'student' | 'teacher' | null) => void;
}

/**
 * KOMPONEN MANUAL LENGKAP (TAMPILAN CETAK PDF)
 * Berisi narasi teknis dan operasional yang sangat detail.
 */
const FullManualContent = () => (
  <div className="space-y-12 text-slate-800 print:block">
    {/* HEADER DOKUMEN */}
    <header className="text-center space-y-2 border-b-8 border-blue-600 pb-6">
       <h1 className="text-4xl font-black Museum-Text uppercase">Panduan Operasional Mentari AI</h1>
       <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Ekosistem Digital Guru: Administrasi, Media & Gamifikasi</p>
    </header>

    {/* BAGIAN 1: FILOSOFI SISTEM */}
    <section className="space-y-4">
      <h2 className="text-xl font-black uppercase text-blue-700 flex items-center gap-3">
         <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs">01</span>
         Visi & Filosofi Sistem
      </h2>
      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
         <p className="text-sm leading-relaxed text-justify">
            <span className="font-black text-blue-600">MENTARI</span> bukan sekadar aplikasi web biasa, melainkan sebuah <b>"Micro-SaaS" Mandiri</b>. Artinya, aplikasi ini tidak menyimpan data Anda di server pihak ketiga. Seluruh database (Nama Siswa, Nilai, Koin, Konfigurasi) disimpan di <b>Google Spreadsheet Pribadi</b> milik Anda. 
            <br/><br/>
            <b>Keunggulan Sistem:</b> (1) Privasi Data 100% milik Guru. (2) Akses gratis selamanya selama infrastruktur Google Apps Script tersedia. (3) Kecerdasan Buatan (AI) Gemini yang bisa disesuaikan dengan kebutuhan kurikulum nasional (Kurikulum Merdeka).
         </p>
      </div>
    </section>

    {/* BAGIAN 2: SETUP TEKNIS API KEY */}
    <section className="space-y-4">
      <h2 className="text-xl font-black uppercase text-blue-700 flex items-center gap-3">
         <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs">02</span>
         Langkah Awal: Aktivasi Otak AI (Gemini API)
      </h2>
      <div className="space-y-4 text-sm leading-relaxed">
        <p className="font-bold">Google Gemini API adalah mesin yang berpikir untuk membuatkan modul, soal, dan game. Tanpa kunci ini, fitur AI tidak akan merespons.</p>
        <div className="grid grid-cols-1 gap-3">
           <div className="p-4 bg-white border-2 border-slate-100 rounded-2xl">
              <h4 className="font-black text-xs uppercase mb-2 text-indigo-600">Prosedur Mendapatkan Kunci:</h4>
              <ol className="list-decimal list-inside space-y-2 uppercase text-[10px] font-bold">
                 <li>Kunjungi <b>https://aistudio.google.com/app/apikey</b> di browser Anda.</li>
                 <li>Login menggunakan akun Google (Gmail) yang aktif.</li>
                 <li>Pilih <b>"Get API Key"</b> di menu sebelah kiri.</li>
                 <li>Klik tombol biru <b>"Create API key in new project"</b>.</li>
                 <li>Akan muncul kode panjang yang diawali dengan "AIza...". Salin kode tersebut.</li>
                 <li>Buka aplikasi Mentari, tempelkan di kolom <b>"Kunci AI Gemini"</b> pada layar login.</li>
              </ol>
           </div>
        </div>
      </div>
    </section>

    {/* BAGIAN 3: SETUP DATABASE CLOUD */}
    <section className="space-y-4">
      <h2 className="text-xl font-black uppercase text-blue-700 flex items-center gap-3">
         <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs">03</span>
         Langkah Kedua: Membangun Server Cloud (Apps Script)
      </h2>
      <div className="bg-amber-50 p-6 rounded-3xl border border-amber-200">
         <p className="text-xs font-bold uppercase mb-4 text-amber-700">Wajib Dilakukan Agar Data Siswa Tidak Hilang Saat Aplikasi Ditutup:</p>
         <div className="space-y-4 text-[10px] font-bold uppercase leading-relaxed">
            <p>1. Buat Google Spreadsheet baru di Google Drive Anda. Beri nama "Database Mentari Kelas X".</p>
            <p>2. Klik menu <b>Ekstensi (Extensions)</b> → <b>Apps Script</b>.</p>
            <p>3. Hapus semua teks <code>myFunction()</code> yang ada di editor tersebut.</p>
            <p>4. Unduh file <b>Source Code Server Mentari</b> pada link: <a href="https://drive.google.com/file/d/1eW-pExjGx6e5bzOKKeJWd9KfE9BLeIcU/view?usp=sharing" target="_blank" className="text-blue-600 underline font-black">KLIK DI SINI</a>, lalu salin seluruh kodenya dan tempel (paste) ke editor Apps Script tadi.</p>
            <p>5. Klik ikon Simpan (Disket) di bagian atas.</p>
            <p>6. Klik tombol <b>Terapkan (Deploy)</b> → <b>Penerapan Baru (New Deployment)</b>.</p>
            <p>7. Pada bagian "Pilih Jenis", klik ikon Gerigi → pilih <b>Aplikasi Web (Web App)</b>.</p>
            <p>8. Deskripsi: "Server Mentari". Jalankan Sebagai: <b>Me (Email Anda)</b>. Siapa yang memiliki akses: <b>Siapa Saja (Anyone)</b>. <span className="text-red-600 underline">Ini Sangat Penting agar siswa bisa login!</span></p>
            <p>9. Klik Terapkan. Jika muncul "Izinkan Akses", klik akun Google Anda → Lanjutan → Buka Server (tidak aman) → Izinkan.</p>
            <p>10. Salin <b>URL Aplikasi Web</b> yang muncul (diakhiri /exec) dan tempel di kolom <b>"Server Spreadsheet"</b> aplikasi Mentari.</p>
            
            <div className="mt-6 p-4 bg-white border-2 border-amber-200 rounded-2xl flex items-center gap-4">
              <i className="fab fa-youtube text-red-600 text-2xl"></i>
              <div>
                <p className="text-[10px] font-black text-slate-800 uppercase leading-none">BINGUNG DENGAN SETUP DI ATAS?</p>
                <p className="text-[9px] font-bold text-blue-600 uppercase mt-1">Tonton Video Panduan Lengkap: <a href="https://www.youtube.com/watch?v=9MUfqHOTKM8" target="_blank" className="underline">https://www.youtube.com/watch?v=9MUfqHOTKM8</a></p>
              </div>
            </div>
         </div>
      </div>
    </section>

    {/* BAGIAN 4: WORKFLOW GURU */}
    <section className="space-y-6">
      <h2 className="text-xl font-black uppercase text-blue-700 flex items-center gap-3">
         <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs">04</span>
         Panduan Operasional Manajemen Guru (3 Fase)
      </h2>
      
      <div className="space-y-6">
         <div className="border-l-4 border-blue-600 pl-6 space-y-2">
            <h3 className="font-black text-sm uppercase text-blue-900">Fase 01: Inisialisasi & Distribusi</h3>
            <p className="text-[10px] leading-relaxed uppercase font-bold text-slate-500">
               Masuk ke <b>PANEL GURU</b> → Tab <b>Manajemen Data</b>. Tambahkan nama siswa satu per satu beserta PIN 6 digit yang mudah diingat (misal: 123456). 
               Setelah data tersimpan di Cloud, buka Tab <b>Konfigurasi</b> dan klik <b>"SALIN LINK LOGIN SISWA"</b>. 
               Bagikan link tersebut ke Grup WhatsApp kelas. Siswa yang klik link itu akan langsung masuk ke pilihan nama tanpa perlu mengisi link server secara manual.
            </p>
         </div>

         <div className="border-l-4 border-indigo-600 pl-6 space-y-2">
            <h3 className="font-black text-sm uppercase text-indigo-900">Fase 02: Produksi Materi & Gamifikasi</h3>
            <p className="text-[10px] leading-relaxed uppercase font-bold text-slate-500">
               Pilih salah satu menu AI (Modul, Soal, Gim, atau Lab). Masukkan materi ajar Anda. Klik <b>"Rakit AI"</b>. 
               Untuk Gim dan Lab Maya, setelah kode HTML muncul, Anda <b>WAJIB</b> mengatur <b>Mata Pelajaran</b>, <b>EXP</b>, dan <b>Koin</b> sebelum menekan <b>"Terbitkan Misi"</b>. 
               Misi yang terbit akan langsung muncul di dashboard HP siswa masing-masing.
            </p>
         </div>

         <div className="border-l-4 border-emerald-600 pl-6 space-y-2">
            <h3 className="font-black text-sm uppercase text-emerald-900">Fase 03: Validasi & Ekonomi Kelas</h3>
            <p className="text-[10px] leading-relaxed uppercase font-bold text-slate-500">
               Siswa akan mengerjakan misi. Hasilnya akan masuk ke <b>Manajemen Misi</b> → <b>Validasi Tugas</b>. 
               Tinjau nama siswa dan judul tugasnya, lalu beri nilai (0-100). Saat dikonfirmasi, Koin dan EXP siswa akan bertambah otomatis sesuai proporsi nilai. 
               Jika siswa melaporkan kebaikan di <b>"Botol Kebaikan"</b>, Anda harus menyetujuinya agar mereka mendapat bonus 10 Koin per laporan.
            </p>
         </div>
      </div>
    </section>

    {/* BAGIAN 5: EKONOMI SISWA */}
    <section className="space-y-4">
      <h2 className="text-xl font-black uppercase text-blue-700 flex items-center gap-3">
         <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs">05</span>
         Memahami Mekanisme Reward (Gamifikasi)
      </h2>
      <div className="bg-slate-900 text-white p-8 rounded-[3rem] space-y-4">
         <p className="text-[10px] font-bold uppercase leading-relaxed text-indigo-200">
            Siswa belajar dalam bentuk petualangan RPG. Berikut adalah elemen yang harus Anda pantau:
         </p>
         <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <li className="p-4 bg-white/5 border border-white/10 rounded-2xl">
               <h5 className="font-black text-xs text-blue-400 mb-1">EXP & LEVEL</h5>
               <p className="text-[9px] font-bold uppercase opacity-70">EXP didapat dari belajar. Setiap 200 EXP, siswa naik Level. Level menentukan "Kasta" siswa di papan peringkat kelas.</p>
            </li>
            <li className="p-4 bg-white/5 border border-white/10 rounded-2xl">
               <h5 className="font-black text-xs text-amber-400 mb-1">KOIN EMAS</h5>
               <p className="text-[9px] font-bold uppercase opacity-70">Mata uang digital untuk belanja item di "Pasar Petualang" (Bingkai, Gelar, Latar Profil) atau ditukar hadiah nyata.</p>
            </li>
            <li className="p-4 bg-white/5 border border-white/10 rounded-2xl">
               <h5 className="font-black text-xs text-emerald-400 mb-1">PENUKARAN TUNAI</h5>
               <p className="text-[9px] font-bold uppercase opacity-70">Siswa bisa menukar koin dengan uang tunai (misal: 1000 koin = Rp 1000). Siswa akan mendapat KODE UNIK. Mereka memberikan kode itu ke Guru untuk dicairkan.</p>
            </li>
            <li className="p-4 bg-white/5 border border-white/10 rounded-2xl">
               <h5 className="font-black text-xs text-rose-400 mb-1">BOTOL KEBAIKAN</h5>
               <p className="text-[9px] font-bold uppercase opacity-70">Siswa melaporkan karakter positif. Jika botol penuh (20 laporan), mereka mendapat bonus masif 500 EXP & 500 Koin.</p>
            </li>
         </ul>
      </div>
    </section>

    {/* FOOTER PANDUAN */}
    <footer className="pt-12 border-t-2 border-slate-100 flex flex-col items-center gap-4">
       <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl shadow-xl"><i className="fas fa-sun"></i></div>
       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">© 2025 MENTARI AI - Menerangi Langkah Pendidikan</p>
    </footer>
  </div>
);

const TutorialPortal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'intro' | 'teacher' | 'student' | 'tech'>('intro');

  return (
    <div className="fixed inset-0 z-[120000] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-6 animate-in fade-in zoom-in duration-300 no-print">
      <div className="w-full max-w-6xl bg-white rounded-[3.5rem] shadow-2xl flex flex-col md:flex-row max-h-[95vh] overflow-hidden border-8 border-white">
        
        {/* SIDEBAR NAV (Hidden on Print) */}
        <div className="w-full md:w-80 bg-slate-50 border-r-2 border-slate-100 p-8 flex flex-col gap-6 shrink-0 print:hidden">
          <div className="mb-4">
             <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl shadow-lg mb-4">
                <i className="fas fa-graduation-cap"></i>
             </div>
             <h2 className="text-2xl font-black Museum-Text uppercase text-slate-800 leading-none">Pusat Bantuan</h2>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">MENTARI - Ecosystem v17</p>
          </div>

          <nav className="space-y-2">
             {[
               { id: 'intro', icon: 'fa-star', label: 'Visi & Misi' },
               { id: 'tech', icon: 'fa-key', label: '1. Setup Sistem' },
               { id: 'teacher', icon: 'fa-chalkboard-user', label: '2. Panduan Guru' },
               { id: 'student', icon: 'fa-user-astronaut', label: '3. Dunia Siswa' }
             ].map((item) => (
               <button 
                key={item.id} 
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-white hover:text-blue-600'}`}
               >
                 <i className={`fas ${item.icon} w-5 text-center`}></i> {item.label}
               </button>
             ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-200 space-y-3">
             <button 
                onClick={() => window.print()}
                className="w-full p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-3 border-2 border-emerald-100 group"
             >
                <i className="fas fa-file-pdf text-sm group-hover:scale-110 transition-transform"></i> Unduh Panduan PDF
             </button>
             <button onClick={onClose} className="w-full p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all shadow-sm">
                Tutup Panduan
             </button>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-grow overflow-y-auto p-8 md:p-14 bg-white no-scrollbar">
          
          {/* TAB 1: INTRO */}
          {activeTab === 'intro' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-4">
                <div className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest border border-blue-100">Filosofi Kedaulatan Digital</div>
                <h1 className="text-4xl md:text-5xl font-black Museum-Text uppercase leading-tight italic text-slate-800">Masa Depan Administrasi Guru.</h1>
                <p className="text-sm font-semibold text-slate-500 leading-relaxed uppercase max-w-3xl">
                   <span className="text-blue-600 font-black">MENTARI</span> hadir untuk membebaskan guru dari belenggu administrasi fisik yang membosankan. Kami menggabungkan <b>Kecerdasan Buatan (Generative AI)</b> dengan <b>Cloud Computing</b> mandiri agar Anda memiliki kendali penuh atas data kelas Anda sendiri tanpa bergantung pada aplikasi berbayar bulanan yang mahal.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                   { icon: 'fa-shield-halved', title: 'Data Mandiri', desc: 'Database menggunakan Google Spreadsheet milik Guru sendiri. Privasi 100% terjaga dan aman.' },
                   { icon: 'fa-brain', title: 'Asisten AI', desc: 'Ditenagai Google Gemini untuk merancang RPP, Bank Soal, Simulasi STEM, dan Game Edukasi.' },
                   { icon: 'fa-gamepad', title: 'Ekonomi Gamifikasi', desc: 'Sistem Level, Koin, dan Papan Peringkat untuk memacu adrenalin belajar para siswa.' }
                 ].map((box, i) => (
                   <div key={i} className="p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100">
                      <i className={`fas ${box.icon} text-blue-600 text-2xl mb-4`}></i>
                      <h4 className="text-[11px] font-black uppercase text-slate-800 mb-2">{box.title}</h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed">{box.desc}</p>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {/* TAB 2: TECH SETUP */}
          {activeTab === 'tech' && (
             <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                   <h2 className="text-3xl font-black Museum-Text uppercase text-slate-800">Langkah Setup Sistem</h2>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Wajib diselesaikan oleh Guru sebelum dibagikan ke siswa.</p>
                   
                   <div className="mt-4 p-5 bg-red-50 border-2 border-red-100 rounded-[2rem] flex items-center justify-between group cursor-pointer" onClick={() => window.open('https://www.youtube.com/watch?v=9MUfqHOTKM8', '_blank')}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg animate-pulse group-hover:scale-110 transition-transform"><i className="fab fa-youtube"></i></div>
                        <div>
                          <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Tonton Video Panduan Setup</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase">Tutorial langkah demi langkah di YouTube</p>
                        </div>
                      </div>
                      <i className="fas fa-arrow-up-right-from-square text-red-300 group-hover:text-red-600 transition-colors"></i>
                   </div>
                </div>
                
                <div className="space-y-10">
                   {/* LANGKAH 1 */}
                   <div className="relative pl-12 border-l-4 border-amber-400">
                      <div className="absolute -left-[1.35rem] top-0 w-10 h-10 bg-amber-400 text-white rounded-full flex items-center justify-center font-black shadow-lg">1</div>
                      <h4 className="text-sm font-black uppercase text-amber-700 mb-3">Mendapatkan Kunci AI (Google Gemini API)</h4>
                      <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 space-y-4">
                         <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed italic">Tanpa kunci ini, fitur generator AI tidak akan bisa berpikir.</p>
                         <ol className="list-decimal list-inside text-[10px] font-bold text-slate-600 uppercase space-y-2 leading-loose">
                           <li>Buka situs <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-blue-600 underline">Google AI Studio</a>.</li>
                           <li>Klik tombol <b>"Get API Key"</b> lalu pilih <b>"Create API key in new project"</b>.</li>
                           <li>Salin (Copy) kode yang muncul.</li>
                           <li>Buka Mentari, tempelkan di kolom <b>"Kunci AI Gemini"</b> pada halaman login.</li>
                         </ol>
                      </div>
                   </div>

                   {/* LANGKAH 2 */}
                   <div className="relative pl-12 border-l-4 border-blue-600">
                      <div className="absolute -left-[1.35rem] top-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-black shadow-lg">2</div>
                      <h4 className="text-sm font-black uppercase text-blue-700 mb-3">Menghubungkan Server Cloud (Google Spreadsheet)</h4>
                      <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 space-y-4">
                         <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed italic">Langkah ini wajib agar koin dan nilai siswa tersimpan permanen di akun Google Drive Anda.</p>
                         <ol className="list-decimal list-inside text-[10px] font-bold text-slate-600 uppercase space-y-2 leading-loose">
                           <li>Buat <b>Google Spreadsheet</b> baru di Drive Anda.</li>
                           <li>Klik menu <b>Ekstensi</b> → <b>Apps Script</b>.</li>
                           <li>Hapus semua kode lama, tempel <b>Source Code Server Mentari</b> (Dapatkan file kodenya di: <a href="https://drive.google.com/file/d/1eW-pExjGx6e5bzOKKeJWd9KfE9BLeIcU/view?usp=sharing" target="_blank" className="text-blue-600 underline font-black">LINK DRIVE INI</a>), lalu klik ikon Simpan.</li>
                           <li>Klik tombol <b>Terapkan</b> → <b>Penerapan Baru</b>.</li>
                           <li>Pilih jenis <b>Aplikasi Web</b>. Atur "Akses" ke <b>Siapa Saja (Anyone)</b>.</li>
                           <li>Salin <b>URL Aplikasi Web</b> yang muncul (diakhiri /exec).</li>
                           <li>Tempelkan ke kolom <b>"Server Spreadsheet"</b> di halaman login Mentari.</li>
                         </ol>
                      </div>
                   </div>
                </div>
             </div>
          )}

          {/* TAB 3: GURU GUIDE */}
          {activeTab === 'teacher' && (
             <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-4">
                   <h2 className="text-3xl font-black Museum-Text uppercase text-slate-800 italic leading-none">Workflow Manajemen Guru</h2>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Ikuti 3 Fase Utama untuk mengoperasikan ekosistem kelas Anda.</p>
                </div>

                <div className="grid grid-cols-1 gap-10">
                   <div className="p-8 bg-blue-50/50 rounded-[3rem] border-2 border-blue-100">
                      <h3 className="text-xl font-black uppercase text-blue-900 Museum-Text mb-3">Fase 01: Setup Database Siswa</h3>
                      <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase">
                         Buka <b>PANEL GURU</b> → <b>Manajemen Data</b>. Daftarkan seluruh nama siswa di kelas Anda. Atur PIN masuk mereka (misal: 6 digit angka). 
                         Setelah itu, masuk ke Tab <b>Konfigurasi</b> dan klik tombol <b>SALIN LINK LOGIN SISWA</b>. Bagikan link ini ke grup WA kelas agar siswa bisa login otomatis tanpa mengisi URL server secara manual.
                      </p>
                   </div>
                   <div className="p-8 bg-indigo-50/50 rounded-[3rem] border-2 border-indigo-100">
                      <h3 className="text-xl font-black uppercase text-indigo-900 Museum-Text mb-3">Fase 02: Produksi Media & Misi</h3>
                      <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase">
                         Gunakan menu <b>Buat Modul</b> untuk administrasi Anda. Gunakan menu <b>Buat Gim</b> atau <b>Buat Lab</b> untuk tugas siswa. 
                         Ketik topik materi, klik <b>Rakit AI</b>. Setelah kode muncul, tentukan <b>Hadiah Koin</b> untuk memotivasi siswa, lalu klik <b>Terbitkan Misi</b>. Misi tersebut akan langsung muncul di beranda HP siswa.
                      </p>
                   </div>
                   <div className="p-8 bg-emerald-50/50 rounded-[3rem] border-2 border-emerald-100">
                      <h3 className="text-xl font-black uppercase text-emerald-900 Museum-Text mb-3">Fase 03: Validasi Laporan & Koin</h3>
                      <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase">
                         Saat siswa selesai main gim atau kirim tugas, masuk ke <b>PANEL GURU</b> → <b>Manajemen Misi</b>. Berikan nilai (0-100). Saat dikonfirmasi, koin dan EXP siswa akan cair. 
                         Juga pantau Tab <b>Manajemen Poin</b> untuk mencairkan hadiah tunai yang diajukan siswa dengan menukar koin mereka.
                      </p>
                   </div>
                </div>
             </div>
          )}

          {/* TAB 4: STUDENT GUIDE */}
          {activeTab === 'student' && (
             <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-3xl font-black Museum-Text uppercase text-slate-800">Mekanisme Dunia Siswa</h2>
                
                <div className="bg-indigo-600 p-10 rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl">
                   <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><i className="fas fa-rocket text-[12rem]"></i></div>
                   <div className="relative z-10 space-y-8">
                      <div className="space-y-2">
                         <h4 className="text-xl font-black uppercase italic tracking-tight">Menjadi Petualang Mentari</h4>
                         <p className="text-[10px] font-bold uppercase leading-relaxed opacity-80 max-w-2xl">
                            Siswa belajar melalui sistem RPG (Role Playing Game). Mereka harus mengumpulkan harta karun berupa EXP dan KOIN dari Bapak/Ibu Guru.
                         </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="p-6 bg-white/10 rounded-[2rem] backdrop-blur-md border border-white/20">
                            <h5 className="text-xs font-black uppercase mb-2 text-yellow-300">1. Misi Utama</h5>
                            <p className="text-[9px] font-bold uppercase opacity-80 leading-relaxed">Pengerjaan Gim dan Lab Maya yang diterbitkan Guru. Selesaikan tantangan dengan skor tinggi untuk mendapat koin maksimal.</p>
                         </div>
                         <div className="p-6 bg-white/10 rounded-[2rem] backdrop-blur-md border border-white/20">
                            <h5 className="text-xs font-black uppercase mb-2 text-rose-300">2. Botol Kebaikan</h5>
                            <p className="text-[9px] font-bold uppercase opacity-80 leading-relaxed">Siswa lapor aksi terpuji (misal: membuang sampah). Jika disetujui Guru, mereka dapat koin. Jika botol penuh, mereka dapat hadiah besar.</p>
                         </div>
                         <div className="p-6 bg-white/10 rounded-[2rem] backdrop-blur-md border border-white/20">
                            <h5 className="text-xs font-black uppercase mb-2 text-cyan-300">3. Pasar Petualang</h5>
                            <p className="text-[9px] font-bold uppercase opacity-80 leading-relaxed">Tempat siswa membelanjakan koin mereka. Bisa membeli Bingkai Neon, Latar Matrix, atau Gelar "Maha Jenius" untuk pamer di kelas.</p>
                         </div>
                         <div className="p-6 bg-white/10 rounded-[2rem] backdrop-blur-md border border-white/20">
                            <h5 className="text-xs font-black uppercase mb-2 text-emerald-300">4. Tukar Tunai</h5>
                            <p className="text-[9px] font-bold uppercase opacity-80 leading-relaxed">Fitur terpenting! Siswa bisa menukar koin digital menjadi uang tunai atau hadiah fisik yang disediakan oleh Guru di kelas.</p>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="p-8 bg-slate-50 rounded-[3rem] border-2 border-slate-100 flex flex-col md:flex-row items-center gap-8">
                   <div className="shrink-0 text-center space-y-2">
                      <div className="w-16 h-16 rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center text-3xl mx-auto shadow-inner"><i className="fas fa-ranking-stars"></i></div>
                      <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Sistem Pangkat</p>
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-grow w-full">
                      {[
                        { lvl: '1-5', label: 'Pemula', icon: 'fa-seedling', color: 'text-emerald-500' },
                        { lvl: '6-15', label: 'Penjelajah', icon: 'fa-route', color: 'text-blue-500' },
                        { lvl: '16-30', label: 'Ksatria', icon: 'fa-shield-halved', color: 'text-indigo-600' },
                        { lvl: '31+', label: 'Legenda', icon: 'fa-crown', color: 'text-amber-500' }
                      ].map(rank => (
                        <div key={rank.label} className="px-4 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm text-center flex flex-col items-center gap-2 group hover:border-blue-400 transition-all">
                           <div className={`w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-lg ${rank.color} group-hover:scale-110 transition-transform`}>
                              <i className={`fas ${rank.icon}`}></i>
                           </div>
                           <div>
                              <p className="text-[7px] font-black text-slate-300 uppercase">Level {rank.lvl}</p>
                              <p className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{rank.label}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

const LoginPortal: React.FC<LoginPortalProps> = ({
  students,
  teacherSettings,
  setTeacherSettings,
  syncTeacherData,
  handleUpdateStudentProfile,
  setIsLoggedIn,
  setUserRole
}) => {
  const [loginForm, setLoginForm] = useState({ 
    role: 'student', 
    studentId: '', 
    pin: '', 
    teacherPass: '',
    gasUrl: teacherSettings.gasUrl || ''
  });
  
  const [userApiKey, setUserApiKey] = useState(localStorage.getItem('USER_API_KEY') || '');
  const [tempGasUrl, setTempGasUrl] = useState(teacherSettings.gasUrl || '');
  const [showTutorial, setShowTutorial] = useState(false);
  const [isSystemConnected, setIsSystemConnected] = useState(!!(localStorage.getItem('USER_API_KEY') && teacherSettings.gasUrl));
  const [isSyncing, setIsSyncing] = useState(false);
  const [isStudentOnlyMode, setIsStudentOnlyMode] = useState(false);

  // Auto-detect GAS from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gasParam = params.get('gas');
    if (gasParam) {
      try {
        const decodedGas = atob(gasParam);
        if (decodedGas.startsWith('https://script.google.com/')) {
          setTempGasUrl(decodedGas);
          setIsStudentOnlyMode(true);
          setLoginForm(prev => ({ ...prev, role: 'student', gasUrl: decodedGas }));
          setIsSystemConnected(true);
          syncTeacherData(decodedGas).catch(() => {});
        }
      } catch (e) { console.warn("Invalid GAS param"); }
    }
  }, []);

  useEffect(() => {
    if (!isStudentOnlyMode) {
       setIsSystemConnected(!!(localStorage.getItem('USER_API_KEY') && teacherSettings.gasUrl));
    }
  }, [loginForm.role, tempGasUrl, teacherSettings.gasUrl, isStudentOnlyMode]);

  const handleConnectSystem = async () => {
    if (userApiKey.trim() === '' || !tempGasUrl.trim().startsWith('https://script.google.com/')) {
        alert("Mohon lengkapi Kunci AI dan Link Spreadsheet yang valid!");
        return;
    }
    setIsSyncing(true);
    try {
        localStorage.setItem('USER_API_KEY', userApiKey.trim());
        await syncTeacherData(tempGasUrl.trim());
        const updatedSettings = { ...teacherSettings, gasUrl: tempGasUrl.trim() };
        setTeacherSettings(updatedSettings);
        localStorage.setItem('teacher_settings', JSON.stringify(updatedSettings));
        setIsSystemConnected(true);
        alert("SISTEM TERHUBUNG!");
    } catch (err) {
        alert("Koneksi Gagal!");
    } finally {
        setIsSyncing(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.role === 'teacher') {
      if (loginForm.teacherPass === (teacherSettings.password || 'guru123')) {
        setIsLoggedIn(true); 
        setUserRole('teacher');
        localStorage.setItem('isLoggedIn', 'true'); 
        localStorage.setItem('userRole', 'teacher');
        await syncTeacherData().catch(() => {});
      } else { alert("Password Salah!"); }
    } else {
      const student = students.find(s => s.id.toString().trim() === loginForm.studentId.toString().trim());
      if (student) {
        if (student.pin && loginForm.pin !== student.pin) { alert("PIN Salah!"); return; }
        setIsLoggedIn(true); 
        setUserRole('student');
        localStorage.setItem('isLoggedIn', 'true'); 
        localStorage.setItem('userRole', 'student');
        localStorage.setItem('loggedStudentId', student.id.toString().trim());
        let finalProfile: StudentProfile = { id: student.id.toString().trim(), name: student.name || 'Siswa', hobby: '', animal: '', avatar: 'av1', coins: student.coins || 10, exp: student.exp || 0, level: student.level || 1, dailyTasks: [], lastResetDate: new Date().toLocaleDateString(), aiWorks: [], kindnessCount: student.kindnessCount || 0, completedAdventureIds: [], purchasedItems: [], viewedMaterialIds: [], redemptions: student.redemptions || [], activeTitle: '', activeBackground: '', activeBorder: '', activeEffect: '', activeFont: '' };
        if (student.profileData) { try { const serverData = JSON.parse(student.profileData); finalProfile = { ...finalProfile, ...serverData }; } catch (e) {} }
        handleUpdateStudentProfile(finalProfile);
        if (tempGasUrl) { syncTeacherData(tempGasUrl).catch(() => {}); } else { await syncTeacherData().catch(() => {}); }
      } else { alert("Pilih namamu dari daftar!"); }
    }
  };

  return (
    <div className="fixed inset-0 z-[110000] flex items-center justify-center p-4 bg-blue-600/95 backdrop-blur-xl overflow-y-auto">
      {showTutorial && <TutorialPortal onClose={() => setShowTutorial(false)} />}
      
      {/* HIDDEN PRINT-VIEW: Berisi manual lengkap seluruh fase */}
      <div className="hidden print:block fixed inset-0 bg-white z-[200000] p-10 overflow-auto">
         <FullManualContent />
      </div>

      <div className="relative w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden rounded-[3rem] bg-white shadow-2xl animate-in zoom-in duration-500 my-auto no-print">
         
         {/* PANEL INFO (KIRI) */}
         <div className="hidden lg:flex flex-col bg-gradient-to-br from-blue-700 to-indigo-900 p-12 text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><i className="fas fa-sun text-[12rem]"></i></div>
            <div className="relative z-10 space-y-8 h-full flex flex-col">
               <div className="flex items-center justify-between">
                  <div className="inline-block px-4 py-2 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-md">
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-200">{isStudentOnlyMode ? 'Portal Siswa' : 'Ecosystem v17.0'}</p>
                  </div>
               </div>
               <h2 className="text-3xl font-black Museum-Text uppercase leading-tight italic">
                  {isStudentOnlyMode ? 'Selamat Datang \n Para Petualang Mentari!' : 'Ekosistem Belajar \n Berbasis AI & Cloud Pribadi'}
               </h2>
               
               <div className="space-y-4">
                  {/* TOMBOL UNDUH MANUAL UTAMA - Agar guru punya file referensi saat setup */}
                  {!isStudentOnlyMode && (
                    <button 
                       onClick={() => window.print()}
                       className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-3 border-2 border-emerald-400 group"
                    >
                       <i className="fas fa-file-pdf text-lg group-hover:scale-110 transition-transform"></i> UNDUH PANDUAN LENGKAP (PDF)
                    </button>
                  )}
                  
                  <button 
                    onClick={() => setShowTutorial(true)}
                    className="w-full py-4 bg-white/10 border-2 border-white/20 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                     <i className="fas fa-book-open text-lg"></i> BUKA PUSAT BANTUAN
                  </button>
               </div>

               <div className="pt-8 border-t border-white/10 mt-auto">
                  <p className="text-[9px] font-bold text-blue-300 uppercase tracking-widest italic">Menerangi Langkah, Memudahkan Masa Depan Pendidikan.</p>
               </div>
            </div>
         </div>

         {/* PANEL LOGIN & SETUP (KANAN) */}
         <div className="p-8 md:p-10 flex flex-col justify-center bg-white overflow-hidden">
            <div className="text-center mb-6">
               <div className="inline-flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-base shadow-lg transform -rotate-3"><i className="fas fa-sun"></i></div>
                  <h1 className="text-3xl md:text-4xl font-black Museum-Text uppercase italic text-blue-600 leading-none tracking-tight">MENTARI</h1>
               </div>
               <p className="text-[8px] md:text-[9px] font-black text-blue-500/80 uppercase tracking-[0.2em] leading-tight">Media Edukasi & Tata Kelola Administrasi Mandiri</p>
            </div>
            
            {!isStudentOnlyMode && (!isSystemConnected) && (
            <div className="space-y-4 mb-8">
                <div className="p-5 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] space-y-4">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2"><i className="fas fa-key text-blue-500"></i> Kunci AI Gemini</label>
                        <input type="password" value={userApiKey} onChange={e => setUserApiKey(e.target.value)} className="w-full input-futuristic px-5 py-3 font-mono text-[10px]" placeholder="AIzaSyB..." />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2"><i className="fas fa-link text-indigo-500"></i> Server Spreadsheet</label>
                        <input type="text" value={tempGasUrl} onChange={e => setTempGasUrl(e.target.value)} className="w-full input-futuristic px-5 py-3 font-mono text-[10px]" placeholder="https://script.google.com/..." />
                    </div>
                    <button onClick={handleConnectSystem} disabled={isSyncing} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-indigo-700 active:scale-95 transition-all">
                        {isSyncing ? 'MENGHUBUNGKAN...' : 'HUBUNGKAN SISTEM'}
                    </button>
                </div>
            </div>
            )}

            {(isSystemConnected || isStudentOnlyMode) && (
                <div className="animate-in slide-in-from-bottom-8 duration-700">
                    <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
                        {!isStudentOnlyMode && (
                        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-4">
                            <button type="button" onClick={() => setLoginForm({...loginForm, role: 'student'})} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${loginForm.role === 'student' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>Masuk Siswa</button>
                            <button type="button" onClick={() => setLoginForm({...loginForm, role: 'teacher'})} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${loginForm.role === 'teacher' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>Masuk Guru</button>
                        </div>
                        )}
                        {loginForm.role === 'student' ? (
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nama Siswa</label>
                                    <select required value={loginForm.studentId} onChange={e => setLoginForm({...loginForm, studentId: e.target.value})} className="w-full input-futuristic px-5 py-3.5 font-bold border-2 border-blue-50 text-sm">
                                        <option value="">-- DAFTAR SISWA --</option>
                                        {students.map(s => <option key={s.id} value={s.id}>{(s.name || 'Siswa').toUpperCase()}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">PIN Keamanan</label>
                                    <input type="password" maxLength={6} required value={loginForm.pin} onChange={e => setLoginForm({...loginForm, pin: e.target.value})} className="w-full input-futuristic px-5 py-3.5 font-black text-center tracking-[0.5em] text-blue-600 text-lg" placeholder="••••••" />
                                </div>
                                <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 active:scale-[0.98] transition-all mt-2 text-sm">Mulai Petualangan</button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center mb-1 pr-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Sandi Akses Guru</label>
                                        <button type="button" onClick={() => setIsSystemConnected(false)} className="text-[9px] font-black text-blue-600 hover:underline uppercase flex items-center gap-1"><i className="fas fa-cog"></i> Ganti Server</button>
                                    </div>
                                    <input type="password" required value={loginForm.teacherPass} onChange={e => setLoginForm({...loginForm, teacherPass: e.target.value})} className="w-full input-futuristic px-5 py-3.5 font-bold text-sm" />
                                </div>
                                <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl mt-2 text-sm">Masuk Panel Guru</button>
                            </div>
                        )}
                    </form>
                </div>
            )}

            <div className="mt-8 pt-4 border-t border-slate-50 flex items-center justify-center gap-4">
                 <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${isSystemConnected ? 'bg-green-500' : 'bg-red-400'}`}></div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Sistem Status</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-indigo-50'}`}></div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Cloud Status</span>
                 </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default LoginPortal;