
import { StudentProfile, Student, AIWork } from '../types';
import { generateAdventureContent } from '../services/studentAiService';
import { BlockingOverlay } from './SharedUI';
import { sanitizeGeneratedCode } from '../utils/codeUtils';
import React, { useState, useRef, useMemo, useEffect } from 'react';

const PetualanganPortal: React.FC<{ profile: StudentProfile, onUpdateProfile: (p: StudentProfile) => void, students: Student[], setGlobalBusy: (b: boolean) => void, isUnlocked?: boolean }> = ({ profile, onUpdateProfile, students, setGlobalBusy, isUnlocked = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [adventureResult, setAdventureResult] = useState<string | null>(null);
  const [activeAdventure, setActiveAdventure] = useState<string | null>(null);
  const [adventureInput, setAdventureInput] = useState('');
  
  const [isAdventureFinished, setIsAdventureFinished] = useState(false);
  const [readTimer, setReadTimer] = useState(0);
  
  const adventureContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'ADVENTURE_COMPLETE') {
            setIsAdventureFinished(true);
            setReadTimer(5);
        }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    let interval: any;
    if (adventureResult && readTimer > 0) {
      interval = setInterval(() => {
        setReadTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [adventureResult, readTimer]);

  const ADVENTURE_CARDS = [
    { 
      id: 'spiritual', 
      title: 'Jelajah Spiritual', 
      isCore: true,
      dimensi: 'Keimanan & Ketakwaan',
      icon: 'fa-mountain-sun', 
      color: 'blue', 
      desc: 'Merenungi keajaiban alam sebagai bukti kebesaran Sang Pencipta.', 
      instruction: 'Tuliskan satu fenomena alam yang ingin kamu renungkan keajaibannya. AI akan membuatkan narasi refleksi spiritual khusus untukmu.',
      objective: 'Memperkuat iman dan rasa syukur melalui refleksi alam.',
      skills: ['Religius', 'Refleksi'],
      difficulty: 'Mudah',
      duration: '5 Menit',
      placeholder: 'Keajaiban Alam (misal: Terumbu Karang)' 
    },
    { 
      id: 'budaya', 
      title: 'Duta Bangsa', 
      isCore: true,
      dimensi: 'Kewargaan',
      icon: 'fa-globe-asia', 
      color: 'orange', 
      desc: 'Misi mengenal budaya dunia dan menanamkan cinta tanah air.', 
      instruction: 'Tuliskan nama negara atau daerah yang ingin kamu kunjungi secara virtual. AI akan menjadi pemandumu mengenal budayanya.',
      objective: 'Menghargai keberagaman dan kontribusi bagi masyarakat.',
      skills: ['Toleransi', 'Wawasan'],
      difficulty: 'Menengah',
      duration: '8 Menit',
      placeholder: 'Negara/Daerah (misal: Raja Ampat)' 
    },
    { 
      id: 'kritis', 
      title: 'Detektif Logika', 
      isCore: true,
      dimensi: 'Penalaran Kritis',
      icon: 'fa-microscope', 
      color: 'cyan', 
      desc: 'Pecahkan misteri dan tantangan melalui analisis berpikir logis.', 
      instruction: 'Tuliskan sebuah misteri sains atau kasus logika yang ingin kamu pecahkan. AI akan menyusun bukti-bukti untuk kamu analisis.',
      objective: 'Mampu menganalisis masalah dan mencari solusi objektif.',
      skills: ['Kritis', 'Analisis'],
      difficulty: 'Menantang',
      duration: '10 Menit',
      placeholder: 'Kasus Misteri (misal: Rahasia Magnet)' 
    },
    { 
      id: 'kreatif', 
      title: 'Studio Inovasi', 
      isCore: true,
      dimensi: 'Kreativitas',
      icon: 'fa-palette', 
      color: 'pink', 
      desc: 'Ubah ide biasa menjadi penemuan luar biasa yang bermanfaat.', 
      instruction: 'Tuliskan satu benda (misal: botol bekas) yang ingin kamu beri inovasi baru. AI akan menantangmu membuat penemuan unik.',
      objective: 'Menghasilkan gagasan orisinal dan solusi inovatif.',
      skills: ['Kreativitas', 'Inovasi'],
      difficulty: 'Mudah',
      duration: '6 Menit',
      placeholder: 'Benda di sekitarmu (misal: Kardus Bekas)' 
    },
    { 
      id: 'gotongroyong', 
      title: 'Tim Kolaborasi', 
      isCore: true,
      dimensi: 'Kolaborasi',
      icon: 'fa-hands-holding-circle', 
      color: 'teal', 
      desc: 'Bekerja sama dalam misi tim untuk mencapai tujuan bersama.', 
      instruction: 'Tuliskan satu masalah di lingkungan sekitarmu (misal: taman kotor). AI akan mensimulasikan misi kerjasama tim untuk menyelesaikannya.',
      objective: 'Membangun semangat kerjasama dan kepedulian sosial.',
      skills: ['Kerjasama', 'Empati'],
      difficulty: 'Menantang',
      duration: '10 Menit',
      placeholder: 'Masalah Sosial (misal: Taman Kotor)' 
    },
    { 
      id: 'mandiri', 
      title: 'Kapten Mandiri', 
      isCore: true,
      dimensi: 'Kemandirian',
      icon: 'fa-user-check', 
      color: 'violet', 
      desc: 'Atur strategimu sendiri dalam menghadapi hambatan belajar.', 
      instruction: 'Tuliskan satu tantangan belajar atau tanggung jawab harianmu. AI akan melatih kemandirianmu melalui simulasi strategi mandiri.',
      objective: 'Mengambil inisiatif dan bertanggung jawab atas tugas.',
      skills: ['Mandiri', 'Disiplin'],
      difficulty: 'Mudah',
      duration: '5 Menit',
      placeholder: 'Tantangan (misal: Atur Jadwal)' 
    },
    { 
      id: 'kesehatan', 
      title: 'Pahlawan Sehat', 
      isCore: true,
      dimensi: 'Kesehatan',
      icon: 'fa-heart-pulse', 
      color: 'lime', 
      desc: 'Jaga keseimbangan raga dan ketenangan jiwa untuk belajar.', 
      instruction: 'Tuliskan satu topik kesehatan (misal: gizi seimbang). AI akan mengajakmu berpetualang ke dalam tubuh manusia yang sehat.',
      objective: 'Membiasakan pola hidup sehat lahir dan batin.',
      skills: ['Kesehatan', 'Mental'],
      difficulty: 'Mudah',
      duration: '5 Menit',
      placeholder: 'Gaya Hidup (misal: Tidur Teratur)' 
    },
    { 
      id: 'bahasa', 
      title: 'Suara Efektif', 
      isCore: true,
      dimensi: 'Komunikasi',
      icon: 'fa-comment-dots', 
      color: 'indigo', 
      desc: 'Sampaikan ide dengan jelas agar dunia memahamimu.', 
      instruction: 'Tuliskan satu situasi komunikasi (misal: cara meminta maaf). AI akan melatih kesantunan dan kejelasan pesanmu dalam simulasi.',
      objective: 'Membangun relasi sehat melalui komunikasi yang baik.',
      skills: ['Komunikasi', 'Bahasa'],
      difficulty: 'Mudah',
      duration: '4 Menit',
      placeholder: 'Situasi (misal: Pidato Singkat)' 
    },
    { 
      id: 'literasi', 
      title: 'Petualangan Dunia', 
      isCore: false,
      dimensi: 'Literasi Global',
      icon: 'fa-map-marked-alt', 
      color: 'rose', 
      desc: 'Eksplorasi teks melalui narasi perjalanan virtual.', 
      instruction: 'Tuliskan nama tempat yang sangat ingin kamu kunjungi. AI akan membawamu ke sana lewat cerita naratif yang seru untuk dibaca.',
      objective: 'Meningkatkan pemahaman bacaan secara menyenangkan.',
      skills: ['Literasi', 'Geografi'],
      difficulty: 'Mudah',
      duration: '5 Menit',
      placeholder: 'Tempat Impian (misal: Menara Eiffel)' 
    },
    { 
      id: 'matematika', 
      title: 'Misi Numerasi', 
      isCore: false,
      dimensi: 'Numerasi Praktis',
      icon: 'fa-rocket', 
      color: 'sky', 
      desc: 'Gunakan angka untuk memecahkan misi teknis di luar angkasa.', 
      instruction: 'Tuliskan satu materi matematika (misal: pembagian). AI akan mengubahnya menjadi misi penyelamatan luar angaskas yang mendebarkan.',
      objective: 'Mengaplikasikan matematika dalam konteks nyata.',
      skills: ['Logika', 'Berhitung'],
      difficulty: 'Menantang',
      duration: '10 Menit',
      placeholder: 'Materi (misal: Satuan Berat)' 
    },
    { 
      id: 'sains_eksplorasi', 
      title: 'Lab Masa Depan', 
      isCore: false,
      dimensi: 'Sains & Teknologi',
      icon: 'fa-microchip', 
      color: 'amber', 
      desc: 'Bereksperimen dengan penemuan mutakhir and robotika.', 
      instruction: 'Tuliskan satu teknologi masa depan yang kamu bayangkan. AI akan membawamu ke laboratorium canggih untuk bereksperimen.',
      objective: 'Mengenal kemajuan teknologi dan inovasi masa depan.',
      skills: ['Teknologi', 'Inovasi'],
      difficulty: 'Menengah',
      duration: '7 Menit',
      placeholder: 'Teknologi (misal: Robot Penolong)' 
    },
    { 
      id: 'seni_budaya', 
      title: 'Panggung Ekspresi', 
      isCore: false,
      dimensi: 'Seni & Estetika',
      icon: 'fa-masks-theater', 
      color: 'fuchsia', 
      desc: 'Salurkan bakat senimu melalui visual, musik, and akting.', 
      instruction: 'Tuliskan satu tema karya seni. AI akan menyiapkan panggung ekspresi kreatif untuk kamu apresiasi dan ciptakan.',
      objective: 'Meningkatkan apresiasi seni dan keberanian berekspresi.',
      skills: ['Seni', 'Ekspresi'],
      difficulty: 'Mudah',
      duration: '6 Menit',
      placeholder: 'Tema Seni (misal: Lukisan Pelangi)' 
    }
  ];

  const corePillars = useMemo(() => ADVENTURE_CARDS.filter(c => c.isCore), []);
  const explorationAdventures = useMemo(() => ADVENTURE_CARDS.filter(c => !c.isCore), []);

  const isCoreFullyDone = useMemo(() => corePillars.every(c => profile.completedAdventureIds.includes(c.id)), [corePillars, profile.completedAdventureIds]);
  const isExtraFullyDone = useMemo(() => explorationAdventures.every(c => profile.completedAdventureIds.includes(c.id)), [explorationAdventures, profile.completedAdventureIds]);

  const handleStartAdventure = async (type: string) => {
    const today = new Date().toLocaleDateString();
    const hasDoneToday = profile.lastAdventureDate === today;

    if (hasDoneToday) {
      alert("⚠️ LIMIT HARIAN: Kamu sudah melakukan petualangan hari ini! Pintu portal sedang diisi ulang energinya. Kembalilah besok ya.");
      return;
    }

    const isDone = profile.completedAdventureIds.includes(type);
    const isCore = corePillars.some(c => c.id === type);
    const isExtra = explorationAdventures.some(c => c.id === type);

    if (isCore && isDone && !isCoreFullyDone) {
        alert("🌟 Dimensi ini sudah kamu selesaikan! Ayo coba Dimensi Profil Lulusan lainnya yang masih terkunci agar pengetahuanmu seimbang.");
        return;
    }
    if (isExtra && isDone && !isExtraFullyDone) {
        alert("🚀 Petualangan ini sudah kamu tuntaskan! Pilih misi akademik lainnya yang belum kamu jelajahi untuk melengkapi koleksi karyamu.");
        return;
    }

    setActiveAdventure(type);
    setAdventureInput('');
    setIsAdventureFinished(false);
  };

  const handleCloseAdventure = () => {
    setAdventureResult(null);
    setActiveAdventure(null);
    setReadTimer(0);
    setIsAdventureFinished(false);
  };

  const handleCancelGeneration = () => {
    setIsLoading(false);
    setGlobalBusy(false);
  };

  const executeAdventure = async () => {
    if (!activeAdventure) return;
    if (!adventureInput.trim()) {
        alert("Mohon masukkan topik petualanganmu!");
        return;
    }
    setIsLoading(true);
    setGlobalBusy(true);
    setAdventureResult(null);
    setIsAdventureFinished(false);
    try {
      const code = await generateAdventureContent(activeAdventure, profile, adventureInput);
      setAdventureResult(code);
      setReadTimer(0);
    } catch (err) {
      alert("Waduh! Ada gangguan di portal dimensi. Silakan coba lagi.");
    } finally {
      setIsLoading(false); 
      setGlobalBusy(false);
    }
  };

  const handleClaimReward = () => {
    if (!activeAdventure || !adventureResult || !isAdventureFinished) return;
    const today = new Date().toLocaleDateString();

    const newWork: AIWork = {
        id: Date.now().toString(),
        title: ADVENTURE_CARDS.find(c => c.id === activeAdventure)?.title || 'Karya AI',
        type: activeAdventure,
        content: adventureResult,
        date: new Date().toLocaleDateString()
    };

    const newExp = profile.exp + 50;
    let newLevel = profile.level;
    if (newExp >= profile.level * 200) {
        newLevel += 1;
    }
    
    let nextCompletedIds = [...profile.completedAdventureIds];
    if (!nextCompletedIds.includes(activeAdventure)) {
        nextCompletedIds.push(activeAdventure);
    }

    onUpdateProfile({
        ...profile,
        exp: newExp,
        level: newLevel,
        coins: profile.coins + 20,
        lastAdventureDate: today,
        completedAdventureIds: nextCompletedIds,
        dailyTasks: profile.dailyTasks.includes('adventure') ? profile.dailyTasks : [...profile.dailyTasks, 'adventure'],
        aiWorks: [newWork, ...(profile.aiWorks || [])].slice(0, 10)
    });

    handleCloseAdventure();
  };

  const toggleFullscreen = () => {
    if (adventureContainerRef.current) {
        if (!document.fullscreenElement) {
            adventureContainerRef.current.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }
  };

  const AdventureCard: React.FC<{ card: typeof ADVENTURE_CARDS[0] }> = ({ card }) => {
    const isCompleted = profile.completedAdventureIds.includes(card.id);
    const isCore = corePillars.some(c => c.id === card.id);
    const isExtra = explorationAdventures.some(c => c.id === card.id);
    const isInCycleLock = (isCore && isCompleted && !isCoreFullyDone) || (isExtra && isCompleted && !isExtraFullyDone);
    const today = new Date().toLocaleDateString();
    const hasDoneToday = profile.lastAdventureDate === today;
    
    return (
      <div className="h-full relative overflow-visible">
        <button 
          onClick={() => handleStartAdventure(card.id)}
          className={`group relative flex flex-col w-full h-full bg-white p-8 rounded-[3.5rem] border-4 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 overflow-hidden active:scale-95 text-left ${hasDoneToday || isInCycleLock ? 'grayscale border-slate-100' : `border-slate-50 hover:shadow-2xl hover:-translate-y-2 hover:border-${card.color}-200`}`}
        >
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="flex flex-col gap-1.5">
              <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.1em] bg-${card.color}-50 text-${card.color}-600 border border-${card.color}-100 w-fit`}>
                {card.dimensi}
              </div>
              {isCompleted && (
                <div className="px-3 py-1 rounded-full text-[8px] font-black uppercase bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1 w-fit tracking-wider">
                   <i className="fas fa-check-circle"></i> Selesai
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <i className="fas fa-bolt text-[9px] text-yellow-400"></i>
              <span className="text-[9px] font-bold uppercase tracking-widest">{card.duration}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${card.color}-500 text-white text-2xl shadow-lg transform group-hover:rotate-6 transition-all duration-500`}>
              <i className={`fas ${card.icon}`}></i>
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-800 Museum-Text uppercase leading-none tracking-tight">{card.title}</h4>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Selesai +20 Koin</p>
            </div>
          </div>

          <div className="flex-grow space-y-4 relative z-10 mb-6">
            <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-wide">{card.desc}</p>
            <div className={`p-4 bg-${card.color}-50/50 rounded-2xl border border-${card.color}-100/50`}>
              <span className={`text-[8px] font-black uppercase text-${card.color}-600 tracking-[0.2em] block mb-1.5`}>Misi Karakter</span>
              <p className="text-[9px] font-bold text-slate-600 leading-tight italic">"{card.objective}"</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-50 relative z-10">
            {card.skills.map(skill => (
              <span key={skill} className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[7px] font-black uppercase tracking-wider">
                #{skill}
              </span>
            ))}
          </div>
          
          {(hasDoneToday || isInCycleLock) && (
              <div className="absolute inset-0 bg-slate-100/40 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                   <div className="w-14 h-14 bg-white rounded-3xl flex items-center justify-center shadow-2xl mb-4 border-2 border-slate-100">
                      <i className={`fas ${isInCycleLock ? 'fa-lock text-amber-400' : 'fa-battery-empty text-slate-300'} text-2xl`}></i>
                   </div>
                   <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] px-4 leading-relaxed">
                      {isInCycleLock ? 'Selesaikan Misi Lain Dulu' : 'Energi Petualang Habis'}
                   </p>
                   {isInCycleLock && <span className="text-[7px] font-black text-amber-600 uppercase mt-2 tracking-widest bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">Fokus Keseimbangan</span>}
              </div>
          )}

          <div className={`absolute -right-6 -bottom-6 w-32 h-32 bg-${card.color}-50 rounded-full opacity-50 group-hover:scale-110 transition-all duration-700 pointer-events-none`}></div>
        </button>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in duration-700">
      {!activeAdventure ? (
        <div className="space-y-12">
          <div>
            <div className="flex items-center gap-4 mb-6">
               <div className="h-8 w-2 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/20"></div>
               <h3 className="text-xl font-black text-indigo-900 Museum-Text uppercase tracking-tight">Eksplorasi 8 Dimensi Profil Lulusan</h3>
               <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-auto">Progres: {profile.completedAdventureIds.filter(id => corePillars.some(c => c.id === id)).length} / 8</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
              {corePillars.map(card => (
                <AdventureCard key={card.id} card={card} />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-4 mb-6">
               <div className="h-8 w-2 bg-rose-500 rounded-full shadow-lg shadow-rose-500/20"></div>
               <h3 className="text-xl font-black text-rose-900 Museum-Text uppercase tracking-tight">Eksplorasi Akademik Tambahan</h3>
               <span className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] ml-auto">Progres: {profile.completedAdventureIds.filter(id => explorationAdventures.some(c => c.id === id)).length} / 4</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
              {explorationAdventures.map(card => (
                <AdventureCard key={card.id} card={card} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        !adventureResult && (
          <div className="animate-in slide-in-from-bottom-8 duration-500">
             <div className="max-w-3xl mx-auto bg-white rounded-[3.5rem] p-10 md:p-14 shadow-2xl border-4 border-blue-100 relative">
                <button onClick={() => { setActiveAdventure(null); setAdventureResult(null); }} className="absolute top-8 right-8 text-slate-300 hover:text-red-500 transition-all active:scale-90 z-30"><i className="fas fa-times-circle text-3xl"></i></button>
                
                {(() => {
                  const card = ADVENTURE_CARDS.find(c => c.id === activeAdventure);
                  return (
                    <div className="relative z-10">
                      <div className="flex items-center gap-6 mb-10">
                        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-white text-2xl shadow-xl bg-${card?.color}-500 shrink-0`}>
                            <i className={`fas ${card?.icon}`}></i>
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-blue-900 Museum-Text uppercase leading-none tracking-tight">{card?.title}</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">{card?.dimensi}</p>
                        </div>
                      </div>

                      <div className={`mb-10 p-6 bg-${card?.color}-50 border-2 border-${card?.color}-100 rounded-3xl animate-in fade-in slide-in-from-top-4 duration-700 shadow-inner`}>
                         <h4 className={`text-[10px] font-black uppercase text-${card?.color}-600 mb-3 tracking-[0.2em] flex items-center gap-2`}>
                            <i className="fas fa-lightbulb"></i> Panduan Langkah Misi
                         </h4>
                         <p className="text-[10px] font-bold text-slate-700 uppercase leading-relaxed italic">
                            {card?.instruction}
                         </p>
                      </div>

                      <div className="space-y-6">
                        <div className="relative">
                            <input 
                              value={adventureInput} 
                              onChange={e => setAdventureInput(e.target.value)}
                              className="w-full input-futuristic px-8 py-5 text-lg font-bold text-blue-600 focus:ring-8 focus:ring-blue-500/10 transition-all outline-none border-2 border-slate-100 shadow-inner" 
                              placeholder={card?.placeholder} 
                              autoFocus
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20">
                                <i className="fas fa-keyboard text-xl"></i>
                            </div>
                        </div>
                        <button 
                          onClick={executeAdventure}
                          disabled={isLoading}
                          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-sm tracking-[0.2em] shadow-xl shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                        >
                          {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-wand-magic-sparkles"></i>}
                          {isLoading ? 'Membuka Portal...' : 'Jalankan Misi Dimensi'}
                        </button>
                      </div>
                    </div>
                  );
                })()}
             </div>
          </div>
        )
      )}

      <BlockingOverlay isVisible={isLoading} text="Sedang Merakit Petualangan..." onCancel={handleCancelGeneration} isUnlocked={isUnlocked} />

      {/* OVERLAY HASIL PETUALANGAN DENGAN BINGKAI STANDAR */}
      {adventureResult && (
        <div ref={adventureContainerRef} className="fixed inset-0 z-[7000] bg-slate-900 flex flex-col h-screen overflow-hidden animate-in zoom-in duration-300">
            {/* Header Bingkai */}
            <div className="bg-indigo-900 p-3 md:p-4 border-b-2 border-indigo-400 flex justify-between items-center z-10 shadow-lg shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white border border-indigo-300 shadow-md">
                        <i className="fas fa-mountain-sun text-xl animate-pulse"></i>
                    </div>
                    <div>
                        <h3 className="text-white font-black uppercase text-xs md:text-sm Museum-Text leading-none">Petualangan Aktif</h3>
                        <p className="text-[8px] md:text-[9px] text-indigo-300 font-bold uppercase tracking-widest mt-1">Eksplorasi Dimensi Profil Lulusan</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={toggleFullscreen} className="bg-white/10 hover:bg-indigo-700 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-xl transition-all font-black text-[9px] uppercase border border-white/20">
                        <i className="fas fa-expand mr-1.5"></i> Layar Penuh
                    </button>
                    <button onClick={() => { if(confirm("Tutup petualangan tanpa mengambil hadiah?")) handleCloseAdventure(); }} className="bg-red-500/20 hover:bg-red-600 text-red-100 px-3 md:px-4 py-1.5 md:py-2 rounded-xl transition-all font-black text-[9px] uppercase border border-red-400/30">
                        <i className="fas fa-times mr-1.5"></i> Tutup
                    </button>
                </div>
            </div>

            {/* Body Bingkai (Konten) */}
            <div className="flex-grow w-full relative bg-slate-50 overflow-hidden">
                <iframe 
                    ref={iframeRef}
                    srcDoc={sanitizeGeneratedCode(adventureResult || "")}
                    className="absolute inset-0 w-full h-full border-none shadow-inner"
                    title="Adventure Content"
                    sandbox="allow-scripts allow-popups allow-forms"
                />
            </div>

            {/* Footer Bingkai (Area Klaim Hadiah) */}
            <div className="bg-white p-3 md:p-5 border-t-2 border-slate-100 flex flex-col md:flex-row items-center justify-center gap-4 shrink-0">
                {isAdventureFinished ? (
                    <div className="animate-in slide-in-from-bottom-2 duration-500 flex flex-col items-center">
                        <button 
                            onClick={handleClaimReward}
                            disabled={readTimer > 0}
                            className={`px-8 md:px-12 py-3 md:py-3.5 rounded-full font-black uppercase text-[10px] md:text-[11px] tracking-widest shadow-2xl transition-all flex items-center gap-3 md:gap-4 active:scale-95 ${readTimer > 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed grayscale' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/30 animate-bounce'}`}
                        >
                            {readTimer > 0 ? (
                                <><i className="fas fa-clock fa-spin"></i> Memproses Misi ({readTimer}s)</>
                            ) : (
                                <><i className="fas fa-check-circle text-base"></i> Ambil Hadiah Petualang</>
                            )}
                        </button>
                        {readTimer === 0 && <p className="text-[8px] font-black text-emerald-500 uppercase mt-2 tracking-widest animate-pulse">Selesaikan Sekarang Untuk +20 Koin & +50 EXP!</p>}
                    </div>
                ) : (
                    <div className="flex items-center gap-4 px-6 py-3 bg-blue-50 border-2 border-blue-100 rounded-2xl animate-pulse">
                        <i className="fas fa-scroll text-blue-600"></i>
                        <span className="text-[9px] md:text-[10px] font-black text-blue-700 uppercase tracking-widest">Selesaikan seluruh narasi petualangan untuk membuka tombol hadiah!</span>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default PetualanganPortal;
