import React, { useState, useRef, useEffect } from 'react';
import { TeacherToolType, TeacherSettings, VisualDesign } from '../types';
import { generateTeacherTool, generateVisualLayout, buildCanvaPrompt } from '../services/teacherToolsService';
import { BlockingOverlay, ProRequirementNotice } from './SharedUI';
import { validateUsageCloud, getUsageStatusCloud } from '../services/validationService';
import { handleAiGenerationError } from '../utils/errorUtils';

const GuruToolboxPortal: React.FC<{ isUnlocked: boolean, gasUrl?: string, myDeviceId?: string, setGlobalBusy: (b: boolean) => void, settings: TeacherSettings }> = ({ isUnlocked, gasUrl, myDeviceId, setGlobalBusy, settings }) => {
  const [activeTool, setActiveTool] = useState<TeacherToolType>('lkpd');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [visualDesign, setVisualDesign] = useState<VisualDesign | null>(null);
  const [draftType, setDraftType] = useState<'text' | 'visual'>('text');
  const [isCloudBlocked, setIsCloudBlocked] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  
  const [dailyCount, setDailyCount] = useState(() => {
    const today = new Date().toLocaleDateString();
    const saved = localStorage.getItem(`usage_toolbox_v1_${today}`);
    return saved ? parseInt(saved) : 0;
  });

  const [hasBonusToday, setHasBonusToday] = useState(() => {
    const today = new Date().toLocaleDateString();
    const saved = localStorage.getItem(`bonus_toolbox_v1_${today}`);
    return saved === 'true';
  });

  const [proNotice, setProNotice] = useState<{show: boolean, title: string, feature: string, benefit: string, canClaimBonus?: boolean}>({
    show: false, title: '', feature: '', benefit: '', canClaimBonus: false
  });

  const resultRef = useRef<HTMLDivElement>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const [materi, setMateri] = useState('');
  const [kelas, setKelas] = useState('Kelas 4 SD');
  const [phase, setPhase] = useState('Fase B (Kelas 3-4)');
  const [sourceText, setSourceText] = useState('');

  const currentLimit = hasBonusToday ? 1 : 0;

  useEffect(() => {
    const checkCloud = async () => {
      if (!isUnlocked && myDeviceId) {
        setIsValidating(true);
        const isAllowed = await getUsageStatusCloud(myDeviceId, 'Peralatan Guru', currentLimit, gasUrl || "NONE");
        if (!isAllowed) setIsCloudBlocked(true);
        setIsValidating(false);
      }
    };
    checkCloud();
  }, [isUnlocked, myDeviceId, gasUrl, currentLimit]);

  const handleClaimBonus = () => {
    const today = new Date().toLocaleDateString();
    setHasBonusToday(true);
    localStorage.setItem(`bonus_toolbox_v1_${today}`, 'true');
    setProNotice(prev => ({ ...prev, show: false }));
    setIsCloudBlocked(false); 
    alert("🌟 BONUS DIAKTIFKAN!\n\n1 Kesempatan Merakit Dokumen telah terbuka. Silakan klik tombol Rakit Dokumen lagi.");
  };

  const performGeneration = async () => {
    if (!materi.trim() && activeTool !== 'simplifier') return alert("Mohon isi nama materi!");
    if (activeTool === 'simplifier' && !sourceText.trim()) return alert("Mohon masukkan teks asli!");

    setIsLoading(true);
    setGlobalBusy(true);
    setResult(null);
    setVisualDesign(null);

    try {
      if (!isUnlocked && myDeviceId) {
        const isAllowed = await validateUsageCloud(myDeviceId, 'Peralatan Guru', currentLimit, gasUrl || "NONE", dailyCount);
        if (!isAllowed) {
            setIsLoading(false); setGlobalBusy(false); setIsCloudBlocked(true);
            setProNotice({ show: true, title: 'Akses Terbatas', feature: 'Peralatan Administrasi', benefit: 'Gunakan Akun PRO untuk akses tanpa batas harian.', canClaimBonus: !hasBonusToday });
            return;
        }
      }

      const data = { 
        materi, 
        kelas, 
        phase, 
        text: sourceText,
        sekolah: settings.schoolName || 'Sekolah Mentari',
        guru: settings.teacherName || 'Guru Pengampu'
      };

      if (draftType === 'visual') {
        const textRes = await generateTeacherTool(activeTool, data);
        const visual = await generateVisualLayout(materi, textRes.text, activeTool);
        setVisualDesign(visual);
        setResult(textRes.text);
      } else {
        const res = await generateTeacherTool(activeTool, data);
        setResult(res.text);
      }

      if (!isUnlocked) {
        const today = new Date().toLocaleDateString();
        const newCount = dailyCount + 1;
        setDailyCount(newCount);
        localStorage.setItem(`usage_toolbox_v1_${today}`, newCount.toString());
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
                title: 'Akses Terkunci', 
                feature: 'Peralatan Administrasi', 
                benefit: 'Bapak/Ibu dapat mencoba fitur ini secara GRATIS dengan membagikan aplikasi Mentari terlebih dahulu.',
                canClaimBonus: true 
            });
            return;
        }
        if (dailyCount >= 1 || (isCloudBlocked && !hasBonusToday)) {
            setProNotice({ 
                show: true, 
                title: 'Limit Harian Tercapai', 
                feature: 'Akses Dokumen Berlanjut', 
                benefit: 'Jatah gratis melalui share sudah digunakan. Upgrade ke GURU PRO untuk akses tanpa batas setiap saat.', 
                canClaimBonus: false 
            });
            return;
        }
    }
    performGeneration();
  };

  const handleCanvaMagic = () => {
    if (!result) return;
    const promptCanva = buildCanvaPrompt(activeTool, materi, result, settings.schoolName || 'Sekolah Mentari');
    navigator.clipboard.writeText(promptCanva);
    alert("🚀 PROMPT CANVA PROFESIONAL DISALIN!\n\nLangkah:\n1. Klik OK untuk buka Canva AI,\n2. Tempel (CTRL+V) pada kolom Magic Design,\n3. Klik Generate.");
    window.open('https://www.canva.com/ai', '_blank');
  };

  const handleDownloadImage = () => {
    if (!visualDesign?.imageUrl) return;
    const link = document.createElement('a');
    link.href = visualDesign.imageUrl;
    link.download = `Draft_Visual_${materi.replace(/\s+/g, '_')}.png`;
    link.click();
  };

  const handleDownloadDoc = () => {
    if (!printAreaRef.current) return;
    const content = printAreaRef.current.innerHTML;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><style>body { font-family: 'Arial', sans-serif; font-size: 11pt; } table { border-collapse: collapse; width: 100%; margin-bottom: 10px; } td, th { border: 1px solid #ddd; padding: 6pt; }</style></head><body>";
    const footer = "</body></html>";
    const blob = new Blob(['\ufeff', header + content + footer], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Dokumen_AI_${materi.replace(/\s+/g, '_')}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadHtml = () => {
    if (!printAreaRef.current) return;
    const content = printAreaRef.current.innerHTML;
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Hasil Generator Mentari AI</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @media print { .no-print { display: none; } body { padding: 0; } }
          body { background-color: #f8fafc; padding: 40px; font-family: sans-serif; }
          .container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); max-width: 800px; margin: auto; border: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="no-print mb-8 text-center">
          <button onclick="window.print()" style="background:#2563eb; color:white; padding:10px 25px; border-radius:8px; border:none; cursor:pointer; font-weight:bold; font-size:14px;">CETAK DOKUMEN</button>
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
    link.download = `Cetak_AI_${materi.replace(/\s+/g, '_')}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderCleanDocument = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentTable: string[][] = [];
    let inTable = false;

    const flushTable = (idx: number) => {
      if (currentTable.length > 0) {
        let filteredTable = currentTable.filter(row => {
          const rowText = row.join('').trim();
          return rowText !== '' && !rowText.includes('-') && !rowText.match(/^[:\-\s|]+$/);
        });

        filteredTable = filteredTable.filter(row => {
            const firstCell = row[0]?.trim().toLowerCase() || "";
            const secondCell = row[1]?.trim().toLowerCase() || "";
            const isForbiddenHeader = firstCell === "nomor" || firstCell === "no" || secondCell === "deskripsi" || secondCell === "pertanyaan" || secondCell === "materi";
            return !isForbiddenHeader;
        });

        if (filteredTable.length > 0) {
          const isHeaderKop = filteredTable.length <= 5 && filteredTable[0].length <= 2;
          elements.push(
            <div key={`tbl-${idx}`} className={`mb-6 overflow-x-auto ${isHeaderKop ? 'bg-slate-50 rounded-2xl p-5 border-2 border-indigo-100' : 'border border-slate-200'}`}>
              <table className="w-full border-collapse text-[12px] text-slate-800">
                <tbody>
                  {filteredTable.map((r, i) => (
                    <tr key={i} className={!isHeaderKop ? "border-b border-slate-100" : ""}>
                      {r.map((c, j) => (
                          <td key={j} className={`${isHeaderKop ? 'border-none py-1.5' : 'border-none p-3'} align-top font-bold uppercase`}>
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

    let numberedListBuffer: string[][] = [];
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.includes('-') || trimmed.match(/^[:\-\s|]+$/)) return;
      const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numberedMatch) {
          numberedListBuffer.push([numberedMatch[1], numberedMatch[2]]);
          return;
      } else if (numberedListBuffer.length > 0) {
          const listToRender = [...numberedListBuffer];
          elements.push(
            <div key={`list-${idx}`} className="mb-6 bg-white rounded-2xl border border-slate-100 overflow-hidden">
               <table className="w-full border-collapse text-[12px] text-slate-700">
                  <tbody>
                    {listToRender.map((row, lIdx) => (
                      <tr key={lIdx} className="border-b border-slate-50 last:border-0">
                        <td className="w-10 p-3 font-black text-indigo-600 bg-indigo-50/30 text-center align-top">{row[0]}</td>
                        <td className="p-3 font-semibold uppercase align-top">{row[1]}</td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          );
          numberedListBuffer = [];
      }
      if (trimmed.startsWith('|')) {
        inTable = true;
        currentTable.push(trimmed.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1));
      } else {
        if (inTable) flushTable(idx);
        if (trimmed === '') return;
        const isHeading = (trimmed.length < 60 && !trimmed.includes(':') && !trimmed.endsWith('.')) || trimmed === trimmed.toUpperCase();
        if (isHeading) {
          elements.push(<div key={idx} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl mb-5 shadow-lg Museum-Text font-black uppercase text-sm tracking-widest text-center border-b-4 border-indigo-800">{trimmed}</div>);
        } else {
          elements.push(<p key={idx} className="mb-4 leading-relaxed text-sm text-slate-700 font-bold uppercase tracking-tight">{trimmed}</p>);
        }
      }
    });
    if (inTable) flushTable(lines.length);
    return elements;
  };

  const tools = [
    { id: 'lkpd', label: 'Generator LKPD', icon: 'fa-file-signature' },
    { id: 'summary', label: 'Ringkasan Materi', icon: 'fa-book-open-reader' },
    { id: 'rubric', label: 'Rubrik Penilaian', icon: 'fa-table-list' },
    { id: 'simplifier', label: 'Penyederhana Teks', icon: 'fa-wand-magic-sparkles' }
  ];

  return (
    <div className="animate-in fade-in duration-700 space-y-8">
      <BlockingOverlay isVisible={isLoading} text="AI Sedang Merakit LKPD..." isUnlocked={isUnlocked} />
      
      <ProRequirementNotice 
        isOpen={proNotice.show} 
        onClose={() => setProNotice({...proNotice, show: false})} 
        featureName={proNotice.feature} 
        benefitDesc={proNotice.benefit} 
        deviceId={myDeviceId}
        canClaimBonus={proNotice.canClaimBonus}
        onShareBonus={handleClaimBonus}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 space-y-6 sticky top-24 no-print">
          <div className="bg-white rounded-[3rem] p-5 shadow-xl border-4 border-indigo-100">
             <div className="flex flex-col gap-2">
                {tools.map(tool => (
                  <button key={tool.id} onClick={() => { setActiveTool(tool.id as any); setResult(null); setVisualDesign(null); }} className={`flex items-center gap-4 p-5 rounded-[2rem] transition-all active:scale-95 text-left ${activeTool === tool.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${activeTool === tool.id ? 'bg-white/20' : 'bg-white shadow-sm'}`}><i className={`fas ${tool.icon}`}></i></div>
                    <div><span className="text-[10px] font-black uppercase tracking-widest block leading-none">{tool.label}</span><span className={`text-[8px] font-bold uppercase opacity-60 mt-1 block`}>Asisten Cerdas Guru</span></div>
                  </button>
                ))}
             </div>
          </div>
          <div className="bg-white rounded-[3rem] p-8 shadow-xl border-4 border-indigo-100 space-y-5">
             <h4 className="text-xs font-black uppercase text-indigo-600 Museum-Text mb-4 tracking-tighter">Konfigurasi AI</h4>
             <div className="space-y-4">
                <div className="space-y-1.5">
                   <label className="text-[9px] font-black uppercase text-indigo-400 ml-2 tracking-widest">Format Output Draft</label>
                   <select value={draftType} onChange={e => setDraftType(e.target.value as any)} className="w-full input-futuristic px-5 py-3 text-[10px] font-black text-blue-600 uppercase border-2 border-indigo-50">
                      <option value="text">Draft Teks Sistematis</option>
                      <option value="visual">Poster Visual AI (Visual Mode)</option>
                   </select>
                </div>
                {activeTool === 'simplifier' ? (
                  <>
                    <textarea value={sourceText} onChange={e => setSourceText(e.target.value)} className="w-full input-futuristic px-5 py-3 h-40 resize-none text-xs" placeholder="Tempel teks asli..." />
                    <select value={phase} onChange={e => setPhase(e.target.value)} className="w-full input-futuristic px-5 py-3 text-xs font-bold uppercase">
                       <option>Fase B (Kelas 3-4)</option><option>Fase A (Kelas 1-2)</option><option>Fase C (Kelas 5-6)</option>
                    </select>
                  </>
                ) : (
                  <>
                    <input value={materi} onChange={e => setMateri(e.target.value)} className="w-full input-futuristic px-5 py-3 text-xs font-bold uppercase" placeholder="Nama Materi..." />
                    <input value={kelas} onChange={e => setKelas(e.target.value)} className="w-full input-futuristic px-5 py-3 text-xs font-bold uppercase" placeholder="Kelas 4 SD" />
                  </>
                )}
             </div>
             <button onClick={handleGenerate} disabled={isLoading || isValidating} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3">
               {isValidating ? <i className="fas fa-shield-halved fa-spin"></i> : isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-microchip"></i>} 
               {isValidating ? 'VALIDASI...' : 'RAKIT DOKUMEN AI'}
             </button>
          </div>
        </div>
        <div className="lg:col-span-8 h-full" ref={resultRef}>
          {!result && !visualDesign ? (
            <div className="w-full min-h-[600px] border-4 border-dashed border-indigo-200 rounded-[4rem] flex flex-col items-center justify-center p-16 text-center bg-white/50">
               <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-8"><i className="fas fa-folder-open text-5xl text-indigo-200"></i></div>
               <h3 className="text-xl font-black uppercase text-indigo-300 Museum-Text tracking-widest">Ruang Kerja AI</h3>
               <p className="mt-4 text-[10px] font-black uppercase text-slate-300 leading-loose tracking-[0.2em]">Data siap diolah menjadi LKPD profesional.</p>
            </div>
          ) : (
            <div className="space-y-8 animate-in zoom-in duration-500">
               {visualDesign && (
                  <div className="bg-white rounded-[3.5rem] p-8 border-4 border-blue-500 shadow-2xl relative overflow-hidden flex flex-col gap-8">
                     <div className="flex flex-col md:flex-row gap-8">
                        <div className="w-full md:w-1/2 aspect-[3/4] rounded-3xl overflow-hidden shadow-xl border-4 border-white shrink-0 relative group">
                           <img src={visualDesign.imageUrl} className="w-full h-full object-cover" alt="Poster Visual" />
                           <button onClick={handleDownloadImage} className="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase shadow-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2"><i className="fas fa-download"></i> UNDUH POSTER</button>
                        </div>
                        <div className="flex flex-col justify-center text-center md:text-left">
                           <h3 className="text-2xl font-black text-blue-900 Museum-Text uppercase mb-6 leading-tight">{visualDesign.headline}</h3>
                           <div className="space-y-4 mb-8">
                              {visualDesign.points.map((p, i) => (
                                <div key={i} className="flex items-center gap-4 bg-blue-50 p-4 rounded-2xl border-l-8 border-blue-500 shadow-sm">
                                   <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0">{i+1}</span>
                                   <p className="text-xs font-bold text-slate-700 uppercase tracking-tight">{p}</p>
                                </div>
                              ))}
                           </div>
                           <p className="text-[10px] font-black text-blue-400 italic uppercase tracking-widest">{visualDesign.footer}</p>
                        </div>
                     </div>
                  </div>
               )}

               {result && (
                <div className="bg-white rounded-[3.5rem] shadow-2xl border-4 border-indigo-600 overflow-hidden flex flex-col h-full">
                  <div className="p-6 bg-indigo-600 flex flex-wrap gap-3 justify-center no-print">
                      <button onClick={() => { navigator.clipboard.writeText(result); alert("Teks disalin!"); }} className="px-5 py-2.5 bg-white text-indigo-600 rounded-xl font-black uppercase text-[9px] hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-sm"><i className="fas fa-copy"></i> SALIN DATA</button>
                      <button onClick={handleCanvaMagic} className="px-5 py-2.5 bg-[#00C4CC] text-white rounded-xl font-black uppercase text-[9px] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-sm"><i className="fas fa-wand-magic-sparkles"></i> MAGIC DESIGN CANVA</button>
                      <button onClick={handleDownloadHtml} className="px-5 py-2.5 bg-white text-emerald-600 rounded-xl font-black uppercase text-[9px] hover:bg-emerald-50 transition-all flex items-center gap-2 shadow-sm"><i className="fas fa-file-code"></i> FILE CETAK</button>
                      <button onClick={handleDownloadDoc} className="px-5 py-2.5 bg-white text-indigo-600 rounded-xl font-black uppercase text-[9px] hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-sm"><i className="fas fa-file-word"></i> WORD</button>
                  </div>
                  <div className="bg-slate-50 p-8 md:p-14 overflow-auto max-h-[900px]">
                      <div ref={printAreaRef} className="bg-white shadow-lg mx-auto w-full p-10 md:p-16 text-black rounded-sm min-h-[1000px] document-body printable-area">
                        {renderCleanDocument(result)}
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

export default GuruToolboxPortal;