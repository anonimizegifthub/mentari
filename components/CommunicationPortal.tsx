import React, { useState, useRef, useEffect } from 'react';
import { CommunicationToolType, Student, TeacherSettings } from '../types';
import { generateCommunicationContent } from '../services/communicationService';
import { BlockingOverlay, ProRequirementNotice } from './SharedUI';
import { validateUsageCloud, getUsageStatusCloud } from '../services/validationService';
import { handleAiGenerationError } from '../utils/errorUtils';

const CommunicationPortal: React.FC<{ isUnlocked: boolean, gasUrl?: string, students: Student[], settings: TeacherSettings, setGlobalBusy: (b: boolean) => void }> = ({ isUnlocked, gasUrl, students, settings, setGlobalBusy }) => {
  const [activeTool, setActiveTool] = useState<CommunicationToolType>('bulletin');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isCloudBlocked, setIsCloudBlocked] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  
  const [dailyCount, setDailyCount] = useState(() => {
    const today = new Date().toLocaleDateString();
    const saved = localStorage.getItem(`usage_komunikasi_v1_${today}`);
    return saved ? parseInt(saved) : 0;
  });

  const [hasBonusToday, setHasBonusToday] = useState(() => {
    const today = new Date().toLocaleDateString();
    const saved = localStorage.getItem(`bonus_komunikasi_v1_${today}`);
    return saved === 'true';
  });

  const [proNotice, setProNotice] = useState<{show: boolean, title: string, feature: string, benefit: string, canClaimBonus?: boolean}>({
    show: false, title: '', feature: '', benefit: '', canClaimBonus: false
  });

  // Form States
  const [aktivitas, setAktivitas] = useState('');
  const [champions, setChampions] = useState('');
  const [targetStudentId, setTargetStudentId] = useState('');
  const [pencapaian, setPencapaian] = useState('Ananda sangat aktif dalam diskusi kelompok minggu ini.');

  const resultRef = useRef<HTMLDivElement>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const currentLimit = hasBonusToday ? 1 : 0;

  // Initial cloud status check
  useEffect(() => {
    const checkCloud = async () => {
      if (!isUnlocked && settings.schoolCode) {
        setIsValidating(true);
        const isAllowed = await getUsageStatusCloud(settings.schoolCode, 'Komunikasi', currentLimit, gasUrl || "NONE");
        if (!isAllowed) setIsCloudBlocked(true);
        setIsValidating(false);
      }
    };
    checkCloud();
  }, [isUnlocked, settings.schoolCode, gasUrl, currentLimit]);

  const handleClaimBonus = () => {
    const today = new Date().toLocaleDateString();
    setHasBonusToday(true);
    localStorage.setItem(`bonus_komunikasi_v1_${today}`, 'true');
    setProNotice(prev => ({ ...prev, show: false }));
    setIsCloudBlocked(false); 
    alert("🌟 BONUS DIAKTIFKAN!\n\n1 Kesempatan Merakit Laporan telah terbuka. Silakan klik tombol Rakit Laporan lagi.");
  };

  const performGeneration = async () => {
    if (activeTool === 'bulletin' && !aktivitas.trim()) return alert("Mohon isi rangkuman aktivitas kelas!");
    if (activeTool === 'parent_msg' && !targetStudentId) return alert("Mohon pilih nama siswa!");

    setIsLoading(true);
    setGlobalBusy(true);
    setResult(null);

    try {
      if (!isUnlocked && settings.schoolCode) {
        const isAllowed = await validateUsageCloud(settings.schoolCode, 'Komunikasi', currentLimit, gasUrl || "NONE", dailyCount);
        if (!isAllowed) {
            setIsLoading(false); setGlobalBusy(false); setIsCloudBlocked(true);
            setProNotice({ show: true, title: 'Akses Terbatas', feature: 'Komunikasi Ortu AI', benefit: 'Upgrade ke GURU PRO untuk akses tanpa batas harian.', canClaimBonus: !hasBonusToday });
            return;
        }
      }

      const studentName = students.find(s => s.id === targetStudentId)?.name || '';
      const data = { 
        sekolah: settings.schoolName || 'Sekolah Mentari', 
        kelas: settings.className || 'Kelas Kita', 
        aktivitas, 
        champions, 
        namaSiswa: studentName, 
        pencapaian,
        namaGuru: settings.teacherName || 'Guru Pengampu'
      };
      
      const res = await generateCommunicationContent(activeTool, data);
      setResult(res.text);

      if (!isUnlocked) {
        const today = new Date().toLocaleDateString();
        const newCount = dailyCount + 1;
        setDailyCount(newCount);
        localStorage.setItem(`usage_komunikasi_v1_${today}`, newCount.toString());
      }

      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);
    } catch (e) {
      handleAiGenerationError(e);
    } finally {
      setIsLoading(false);
      setGlobalBusy(false);
    }
  };

  const handleGenerate = () => {
    if (!isUnlocked) {
        if (dailyCount === 0 && !hasBonusToday) {
            setProNotice({ 
                show: true, 
                title: 'Fitur Terkunci', 
                feature: 'Komunikasi Ortu AI', 
                benefit: 'Bapak/Ibu dapat mencoba fitur ini secara GRATIS dengan membagikan aplikasi Mentari terlebih dahulu.',
                canClaimBonus: true 
            });
            return;
        }
        if (dailyCount >= 1 || (isCloudBlocked && !hasBonusToday)) {
            setProNotice({ 
                show: true, 
                title: 'Limit Harian Tercapai', 
                feature: 'Komunikasi Tanpa Batas', 
                benefit: 'Jatah gratis melalui share sudah digunakan. Upgrade ke GURU PRO untuk akses tanpa batas harian.', 
                canClaimBonus: false 
            });
            return;
        }
    }
    performGeneration();
  };

  const handleShareWhatsApp = () => {
    if (!result) return;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(result)}`;
    window.open(url, '_blank');
  };

  const handleDownloadHtml = () => {
    if (!printAreaRef.current) return;
    const content = printAreaRef.current.innerHTML;
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Komunikasi Mentari AI</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @media print { .no-print { display: none; } body { padding: 0; } }
          body { background-color: #ecfdf5; padding: 40px; font-family: sans-serif; }
          .container { background: white; padding: 50px; border-radius: 40px; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); max-width: 850px; margin: auto; border: 8px solid #10b981; }
        </style>
      </head>
      <body>
        <div class="no-print mb-8 text-center">
          <button onclick="window.print()" style="background:#10b981; color:white; padding:12px 30px; border-radius:12px; border:none; cursor:pointer; font-weight:bold; font-size:16px;">CETAK SEKARANG</button>
        </div>
        <div class="container">
          ${content}
        </div>
      </body>
      </html>
    `;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Komunikasi_${activeTool}_${Date.now()}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderNewsletterDoc = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentTable: string[][] = [];
    let inTable = false;

    const flushTable = (idx: number) => {
      if (currentTable.length > 0) {
        elements.push(
          <div key={`tbl-${idx}`} className="mb-8 p-6 bg-emerald-50/50 rounded-[2.5rem] border-2 border-emerald-100 shadow-sm">
            <table className="w-full border-collapse text-xs md:text-sm text-emerald-900">
              <tbody>
                {currentTable.map((r, i) => (
                  <tr key={i}>
                    {r.map((c, j) => (
                        <td key={j} className="py-2 px-4 align-top font-bold uppercase tracking-wide">
                            {c.trim()}
                        </td>
                    ))}
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
        );
        currentTable = [];
      }
      inTable = false;
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('|')) {
        inTable = true;
        currentTable.push(trimmed.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1));
      } else {
        if (inTable) flushTable(idx);
        if (trimmed === '') return;
        const isBoldHeader = trimmed.length < 50 && (trimmed === trimmed.toUpperCase());
        if (isBoldHeader) {
          elements.push(<div key={idx} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl mb-4 shadow-md Museum-Text font-black uppercase text-sm tracking-[0.15em] text-center">{trimmed}</div>);
        } else {
          elements.push(<p key={idx} className="mb-4 text-sm text-slate-700 font-semibold leading-relaxed border-b border-emerald-50 pb-2 uppercase">{trimmed}</p>);
        }
      }
    });
    if (inTable) flushTable(lines.length);
    return elements;
  };

  const tools = [
    { id: 'bulletin', label: 'Buletin Mingguan', icon: 'fa-newspaper', color: 'emerald', desc: 'Laporan perkembangan kelas untuk orang tua' },
    { id: 'parent_msg', label: 'Pesan Apresiasi Ortu', icon: 'fa-comments', color: 'cyan', desc: 'Kirim kabar bangga ke WhatsApp orang tua' }
  ];

  return (
    <div className="animate-in fade-in duration-700 space-y-8">
      <BlockingOverlay isVisible={isLoading} text="AI Sedang Merangkum Berita..." isUnlocked={isUnlocked} />
      
      <ProRequirementNotice 
        isOpen={proNotice.show} 
        onClose={() => setProNotice({...proNotice, show: false})} 
        featureName={proNotice.feature} 
        benefitDesc={proNotice.benefit} 
        deviceId={settings.schoolCode}
        canClaimBonus={proNotice.canClaimBonus}
        onShareBonus={handleClaimBonus}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 space-y-6 sticky top-24 no-print">
          <div className="bg-white rounded-[3rem] p-4 shadow-xl border-4 border-emerald-100">
             <div className="flex flex-col gap-2">
                {tools.map(tool => (
                  <button key={tool.id} onClick={() => { setActiveTool(tool.id as any); setResult(null); }} className={`flex items-center gap-4 p-5 rounded-[2rem] transition-all active:scale-95 text-left ${activeTool === tool.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${activeTool === tool.id ? 'bg-white/20' : 'bg-white shadow-sm'}`}><i className={`fas ${tool.icon}`}></i></div>
                    <div><span className="text-[10px] font-black uppercase tracking-widest block leading-none">{tool.label}</span><span className={`text-[8px] font-bold uppercase opacity-60 mt-1 block`}>{tool.desc}</span></div>
                  </button>
                ))}
             </div>
          </div>
          <div className="bg-white rounded-[3rem] p-8 shadow-xl border-4 border-emerald-100 space-y-5">
             <h4 className="text-xs font-black uppercase text-emerald-600 Museum-Text mb-4">Detail Laporan</h4>
             <div className="space-y-4">
                {activeTool === 'bulletin' ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Highlights Aktivitas Minggu Ini</label>
                      <textarea value={aktivitas} onChange={e => setAktivitas(e.target.value)} className="w-full input-futuristic px-5 py-3 h-32 resize-none text-xs leading-relaxed" placeholder="Contoh: Praktikum menanam jagung, Misi Game Pecahan, Kerja bakti..." />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Bintang Kelas / Juara (Opsional)</label>
                      <select value={champions} onChange={e => setChampions(e.target.value)} className="w-full input-futuristic px-5 py-3 text-xs font-bold uppercase cursor-pointer">
                        <option value="">-- PILIH BINTANG KELAS --</option>
                        {students.map(s => <option key={s.id} value={s.name}>{s.name.toUpperCase()}</option>)}
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Pilih Nama Siswa</label>
                      <select value={targetStudentId} onChange={e => setTargetStudentId(e.target.value)} className="w-full input-futuristic px-5 py-3 text-xs font-bold uppercase cursor-pointer">
                        <option value="">-- DAFTAR SISWA --</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Kabar Baik / Catatan Positif</label>
                      <textarea value={pencapaian} onChange={e => setPencapaian(e.target.value)} className="w-full input-futuristic px-5 py-3 h-28 resize-none text-xs leading-relaxed" placeholder="Apa yang ingin dibanggakan dari siswa ini?" />
                    </div>
                  </>
                )}
             </div>
             <button onClick={handleGenerate} disabled={isLoading || isValidating} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-3">
               {isValidating ? <i className="fas fa-shield-halved fa-spin"></i> : isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-comment-nodes"></i>} 
               {isValidating ? 'VALIDASI...' : 'RAKIT LAPORAN'}
             </button>
          </div>
        </div>
        <div className="lg:col-span-8 h-full" ref={resultRef}>
          {!result ? (
            <div className="w-full min-h-[600px] border-4 border-dashed border-emerald-200 rounded-[4rem] flex flex-col items-center justify-center p-16 text-center bg-white/50">
               <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-8"><i className="fas fa-bullhorn text-5xl text-emerald-200"></i></div>
               <h3 className="text-xl font-black uppercase text-emerald-300 Museum-Text tracking-widest">Ruang Informasi Ortu</h3>
               <p className="mt-4 text-[10px] font-black uppercase max-w-xs mx-auto text-slate-300 leading-loose tracking-[0.2em]">Bagikan kabar positif tentang perkembangan kelas kepada wali murid hari ini.</p>
            </div>
          ) : (
            <div className="bg-white rounded-[3.5rem] shadow-2xl border-4 border-emerald-600 overflow-hidden flex flex-col h-full animate-in zoom-in duration-500">
               <div className="p-6 bg-emerald-600 flex flex-wrap gap-3 justify-center no-print">
                  <button onClick={() => { navigator.clipboard.writeText(result); alert("Berhasil disalin!"); }} className="px-5 py-2.5 bg-white text-emerald-600 rounded-xl font-black uppercase text-[9px] hover:bg-emerald-50 transition-all flex items-center gap-2 shadow-sm"><i className="fas fa-copy"></i> SALIN PESAN</button>
                  <button onClick={handleShareWhatsApp} className="px-5 py-2.5 bg-emerald-100 text-emerald-800 rounded-xl font-black uppercase text-[9px] hover:bg-emerald-200 transition-all flex items-center gap-2 shadow-sm"><i className="fab fa-whatsapp"></i> KIRIM KE WA</button>
                  <button onClick={handleDownloadHtml} className="px-5 py-2.5 bg-white text-emerald-600 rounded-xl font-black uppercase text-[9px] hover:bg-emerald-50 transition-all flex items-center gap-2 shadow-sm"><i className="fas fa-file-code"></i> FILE CETAK</button>
               </div>
               <div className="bg-slate-100 p-8 md:p-14 overflow-auto max-h-[800px]">
                  <div ref={printAreaRef} className="bg-white shadow-lg mx-auto w-full p-10 md:p-16 text-black rounded-sm min-h-[600px] document-body whitespace-pre-wrap border-t-8 border-emerald-500 printable-area">
                    <div className="flex flex-col items-center mb-10 pb-6 border-b-2 border-slate-100">
                        <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-xl shadow-emerald-100"><i className="fas fa-sun"></i></div>
                        <h1 className="text-xl font-black Museum-Text uppercase text-emerald-800">{activeTool === 'bulletin' ? 'Kabar Mentari Mingguan' : 'Apresiasi Petualang'}</h1>
                        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-400 mt-1">Ecosystem v17.0 Digital Report</p>
                    </div>
                    {renderNewsletterDoc(result)}
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunicationPortal;