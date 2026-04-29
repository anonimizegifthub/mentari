
import React, { useState } from 'react';

interface FloatingActionMenuProps {
  gasUrl?: string;
  userRole?: 'teacher' | 'student' | null;
  onOpenTutorial?: () => void;
}

const FloatingActionMenu: React.FC<FloatingActionMenuProps> = ({ gasUrl, userRole, onOpenTutorial }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleShareClass = async () => {
    if (!gasUrl) {
      alert("Harap atur Link Spreadsheet di Panel Guru terlebih dahulu!");
      return;
    }

    const baseUrl = window.location.origin + window.location.pathname;
    const shareLink = `${baseUrl}?gas=${btoa(gasUrl)}`;
    
    const shareData = {
      title: 'Akses Kelas Mentari',
      text: 'Gunakan link ini untuk login otomatis ke Ruang Kelas Mentari kita!',
      url: shareLink
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareLink);
        alert("LINK KELAS BERHASIL DISALIN!\n\nKirimkan link ini ke grup WA Siswa agar mereka bisa login tanpa mengisi link server.");
      }
    } catch (err) {
      console.error("Gagal berbagi", err);
    }
  };

  const menuItems: { label: string; icon: string; color: string; action: () => void | Promise<void> }[] = [
    {
      label: 'Komunitas WA',
      icon: 'fab fa-whatsapp',
      color: 'bg-emerald-500',
      action: () => { window.open('https://chat.whatsapp.com/IrqmBoWVhsm5LgwLt0zVPq', '_blank'); }
    },
    {
      label: 'Hubungi Admin',
      icon: 'fas fa-headset',
      color: 'bg-indigo-500',
      action: () => { window.open('https://wa.me/6285755332389?text=Halo%20Admin%20Mentari,%20saya%20membutuhkan%20bantuan%20terkait%20aplikasi.', '_blank'); }
    },
    {
      label: 'Bagikan Aplikasi',
      icon: 'fas fa-share-nodes',
      color: 'bg-blue-600',
      action: async () => {
        const shareData = {
          title: 'MENTARI - GRATIS & LENGKAP',
          text: 'Halo Bapak/Ibu Guru! Coba aplikasi MENTARI AI. GRATIS & lengkap banget, ada banyak generator cerdas: Modul Ajar, Bank Soal, Gim Edukasi, sampe Lab Maya. Yuk mudahkan administrasi kita di: ',
          url: window.location.href
        };
        try {
          if (navigator.share) {
            await navigator.share(shareData);
          } else {
            await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
            alert("Link & Teks Aplikasi berhasil disalin!");
          }
        } catch (err) {
          console.error("Gagal berbagi", err);
        }
      }
    }
  ];

  if (userRole === 'teacher' && onOpenTutorial) {
    menuItems.unshift({
      label: 'Panduan Sistem Lengkap',
      icon: 'fas fa-book-bookmark',
      color: 'bg-indigo-600',
      action: onOpenTutorial
    });
  }

  if (userRole === 'teacher' && gasUrl) {
    menuItems.unshift({
      label: 'Bagikan Kelas ke Siswa',
      icon: 'fas fa-link',
      color: 'bg-amber-600',
      action: handleShareClass
    });
  }

  return (
    <div className="fixed bottom-8 right-8 z-[9999] no-print">
      <div className="relative flex flex-col items-end gap-4">
        {/* Expanded Menu Items */}
        <div className={`flex flex-col items-end gap-3 transition-all duration-500 transform ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
          {menuItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 group">
              <span className="px-4 py-2 bg-slate-900/80 backdrop-blur-md text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/20 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                {item.label}
              </span>
              <button
                onClick={() => {
                  item.action();
                  setIsOpen(false);
                }}
                className={`w-12 h-12 ${item.color} text-white rounded-2xl flex items-center justify-center text-xl shadow-2xl hover:scale-110 active:scale-95 transition-all border-2 border-white/20`}
              >
                <i className={item.icon}></i>
              </button>
            </div>
          ))}
        </div>

        {/* Main Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-16 h-16 rounded-[2rem] flex items-center justify-center text-white shadow-2xl transition-all duration-500 active:scale-90 border-4 border-white ring-4 ring-blue-500/10 ${isOpen ? 'bg-red-500 rotate-[135deg]' : 'bg-gradient-to-br from-blue-600 to-indigo-700 animate-pulse'}`}
        >
          <i className={`fas ${isOpen ? 'fa-times' : 'fa-plus'} text-2xl`}></i>
        </button>
      </div>
    </div>
  );
};

export default FloatingActionMenu;
