
import React, { useState, useRef, useEffect } from 'react';
import { MediaToolType, VisualDesign, TeacherSettings } from '../types';
import { generateCreativeMedia, CreativeMediaResponse } from '../services/creativeMediaService';
import { generateVisualLayout, buildCanvaPrompt } from '../services/teacherToolsService';
import { BlockingOverlay, ProRequirementNotice } from './SharedUI';
import { validateUsageCloud, getUsageStatusCloud } from '../services/validationService';
import { handleAiGenerationError } from '../utils/errorUtils';

const MediaKreatifPortal: React.FC<{ isUnlocked: boolean, gasUrl?: string, myDeviceId?: string, setGlobalBusy: (b: boolean) => void, settings: TeacherSettings }> = ({ isUnlocked, gasUrl, myDeviceId, setGlobalBusy, settings }) => {
  const [activeTool, setActiveTool] = useState<MediaToolType>('lyrics');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CreativeMediaResponse | null>(null);
  const [visualDesign, setVisualDesign] = useState<VisualDesign | null>(null);
  const [draftType, setDraftType] = useState<'text' | 'visual'>('text');
  const [isCloudBlocked, setIsCloudBlocked] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  
  const [dailyCount, setDailyCount] = useState(() => {
    const today = new Date().toLocaleDateString();
    const saved = localStorage.getItem(`usage_media_v1_${today}`);
    return saved ? parseInt(saved) : 0;
  });

  const [hasBonusToday, setHasBonusToday] = useState(() => {
    const today = new Date().toLocaleDateString();
    const saved = localStorage.getItem(`bonus_media_v1_${today}`);
    return saved === 'true';
  });

  const [proNotice, setProNotice] = useState<{show: boolean, title: string, feature: string, benefit: string, canClaimBonus?: boolean}>({
    show: false, title: '', feature: '', benefit: '', canClaimBonus: false
  });

  const [materi, setMateri] = useState('');
  const [kelas, setKelas] = useState('Kelas 4 SD');
  const [tone, setTone] = useState('Pelangi-Pelangi');
  const [sourceText, setSourceText] = useState('');

  const resultRef = useRef<HTMLDivElement>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const currentLimit = hasBonusToday ? 1 : 0;

  const toolInfo = {
    lyrics: { 
        title: "🎵 Lirik Lagu Edukasi", 
        desc: "Ubah materi hafalan yang kaku menjadi lirik lagu kreatif dengan irama populer agar lebih mudah diingat oleh siswa.",
        icon: "fa-music"
    },
    mindmap: { 
        title: "🧠 Peta Pikiran AI", 
        desc: "Susun hierarki konsep materi secara sistematis untuk mempermudah siswa memahami hubungan logis antar topik.",
        icon: "fa-sitemap"
    },
    infographic: { 
        title: "📊 Alat Info Grafis", 
        desc: "Rakit poin-poin data visual, fakta kunci, dan statistik materi yang siap dipindahkan ke desain infografis profesional.",
        icon: "fa-chart-pie"
    },
    presentation: { 
        title: "🖥️ Slide Presentasi", 
        desc: "Susun outline slide demi slide yang sistematis, lengkap dengan poin utama konten dan struktur presentasi kelas.",
        icon: "fa-desktop"
    },
    table: { 
        title: "📋 Tabel Data Materi", 
        desc: "Organisasikan klasifikasi, perbandingan, atau daftar istilah materi ke dalam format tabel yang rapi dan mudah dibaca.",
        icon: "fa-table"
    },
    video_script: { 
        title: "🎬 Naskah Video Edukasi", 
        desc: "Rancang skenario visual dan narasi dialog profesional bergaya konten kreator untuk video pembelajaran digital.",
        icon: "fa-video"
    }
  };

  useEffect(() => {
    const checkCloud = async () => {
      if (!isUnlocked && myDeviceId) {
        setIsValidating(true);
        const isAllowed = await getUsageStatusCloud(myDeviceId, 'Media Kreatif', currentLimit, gasUrl || "NONE");
        if (!isAllowed) setIsCloudBlocked(true);
        setIsValidating(false);
      }
    };
    checkCloud();
  }, [isUnlocked, myDeviceId, gasUrl, currentLimit]);

  const handleClaimBonus = () => {
    const today = new Date().toLocaleDateString();
    setHasBonusToday(true);
    localStorage.setItem(`bonus_media_v1_${today}`, 'true');
    setProNotice(prev => ({ ...prev, show: false }));
    setIsCloudBlocked(false); 
    alert("🌟 BONUS DIAKTIFKAN!\n\n1 Kesempatan Merakit Media telah terbuka. Silakan klik tombol Rakit Media lagi.");
  };

  const performGeneration = async () => {
    if (!materi.trim()) return alert("Mohon isi judul materi!");
    if (activeTool !== 'lyrics' && !sourceText.trim()) return alert("Mohon isi detail materi agar AI bisa merangkum dengan lengkap!");

    setIsLoading(true);
    setGlobalBusy(true);
    setResult(null);
    setVisualDesign(null);

    try {
      if (!isUnlocked && myDeviceId) {
        const isAllowed = await validateUsageCloud(myDeviceId, 'Media Kreatif', currentLimit, gasUrl || "NONE", dailyCount);
        if (!isAllowed) {
            setIsLoading(false); setGlobalBusy(false); setIsCloudBlocked(true);
            setProNotice({ show: true, title: 'Akses Terbatas', feature: 'Media Kreatif AI', benefit: 'Upgrade ke GURU PRO untuk akses tanpa batas.', canClaimBonus: !hasBonusToday });
            return;
        }
      }

      const data = { 
        materi, 
        kelas, 
        tone, 
        text: sourceText,
        sekolah: settings.schoolName || 'Sekolah Mentari',
        guru: settings.teacherName || 'Guru Kreatif'
      };

      const res = await generateCreativeMedia(activeTool, data);
      
      if (draftType === 'visual') {
        const visual = await generateVisualLayout(materi, res.draft, activeTool);
        setVisualDesign(visual);
      }
      
      setResult(res);

      if (!isUnlocked) {
        const today = new Date().toLocaleDateString();
        const newCount = dailyCount + 1;
        setDailyCount(newCount);
        localStorage.setItem(`usage_media_v1_${today}`, newCount.toString());
      }

      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);
    } catch (err) {
      handleAiGenerationError(err, 'memproses media kreatif');
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
                feature: 'Media Kreatif AI', 
                benefit: 'Bapak/Ibu dapat mencoba fitur ini secara GRATIS dengan membagikan aplikasi Mentari terlebih dahulu.',
                canClaimBonus: true 
            });
            return;
        }
        if (dailyCount >= 1 || (isCloudBlocked && !hasBonusToday)) {
            setProNotice({ 
                show: true, 
                title: 'Limit Harian Tercapai', 
                feature: 'Media Kreatif Tanpa Batas', 
                benefit: 'Jatah gratis melalui share sudah digunakan. Upgrade ke GURU PRO untuk akses tanpa batas harian.', 
                canClaimBonus: false 
            });
            return;
        }
    }
    performGeneration();
  };

  const handleCanvaMagic = () => {
    if (!result) return;
    const promptCanva = buildCanvaPrompt(activeTool, materi, result.draft, settings.schoolName || 'Sekolah Mentari');
    navigator.clipboard.writeText(promptCanva);
    alert("🚀 PROMPT CANVA PROFESIONAL DISALIN!\n\nLangkah:\n1. Klik OK untuk buka Canva AI,\n2. Tempel (CTRL+V) pada kolom Magic Design,\n3. Klik Generate.");
    window.open('https://www.canva.com/ai', '_blank');
  };

  const handleNotebookLM = () => {
    if (!result) return;
    const finalSource = `DATA SUMBER MATERI: ${materi.toUpperCase()}\n\n${result.source}`;
    navigator.clipboard.writeText(finalSource);

    let tutorialNotice = "";
    switch (activeTool) {
      case 'presentation':
        tutorialNotice = "🖥️ LANGKAH BUAT PRESENTASI DI NOTEBOOKLM:\n\n1. Klik OK untuk buka NotebookLM.\n2. Klik 'New Notebook' -> Pilih 'Copied Text'.\n3. Tempel (CTRL+V) draf tadi -> Klik 'Insert'.\n4. Pada panel 'Notebook Guide' di kanan bawah, klik tombol 'Presentation'.\n5. NotebookLM akan merakit draf slide presentasi otomatis untukmu!";
        break;
      case 'video_script':
        tutorialNotice = "🎬 LANGKAH RINGKASAN VIDEO DI NOTEBOOKLM:\n\n1. Klik OK untuk buka NotebookLM.\n2. Klik 'New Notebook' -> Pilih 'Copied Text'.\n3. Tempel (CTRL+V) naskah video tadi -> Klik 'Insert'.\n4. Pada bagian 'Notebook Guide', cari 'Audio Overview' lalu klik 'Generate'.\n5. NotebookLM akan merubah naskah videomu menjadi DISKUSI AUDIO AI yang sangat mendalam!";
        break;
      case 'infographic':
        tutorialNotice = "📊 LANGKAH ANALISIS DATA DI NOTEBOOKLM:\n\n1. Klik OK untuk buka NotebookLM.\n2. Tempel poin infografis sebagai sumber baru.\n3. Klik tombol 'Briefing Doc' di Notebook Guide.\n4. Poin-poin visual tadi akan diubah menjadi narasi penjelasan yang sangat lengkap dan profesional.";
        break;
      case 'mindmap':
        tutorialNotice = "🧠 LANGKAH EKSPANSI KONSEP DI NOTEBOOKLM:\n\n1. Klik OK untuk buka NotebookLM.\n2. Tempel hierarki peta pikiran sebagai sumber.\n3. Klik tombol 'Table of Contents' di Notebook Guide untuk melihat struktur logis konsepmu.\n4. Gunakan fitur 'FAQ' untuk memperdalam tiap cabang peta pikiran tadi.";
        break;
      case 'table':
        tutorialNotice = "📋 LANGKAH KOMPILASI DATA DI NOTEBOOKLM:\n\n1. Klik OK untuk buka NotebookLM.\n2. Tempel tabel data tadi sebagai sumber.\n3. Klik tombol 'Study Guide' di Notebook Guide.\n4. NotebookLM akan membuat kuis dan panduan belajar otomatis berdasarkan klasifikasi tabel tersebut.";
        break;
      case 'lyrics':
        tutorialNotice = "🎵 LANGKAH ANALISIS LIRIK DI NOTEBOOKLM:\n\n1. Klik OK untuk buka NotebookLM.\n2. Tempel lirik lagu edukasi tadi sebagai sumber.\n3. Klik tombol 'FAQ' di Notebook Guide untuk menghasilkan daftar tanya jawab otomatis berdasarkan materi dalam lagu.";
        break;
      default:
        tutorialNotice = "📓 LANGKAH SUMBER NOTEBOOKLM:\n\n1. Klik OK untuk buka NotebookLM.\n2. Pilih 'Copied Text' sebagai sumber materi.\n3. Tempel (CTRL+V) teks sumber yang sudah disalin.";
    }

    alert(tutorialNotice);
    window.open('https://notebooklm.google.com/', '_blank');
  };

  const handleDownloadImage = () => {
    if (!visualDesign?.imageUrl) return;
    const link = document.createElement('a');
    link.href = visualDesign.imageUrl;
    link.download = `Draft_Visual_${materi.replace(/\s+/g, '_')}.png`;
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
        <title>Media Kreatif - ${materi}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @media print { .no-print { display: none; } body { padding: 0; } }
          body { background-color: #fff1f2; padding: 40px; font-family: sans-serif; }
          .container { background: white; padding: 50px; border-radius: 24px; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); max-width: 900px; margin: auto; border: 4px solid #f43f5e; }
        </style>
      </head>
      <body>
        <div class="no-print mb-8 text-center">
          <button onclick="window.print()" style="background:#f43f5e; color:white; padding:12px 30px; border-radius:12px; border:none; cursor:pointer; font-weight:bold; font-size:16px;">CETAK SEKARANG</button>
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
    link.download = `Media_Kreatif_${materi.replace(/\s+/g, '_')}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadDoc = () => {
    if (!printAreaRef.current) return;
    const content = printAreaRef.current.innerHTML;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><style>body { font-family: 'Arial', sans-serif; font-size: 11pt; line-height: 1.6; } p { margin-bottom: 10px; }</style></head><body>";
    const footer = "</body></html>";
    const blob = new Blob(['\ufeff', header + content + footer], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Media_Kreatif_${activeTool}_${materi.replace(/\s+/g, '_')}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderArtisticDoc = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed === '') return;

      const isHeading = trimmed.length < 50 && trimmed === trimmed.toUpperCase();
      if (isHeading) {
        elements.push(
          <div key={idx} className="bg-rose-500 text-white px-8 py-4 rounded-[2rem] mb-6 shadow-lg Museum-Text font-black uppercase text-base tracking-[0.2em] text-center border-b-4 border-rose-700">
            {trimmed}
          </div>
        );
      } else {
        elements.push(
          <p key={idx} className="mb-5 text-base text-slate-700 font-bold border-l-8 border-rose-100 pl-6 leading-relaxed uppercase tracking-tight">
            {trimmed}
          </p>
        );
      }
    });
    return elements;
  };

  const tools = [
    { id: 'lyrics', label: 'Lirik Lagu Edukasi', icon: 'fa-music' },
    { id: 'mindmap', label: 'Peta Pikiran AI', icon: 'fa-sitemap' },
    { id: 'infographic', label: 'Alat Info Grafis', icon: 'fa-chart-pie' },
    { id: 'presentation', label: 'Slide Presentasi', icon: 'fa-desktop' },
    { id: 'table', label: 'Tabel Data', icon: 'fa-table' },
    { id: 'video_script', label: 'Naskah Video', icon: 'fa-video' }
  ];

  return (
    <div className="animate-in fade-in duration-700 space-y-8">
      <BlockingOverlay isVisible={isLoading} text="AI Studio Berkreasi..." isUnlocked={isUnlocked} />
      
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
          <div className="bg-white rounded-[3rem] p-4 shadow-xl border-4 border-rose-100">
             <div className="grid grid-cols-2 gap-2">
                {tools.map(tool => (
                  <button key={tool.id} onClick={() => { setActiveTool(tool.id as any); setResult(null); setVisualDesign(null); }} className={`flex flex-col items-center gap-2 p-4 rounded-[2rem] transition-all active:scale-95 text-center ${activeTool === tool.id ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${activeTool === tool.id ? 'bg-white/20' : 'bg-white shadow-sm'}`}><i className={`fas ${tool.icon}`}></i></div>
                    <span className="text-[8px] font-black uppercase tracking-widest leading-tight">{tool.label}</span>
                  </button>
                ))}
             </div>
          </div>
          <div className="bg-white rounded-[3rem] p-8 shadow-xl border-4 border-rose-100 space-y-5">
             <h4 className="text-xs font-black uppercase text-rose-600 Museum-Text mb-4">Pengaturan Media</h4>
             <div className="space-y-4">
                <div className="space-y-1.5">
                   <label className="text-[9px] font-black uppercase text-rose-400 ml-2 tracking-widest">Format Output Draft</label>
                   <select value={draftType} onChange={e => setDraftType(e.target.value as any)} className="w-full input-futuristic px-5 py-3 text-[10px] font-black text-rose-600 uppercase border-2 border-rose-50">
                      <option value="text">Draft Teks Sistematis</option>
                      <option value="visual">Visual Poster AI (Visual Mode)</option>
                   </select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Materi Utama</label>
                  <input value={materi} onChange={e => setMateri(e.target.value)} className="w-full input-futuristic px-5 py-3 text-xs font-bold" placeholder="Misal: Rantai Makanan" />
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Tingkat Kelas</label>
                   <select value={kelas} onChange={e => setKelas(e.target.value)} className="w-full input-futuristic px-5 py-3 text-xs font-bold">
                      <option>Kelas 1 SD</option><option>Kelas 2 SD</option><option>Kelas 3 SD</option><option>Kelas 4 SD</option><option>Kelas 5 SD</option><option>Kelas 6 SD</option>
                      <option>SMP Sederajat</option><option>SMA Sederajat</option>
                   </select>
                </div>

                {activeTool === 'lyrics' ? (
                   <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nada Lagu</label><input value={tone} onChange={e => setTone(e.target.value)} className="w-full input-futuristic px-5 py-3 text-xs font-bold" placeholder="Misal: Pelangi-Pelangi" /></div>
                ) : (
                   <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Detail Materi (Sumber AI)</label><textarea value={sourceText} onChange={e => setSourceText(e.target.value)} className="w-full input-futuristic px-5 py-3 h-32 resize-none text-xs leading-relaxed" placeholder="Tuliskan detail materi agar AI menghasilkan teks sumber faktual yang rinci untuk NotebookLM..." /></div>
                )}
             </div>
             <button onClick={handleGenerate} disabled={isLoading || isValidating} className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black uppercase text-xs joyful-shadow">
               {isValidating ? <i className="fas fa-shield-halved fa-spin"></i> : isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-icons"></i>}
               {isValidating ? 'VALIDASI...' : 'RAKIT MEDIA'}
             </button>
          </div>
        </div>
        <div className="lg:col-span-8 h-full" ref={resultRef}>
          {!result && !visualDesign ? (
            <div className="w-full min-h-[600px] border-4 border-dashed border-rose-200 rounded-[4rem] flex flex-col items-center justify-center p-16 text-center bg-white/50">
               <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-8"><i className="fas fa-magic text-5xl text-rose-200"></i></div>
               <h3 className="text-xl font-black uppercase text-rose-300 Museum-Text">Studio Kreatif</h3>
               <p className="mt-4 text-[10px] font-black uppercase text-slate-300 leading-loose tracking-[0.2em] max-w-sm">Pilih alat di samping untuk merakit materi pembelajaran kelas dunia.</p>
            </div>
          ) : (
            <div className="space-y-8 animate-in zoom-in duration-500">
               {/* HEADER DESKRIPSI DINAMIS */}
               <div className="bg-white rounded-[2.5rem] p-8 border-4 border-rose-100 shadow-lg flex items-center gap-6">
                  <div className="w-14 h-14 bg-rose-500 text-white rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-lg">
                    <i className={`fas ${(toolInfo as any)[activeTool].icon || 'fa-icons'}`}></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-rose-900 Museum-Text uppercase">{(toolInfo as any)[activeTool].title}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{(toolInfo as any)[activeTool].desc}</p>
                  </div>
               </div>

               {visualDesign && (
                  <div className="bg-white rounded-[3.5rem] p-8 border-4 border-rose-500 shadow-2xl relative overflow-hidden flex flex-col gap-8">
                     <div className="flex flex-col md:flex-row gap-8">
                        <div className="w-full md:w-1/2 aspect-[3/4] rounded-3xl overflow-hidden shadow-xl border-4 border-white shrink-0 relative group">
                           <img src={visualDesign.imageUrl} className="w-full h-full object-cover" alt="Poster Visual" />
                           <button onClick={handleDownloadImage} className="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase shadow-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2"><i className="fas fa-download"></i> UNDUH MEDIA</button>
                        </div>
                        <div className="flex flex-col justify-center text-center md:text-left">
                           <h3 className="text-2xl font-black text-rose-900 Museum-Text uppercase mb-6 leading-tight">{visualDesign.headline}</h3>
                           <div className="space-y-4 mb-8">
                              {visualDesign.points.map((p, i) => (
                                <div key={i} className="flex items-center gap-4 bg-rose-50 p-4 rounded-2xl border-l-8 border-rose-500 shadow-sm">
                                   <span className="w-6 h-6 bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0">{i+1}</span>
                                   <p className="text-xs font-bold text-slate-700 uppercase tracking-tight">{p}</p>
                                </div>
                              ))}
                           </div>
                           <p className="text-[10px] font-black text-rose-400 italic uppercase tracking-widest">{visualDesign.footer}</p>
                        </div>
                     </div>
                  </div>
               )}

               {result && (
                <div className="bg-white rounded-[3.5rem] shadow-2xl border-4 border-rose-500 overflow-hidden flex flex-col h-full">
                  <div className="p-6 bg-rose-500 flex flex-wrap gap-3 justify-center no-print">
                      <button onClick={() => { navigator.clipboard.writeText(result.draft); alert("Draft Disalin!"); }} className="px-5 py-2.5 bg-white text-rose-500 rounded-xl font-black uppercase text-[9px] joyful-shadow flex items-center gap-2"><i className="fas fa-copy"></i> SALIN DRAFT</button>
                      <button onClick={handleCanvaMagic} className="px-5 py-2.5 bg-[#00C4CC] text-white rounded-xl font-black uppercase text-[9px] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-sm"><i className="fas fa-wand-magic-sparkles"></i> MAGIC DESIGN CANVA</button>
                      <button onClick={handleNotebookLM} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-black uppercase text-[9px] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-sm"><i className="fas fa-book-bookmark"></i> HASILKAN DI NOTEBOOKLM</button>
                      <button onClick={handleDownloadHtml} className="px-5 py-2.5 bg-white text-emerald-600 rounded-xl font-black uppercase text-[9px] joyful-shadow flex items-center gap-2"><i className="fas fa-file-code"></i> FILE CETAK</button>
                      <button onClick={handleDownloadDoc} className="px-5 py-2.5 bg-white text-rose-500 rounded-xl font-black uppercase text-[9px] joyful-shadow flex items-center gap-2"><i className="fas fa-file-word"></i> WORD</button>
                  </div>
                  <div className="bg-slate-50 p-8 md:p-14 overflow-auto max-h-[900px]">
                      <div ref={printAreaRef} className="bg-white shadow-lg mx-auto w-full p-10 md:p-16 text-black rounded-sm min-h-[800px] document-body whitespace-pre-wrap printable-area">
                        {renderArtisticDoc(result.draft)}
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

export default MediaKreatifPortal;
