
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Mission, GameFormData, AssessmentFormData } from '../types';
import { generateGameQuick, generateGame, generateInteractiveQuiz } from '../services/gameService';
import { getInitialGameData, getInitialAssessmentData } from '../constants';
import { AssemblyLoader, BlockingOverlay, ProRequirementNotice } from './SharedUI';
import { validateUsageCloud, getUsageStatusCloud } from '../services/validationService';
import { sanitizeGeneratedCode } from '../utils/codeUtils';
import { handleAiGenerationError } from '../utils/errorUtils';

const GAME_GENRES = [
  "Otomatis (Rekomendasi AI)",
  "Trivia Quiz (Klasik)",
  "Catch the Objects (Menangkap Jawaban)",
  "Endless Runner Edukasi",
  "Labirin Pengetahuan",
  "Space Shooter Soal",
  "Memory Match (Mencocokkan Kartu)",
  "Word Scramble (Susun Kata)",
  "Platformer Sederhana",
  "Lainnya..."
];

const RakitGimPortal: React.FC<{ gasUrl?: string, isUnlocked: boolean, subjects: string[], onPublish: (m: Partial<Mission>) => void, setGlobalBusy: (b: boolean) => void, myDeviceId?: string }> = ({ gasUrl, isUnlocked, subjects, onPublish, setGlobalBusy, myDeviceId }) => {
  // INTERNAL MAIN SUB-TAB
  const [mainMode, setMainMode] = useState<'gim' | 'kuis'>('gim');
  
  // SHARED STATE
  const [isLoading, setIsLoading] = useState(false);
  const [gameCode, setGameCode] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [showTestOverlay, setShowTestOverlay] = useState(false);
  const [isCloudBlocked, setIsCloudBlocked] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  
  const [publishSubject, setPublishSubject] = useState('');
  const [publishExp, setPublishExp] = useState<number>(100);
  const [publishCoin, setPublishCoin] = useState<number>(50);
  const [isPublishing, setIsPublishing] = useState(false);

  // --- GIM MODE STATES (KEPT ORIGINAL) ---
  const [formData, setFormData] = useState<GameFormData>(getInitialGameData());
  const [quickMateri, setQuickMateri] = useState('');
  const [quickKelas, setQuickKelas] = useState('Kelas 4 SD');
  const [quickGenre, setQuickGenre] = useState(GAME_GENRES[0]);
  const [customGenre, setCustomGenre] = useState('');
  const [quickQuestionCount, setQuickQuestionCount] = useState<number>(10);
  const [quickIsDuel, setQuickIsDuel] = useState(false);
  const [quickIsExamMode, setQuickIsExamMode] = useState(false);
  const [quickPlatform, setQuickPlatform] = useState<'Mobile' | 'PC & Mobile'>('Mobile');
  const [activeTab, setActiveTab] = useState<'quick' | 'form' | 'visual' | 'logic'>('quick');

  // --- KUIS MODE STATES (NEW - MIRROR ASSESSMENT) ---
  const [quizFormData, setQuizFormData] = useState<AssessmentFormData>(getInitialAssessmentData());
  const [activeQuizFormTab, setActiveQuizFormTab] = useState<'identity' | 'structure' | 'topics'>('identity');
  const [quizTargetLulus, setQuizTargetLulus] = useState(70);

  const calculateTotalQuizSoal = () => quizFormData.formats.reduce((acc, curr) => acc + (parseInt(curr.count) || 0), 0);
  const calculateTotalQuizWeight = () => quizFormData.topics.reduce((acc, curr) => acc + (parseInt(curr.bobot) || 0), 0);
  const isQuizSoalMatching = (parseInt(quizFormData.jumlahSoalTotal) || 0) === calculateTotalQuizSoal() && calculateTotalQuizSoal() > 0;
  const isQuizWeightMatching = calculateTotalQuizWeight() === 100;

  const [dailyCount, setDailyCount] = useState(() => {
    const today = new Date().toLocaleDateString();
    const saved = localStorage.getItem(`usage_gim_v1_${today}`);
    return saved ? parseInt(saved) : 0;
  });

  const [hasBonusToday, setHasBonusToday] = useState(() => {
    const today = new Date().toLocaleDateString();
    const saved = localStorage.getItem(`bonus_gim_v1_${today}`);
    return saved === 'true';
  });

  const [proNotice, setProNotice] = useState<{show: boolean, title: string, feature: string, benefit: string, canClaimBonus?: boolean}>({
    show: false, title: '', feature: '', benefit: '', canClaimBonus: false
  });
  
  const resultRef = useRef<HTMLDivElement>(null);
  const isCustomMode = activeTab !== 'quick';
  const currentLimit = hasBonusToday ? 2 : 1;

  useEffect(() => {
    const checkCloud = async () => {
      if (!isUnlocked && myDeviceId) {
        setIsValidating(true);
        const isAllowed = await getUsageStatusCloud(myDeviceId, 'Gim Edukasi', currentLimit, gasUrl || "NONE");
        if (!isAllowed) setIsCloudBlocked(true);
        setIsValidating(false);
      }
    };
    checkCloud();
  }, [isUnlocked, myDeviceId, currentLimit, gasUrl]);

  const handleClaimBonus = () => {
    const today = new Date().toLocaleDateString();
    setHasBonusToday(true);
    localStorage.setItem(`bonus_gim_v1_${today}`, 'true');
    setProNotice(prev => ({ ...prev, show: false }));
    setIsCloudBlocked(false); 
    alert("🌟 BONUS DIKLAIM!\n\nAnda mendapatkan 1 kesempatan tambahan untuk merakit media hari ini!");
  };

  const handleGenerate = async () => {
    if (!isUnlocked) {
        if (dailyCount === 1 && !hasBonusToday) {
            setProNotice({ show: true, title: 'Jatah Harian Habis', feature: 'Kesempatan Ekstra Menanti', benefit: 'Dapatkan 1 jatah merakit lagi hari ini dengan membagikan aplikasi Mentari.', canClaimBonus: true });
            return;
        }
        if (dailyCount >= 2 || (isCloudBlocked && !hasBonusToday)) {
            setProNotice({ show: true, title: 'Limit Harian Tercapai', feature: 'Akses Tanpa Batas', benefit: 'User Basic dibatasi merakit 1 karya per hari (+1 bonus share). Upgrade ke GURU PRO untuk bebas merancang kapan saja.', canClaimBonus: false });
            return;
        }
    }

    if (mainMode === 'gim') {
        if (activeTab === 'quick' && !quickMateri.trim()) return alert("Harap isi Materi!");
        if (activeTab !== 'quick' && (!formData.judul.trim() || !formData.kontenNarasi.trim())) return alert("Harap isi Judul dan Konten!");
    } else {
        if (!quizFormData.judulAsesmen.trim()) return alert("Harap isi Judul Kuis!");
        if (!isQuizSoalMatching) return alert("Jumlah rincian soal tidak sesuai target total!");
        if (!isQuizWeightMatching) return alert("Total bobot materi kuis harus tepat 100%!");
    }

    setIsLoading(true);
    setGlobalBusy(true);

    try {
      if (!isUnlocked && myDeviceId) {
        const isAllowed = await validateUsageCloud(myDeviceId, 'Gim Edukasi', currentLimit, gasUrl || "NONE", dailyCount);
        if (!isAllowed) {
            setIsLoading(false);
            setGlobalBusy(false);
            setIsCloudBlocked(true);
            setProNotice({ show: true, title: 'Limit Cloud Tercapai', feature: 'Keamanan Kuota', benefit: 'Sistem mendeteksi perangkat atau kelas ini sudah menggunakan kuota harian.', canClaimBonus: !hasBonusToday });
            return; 
        }
      }

      setGameCode(null);
      setIsPublished(false);
      setPublishSubject('');

      let code = "";
      if (mainMode === 'gim') {
        if (activeTab === 'quick') {
          const finalGenre = quickGenre === "Lainnya..." ? customGenre : quickGenre;
          code = await generateGameQuick(quickMateri, quickKelas, quickQuestionCount, finalGenre, quickIsDuel, quickPlatform, quickIsExamMode, formData.minScore);
        } else {
          code = await generateGame(formData);
        }
      } else {
        code = await generateInteractiveQuiz(quizFormData, quizTargetLulus);
      }
      
      setGameCode(code);

      if (!isUnlocked) {
        const today = new Date().toLocaleDateString();
        const newCount = dailyCount + 1;
        setDailyCount(newCount);
        localStorage.setItem(`usage_gim_v1_${today}`, newCount.toString());
      }

      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 500);
    } catch (err) {
      handleAiGenerationError(err, mainMode === 'gim' ? 'merakit Game Interaktif' : 'merakit Kuis Otomatis');
    } finally {
      setIsLoading(false);
      setGlobalBusy(false);
    }
  };

  const handlePublish = () => {
    if (!gameCode || isPublished) return;
    if (!publishSubject) return alert("MATA PELAJARAN BELUM DIPILIH!");
    if (publishExp <= 0 || publishCoin <= 0) return alert("Hadiah harus lebih dari 0!");

    setIsPublishing(true);

    const title = mainMode === 'gim' 
        ? (activeTab === 'quick' ? `Misi Game: ${quickMateri}` : `Misi Game: ${formData.judul}`)
        : `Misi Kuis: ${quizFormData.judulAsesmen}`;
    
    const isExamActive = mainMode === 'gim' 
        ? (activeTab === 'quick' ? quickIsExamMode : formData.isExamMode)
        : true; // Quiz default to exam style result reporting
    
    onPublish({
        title,
        subject: publishSubject,
        description: isExamActive ? "[MODE OTOMATIS] Selesaikan kuis ini untuk mendapatkan hadiah. Skor Anda akan dilaporkan langsung ke Guru." : "Mainkan game interaktif ini!",
        expReward: publishExp,
        coinReward: publishCoin,
        gameCode: gameCode,
        isActive: true,
        minScore: mainMode === 'gim' ? formData.minScore : quizTargetLulus,
        isExamMode: isExamActive
    });

    setTimeout(() => {
        setIsPublishing(false);
        setIsPublished(true);
        alert(`SUKSES!\n\nMisi telah diterbitkan ke dashboard siswa.`);
    }, 1500);
  };

  const updateFitur = (key: keyof GameFormData['fiturTeknis']) => {
    setFormData({ ...formData, fiturTeknis: { ...formData.fiturTeknis, [key]: !formData.fiturTeknis[key] } });
  };

  const toggleDuelMode = () => {
    if (!isUnlocked) {
        setProNotice({ show: true, title: 'Fitur Khusus Guru PRO', feature: 'Mode Duel Split Screen', benefit: 'Buat gim kompetisi kelas (Battle Mode) yang memungkinkan 2 pemain bertanding di satu perangkat secara split-screen.' });
        return;
    }
    if (activeTab === 'quick') {
        const nextDuel = !quickIsDuel;
        setQuickIsDuel(nextDuel);
        if (nextDuel) { setQuickPlatform('PC & Mobile'); setQuickIsExamMode(false); }
    } else {
        const nextDuel = !formData.isDuel;
        setFormData({ ...formData, isDuel: nextDuel, platform: nextDuel ? 'PC & Mobile' : formData.platform, isExamMode: nextDuel ? false : formData.isExamMode });
    }
  };

  return (
    <div className="animate-in fade-in duration-700">
      <BlockingOverlay isVisible={isLoading} text={mainMode === 'gim' ? "Merakit Game Interaktif..." : "Merakit Kuis Otomatis..."} isUnlocked={isUnlocked} />
      
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
          
          {/* SUB-TAB LEVEL 1 (MAIN MODE) */}
          <div className="flex bg-slate-200/50 p-1.5 rounded-[2rem] border-2 border-slate-100 mb-2">
            <button onClick={() => { setMainMode('gim'); setGameCode(null); }} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-2xl transition-all Museum-Text flex items-center justify-center gap-2 ${mainMode === 'gim' ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-blue-500'}`}>
               <i className="fas fa-gamepad"></i> GIM INTERAKTIF
            </button>
            <button onClick={() => { setMainMode('kuis'); setGameCode(null); }} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-2xl transition-all Museum-Text flex items-center justify-center gap-2 ${mainMode === 'kuis' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-indigo-500'}`}>
               <i className="fas fa-file-circle-question"></i> KUIS OTOMATIS
            </button>
          </div>

          <div className={`rounded-[3rem] shadow-2xl overflow-hidden border-4 bg-white ${mainMode === 'gim' ? 'border-indigo-400' : 'border-violet-400'}`}>
            {mainMode === 'gim' ? (
                /* ORIGINAL GAME UI */
                <>
                <div className="flex flex-col">
                  <div className="flex bg-slate-50 border-b-2 border-slate-100">
                    <button onClick={() => setActiveTab('quick')} className={`flex-1 py-5 text-[10px] font-black uppercase tracking-[0.3em] transition-all Museum-Text flex items-center justify-center gap-3 ${!isCustomMode ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-200'}`}>
                      <i className="fas fa-bolt"></i> Mode Kilat
                    </button>
                    <button onClick={() => setActiveTab('form')} className={`flex-[1.5] py-5 text-[10px] font-black uppercase tracking-[0.3em] transition-all Museum-Text flex items-center justify-center gap-3 ${isCustomMode ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-200'}`}>
                      <i className="fas fa-drafting-compass"></i> Mode Arsitek
                    </button>
                  </div>
                  {isCustomMode && (
                    <div className="flex bg-indigo-50/50 border-b-2 border-indigo-100 p-2 gap-2">
                      {(['form', 'visual', 'logic'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 rounded-2xl text-[8px] font-black uppercase tracking-0.2em transition-all Museum-Text ${activeTab === tab ? 'bg-white text-indigo-600 shadow-md ring-2 ring-indigo-100' : 'text-indigo-300 hover:bg-white/50'}`}>{tab === 'form' ? '1. Identitas' : tab === 'visual' ? '2. Visual' : '3. Mekanik'}</button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-7">
                  {activeTab === 'quick' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Materi Pembelajaran <span className="text-red-500">*</span></label><input value={quickMateri} onChange={e => setQuickMateri(e.target.value)} className="w-full input-futuristic bg-white px-6 py-3.5 text-sm font-bold" placeholder="Contoh: Perkalian Dasar" /></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Jenis / Genre Permainan</label><select value={quickGenre} onChange={e => setQuickGenre(e.target.value)} className="w-full input-futuristic bg-white px-4 py-3.5 text-sm font-black text-indigo-600 shadow-inner">{GAME_GENRES.map(g => <option key={g} value={g}>{g}</option>)}</select></div>
                      {quickGenre === "Lainnya..." && (<div className="space-y-1.5 animate-in slide-in-from-top-2"><label className="text-[10px] font-black uppercase text-blue-400 ml-2 tracking-widest">Tentukan Genre Sendiri</label><input value={customGenre} onChange={e => setCustomGenre(e.target.value)} className="w-full input-futuristic bg-white px-6 py-3.5 text-sm font-bold border-blue-200" placeholder="e.g. Permainan RPG Simulasi Kebun" /></div>)}
                      <div className="grid grid-cols-2 gap-3"><div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Target Kelas</label><select value={quickKelas} onChange={e => setQuickKelas(e.target.value)} className="w-full input-futuristic bg-white px-4 py-3 text-sm font-bold cursor-pointer"><option>Kelas 1 SD</option><option>Kelas 2 SD</option><option>Kelas 3 SD</option><option>Kelas 4 SD</option><option>Kelas 5 SD</option><option>Kelas 6 SD</option><option>SMP Sederajat</option><option>SMA Sederajat</option></select></div><div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Target Jml Soal</label><select value={quickQuestionCount} onChange={e => setQuickQuestionCount(Number(e.target.value))} className="w-full input-futuristic bg-white px-4 py-3 text-sm font-black text-indigo-600 cursor-pointer"><option value={5}>5 Soal</option><option value={10}>10 Soal</option><option value={15}>15 Soal</option><option value={20}>20 Soal</option></select></div></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Target Perangkat</label><select disabled={quickIsDuel} value={quickPlatform} onChange={e => setQuickPlatform(e.target.value as any)} className={`w-full input-futuristic bg-white px-4 py-3.5 text-sm font-black text-blue-600 cursor-pointer shadow-inner ${quickIsDuel ? 'opacity-50 grayscale' : ''}`}><option value="Mobile">Khusus Mobile (Optimal di HP)</option><option value="PC & Mobile">PC & Mobile (Universal)</option></select></div>
                      <div className="grid grid-cols-1 gap-2.5">
                        <div onClick={toggleDuelMode} className={`p-3.5 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${quickIsDuel ? 'bg-amber-600 border-amber-600 text-white shadow-xl scale-[1.02]' : 'bg-slate-50 border-slate-200'}`}><div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-xl flex items-center justify-center ${quickIsDuel ? 'bg-white text-amber-600' : 'bg-amber-100 text-amber-600'}`}><i className="fas fa-hand-fist text-xs"></i></div><div><span className="text-[9px] font-black uppercase Museum-Text tracking-widest block leading-none">Mode Duel (Battle)</span><span className="text-[7px] font-bold uppercase opacity-60">2 Pemain • Split Screen</span></div></div><div className="relative"><input type="checkbox" checked={quickIsDuel} readOnly className="w-4 h-4 accent-white" />{!isUnlocked && <i className="fas fa-lock absolute -top-1 -right-1 text-[8px] text-amber-400 bg-white rounded-full p-0.5 border"></i>}</div></div>
                        <div onClick={() => !quickIsDuel && setQuickIsExamMode(!quickIsExamMode)} className={`p-3.5 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${quickIsExamMode ? 'bg-red-600 border-red-600 text-white shadow-xl scale-[1.02]' : 'bg-slate-50 border-slate-200'} ${quickIsDuel ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}><div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-xl flex items-center justify-center ${quickIsExamMode ? 'bg-white text-red-600' : 'bg-red-100 text-red-600'}`}><i className="fas fa-file-invoice text-xs"></i></div><div><span className="text-[9px] font-black uppercase Museum-Text tracking-widest block leading-none">Mode Ujian (Exam)</span><span className="text-[7px] font-bold uppercase opacity-60">Satu Kali Lulus</span></div></div><div className="relative"><input type="checkbox" checked={quickIsExamMode} disabled={quickIsDuel} readOnly className="w-4 h-4 accent-white" /></div></div>
                      </div>
                    </div>
                  )}
                  {activeTab === 'form' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Judul Game <span className="text-red-500">*</span></label><input value={formData.judul} onChange={e => setFormData({...formData, judul: e.target.value})} className="w-full input-futuristic bg-white px-6 py-3.5 text-sm font-bold" placeholder="Contoh: Petualangan Matematika" /></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Genre</label><select value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value as any})} className="w-full input-futuristic bg-white px-6 py-3.5 text-sm font-bold"><option>Visual Novel</option><option>RPG 2D</option><option>Platformer</option><option>Puzzle</option><option>Quiz Interaktif</option></select></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Target Audiens</label><input value={formData.targetAudiens} onChange={e => setFormData({...formData, targetAudiens: e.target.value})} className="w-full input-futuristic bg-white px-6 py-3.5 text-sm font-bold" placeholder="Contoh: Siswa SD Kelas 4" /></div>
                    </div>
                  )}
                  {activeTab === 'visual' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Tema Visual</label><select value={formData.temaVisual} onChange={e => setFormData({...formData, temaVisual: e.target.value as any})} className="w-full input-futuristic bg-white px-6 py-3.5 text-sm font-bold"><option>Cyberpunk</option><option>Minimalist/Clean</option><option>Pixel Art</option><option>Professional/Corporate</option></select></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Skema Warna</label><input value={formData.skemaWarna} onChange={e => setFormData({...formData, skemaWarna: e.target.value})} className="w-full input-futuristic bg-white px-6 py-3.5 text-sm font-bold" placeholder="Contoh: Deep Blue and Gold" /></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Gaya Aset Gambar</label><select value={formData.asetGambar} onChange={e => setFormData({...formData, asetGambar: e.target.value as any})} className="w-full input-futuristic bg-white px-6 py-3.5 text-sm font-bold"><option>Placeholder Warna</option><option>Pixel Art API</option><option>Unsplash API</option></select></div>
                    </div>
                  )}
                  {activeTab === 'logic' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Konten & Narasi <span className="text-red-500">*</span></label><textarea value={formData.kontenNarasi} onChange={e => setFormData({...formData, kontenNarasi: e.target.value})} className="w-full input-futuristic bg-white px-6 py-3 h-32 resize-none font-bold Museum-Text text-xs leading-relaxed shadow-inner" placeholder="Masukkan detail cerita..." /></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Target Perangkat</label><select disabled={formData.isDuel} value={formData.platform} onChange={e => setFormData({...formData, platform: e.target.value as any})} className={`w-full input-futuristic bg-white px-4 py-3.5 text-sm font-black text-blue-600 shadow-inner ${formData.isDuel ? 'opacity-50 grayscale' : ''}`}><option value="Mobile">Khusus Mobile (Optimal di HP)</option><option value="PC & Mobile">PC & Mobile (Universal)</option></select></div>
                      <div className="grid grid-cols-2 gap-3">{(['skor', 'nyawa', 'timer', 'mobileFriendly', 'suara'] as const).map(feat => (<div key={feat} onClick={() => updateFitur(feat)} className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${formData.fiturTeknis[feat] ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-200 opacity-60'}`}><i className={`fas ${feat === 'skor' ? 'fa-star' : feat === 'nyawa' ? 'fa-heart' : feat === 'timer' ? 'fa-clock' : feat === 'mobileFriendly' ? 'fa-mobile-alt' : 'fa-volume-up'} text-xs`}></i><span className="text-[9px] font-black uppercase Museum-Text tracking-widest truncate">{feat}</span></div>))}</div>
                    </div>
                  )}
                </div>
                </>
            ) : (
                /* NEW KUIS MODE UI - MIRROR RAKITAIPORTAL */
                <>
                <div className="flex bg-violet-50">
                   {(['identity', 'structure', 'topics'] as const).map(tab => (
                     <button key={tab} onClick={() => setActiveQuizFormTab(tab)} className={`flex-1 py-5 text-[10px] font-black uppercase tracking-widest transition-all relative Museum-Text active:scale-95 ${activeQuizFormTab === tab ? 'text-violet-700' : 'text-slate-400 hover:text-violet-400'}`}>
                        {activeQuizFormTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-violet-500"></div>}
                        {tab === 'identity' ? 'IDENTITAS' : tab === 'structure' ? 'STRUKTUR' : 'MATERI'}
                     </button>
                   ))}
                </div>
                <div className="p-7">
                    {activeQuizFormTab === 'identity' && (
                        <div className="space-y-5 animate-in fade-in duration-300">
                           <div className="space-y-1.5"><label className="text-[11px] font-bold uppercase text-slate-500 ml-1">Nama Kuis <span className="text-red-500">*</span></label><input value={quizFormData.judulAsesmen} onChange={e => setQuizFormData({...quizFormData, judulAsesmen: e.target.value})} className="w-full input-futuristic bg-white px-5 py-3 text-sm font-semibold" placeholder="Kuis Tengah Semester..." /></div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1.5"><label className="text-[11px] font-bold uppercase text-slate-500 ml-1">Mata Pelajaran</label><select value={quizFormData.mataPelajaran} onChange={e => setQuizFormData({...quizFormData, mataPelajaran: e.target.value})} className="w-full input-futuristic bg-white px-5 py-3 text-sm font-semibold">{subjects.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                              <div className="space-y-1.5"><label className="text-[11px] font-bold uppercase text-slate-500 ml-1">Target Kelas</label><select value={quizFormData.jenjang} onChange={e => setQuizFormData({...quizFormData, jenjang: e.target.value})} className="w-full input-futuristic bg-white px-5 py-3 text-sm font-semibold"><option>Kelas 1 SD</option><option>Kelas 2 SD</option><option>Kelas 3 SD</option><option>Kelas 4 SD</option><option>Kelas 5 SD</option><option>Kelas 6 SD</option></select></div>
                           </div>
                        </div>
                    )}
                    {activeQuizFormTab === 'structure' && (
                        <div className="space-y-5 animate-in fade-in duration-300">
                           <div className="p-6 rounded-3xl border-4 border-violet-50 flex flex-col gap-3 bg-violet-50/50">
                              <div className="flex justify-between items-center"><span className="text-[11px] font-black uppercase text-violet-700 Museum-Text">Total Soal</span><input type="number" value={quizFormData.jumlahSoalTotal} onChange={e => setQuizFormData({...quizFormData, jumlahSoalTotal: e.target.value})} className="w-24 rounded-xl px-3 py-1.5 text-center font-bold bg-white border-2 border-violet-200 text-violet-600" /></div>
                              <div className="flex justify-between items-center pt-2 border-t-2 border-violet-100"><span className="text-[11px] font-bold text-slate-400 uppercase">Input Saat Ini:</span><span className={`text-2xl font-black ${isQuizSoalMatching ? 'text-green-500' : 'text-red-400'}`}>{calculateTotalQuizSoal()} / {quizFormData.jumlahSoalTotal}</span></div>
                           </div>
                           <div className="grid grid-cols-1 gap-3">
                              {quizFormData.formats.map((f, i) => {
                                 // Quiz only supports certain interactive types
                                 const isSupported = ["Pilihan Ganda", "Benar/Salah", "Isian Short"].includes(f.type);
                                 if (!isSupported) return null;
                                 return (
                                    <div key={f.type} className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${parseInt(f.count) > 0 ? 'bg-violet-600 border-violet-600 text-white shadow-md' : 'bg-white border-slate-200 opacity-60'}`}>
                                       <label className="text-[10px] font-black uppercase Museum-Text">{f.type}</label>
                                       <input type="number" value={f.count} onChange={e => { const nf = [...quizFormData.formats]; nf[i].count = e.target.value; setQuizFormData({...quizFormData, formats: nf})}} className={`w-20 bg-white/10 rounded-lg px-3 py-1 text-right text-base font-black focus:outline-none ${parseInt(f.count) > 0 ? 'text-white' : 'text-slate-400'}`} />
                                    </div>
                                 );
                              })}
                           </div>
                        </div>
                    )}
                    {activeQuizFormTab === 'topics' && (
                        <div className="space-y-5 animate-in fade-in duration-300">
                           <div className="p-5 rounded-2xl border-4 border-emerald-50 bg-green-50/30 flex justify-between items-center"><span className="text-[11px] font-black uppercase text-green-700 Museum-Text">Total Bobot Materi</span><div className={`px-6 py-2 rounded-xl text-xl font-black ${isQuizWeightMatching ? 'text-green-600 bg-white' : 'text-red-500 bg-red-50'}`}>{calculateTotalQuizWeight()}%</div></div>
                           <div className="space-y-3">
                              <div className="flex items-center justify-between ml-1"><label className="text-[11px] font-bold uppercase text-slate-500">Materi yang Diuji</label><button onClick={() => setQuizFormData({...quizFormData, topics: [...quizFormData.topics, {materi: '', bobot: '0'}]})} className="text-[10px] font-black uppercase text-violet-600 hover:underline">+ Tambah Materi</button></div>
                              {quizFormData.topics.map((t, i) => (
                                <div key={i} className="flex gap-3 animate-in slide-in-from-left-2 duration-300">
                                   <input value={t.materi} onChange={e => { const nt = [...quizFormData.topics]; nt[i].materi = e.target.value; setQuizFormData({...quizFormData, topics: nt})}} className="flex-grow input-futuristic bg-white px-5 py-2.5 text-sm font-bold" placeholder="Materi..." />
                                   <div className="relative w-20"><input type="number" value={t.bobot} onChange={e => { const nt = [...quizFormData.topics]; nt[i].bobot = e.target.value; setQuizFormData({...quizFormData, topics: nt})}} className="w-full input-futuristic bg-white px-2 py-2.5 text-sm font-black text-center" /><span className="absolute right-1 top-1/2 -translate-y-1/2 text-[8px] font-bold text-slate-300">%</span></div>
                                   {quizFormData.topics.length > 1 && (<button onClick={() => { const nt = quizFormData.topics.filter((_, idx) => idx !== i); setQuizFormData({...quizFormData, topics: nt})}} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center border-2 border-red-100 transition-all active:scale-90"><i className="fas fa-trash-alt text-xs"></i></button>)}
                                </div>
                              ))}
                           </div>
                           <div className="bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] p-4 mt-6">
                               <div className="flex justify-between items-center mb-2"><label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Kriteria Ketuntasan (Min Skor)</label><span className="text-xs font-black text-violet-700 bg-white px-3 py-0.5 rounded-lg border-2 border-violet-100 shadow-sm">{quizTargetLulus}</span></div>
                               <input type="range" min="10" max="100" step="5" value={quizTargetLulus} onChange={e => setQuizTargetLulus(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-violet-600" />
                           </div>
                        </div>
                    )}
                </div>
                </>
            )}
            
            <div className="p-7 pt-0">
              {mainMode === 'gim' && (activeTab === 'quick' || activeTab === 'logic') && (
                <div className="bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] p-4 mb-6 shadow-inner">
                   <div className="flex justify-between items-center mb-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Target Nilai Lulus</label>
                      <span className="text-xs font-black text-indigo-700 bg-white px-3 py-0.5 rounded-lg border-2 border-indigo-100 shadow-sm">{formData.minScore}</span>
                   </div>
                   <input type="range" min="10" max="100" step="5" value={formData.minScore} onChange={e => setFormData({...formData, minScore: Number(e.target.value)})} className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600" />
                </div>
              )}
              
              <div className="flex gap-4">
                 {(mainMode === 'kuis' && activeQuizFormTab !== 'identity') && (
                   <button onClick={() => { if(activeQuizFormTab === 'structure') setActiveQuizFormTab('identity'); else setActiveQuizFormTab('structure'); }} className="flex-1 py-4 rounded-[1.5rem] bg-slate-100 text-slate-500 font-black uppercase text-[10px] hover:bg-slate-200 transition-all">Kembali</button>
                 )}
                 <button 
                  onClick={() => {
                    if (mainMode === 'gim') {
                        if (activeTab === 'form') setActiveTab('visual'); 
                        else if (activeTab === 'visual') setActiveTab('logic'); 
                        else handleGenerate();
                    } else {
                        if (activeQuizFormTab === 'identity') setActiveQuizFormTab('structure');
                        else if (activeQuizFormTab === 'structure') setActiveQuizFormTab('topics');
                        else handleGenerate();
                    }
                  }} 
                  disabled={isLoading || isValidating} 
                  className={`flex-[2] py-4 rounded-[1.5rem] Museum-Text font-bold uppercase text-base joyful-shadow text-white shadow-2xl transition-all active:scale-95 ${mainMode === 'gim' ? 'bg-indigo-600 shadow-indigo-600/30 hover:bg-indigo-700' : 'bg-violet-600 shadow-violet-600/30 hover:bg-violet-700'}`}
                >
                  {isValidating ? <><i className="fas fa-shield-halved fa-spin mr-3"></i>Validasi...</> : isLoading ? <><i className="fas fa-spinner fa-spin mr-3"></i>Merakit...</> : 
                    mainMode === 'gim' 
                        ? (activeTab === 'quick' || activeTab === 'logic' ? <><i className="fas fa-rocket mr-3"></i>Rakit Game AI</> : 'Selanjutnya')
                        : (activeQuizFormTab === 'topics' ? <><i className="fas fa-microchip mr-3"></i>Rakit Kuis AI</> : 'Selanjutnya')
                  }
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-8" ref={resultRef}>
          {gameCode ? (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className={`rounded-[4rem] shadow-[0_30px_100px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col border-8 border-white ${mainMode === 'gim' ? 'bg-slate-900' : 'bg-violet-950'}`}>
                    <div className="p-8 relative overflow-hidden flex flex-col items-center">
                        <div className="w-full max-w-4xl aspect-video max-h-[480px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-8 border-black/20 relative">
                        <iframe title="Preview" srcDoc={sanitizeGeneratedCode(gameCode)} className="w-full h-full border-none" sandbox="allow-scripts allow-popups allow-forms" />
                        </div>
                        <div className="flex items-center gap-6 mt-8">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                <p className="text-[10px] font-black uppercase text-indigo-300 tracking-[0.4em]">Pratinjau {mainMode === 'gim' ? 'Gim' : 'Kuis'} Aktif</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`bg-white rounded-[3.5rem] p-8 border-4 ${mainMode === 'gim' ? 'border-indigo-400' : 'border-violet-400'} shadow-[0_20px_60px_rgba(0,0,0,0.05)]`}>
                    <h3 className={`text-xl font-black Museum-Text uppercase ${mainMode === 'gim' ? 'text-indigo-600' : 'text-violet-600'} mb-6 flex items-center gap-4 tracking-tight`}>
                        <i className={`fas ${mainMode === 'gim' ? 'fa-cog' : 'fa-list-check'} text-2xl`}></i> 
                        Pengaturan Misi & Hadiah
                    </h3>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-[0.2em]">Mata Pelajaran <span className="text-red-500">*</span></label>
                                <select value={publishSubject} onChange={e => setPublishSubject(e.target.value)} className="w-full input-futuristic bg-white px-4 py-3 font-black text-blue-600 border-2 border-slate-100 text-xs shadow-inner">
                                    <option value="">-- Pilih Mapel --</option>
                                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase text-indigo-400 ml-2 tracking-[0.2em]">Max EXP</label>
                                <input type="number" value={publishExp} onChange={e => setPublishExp(Number(e.target.value))} className="w-full input-futuristic bg-white px-4 py-3 font-black text-indigo-600 border-2 border-slate-100 text-xs" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase text-amber-500 ml-2 tracking-[0.2em]">Max Koin</label>
                                <input type="number" value={publishCoin} onChange={e => setPublishCoin(Number(e.target.value))} className="w-full input-futuristic bg-white px-4 py-3 font-black text-amber-600 border-2 border-slate-100 text-xs" />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                                onClick={() => setShowTestOverlay(true)}
                                className={`flex-grow py-5 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4 ${mainMode === 'gim' ? 'bg-indigo-600 border-indigo-900 shadow-indigo-100' : 'bg-violet-600 border-violet-900 shadow-violet-100'}`}
                            >
                                <i className="fas fa-play-circle text-xl"></i> UJI COBA {mainMode === 'gim' ? 'GIM' : 'KUIS'} (TEACHER TEST)
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button onClick={() => {
                                if (!isUnlocked) { setProNotice({ show: true, title: 'Fitur Khusus Guru PRO', feature: 'Unduh File Offline', benefit: 'User PRO dapat mengunduh file HTML mandiri untuk dijalankan secara offline.' }); return; }
                                const blob = new Blob([gameCode], { type: 'text/html' });
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                const fn = mainMode === 'gim' ? (activeTab === 'quick' ? quickMateri : formData.judul) : quizFormData.judulAsesmen;
                                link.download = `${fn.replace(/\s+/g, '_')}_${mainMode === 'gim' ? 'Gim' : 'Kuis'}.html`;
                                link.click();
                                URL.revokeObjectURL(url);
                            }} className={`w-full py-4 rounded-[1.5rem] font-black uppercase Museum-Text text-[10px] tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-4 ${isUnlocked ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-400 border-2 border-slate-200'}`}>
                                <i className={`fas ${isUnlocked ? 'fa-download' : 'fa-lock'} text-base`}></i> {isUnlocked ? 'Unduh File HTML' : 'Unduh HTML (PRO)'}
                            </button>
                            <button onClick={handlePublish} disabled={isPublishing || isPublished} className={`w-full py-4 rounded-[1.5rem] font-black uppercase Museum-Text text-[10px] tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-4 ${isPublished ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
                                {isPublishing ? <i className="fas fa-spinner fa-spin"></i> : <i className={`fas ${isPublished ? 'fa-check-circle' : 'fa-paper-plane'} text-base`}></i>}
                                {isPublishing ? 'Memproses...' : isPublished ? 'Misi Terkirim' : 'Terbitkan Misi'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
          ) : (
            <div className="w-full h-full min-h-[500px] border-4 border-dashed rounded-[4rem] flex flex-col items-center justify-center p-16 text-center bg-white/50 border-slate-200">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 border-4 border-white shadow-inner ${mainMode === 'gim' ? 'bg-indigo-50' : 'bg-violet-50'}`}>
                <i className={`fas ${mainMode === 'gim' ? 'fa-gamepad text-indigo-200' : 'fa-file-circle-question text-violet-200'} text-6xl`}></i>
              </div>
              <h3 className={`text-2xl font-black uppercase Museum-Text tracking-widest ${mainMode === 'gim' ? 'text-indigo-300' : 'text-violet-300'}`}>Studio {mainMode === 'gim' ? 'Game' : 'Kuis'}</h3>
              <p className="mt-4 text-[10px] font-black uppercase max-w-xs mx-auto leading-loose text-slate-300 tracking-[0.2em]">Pilih mode pembuatan di samping untuk mulai merakit petualangan belajar interaktif.</p>
            </div>
          )}
        </div>
      </div>

      {showTestOverlay && gameCode && (
        <div className="fixed inset-0 z-[100000] bg-slate-900 flex flex-col animate-in zoom-in duration-300">
            <div className={`p-4 flex justify-between items-center shadow-2xl border-b-4 ${mainMode === 'gim' ? 'bg-blue-600 border-blue-800' : 'bg-violet-600 border-violet-800'}`}>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white"><i className="fas fa-microchip"></i></div>
                    <div>
                        <h4 className="text-white font-black uppercase text-sm Museum-Text">MODE UJI COBA GURU</h4>
                        <p className="text-[9px] text-white/70 font-bold uppercase tracking-widest">Pastikan seluruh konten sudah sesuai sebelum diterbitkan.</p>
                    </div>
                </div>
                <button onClick={() => setShowTestOverlay(false)} className="bg-white/10 hover:bg-red-50 text-white px-6 py-2 rounded-xl transition-all font-black text-xs uppercase border border-white/20"><i className="fas fa-times mr-2"></i> KELUAR TES</button>
            </div>
            <div className="flex-grow w-full relative bg-black">
                <iframe srcDoc={sanitizeGeneratedCode(gameCode)} className="w-full h-full border-none" title="Game Tester" sandbox="allow-scripts allow-popups allow-forms" />
            </div>
            <div className="bg-slate-950 p-4 text-center border-t border-white/5">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.5em]">Mentari AI Engine • Dev Mode</p>
            </div>
        </div>
      )}
    </div>
  );
};

export default RakitGimPortal;
