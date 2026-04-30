
import React, { useState, useRef, useEffect } from 'react';
import { TeacherSettings } from '../types';
import NeuralTypewriter from './NeuralTypewriter';

interface AppHeaderProps {
    isUnlocked: boolean;
    isScrolled: boolean;
    headerIsVisible: boolean;
    activeTab: string;
    cycleIndex: number;
    teacherSettings: TeacherSettings;
    currentTabInfo: any;
    userRole: 'student' | 'teacher' | null;
    setActiveTab: (tab: any) => void;
    onLogout: () => void;
    logoUrl: string;
    toggleSidebar: () => void;
    isSidebarOpen: boolean;
    gasUrl?: string;
    onOpenTutorial?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
    isUnlocked,
    isScrolled,
    headerIsVisible,
    activeTab,
    cycleIndex,
    teacherSettings,
    currentTabInfo,
    userRole,
    setActiveTab,
    onLogout,
    logoUrl,
    toggleSidebar,
    isSidebarOpen,
    gasUrl,
    onOpenTutorial
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleShareClass = async () => {
        if (!gasUrl) {
            alert("Harap atur Link Spreadsheet di Panel Guru terlebih dahulu!");
            return;
        }

        const origin = window.location.origin;
        const isDev = origin.includes('ais-dev-') || origin.includes('localhost') || origin.includes('web-preview');
        
        const baseUrl = origin + window.location.pathname;
        const shareLink = `${baseUrl}?gas=${encodeURIComponent(btoa(gasUrl))}`;
        
        if (isDev) {
            const confirmDev = window.confirm(
                "PERINGATAN: Anda sedang berada di mode 'Preview Developer'.\n" +
                "Link yang dihasilkan mungkin meminta login Google/Vercel jika dibagikan ke siswa.\n\n" +
                "Sangat disarankan untuk membuka aplikasi melalui 'Shared App URL' yang tersedia di AI Studio sebelum menyalin link kelas untuk siswa.\n\n" +
                "Lanjutkan menyalin link saat ini?"
            );
            if (!confirmDev) return;
        }
        
        const shareData = {
            title: 'Akses Kelas Mentari',
            text: `Ayo login ke ${teacherSettings.className || 'Kelas Kita'} di ${teacherSettings.schoolName || 'Sekolah Kita'}! Klik link ini untuk masuk ke portal belajar digital kita:`,
            url: shareLink
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                alert("LINK KELAS BERHASIL DISALIN!\n\nKirimkan link ini ke grup WA Siswa agar mereka bisa login tanpa mengisi link server.");
            }
        } catch (err) {
            console.error("Gagal berbagi", err);
        }
    };

    const actionMenuItems: { label: string; icon: string; color: string; action: () => void | Promise<void>; show: boolean }[] = [
        {
            label: 'Bagikan Kelas',
            icon: 'fa-link',
            color: 'text-amber-500',
            action: handleShareClass,
            show: userRole === 'teacher' && !!gasUrl
        },
        {
            label: 'Panduan Sistem',
            icon: 'fa-book-bookmark',
            color: 'text-indigo-500',
            action: onOpenTutorial || (() => {}),
            show: userRole === 'teacher' && !!onOpenTutorial
        },
        {
            label: 'Komunitas WA',
            icon: 'fa-whatsapp',
            color: 'text-emerald-500',
            action: () => { window.open('https://chat.whatsapp.com/IrqmBoWVhsm5LgwLt0zVPq', '_blank'); },
            show: true
        },
        {
            label: 'Hubungi Admin',
            icon: 'fa-headset',
            color: 'text-indigo-400',
            action: () => { window.open('https://wa.me/6285755332389?text=Halo%20Admin%20Mentari,%20saya%20membutuhkan%20bantuan%20terkait%20aplikasi.', '_blank'); },
            show: true
        },
        {
            label: 'Bagikan Apps',
            icon: 'fa-share-nodes',
            color: 'text-blue-500',
            action: async () => {
                const shareData = {
                    title: 'Mentari AI - Ekosistem Digital Guru GRATIS',
                    text: 'Bapak/Ibu Guru, coba aplikasi MENTARI AI ini! GRATIS & lengkap, ada banyak generator cerdas: Modul Ajar, Bank Soal, Gim Edukasi, dan Lab Maya. Yuk cobain di: ',
                    url: window.location.origin
                };
                try {
                    if (navigator.share) { await navigator.share(shareData); } 
                    else { await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`); alert("Link & Teks Berbagi disalin!"); }
                } catch (e) {}
            },
            show: true
        }
    ];

    return (
        <header className={`fixed top-0 left-0 right-0 z-[5000] no-print transition-all duration-500 transform ${isUnlocked ? 'epic-dark-blue-header' : 'simple-basic-header'} ${isScrolled ? 'py-1 shadow-2xl' : 'py-3 shadow-xl'} ${!headerIsVisible ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
            {isUnlocked && <div className="cyber-grid-overlay"></div>} 
            {isUnlocked && <div className="header-scanning-light"></div>}
            
            <div className="max-w-full mx-auto px-4 md:px-8 flex flex-col relative z-10 transition-all duration-700 min-h-[50px]">
                <div className={`flex items-center justify-between w-full h-14 md:h-16`}>
                    <div className="flex items-center gap-4 md:gap-6 flex-grow overflow-hidden">
                        
                        <button 
                            onClick={toggleSidebar}
                            className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-lg shrink-0 ${isUnlocked ? 'bg-blue-600/20 text-white border border-blue-500/30' : 'bg-white text-blue-600'}`}
                        >
                            <i className={`fas ${isSidebarOpen ? 'fa-xmark' : 'fa-bars-staggered'} text-lg`}></i>
                        </button>

                        <div className="shrink-0 hidden sm:block">
                           <img src={logoUrl} alt="Logo" className={isUnlocked ? 'logo-pro' : 'logo-basic'} />
                        </div>

                        <div className={`pro-title-wrapper flex flex-col items-start transition-all duration-700 overflow-hidden`}> 
                            {isUnlocked && ( <div className="pro-digital-line pro-line-top"></div> )} 
                            
                            <div className="relative h-14 flex items-center justify-start px-2 w-full overflow-hidden transition-all duration-700">
                                {activeTab === 'beranda' ? (
                                    <div key="title-beranda" className="flex flex-col items-start animate-in fade-in slide-in-from-left-2 zoom-in-95 effect-digital-glitch duration-500">
                                        <h1 className={`text-sm md:text-lg lg:text-xl font-black uppercase Museum-Text leading-none text-left tracking-tight ${isUnlocked ? 'text-yellow-400' : 'text-yellow-300'}`}> 
                                            {(teacherSettings.className || 'RUANG KELAS')} 
                                        </h1>
                                        
                                        <div className="flex items-center gap-2 mt-1 md:mt-1.5 overflow-hidden">
                                            <p className={`text-[7px] md:text-[10px] font-bold uppercase tracking-widest text-left whitespace-nowrap ${isUnlocked ? 'text-white' : 'text-white/90'}`}>
                                                {(teacherSettings.schoolName || 'SEKOLAH MENTARI')}
                                            </p>
                                            <span className={`text-[7px] md:text-[10px] font-black ${isUnlocked ? 'text-blue-400 opacity-60' : 'text-white/30'}`}>|</span>
                                            <p className={`text-[7px] md:text-[10px] font-bold uppercase tracking-widest text-left whitespace-nowrap ${isUnlocked ? 'text-white' : 'text-white/90'}`}>
                                                {(teacherSettings.teacherName || 'GURU MENTARI')}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div key={`title-${activeTab}`} className="flex items-center gap-4 w-full h-full overflow-hidden animate-in fade-in slide-in-from-right-3 zoom-in-95 effect-digital-glitch duration-500">
                                       <div className="flex flex-col shrink-0">
                                           <h1 className={`text-[10px] md:text-sm lg:text-base font-black uppercase leading-none Museum-Text tracking-tight ${isUnlocked ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'text-white'}`}>
                                              {currentTabInfo.title}
                                           </h1>
                                           <p className={`text-[6px] md:text-[8px] font-black uppercase tracking-[0.2em] mt-1 whitespace-nowrap ${isUnlocked ? 'text-blue-300' : 'text-blue-100'}`}>
                                              {currentTabInfo.sub}
                                           </p>
                                       </div>
                                       
                                       <div className="h-8 w-px bg-white/10 hidden lg:block shrink-0"></div>
                                       
                                       <div className="hidden lg:block flex-grow max-w-2xl overflow-hidden h-full flex items-center">
                                           {isUnlocked ? (
                                               <NeuralTypewriter key={`desc-${activeTab}`} text={currentTabInfo.desc} speed={15} />
                                           ) : (
                                               <p className={`text-[9px] md:text-[10px] font-bold uppercase leading-tight italic line-clamp-3 ${isUnlocked ? 'text-blue-200/60' : 'text-blue-50/70'}`}>
                                                  {currentTabInfo.desc}
                                               </p>
                                           )}
                                       </div>
                                    </div>
                                )}
                            </div>

                            {isUnlocked && ( <div className="pro-digital-line pro-line-bottom"></div> )} 
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-4">
                        {/* ACTION MENU DROPDOWN - Hanya muncul untuk Guru */}
                        {userRole === 'teacher' && (
                            <div className="relative" ref={menuRef}>
                                <button 
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className={`h-10 md:h-12 px-3 md:px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-90 shadow-lg ${isUnlocked ? 'bg-blue-600/20 text-white border border-blue-500/30' : 'bg-white text-blue-600'}`}
                                >
                                    <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-shapes'} text-base md:text-lg`}></i>
                                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest hidden sm:inline">AKSI</span>
                                </button>

                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-3 w-56 md:w-64 bg-white rounded-3xl shadow-2xl border-2 border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="p-3 bg-slate-50 border-b border-slate-100">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Menu Bantuan & Aksi</p>
                                        </div>
                                        <div className="p-2 space-y-1">
                                            {actionMenuItems.filter(i => i.show).map((item, idx) => (
                                                <button 
                                                    key={idx}
                                                    onClick={() => { item.action(); setIsMenuOpen(false); }}
                                                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-slate-50 transition-all text-left group"
                                                >
                                                    <div className={`w-8 h-8 rounded-xl bg-slate-50 ${item.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                                                        <i className={`fas ${item.icon} text-sm`}></i>
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{item.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <button 
                          onClick={onLogout} 
                          className={`px-4 md:px-6 py-2 h-10 md:h-12 rounded-xl transition-all active:scale-90 shadow-lg flex items-center gap-2 font-black uppercase text-[9px] md:text-[10px] tracking-widest shrink-0 ${isUnlocked ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white' : 'bg-white text-blue-600 hover:bg-red-50 hover:text-red-600'}`}
                        >
                          <i className="fas fa-power-off text-xs"></i>
                          <span className="hidden sm:inline">LOGOUT</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AppHeader;
