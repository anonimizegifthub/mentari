
import React, { useState, useEffect, useRef } from 'react';
import { AVATARS, SHOP_ITEMS } from '../constants';
import { Toast as ToastType } from '../types';

const HEADER_LOGO_URL = "https://i.ibb.co.com/fz5db4TZ/Gemini_Generated_Image_hjaq8uhjaq8uhjaq.png";

export const AvatarCircle: React.FC<{ avatarId: string, size?: string, animationClass?: string }> = ({ avatarId, size = 'w-16 h-16', animationClass = '' }) => {
  const avatar = AVATARS.find(a => a.id === avatarId) || SHOP_ITEMS.find(a => a.id === avatarId) || AVATARS[0];
  const bgClass = 'bg' in avatar ? (avatar as any).bg : 'bg-slate-100';
  
  return (
    <div className={`${size} rounded-full ${bgClass} border-4 border-white shadow-xl flex items-center justify-center relative group transition-all duration-500 hover:scale-110 ${animationClass} ring-4 ring-slate-100/50`}>
      <i className={`fas ${avatar.icon} ${avatar.color} ${size.includes('w-10') ? 'text-xl' : size.includes('w-12') ? 'text-2xl' : 'text-5xl'}`}></i>
    </div>
  );
};

export const ProRequirementNotice: React.FC<{ 
  isOpen: boolean, 
  onClose: () => void, 
  featureName: string,
  benefitDesc: string,
  title?: string,
  deviceId?: string,
  onShareBonus?: () => void,
  canClaimBonus?: boolean
}> = ({ isOpen, onClose, featureName, benefitDesc, title, deviceId, onShareBonus, canClaimBonus = false }) => {
  const [shareStep, setShareStep] = useState<'initial' | 'selecting' | 'waiting' | 'verifying'>('initial');
  const blurTimeRef = useRef<number | null>(null);
  const MINIMUM_ENGAGEMENT_TIME = 8000; // 8 Detik

  useEffect(() => {
    const handleWindowFocus = () => {
      if (shareStep === 'waiting' && blurTimeRef.current !== null) {
        const now = Date.now();
        const timeSpentAway = now - blurTimeRef.current;
        
        setShareStep('verifying');
        
        setTimeout(() => {
          if (timeSpentAway >= MINIMUM_ENGAGEMENT_TIME) {
            if (onShareBonus) {
              onShareBonus();
              setShareStep('initial');
              blurTimeRef.current = null;
            }
          } else {
            alert("⚠️ VERIFIKASI GAGAL!\n\nSistem mendeteksi Anda kembali terlalu cepat. Mohon bagikan pesan ke media sosial dan tunggu beberapa saat sampai proses pengiriman selesai sebelum kembali ke Mentari.");
            setShareStep('initial');
            blurTimeRef.current = null;
          }
        }, 1200);
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [shareStep, onShareBonus]);

  if (!isOpen) return null;

  const shareData = {
    title: 'Mentari AI - Ekosistem Digital Guru GRATIS',
    text: 'Bapak/Ibu Guru, coba aplikasi MENTARI AI ini! GRATIS & lengkap, ada banyak generator cerdas: Modul Ajar, Bank Soal, Gim Edukasi, dan Lab Maya. Yuk cobain di: ',
    url: window.location.origin
  };

  const handleWhatsAppActivation = () => {
    const message = encodeURIComponent(`Halo Admin Mentari,\n\n Saya ingin aktivasi LISENSI GURU PRO untuk membuka akses penuh ke seluruh fitur premium di perangkat saya.\n\n📱 Hardware ID: ${deviceId || 'Tidak Terdeteksi'}\n\nMohon informasi langkah aktivasinya. Terima kasih.`);
    window.open(`https://wa.me/6285755332389?text=${message}`, '_blank');
  };

  const openShareWindow = (platform: 'wa' | 'fb' | 'tw') => {
    let url = '';
    const fullText = `${shareData.text} ${shareData.url}`;

    if (platform === 'wa') {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullText)}`;
    } else if (platform === 'fb') {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}&quote=${encodeURIComponent(shareData.text)}`;
    } else if (platform === 'tw') {
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`;
    }

    blurTimeRef.current = Date.now();
    setShareStep('waiting');

    const width = 600;
    const height = 700;
    const left = (window.innerWidth / 2) - (width / 2);
    const top = (window.innerHeight / 2) - (height / 2);
    
    window.open(
      url, 
      'MentariShare', 
      `width=${width},height=${height},top=${top},left=${left},menubar=no,toolbar=no,location=no,status=no`
    );
  };

  const handleShareTrigger = async () => {
    if (navigator.share && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      try {
        blurTimeRef.current = Date.now();
        await navigator.share(shareData);
        setShareStep('waiting');
      } catch (err) {
        setShareStep('initial');
      }
    } else {
      setShareStep('selecting');
    }
  };

  return (
    <div className="fixed inset-0 z-[150000] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-10 shadow-2xl max-w-lg w-full border-b-8 border-blue-600 relative overflow-hidden">
        <button onClick={onClose} className="absolute top-6 md:top-8 right-6 md:right-8 text-slate-400 hover:text-red-500 transition-all z-10"><i className="fas fa-times-circle text-2xl"></i></button>
        
        {/* Background Decorative Confetti if bonus can be claimed */}
        {canClaimBonus && (
           <div className="absolute inset-0 pointer-events-none opacity-10">
             {Array.from({length: 10}).map((_, i) => (
                <div key={i} className="absolute w-2 h-2 rounded-full animate-bounce" style={{left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, backgroundColor: ['#3b82f6', '#10b981', '#fbbf24'][i%3], animationDelay: `${i*0.2}s`}}></div>
             ))}
           </div>
        )}

        <div className="text-center relative z-10">
           <div className={`w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center text-white text-3xl md:text-4xl mb-6 md:mb-8 mx-auto shadow-2xl ring-8 transition-all duration-700 ${canClaimBonus ? 'bg-gradient-to-br from-blue-500 to-indigo-600 ring-blue-50 rotate-3' : 'bg-gradient-to-br from-amber-400 to-yellow-600 ring-amber-50 floating'}`}>
              <i className={`fas ${canClaimBonus ? 'fa-gift' : 'fa-crown'}`}></i>
           </div>
           
           <h3 className="text-2xl md:text-3xl font-black Museum-Text uppercase text-slate-800 mb-2 tracking-tight">
             {canClaimBonus ? 'Kabar Gembira!' : (title || 'Limit Harian Tercapai')}
           </h3>
           <p className={`text-[10px] font-black uppercase tracking-[0.4em] mb-6 md:mb-8 ${canClaimBonus ? 'text-blue-600 animate-pulse' : 'text-amber-600'}`}>
              {canClaimBonus ? 'Satu Kesempatan Tambahan Menantimu' : 'Lisensi Perangkat Belum Aktif'}
           </p>
           
           <div className={`p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] text-left border-2 mb-6 md:mb-8 transition-all ${canClaimBonus ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100'}`}>
              <h4 className="text-[10px] md:text-xs font-black uppercase text-slate-700 flex items-center gap-2 mb-2">
                <i className={`fas ${canClaimBonus ? 'fa-star text-yellow-500' : 'fa-circle-check text-emerald-500'}`}></i> 
                {canClaimBonus ? 'Jatah Harian Penuh, TAPI...' : featureName}
              </h4>
              <p className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase leading-relaxed">
                {canClaimBonus 
                  ? 'Bapak/Ibu masih bisa membuat 1 karya lagi hari ini GRATIS! Cukup bagikan aplikasi Mentari ke rekan guru atau grup WA pendidikan lainnya.' 
                  : benefitDesc}
              </p>
           </div>
           
           <div className="space-y-3 md:space-y-4">
              {canClaimBonus && (
                <div className="space-y-3">
                  {shareStep === 'initial' && (
                    <button 
                      onClick={handleShareTrigger} 
                      className="w-full py-4 md:py-5 bg-blue-600 border-blue-800 text-white rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 border-b-4 shadow-blue-500/20 hover:bg-blue-700"
                    >
                      <i className="fas fa-share-nodes text-xl"></i> BAGIKAN & DAPAT +1 AKSES
                    </button>
                  )}

                  {shareStep === 'selecting' && (
                    <div className="grid grid-cols-3 gap-3 animate-in zoom-in duration-300">
                      <button onClick={() => openShareWindow('wa')} className="py-4 bg-emerald-500 text-white rounded-2xl flex flex-col items-center gap-1 shadow-lg hover:bg-emerald-600 active:scale-95 transition-all">
                        <i className="fab fa-whatsapp text-2xl"></i>
                        <span className="text-[8px] font-black uppercase">WhatsApp</span>
                      </button>
                      <button onClick={() => openShareWindow('fb')} className="py-4 bg-blue-700 text-white rounded-2xl flex flex-col items-center gap-1 shadow-lg hover:bg-blue-800 active:scale-95 transition-all">
                        <i className="fab fa-facebook text-2xl"></i>
                        <span className="text-[8px] font-black uppercase">Facebook</span>
                      </button>
                      <button onClick={() => openShareWindow('tw')} className="py-4 bg-slate-900 text-white rounded-2xl flex flex-col items-center gap-1 shadow-lg hover:bg-black active:scale-95 transition-all">
                        <i className="fab fa-twitter text-2xl"></i>
                        <span className="text-[8px] font-black uppercase">Twitter</span>
                      </button>
                    </div>
                  )}

                  {shareStep === 'waiting' && (
                    <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-[2rem] animate-pulse">
                      <div className="flex items-center justify-center gap-3 mb-3">
                        <i className="fas fa-spinner fa-spin text-blue-600 text-xl"></i>
                        <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Menunggu Anda Kembali...</span>
                      </div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed text-center italic">Jangan tutup jendela share terlalu cepat agar validasi berhasil.</p>
                    </div>
                  )}

                  {shareStep === 'verifying' && (
                    <div className="p-6 bg-emerald-50 border-2 border-emerald-200 rounded-[2rem] text-center">
                       <div className="flex items-center justify-center gap-3 mb-2 text-emerald-600">
                          <i className="fas fa-shield-halved animate-bounce"></i>
                          <span className="text-[11px] font-black uppercase tracking-widest">Memvalidasi Share...</span>
                       </div>
                       <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-4">
                          <div className="h-full bg-emerald-50 animate-[loading_1s_linear_infinite]" style={{width: '60%'}}></div>
                       </div>
                    </div>
                  )}
                </div>
              )}
              
              <button onClick={handleWhatsAppActivation} className={`w-full py-4 md:py-5 text-white rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${canClaimBonus ? 'bg-slate-900 shadow-slate-100 hover:bg-black' : 'bg-emerald-600 shadow-emerald-500/30 hover:bg-emerald-700'}`}>
                {canClaimBonus ? <i className="fas fa-crown text-yellow-400"></i> : <i className="fab fa-whatsapp text-xl"></i>}
                {canClaimBonus ? 'AKTIVASI PRO UNTUK UNLIMITED' : 'AKTIVASI GURU PRO'}
              </button>
              <button onClick={onClose} className="w-full py-3 md:py-4 text-slate-400 font-black uppercase text-[9px] md:text-[10px] tracking-widest hover:text-slate-600">Nanti Saja</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export const KindnessBottle: React.FC<{ 
  count: number, 
  lastDate?: string, 
  pendingStatus?: boolean, 
  countToday?: number, 
  onAdd: (msg: string) => void,
  onClaimReward?: () => void 
}> = ({ count, lastDate, pendingStatus = false, countToday = 0, onAdd, onClaimReward }) => {
  const [msg, setMsg] = useState('');
  const isLimitReached = countToday >= 2;
  const isFull = count >= 20;
  const isDisabled = isLimitReached || pendingStatus;
  const fillLevel = Math.min(count * 5, 100);

  return (
    <div className="glass-card rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-10 flex flex-col lg:flex-row items-center gap-8 md:gap-12 overflow-hidden relative group border-4 border-white/50">
       {isFull && <div className="absolute inset-0 bg-yellow-400/5 animate-pulse pointer-events-none"></div>}
       
       <div className="relative w-24 h-36 md:w-32 md:h-48 shrink-0">
          <div className={`absolute inset-0 bg-slate-50 border-4 ${isFull ? 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.5)]' : 'border-slate-200'} rounded-b-[2rem] md:rounded-b-[3rem] rounded-t-xl md:rounded-t-2xl overflow-hidden shadow-inner ring-4 ring-slate-100 transition-all duration-500`}>
             <div className={`absolute bottom-0 left-0 right-0 ${isFull ? 'bg-gradient-to-t from-amber-500 to-yellow-300' : 'bg-gradient-to-t from-blue-400 to-cyan-300'} transition-all duration-1000 shadow-[0_0_30px_rgba(34,211,238,0.4)]`} style={{ height: `${fillLevel}%` }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="absolute w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ left: `${Math.random() * 80}%`, bottom: `${Math.random() * 90}%`, opacity: 0.5 }}></div>
                ))}
             </div>
          </div>
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 -mt-4 w-10 md:w-12 h-5 md:h-6 ${isFull ? 'bg-amber-300 border-amber-400' : 'bg-slate-200 border-slate-300'} rounded-full border-2 transition-colors`}></div>
       </div>

       <div className="flex-grow space-y-4 md:space-y-6 w-full text-center lg:text-left z-10">
          <div>
            <h4 className={`text-xl md:text-2xl font-black ${isFull ? 'text-amber-600' : 'text-blue-900'} Museum-Text uppercase tracking-tight transition-colors`}>
              {isFull ? 'Botol Kebaikan Penuh!' : 'Botol Kebaikan'}
            </h4>
            <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {isFull ? 'Lencana Kebaikanmu Telah Sempurna' : 'Lapor Aktivitas Positif & Dapatkan 10 Koin'}
            </p>
          </div>

          {isFull ? (
            <div className="animate-in zoom-in duration-500">
               <button 
                onClick={() => onClaimReward && onClaimReward()}
                className="w-full py-5 md:py-6 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-white rounded-[2rem] font-black uppercase text-sm md:text-base tracking-[0.2em] shadow-2xl shadow-amber-400/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 group"
               >
                  <i className="fas fa-crown text-2xl group-hover:rotate-12 transition-transform"></i>
                  KLAIM HADIAH 500 EXP & 500 KOIN
               </button>
               <p className="text-center lg:text-left text-[9px] font-black text-amber-500 uppercase mt-3 tracking-widest animate-pulse">
                  <i className="fas fa-sparkles mr-2"></i> Hadiah Spesial untuk Anak Baik!
               </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-3">
                 <input value={msg} onChange={e => setMsg(e.target.value)} disabled={isDisabled} className="flex-grow input-futuristic px-5 md:px-6 py-3 md:py-4 text-xs md:text-sm disabled:opacity-50" placeholder={isLimitReached ? "Limit harian tercapai..." : pendingStatus ? "Menunggu validasi guru..." : "Aku membantu menyapu kelas..."} />
                 <button onClick={() => { if(msg.trim() && !isDisabled) { onAdd(msg); setMsg(''); } }} disabled={isDisabled || !msg.trim()} className="px-8 md:px-10 py-3 md:py-0 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] md:text-[11px] shadow-xl shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-30">KIRIM</button>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-3">
                 <div className="px-4 py-1.5 bg-blue-50 rounded-full border border-blue-100">
                    <span className="text-[8px] md:text-[10px] font-black text-blue-600 uppercase tracking-widest">TERKUMPUL: {count} / 20 CAHAYA</span>
                 </div>
                 <span className="text-[8px] md:text-[9px] font-bold text-slate-300 uppercase tracking-widest">Sisa Kuota: {2-countToday}/2</span>
              </div>
            </>
          )}
       </div>
    </div>
  );
};

export const ToastContainer: React.FC<{ toasts: ToastType[], onRemove: (id: string) => void }> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-24 right-4 md:right-8 z-[100000] flex flex-col gap-4 pointer-events-none w-full max-w-[calc(100%-2rem)] md:max-w-md">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-3 md:gap-4 p-4 md:p-5 pr-6 md:pr-8 rounded-2xl shadow-2xl border-2 text-white animate-in slide-in-from-right-8 duration-300 pointer-events-auto ${t.type === 'success' ? 'bg-emerald-500 border-emerald-400' : t.type === 'error' ? 'bg-red-500 border-red-400' : 'bg-blue-600 border-blue-400'}`}>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/20 flex items-center justify-center text-lg md:text-xl shrink-0"><i className={`fas ${t.type === 'success' ? 'fa-circle-check' : t.type === 'error' ? 'fa-circle-xmark' : 'fa-circle-info'}`}></i></div>
          <p className="text-[10px] md:text-[11px] font-black uppercase Museum-Text tracking-wide flex-grow">{t.message}</p>
          <button onClick={() => onRemove(t.id)} className="ml-2 opacity-50 hover:opacity-100 transition-opacity"><i className="fas fa-times"></i></button>
        </div>
      ))}
    </div>
  );
};

export const AssemblyLoader: React.FC<{ isPremium?: boolean, text?: string }> = ({ isPremium = false, text }) => {
  return (
    <div className={`h-full min-h-[400px] md:min-h-[500px] glass-card rounded-[2rem] md:rounded-[3.5rem] p-10 md:p-20 flex flex-col items-center justify-center text-center overflow-hidden relative border-4 transition-all duration-700 ${isPremium ? 'border-blue-500 bg-blue-50/10 shadow-[0_0_30px_rgba(59,130,246,0.2)]' : 'border-yellow-400 bg-white'}`}>
      {isPremium && <div className="cyber-grid-overlay opacity-10"></div>}
      <div className="relative mb-8 md:mb-12">
        <div className={`w-24 h-24 md:w-32 md:h-32 rounded-3xl flex items-center justify-center text-3xl md:text-4xl floating shadow-2xl border-2 border-white transition-all duration-700 ${isPremium ? 'bg-blue-600 text-white shadow-blue-500/40' : 'bg-blue-50 text-blue-600'}`}>
          <i className={`fas ${isPremium ? 'fa-atom animate-spin-slow' : 'fa-microchip'}`}></i>
        </div>
        <div className={`absolute -inset-6 md:-inset-8 rounded-full border-4 border-dashed animate-spin-slow transition-colors duration-700 ${isPremium ? 'border-blue-300 opacity-40' : 'border-blue-100'}`}></div>
      </div>
      <p className={`text-lg md:text-xl font-black Museum-Text uppercase tracking-tight animate-pulse transition-colors duration-700 ${isPremium ? 'text-blue-600' : 'text-slate-800'}`}>{text || (isPremium ? "NEURAL ENGINE ASSEMBLY..." : "Merespons Instruksi Anda...")}</p>
      <div className={`mt-6 md:mt-8 w-40 md:w-48 h-2 rounded-full overflow-hidden border bg-slate-100 shadow-inner`}>
        <div className={`h-full rounded-full animate-[loading_2s_ease-in-out_infinite] ${isPremium ? 'bg-gradient-to-r from-blue-400 to-indigo-600 shadow-[0_0_10px_rgba(59,130,246,0.8)]' : 'bg-blue-600'}`}></div>
      </div>
    </div>
  );
};

export const BlockingOverlay: React.FC<{ isVisible: boolean, text?: string, onCancel?: () => void, isUnlocked?: boolean }> = ({ isVisible, text, onCancel, isUnlocked = false }) => {
  if (!isVisible) return null;

  if (isUnlocked) {
    return (
      <div className="fixed inset-0 z-[999999] w-screen h-screen bg-slate-950/80 backdrop-blur-[40px] flex items-center justify-center p-4 animate-in fade-in duration-500">
        <div className="cyber-grid-overlay opacity-30"></div>
        <div className="header-scanning-light opacity-50"></div>
        
        <div className="relative w-full max-w-2xl text-center animate-in zoom-in-95 duration-700">
           <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-12">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 shadow-[inset_0_0_50px_rgba(59,130,246,0.5)]"></div>
              <div className="absolute inset-0 rounded-full border-t-4 border-blue-400 animate-spin-slow"></div>
              <img src={HEADER_LOGO_URL} alt="Loading" className="w-full h-full object-contain logo-pro" />
           </div>

           <div className="space-y-4 mb-16">
              <h3 className="text-2xl md:text-4xl font-black Museum-Text uppercase text-white tracking-widest effect-glitch-text drop-shadow-[0_0_20px_rgba(59,130,246,0.8)]">
                {text || "NEURAL GENERATION ACTIVE"}
              </h3>
              <p className="text-[10px] md:text-xs font-black text-blue-400 uppercase tracking-[0.6em] animate-pulse">
                Establishing Quantum Bridge • Gemini Neural Link v3.0
              </p>
           </div>

           <div className="w-full max-w-md mx-auto h-1 bg-slate-800 rounded-full overflow-hidden mb-16 relative">
              <div className="h-full bg-gradient-to-r from-blue-600 via-white to-blue-600 shadow-[0_0_30px_rgba(59,130,246,1)] animate-loading"></div>
           </div>

           {onCancel && (
             <button 
                onClick={onCancel} 
                className="group px-12 py-5 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded-2xl font-black uppercase text-[10px] tracking-[0.4em] transition-all border border-white/10 hover:border-red-500/40 active:scale-95 flex items-center justify-center gap-4 mx-auto"
             >
                <i className="fas fa-power-off text-sm group-hover:animate-pulse"></i>
                TERMINATE NEURAL BRIDGE
             </button>
           )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[999999] w-screen h-screen bg-slate-950/70 backdrop-blur-[60px] flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="text-center max-w-sm w-full animate-in zoom-in-95 relative z-10">
        <div className="relative w-28 h-28 md:w-36 md:h-36 mx-auto mb-10">
           <div className="absolute inset-0 rounded-full border-8 border-white/5 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] shadow-inner"></div>
           <div className="absolute inset-0 rounded-full border-t-8 border-blue-500 animate-spin"></div>
           <div className="absolute inset-0 flex items-center justify-center">
              <img src={HEADER_LOGO_URL} alt="Mentari" className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
           </div>
        </div>
        <h3 className="text-xl md:text-2xl font-black Museum-Text uppercase text-white mb-2 tracking-wide">{text || "Mohon Tunggu..."}</h3>
        <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-12 italic">Portal Digital Mentari Sedang Bekerja.</p>
        {onCancel && (
          <button 
            onClick={onCancel} 
            className="w-full py-4 bg-white/5 text-white/60 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all border border-white/10 active:scale-95"
          >
            Hentikan Proses
          </button>
        )}
      </div>
    </div>
  );
};

export const AIImage: React.FC<{ prompt: string }> = ({ prompt }) => { return null; };
