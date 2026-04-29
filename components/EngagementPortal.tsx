import React, { useState, useRef, useEffect } from 'react';
import { EngagementToolType, Student, VisualDesign, TeacherSettings } from '../types';
import { generateEngagementContent, generateVisualLayout } from '../services/engagementService'; 
import { buildCanvaPrompt } from '../services/teacherToolsService';
import { BlockingOverlay, ProRequirementNotice } from './SharedUI';
import { validateUsageCloud, getUsageStatusCloud } from '../services/validationService';

const EngagementPortal: React.FC<{ isUnlocked: boolean, gasUrl?: string, students: Student[], settings: TeacherSettings, setGlobalBusy: (b: boolean) => void }> = ({ isUnlocked, gasUrl, students, settings, setGlobalBusy }) => {
  const [activeTool, setActiveTool] = useState<EngagementToolType>('certificate');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [visualDesign, setVisualDesign] = useState<VisualDesign | null>(null);
  const [draftType, setDraftType] = useState<'text' | 'visual'>('text');
  const [isCloudBlocked, setIsCloudBlocked] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  
  const [dailyCount, setDailyCount] = useState(() => {
    const today = new Date().toLocaleDateString();
    const saved = localStorage.getItem(`usage_gamifikasi_v1_${today}`);
    return saved ? parseInt(saved) : 0;
  });

  const [hasBonusToday, setHasBonusToday] = useState(() => {
    const today = new Date().toLocaleDateString();
    const saved = localStorage.getItem(`bonus_gamifikasi_v1_${today}`);
    return saved === 'true';
  });

  const [proNotice, setProNotice] = useState<{show: boolean, title: string, feature: string, benefit: string, canClaimBonus?: boolean}>({
    show: false, title: '', feature: '', benefit: '', canClaimBonus: false
  });

  const [targetStudentId, setTargetStudentId] = useState('');
  const [milestone, setMilestone] = useState('Penjelajah Terajin');
  const [topik, setTopik] = useState('');
  const [kelas, setKelas] = useState('Kelas 4 SD');
  const [tema, setTema] = useState('Hilangnya Kapas Penghapus');

  const resultRef = useRef<HTMLDivElement>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const currentLimit = hasBonusToday ? 1 : 0;

  useEffect(() => {
    const checkCloud = async () => {
      if (!isUnlocked && settings.schoolCode) {
        setIsValidating(true);
        const isAllowed = await getUsageStatusCloud(settings.schoolCode, 'Gamifikasi', currentLimit, gasUrl || "NONE");
        if (!isAllowed) setIsCloudBlocked(true);
        setIsValidating(false);
      }
    };
    checkCloud();
  }, [isUnlocked, settings.schoolCode, gasUrl, currentLimit]);

  const handleClaimBonus = () => {
    const today = new Date().toLocaleDateString();
    setHasBonusToday(true);
    localStorage.setItem(`bonus_gamifikasi_v1_${today}`, 'true');
    setProNotice(prev => ({ ...prev, show: false }));
    setIsCloudBlocked(false); 
    alert("🌟 BONUS DIAKTIFKAN!\n\n1 Kesempatan Merakit Apresiasi telah terbuka. Silakan klik tombol Rakit Apresiasi lagi.");
  };

  const performGeneration = async () => {
    if (activeTool === 'certificate' && !targetStudentId) return alert("Pilih nama siswa!");
    if (activeTool === 'certificate' && !milestone.trim()) return alert("Isi capaian siswa!");
    if (activeTool === 'homeproject' && !topik.trim()) return alert("Isi topik proyek!");
    if (activeTool === 'mystery' && !tema.trim()) return alert("Isi tema misteri!");

    setIsLoading(true);
    setGlobalBusy(true);
    setResult(null);
    setVisualDesign(null);

    try {
      if (!isUnlocked && settings.schoolCode) {
        const isAllowed = await validateUsageCloud(settings.schoolCode, 'Gamifikasi', currentLimit, gasUrl || "NONE", dailyCount);
        if (!isAllowed) {
            setIsLoading(false); setGlobalBusy(false); setIsCloudBlocked(true);
            setProNotice({ show: true, title: 'Akses Terbatas', feature: 'Engagement & Gamifikasi', benefit: 'Upgrade ke GURU PRO untuk akses tanpa batas.', canClaimBonus: !hasBonusToday });
            return;
        }
      }

      const studentName = students.find(s => s.id === targetStudentId)?.name || '';
      const data = { 
        namaSiswa: studentName, 
        capaian: milestone, 
        namaGuru: settings.teacherName || 'Guru Mentari', 
        sekolah: settings.schoolName || 'Sekolah Mentari',
        topik, 
        kelas, 
        tema 
      };
      
      const res = await generateEngagementContent(activeTool, data);
      
      if (draftType === 'visual') {
        const visual = await generateVisualLayout(activeTool === 'certificate' ? studentName : (topik || tema), res.text, activeTool);
        setVisualDesign(visual);
      }
      
      setResult(res.text);

      if (!isUnlocked) {
        const today = new Date().toLocaleDateString();
        const newCount = dailyCount + 1;
        setDailyCount(newCount);
        localStorage.setItem(`usage_gamifikasi_v1_${today}`, newCount.toString());
      }

      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);
    } catch (e) {
      alert("Gagal merancang tantangan.");
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
                feature: 'Engagement & Gamifikasi', 
                benefit: 'Bapak/Ibu dapat mencoba fitur ini secara GRATIS dengan membagikan aplikasi Mentari terlebih dahulu.',
                canClaimBonus: true 
            });
            return;
        }
        if (dailyCount >= 1 || (isCloudBlocked && !hasBonusToday)) {
            setProNotice({ 
                show: true, 
                title: 'Limit Harian Tercapai', 
                feature: 'Engagement Tanpa Batas', 
                benefit: 'Jatah gratis melalui share sudah digunakan. Upgrade ke GURU PRO untuk menikmati seluruh fitur sepuasnya.', 
                canClaimBonus: false 
            });
            return;
        }
    }
    performGeneration();
  };

  const handleCanvaMagic = () => {
    if (!result) return;
    const materiTitle = activeTool === 'certificate' ? (students.find(s => s.id === targetStudentId)?.name || 'Siswa') : (topik || tema);
    const promptCanva = buildCanvaPrompt(activeTool, materiTitle, result, settings.schoolName || 'Sekolah Mentari');
    navigator.clipboard.writeText(promptCanva);
    alert("🚀 PROMPT CANVA PROFESIONAL DISALIN!\n\nLangkah:\n1. Klik OK untuk buka Canva AI,\n2. Tempel (CTRL+V) pada kolom Magic Design,\n3. Klik Generate.");
    window.open('https://www.canva.com/ai', '_blank');
  };

  const handleDownloadImage = () => {
    if (!visualDesign?.imageUrl) return;
    const link = document.createElement('a');
    link.href = visualDesign.imageUrl;
    link.download = `Draft_Visual_${activeTool}_${Date.now()}.png`;
    link.click();
  };

  const handleDownloadHtml = () => {
    if (!printAreaRef.current) return;
    const content = printAreaRef.current.innerHTML;
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Apresiasi Mentari AI - ${activeTool}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @media print { .no-print { display: none; } body { padding: 0; } }
          body { background-color: #fff7ed; padding: 40px; font-family: 'Georgia', serif; }
          .container { background: white; padding: 60px; border-radius: 32px; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); max-width: 900px; margin: auto; border: 12px double #f59e0b; }
        </style>
      </head>
      <body>
        <div class="no-print mb-8 text-center">
          <button onclick="window.print()" style="background:#f59e0b; color:white; padding:14px 35px; border-radius:12px; border:none; cursor:pointer; font-weight:bold; font-size:18px;">CETAK SEKARANG</button>
        </div>
        <div class="container text-center">
          ${content}
        </div>
      </body>
      </html>
    `;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Apresiasi_Cetak_${Date.now()}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadDoc = () => {
    if (!printAreaRef.current) return;
    const content = printAreaRef.current.innerHTML;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><style>body { font-family: 'Georgia', serif; font-size: 11pt; padding: 20pt; } .cert-border { border: 10pt double #eab308; padding: 30pt; text-align: center; }</style></head><body>";
    const footer = "</body></html>";
    const blob = new Blob(['\ufeff', header + content + footer], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Apresiasi_${activeTool}_${Date.now()}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderFormalDoc = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentTable: string[][] = [];
    let inTable = false;

    const flushTable = (idx: number) => {
      if (currentTable.length > 0) {
        const filtered = currentTable.filter(row => !row.join('').match(/^[:\-\s|]+$/));
        if (filtered.length > 0) {
          elements.push(
            <div key={`tbl-${idx}`} className="mb-8 border-4 border-amber-200 rounded-[2rem] p-6 bg-amber-50/20">
              <table className="w-full border-collapse text-xs md:text-sm text-amber-900">
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={i}>
                      {r.map((c, j) => (
                          <td key={j} className="py-2 px-4 align-top font-black uppercase tracking-wider">
                              {c.trim()}
                          </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
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
        const isHeading = trimmed.length < 50 && (trimmed === trimmed.toUpperCase());
        if (isHeading) {
          elements.push(<div key={idx} className="bg-amber-600 text-white px-8 py-4 rounded-3xl mb-6 shadow-md Museum-Text font-black uppercase text-base text-center border-b-8 border-amber-800">{trimmed}</div>);
        } else {
          elements.push(<p key={idx} className="mb-4 text-sm text-slate-800 font-bold uppercase leading-relaxed text-center tracking-wide">{trimmed}</p>);
        }
      }
    });
    if (inTable) flushTable(lines.length);
    return elements;
  };

  return (
    <div className="animate-in fade-in duration-700 space-y-8">
      <BlockingOverlay isVisible={isLoading} text="AI Studio Sedang Mendesain..." isUnlocked={isUnlocked} />
      
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
          <div className="bg-white rounded-[3rem] p-8 shadow-xl border-4 border-amber-100 space-y-5">
             <h4 className="text-xs font-black uppercase text-amber-600 Museum-Text mb-4">Parameter Misi</h4>
             <div className="space-y-4">
                <div className="space-y-1.5">
                   <label className="text-[9px] font-black uppercase text-amber-400 ml-2 tracking-widest">Format Output Draft</label>
                   <select value={draftType} onChange={e => setDraftType(e.target.value as any)} className="w-full input-futuristic px-5 py-3 text-[10px] font-black text-amber-600 uppercase border-2 border-amber-50">
                      <option value="text">Draft Teks Sistematis</option>
                      <option value="visual">Visual Poster AI (Visual Mode)</option>
                   </select>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Pilih Alat</label>
                   <select value={activeTool} onChange={e => setActiveTool(e.target.value as any)} className="w-full input-futuristic px-5 py-3 text-xs font-bold">
                     <option value="certificate">Sertifikat Apresiasi</option>
                     <option value="homeproject">Tantangan Rumah</option>
                     <option value="mystery">Misteri Detektif</option>
                   </select>
                </div>
                {activeTool === 'certificate' ? (
                   <>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Pilih Nama Siswa</label>
                        <select value={targetStudentId} onChange={e => setTargetStudentId(e.target.value)} className="w-full input-futuristic px-5 py-3 text-xs font-bold uppercase">
                            <option value="">-- DAFTAR SISWA --</option>
                            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Capaian / Milestone</label>
                        <input value={milestone} onChange={e => setMilestone(e.target.value)} className="w-full input-futuristic px-5 py-3 text-xs font-bold uppercase" placeholder="Contoh: Penjelajah Terajin" />
                     </div>
                   </>
                ) : (
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{activeTool === 'homeproject' ? 'Topik Proyek' : 'Tema Misteri'}</label>
                      <input value={activeTool === 'homeproject' ? topik : tema} onChange={e => activeTool === 'homeproject' ? setTopik(e.target.value) : setTema(e.target.value)} className="w-full input-futuristic px-5 py-3 text-xs font-bold uppercase" placeholder="Judul Materi/Misteri" />
                   </div>
                )}
             </div>
             <button onClick={handleGenerate} disabled={isLoading || isValidating} className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black uppercase text-xs joyful-shadow">
               {isValidating ? <i className="fas fa-shield-halved fa-spin"></i> : isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-award"></i>}
               {isValidating ? 'VALIDASI...' : 'RAKIT APRESIASI'}
             </button>
          </div>
        </div>
        <div className="lg:col-span-8 h-full" ref={resultRef}>
          {!result && !visualDesign ? (
            <div className="w-full min-h-[600px] border-4 border-dashed border-amber-200 rounded-[4rem] flex flex-col items-center justify-center p-16 text-center bg-white/50">
               <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-8"><i className="fas fa-trophy text-5xl text-amber-200"></i></div>
               <h3 className="text-xl font-black uppercase text-amber-300 Museum-Text tracking-widest">Studio Apresiasi</h3>
            </div>
          ) : (
            <div className="space-y-8 animate-in zoom-in duration-300">
               {visualDesign && (
                  <div className="bg-white rounded-[3.5rem] p-8 border-4 border-amber-500 shadow-2xl relative overflow-hidden flex flex-col gap-8">
                     <div className="flex flex-col md:flex-row gap-8">
                        <div className="w-full md:w-1/2 aspect-[3/4] rounded-3xl overflow-hidden shadow-xl border-4 border-white shrink-0 relative group">
                           <img src={visualDesign.imageUrl} className="w-full h-full object-cover" alt="Poster Visual" />
                           <button onClick={handleDownloadImage} className="absolute bottom-4 right-4 bg-amber-600 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase shadow-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2"><i className="fas fa-download"></i> UNDUH POSTER</button>
                        </div>
                        <div className="flex flex-col justify-center text-center md:text-left">
                           <h3 className="text-2xl font-black text-amber-900 Museum-Text uppercase mb-6 leading-tight">{visualDesign.headline}</h3>
                           <div className="space-y-4 mb-8">
                              {visualDesign.points.map((p, i) => (
                                <div key={i} className="flex items-center gap-4 bg-amber-50 p-4 rounded-2xl border-l-8 border-amber-500 shadow-sm">
                                   <span className="w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0">{i+1}</span>
                                   <p className="text-xs font-bold text-slate-700 uppercase tracking-tight">{p}</p>
                                </div>
                              ))}
                           </div>
                           <p className="text-[10px] font-black text-amber-400 italic uppercase tracking-widest">{visualDesign.footer}</p>
                        </div>
                     </div>
                  </div>
               )}

               {result && (
                <div className="bg-white rounded-[3.5rem] shadow-2xl border-4 border-amber-500 overflow-hidden flex flex-col h-full">
                  <div className="p-6 bg-amber-500 flex flex-wrap gap-3 justify-center no-print">
                      <button onClick={() => { navigator.clipboard.writeText(result); alert("Disalin!"); }} className="px-5 py-2.5 bg-white text-amber-500 rounded-xl font-black uppercase text-[9px] joyful-shadow"><i className="fas fa-copy"></i> SALIN</button>
                      <button onClick={handleCanvaMagic} className="px-5 py-2.5 bg-[#00C4CC] text-white rounded-xl font-black uppercase text-[9px] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-sm"><i className="fas fa-wand-magic-sparkles"></i> MAGIC DESIGN CANVA</button>
                      <button onClick={handleDownloadHtml} className="px-5 py-2.5 bg-white text-amber-500 rounded-xl font-black uppercase text-[9px] joyful-shadow"><i className="fas fa-file-code"></i> FILE CETAK</button>
                      <button onClick={handleDownloadDoc} className="px-5 py-2.5 bg-white text-amber-500 rounded-xl font-black uppercase text-[9px] joyful-shadow"><i className="fas fa-file-word"></i> WORD</button>
                  </div>
                  <div className="bg-slate-100 p-8 md:p-14 overflow-auto max-h-[800px]">
                      <div ref={printAreaRef} className={`bg-white shadow-2xl mx-auto w-full p-12 md:p-20 text-black rounded-sm min-h-[600px] printable-area ${activeTool === 'certificate' ? 'border-[12pt] border-double border-amber-400' : 'document-body'}`}>
                        {renderFormalDoc(result)}
                      </div>
                  </div>
                </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EngagementPortal;