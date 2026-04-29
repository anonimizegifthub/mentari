
import React, { useState, useRef, useEffect } from 'react';
import { InteractiveMaterial, GameFormData } from '../types';
import { generateVirtualLab, generateLiteracyAdventure } from '../services/virtualLabService';
import { getInitialGameData } from '../constants';
import { AssemblyLoader, BlockingOverlay, ProRequirementNotice } from './SharedUI';
import { validateUsageCloud, getUsageStatusCloud } from '../services/validationService';
import { sanitizeGeneratedCode } from '../utils/codeUtils';
import { handleAiGenerationError } from '../utils/errorUtils';

const LabMayaPortal: React.FC<{ gasUrl?: string, subjects: string[], onPublish: (m: Partial<InteractiveMaterial>) => void, onPublishLab?: (m: Partial<InteractiveMaterial>) => void, setGlobalBusy: (b: boolean) => void, isUnlocked: boolean, myDeviceId?: string }> = ({ gasUrl, subjects, onPublish, onPublishLab, setGlobalBusy, isUnlocked, myDeviceId }) => {
  // NEW SUB-TAB STATE
  const [activeSubMode, setActiveSubMode] = useState<'lab' | 'literasi'>('lab');

  // SHARED STATE
  const [isLoading, setIsLoading] = useState(false);
  const [labCode, setLabCode] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [isCloudBlocked, setIsCloudBlocked] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [dailyCount, setDailyCount] = useState(() => {
    const today = new Date().toLocaleDateString();
    const saved = localStorage.getItem(`usage_lab_v1_${today}`);
    return saved ? parseInt(saved) : 0;
  });
  const [hasBonusToday, setHasBonusToday] = useState(() => {
    const today = new Date().toLocaleDateString();
    const saved = localStorage.getItem(`bonus_lab_v1_${today}`);
    return saved === 'true';
  });
  const [proNotice, setProNotice] = useState<{show: boolean, title: string, feature: string, benefit: string, canClaimBonus?: boolean}>({
    show: false, title: '', feature: '', benefit: '', canClaimBonus: false
  });
  const [publishSubject, setPublishSubject] = useState(subjects[0] || 'IPAS');
  const [isPublishing, setIsPublishing] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // --- TAB 1: LAB MAYA STATES ---
  const [formData, setFormData] = useState<GameFormData>(getInitialGameData());
  const [quickMateri, setQuickMateri] = useState('');
  const [quickKelas, setQuickKelas] = useState('Kelas 4 SD');
  const [activeTab, setActiveTab] = useState<'quick' | 'form' | 'visual' | 'logic'>('quick');

  // --- TAB 2: MATERI EKSPLORASI STATES ---
  const [litMateri, setLitMateri] = useState('');
  const [litSubMateri, setLitSubMateri] = useState('');
  const [litTujuan, setLitTujuan] = useState('');
  const [litKelas, setLitKelas] = useState('Kelas 4 SD');

  const isCustomMode = activeTab !== 'quick';
  const currentLimit = hasBonusToday ? 2 : 1;

  useEffect(() => {
    const checkCloud = async () => {
      if (!isUnlocked && myDeviceId) {
        setIsValidating(true);
        const isAllowed = await getUsageStatusCloud(myDeviceId, 'Lab Maya', currentLimit, gasUrl || "NONE");
        if (!isAllowed) setIsCloudBlocked(true);
        setIsValidating(false);
      }
    };
    checkCloud();
  }, [isUnlocked, myDeviceId, currentLimit, gasUrl]);

  const handleClaimBonus = () => {
    const today = new Date().toLocaleDateString();
    setHasBonusToday(true);
    localStorage.setItem(`bonus_lab_v1_${today}`, 'true');
    setProNotice(prev => ({ ...prev, show: false }));
    setIsCloudBlocked(false); 
    alert("🌟 BONUS DIKLAIM!\n\nAnda mendapatkan 1 kesempatan tambahan untuk merakit lab/materi hari ini!");
  };

  const handleGenerate = async () => {
    if (!isUnlocked) {
        if (dailyCount === 1 && !hasBonusToday) {
            setProNotice({ show: true, title: 'Kuota Harian Penuh', feature: 'Hadiah Spesial Guru Kreatif', benefit: 'Dapatkan 1 jatah tambahan dengan membagikan aplikasi Mentari.', canClaimBonus: true });
            return;
        }
        if (dailyCount >= 2 || (isCloudBlocked && !hasBonusToday)) {
            setProNotice({ show: true, title: 'Limit Harian Tercapai', feature: 'Rakit Media Tak Terbatas', benefit: 'Gunakan Akun PRO untuk merakit materi sepuasnya tanpa batas harian.', canClaimBonus: false });
            return;
        }
    }

    if (activeSubMode === 'lab') {
        if (activeTab === 'quick' && !quickMateri.trim()) return alert("Mohon isi topik lab maya!");
    } else {
        if (!litMateri.trim()) return alert("Mohon isi nama materi!");
    }

    setIsLoading(true);
    setGlobalBusy(true);

    try {
      if (!isUnlocked && myDeviceId) {
        const isAllowed = await validateUsageCloud(myDeviceId, 'Lab Maya', currentLimit, gasUrl || "NONE", dailyCount);
        if (!isAllowed) {
            setIsLoading(false); setGlobalBusy(false); setIsCloudBlocked(true);
            setProNotice({ show: true, title: 'Limit Cloud Tercapai', feature: 'Keamanan Kuota', benefit: 'Perangkat ini sudah mencapai limit harian.', canClaimBonus: !hasBonusToday });
            return;
        }
      }

      setLabCode(null);
      setIsPublished(false);
      
      let code = "";
      if (activeSubMode === 'lab') {
          code = await generateVirtualLab(
            activeTab === 'quick' ? quickMateri : formData.judul, 
            activeTab === 'quick' ? quickKelas : formData.targetAudiens,
            'PC & Mobile',
            false // Mode Petualang Dinonaktifkan sesuai permintaan
          );
      } else {
          code = await generateLiteracyAdventure(litMateri, litSubMateri, litTujuan, litKelas, false); // Opsi Gambar Dinonaktifkan sesuai permintaan
      }
      
      setLabCode(code);

      if (!isUnlocked) {
        const today = new Date().toLocaleDateString();
        const newCount = dailyCount + 1;
        setDailyCount(newCount);
        localStorage.setItem(`usage_lab_v1_${today}`, newCount.toString());
      }

      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 500);
    } catch (err) {
      handleAiGenerationError(err, activeSubMode === 'lab' ? 'merakit Lab Maya' : 'merakit Materi Eksplorasi');
    } finally {
      setIsLoading(false);
      setGlobalBusy(false);
    }
  };

  const handlePublishAction = () => {
    if (!labCode || isPublished) return;
    setIsPublishing(true);

    if (activeSubMode === 'lab') {
        const title = activeTab === 'quick' ? `Lab Maya: ${quickMateri}` : `Lab Maya: ${formData.judul}`;
        if (onPublishLab) {
            onPublishLab({
                title,
                subject: publishSubject,
                description: "Simulasi Lab Maya interaktif untuk Guru.",
                contentCode: labCode,
                isActive: true
            });
        }
    } else {
        const title = `Petualangan Materi: ${litMateri}`;
        onPublish({
            title,
            subject: publishSubject,
            description: "Eksplorasi literasi interaktif mandiri.",
            contentCode: labCode,
            isActive: true
        });
    }

    setTimeout(() => {
        setIsPublishing(false);
        setIsPublished(true);
        alert(`SUKSES!\n\n${activeSubMode === 'lab' ? 'Materi telah dikirim ke Dashboard Guru.' : 'Materi telah diterbitkan ke Dashboard Siswa.'}`);
    }, 1500);
  };

  return (
    <div className="animate-in fade-in duration-700">
      <BlockingOverlay isVisible={isLoading} text={activeSubMode === 'lab' ? "Merakit Lab Maya..." : "Merakit Materi Literasi..."} isUnlocked={isUnlocked} />
      
      <ProRequirementNotice 
        isOpen={proNotice.show}
        onClose={() => setProNotice({...proNotice, show: false})}
        featureName={proNotice.feature}
        benefitDesc={proNotice.benefit}
        title={proNotice.title}
        deviceId={myDeviceId}
        canClaimBonus={proNotice.canClaimBonus}
        onShareBonus={handleClaimBonus}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-6 no-print sticky top-24">
          
          <div className="flex bg-slate-200/50 p-1.5 rounded-[2rem] border-2 border-slate-100 mb-2">
            <button onClick={() => { setActiveSubMode('lab'); setLabCode(null); }} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-2xl transition-all Museum-Text flex items-center justify-center gap-2 ${activeSubMode === 'lab' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-500 hover:text-emerald-500'}`}>
               <i className="fas fa-flask"></i> LAB MAYA (GURU)
            </button>
            <button onClick={() => { setActiveSubMode('literasi'); setLabCode(null); }} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-2xl transition-all Museum-Text flex items-center justify-center gap-2 ${activeSubMode === 'literasi' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-indigo-500'}`}>
               <i className="fas fa-book-open"></i> MATERI EKSPLORASI (SISWA)
            </button>
          </div>

          <div className={`rounded-[3rem] shadow-2xl overflow-hidden border-4 bg-white ${activeSubMode === 'lab' ? 'border-emerald-400' : 'border-indigo-400'}`}>
            {activeSubMode === 'lab' ? (
              <>
                <div className="flex flex-col">
                  <div className="flex bg-slate-50 border-b-2 border-slate-100">
                    <button onClick={() => setActiveTab('quick')} className={`flex-1 py-5 text-[10px] font-black uppercase tracking-[0.3em] transition-all Museum-Text flex items-center justify-center gap-3 ${!isCustomMode ? 'bg-emerald-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-200'}`}>
                      <i className="fas fa-magic"></i> Buat Cepat
                    </button>
                    <button onClick={() => setActiveTab('form')} className={`flex-[1.5] py-5 text-[10px] font-black uppercase tracking-[0.3em] transition-all Museum-Text flex items-center justify-center gap-3 ${isCustomMode ? 'bg-emerald-600 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-200'}`}>
                      <i className="fas fa-microchip"></i> Mode Advance
                    </button>
                  </div>
                  {isCustomMode && (
                    <div className="flex bg-emerald-50/50 border-b-2 border-emerald-100 p-2 gap-2">
                      {(['form', 'visual', 'logic'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 rounded-2xl text-[8px] font-black uppercase tracking-[0.2em] transition-all Museum-Text ${activeTab === tab ? 'bg-white text-emerald-600 shadow-md ring-2 ring-emerald-100' : 'text-emerald-300 hover:bg-white/50'}`}>
                          {tab === 'form' ? '1. Identitas' : tab === 'visual' ? '2. Visual' : '3. Instruksi'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-7">
                  {activeTab === 'quick' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Topik Lab Maya <span className="text-red-500">*</span></label>
                        <input value={quickMateri} onChange={e => setQuickMateri(e.target.value)} className="w-full input-futuristic bg-white px-6 py-3.5 text-sm font-bold shadow-inner" placeholder="Contoh: Siklus Air" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Target Kelas</label>
                        <select value={quickKelas} onChange={e => setQuickKelas(e.target.value)} className="w-full input-futuristic bg-white px-6 py-3.5 text-sm font-bold cursor-pointer">
                          <option>Kelas 1 SD</option><option>Kelas 2 SD</option><option>Kelas 3 SD</option><option>Kelas 4 SD</option><option>Kelas 5 SD</option><option>Kelas 6 SD</option>
                          <option>SMP Sederajat</option><option>SMA Sederajat</option>
                        </select>
                      </div>
                    </div>
                  )}
                  {activeTab === 'form' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Judul Media <span className="text-red-500">*</span></label><input value={formData.judul} onChange={e => setFormData({...formData, judul: e.target.value})} className="w-full input-futuristic bg-white px-6 py-3.5 text-sm font-bold" placeholder="Contoh: Simulasi Magnet" /></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Target Audiens</label><input value={formData.targetAudiens} onChange={e => setFormData({...formData, targetAudiens: e.target.value})} className="w-full input-futuristic bg-white px-6 py-3.5 text-sm font-bold" placeholder="Siswa Kelas 5 SD" /></div>
                    </div>
                  )}
                  {activeTab === 'visual' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Tema Visual</label><select value={formData.temaVisual} onChange={e => setFormData({...formData, temaVisual: e.target.value as any})} className="w-full input-futuristic bg-white px-6 py-3.5 text-sm font-bold"><option>Minimalist/Clean</option><option>Pixel Art</option><option>Professional/Corporate</option></select></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Skema Warna</label><input value={formData.skemaWarna} onChange={e => setFormData({...formData, skemaWarna: e.target.value})} className="w-full input-futuristic bg-white px-6 py-3.5 text-sm font-bold" placeholder="Eco Green" /></div>
                    </div>
                  )}
                  {activeTab === 'logic' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Instruksi & Konten <span className="text-red-500">*</span></label><textarea value={formData.kontenNarasi} onChange={e => setFormData({...formData, kontenNarasi: e.target.value})} className="w-full input-futuristic bg-white px-6 py-3 text-sm h-32 resize-none font-bold Museum-Text leading-relaxed" placeholder="Detail simulasi yang diinginkan..." /></div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-7 space-y-5 animate-in fade-in duration-300">
                <div className="space-y-1.5">
                   <label className="text-[11px] font-bold uppercase text-slate-500 ml-1">Nama Materi <span className="text-red-500">*</span></label>
                   <input value={litMateri} onChange={e => setLitMateri(e.target.value)} className="w-full input-futuristic bg-white px-5 py-3 text-sm font-semibold" placeholder="Contoh: Metamorfosis Kupu-Kupu" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[11px] font-bold uppercase text-slate-500 ml-1">Sub Materi (Opsional)</label>
                   <input value={litSubMateri} onChange={e => setLitSubMateri(e.target.value)} className="w-full input-futuristic bg-white px-5 py-3 text-sm font-semibold" placeholder="Contoh: Telur, Larva, Pupa..." />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[11px] font-bold uppercase text-slate-500 ml-1">Tujuan Pembelajaran (Opsional)</label>
                   <textarea value={litTujuan} onChange={e => setLitTujuan(e.target.value)} className="w-full input-futuristic bg-white px-5 py-3 h-24 resize-none text-xs font-semibold" placeholder="Tujuan yang ingin dicapai siswa..." />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[11px] font-bold uppercase text-slate-500 ml-1">Target Kelas</label>
                   <select value={litKelas} onChange={e => setLitKelas(e.target.value)} className="w-full input-futuristic bg-white px-5 py-3 text-sm font-semibold">
                      <option>Kelas 1 SD</option><option>Kelas 2 SD</option><option>Kelas 3 SD</option><option>Kelas 4 SD</option><option>Kelas 5 SD</option><option>Kelas 6 SD</option>
                   </select>
                </div>
              </div>
            )}

            <div className="p-7 pt-0">
              {((activeSubMode === 'lab' && (activeTab === 'quick' || activeTab === 'logic')) || activeSubMode === 'literasi') ? (
                <button 
                  onClick={handleGenerate} 
                  disabled={isLoading || isValidating} 
                  className={`w-full py-4 rounded-2xl Museum-Text font-bold uppercase text-base joyful-shadow text-white shadow-2xl transition-all active:scale-95 ${activeSubMode === 'lab' ? 'bg-emerald-600 shadow-emerald-600/30 hover:bg-emerald-700' : 'bg-indigo-600 shadow-indigo-600/30 hover:bg-indigo-700'}`}
                >
                  {isValidating ? <><i className="fas fa-shield-halved fa-spin mr-3"></i>Validasi...</> : isLoading ? <><i className="fas fa-spinner fa-spin mr-3"></i>Merakit...</> : activeSubMode === 'lab' ? <><i className="fas fa-flask mr-3"></i>Rakit Lab Maya AI</> : <><i className="fas fa-microchip mr-3"></i>Rakit Materi Eksplorasi AI</>}
                </button>
              ) : (
                <button onClick={() => { if (activeTab === 'form') setActiveTab('visual'); else if (activeTab === 'visual') setActiveTab('logic'); }} className="w-full py-4 rounded-2xl Museum-Text font-bold uppercase text-base joyful-shadow bg-blue-600 text-white shadow-2xl shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3">
                  Selanjutnya <i className="fas fa-arrow-right"></i>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-8" ref={resultRef}>
          {labCode ? (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className={`rounded-[4rem] shadow-[0_30px_100px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col border-8 border-white ${activeSubMode === 'lab' ? 'bg-slate-900' : 'bg-indigo-950'}`}>
                    <div className="p-8 relative overflow-hidden flex flex-col items-center">
                        <div className={`w-full max-w-4xl aspect-video max-h-[480px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-8 relative ${activeSubMode === 'lab' ? 'border-emerald-950/40' : 'border-indigo-950/40'}`}>
                            <iframe srcDoc={sanitizeGeneratedCode(labCode)} className="w-full h-full border-none" title="Lab Preview" sandbox="allow-scripts allow-popups allow-forms" />
                        </div>
                        <div className="flex items-center gap-6 mt-8">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${activeSubMode === 'lab' ? 'text-emerald-300' : 'text-indigo-300'}`}>Preview Interaktif</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className={`bg-white rounded-[3.5rem] p-8 border-4 shadow-[0_20px_60px_rgba(0,0,0,0.05)] ${activeSubMode === 'lab' ? 'border-emerald-400' : 'border-indigo-400'}`}>
                    <h3 className={`text-xl font-black Museum-Text uppercase mb-6 flex items-center gap-4 tracking-tight ${activeSubMode === 'lab' ? 'text-emerald-600' : 'text-indigo-600'}`}>
                        <i className={`fas ${activeSubMode === 'lab' ? 'fa-paper-plane' : 'fa-rocket'} text-2xl`}></i> 
                        {activeSubMode === 'lab' ? 'Pengaturan Tampilan Depan Kelas' : 'Penerbitan Materi Literasi'}
                    </h3>
                    <div className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-[0.2em]">Mata Pelajaran</label>
                            <select value={publishSubject} onChange={e => setPublishSubject(e.target.value)} className="w-full input-futuristic bg-white px-4 py-3 font-black text-blue-600 border-2 border-slate-100 text-xs">
                                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button onClick={() => {
                                if (!isUnlocked) {
                                  setProNotice({ show: true, title: 'Fitur Khusus Guru PRO', feature: 'Unduh File Offline', benefit: 'User PRO dapat mengunduh file HTML mandiri untuk dijalankan secara offline.' });
                                  return;
                                }
                                const blob = new Blob([labCode], { type: 'text/html' });
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                const fn = activeSubMode === 'lab' ? (activeTab === 'quick' ? quickMateri : formData.judul) : litMateri;
                                link.download = `${activeSubMode === 'lab' ? 'LabMaya' : 'MateriEksplorasi'}_${fn.replace(/\s+/g, '_')}.html`;
                                link.click();
                                URL.revokeObjectURL(url);
                            }} className={`w-full py-4 rounded-[1.5rem] font-black uppercase Museum-Text text-[10px] tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-4 ${isUnlocked ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-400 border-2 border-slate-200'}`}>
                                <i className={`fas ${isUnlocked ? 'fa-download' : 'fa-lock'} text-base`}></i> {isUnlocked ? 'Unduh File HTML' : 'Unduh File HTML (PRO)'}
                            </button>
                            <button onClick={handlePublishAction} disabled={isPublishing || isPublished} className={`w-full py-4 rounded-[1.5rem] font-black uppercase Museum-Text text-[10px] tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-4 ${isPublished ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
                                {isPublishing ? <i className="fas fa-spinner fa-spin"></i> : <i className={`fas ${isPublished ? 'fa-check-circle' : (activeSubMode === 'lab' ? 'fa-chalkboard-user' : 'fa-bullhorn')} text-base`}></i>}
                                {isPublishing ? 'Memproses...' : isPublished ? 'Berhasil Terbit' : (activeSubMode === 'lab' ? 'Kirim ke Dashboard Guru' : 'Kirim ke Dashboard Siswa')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
          ) : (
            <div className="w-full min-h-[500px] border-4 border-dashed rounded-[4rem] flex flex-col items-center justify-center p-16 text-center bg-white/50 border-indigo-200">
               <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 border-4 border-white shadow-inner ${activeSubMode === 'lab' ? 'bg-emerald-50' : 'bg-indigo-50'}`}>
                  <i className={`fas ${activeSubMode === 'lab' ? 'fa-vial text-emerald-200' : 'fa-book-bookmark text-indigo-200'} text-6xl`}></i>
               </div>
               <h3 className={`text-2xl font-black uppercase Museum-Text tracking-widest ${activeSubMode === 'lab' ? 'text-emerald-300' : 'text-indigo-300'}`}>{activeSubMode === 'lab' ? 'Studio Lab Maya' : 'Studio Eksplorasi Literasi'}</h3>
               <p className="mt-4 text-[10px] font-black uppercase max-w-xs mx-auto text-slate-300 leading-loose tracking-[0.2em]">Rakit {activeSubMode === 'lab' ? 'simulasi interaktif STEM untuk demonstrasi kelas.' : 'petualangan literasi interaktif untuk meningkatkan minat baca siswa.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabMayaPortal;
