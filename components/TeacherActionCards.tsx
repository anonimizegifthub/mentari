import React from 'react';

interface TeacherActionCardsProps {
  onAction: (id: string) => void;
}

const TeacherActionCards: React.FC<TeacherActionCardsProps> = ({ onAction }) => {
  const actions = [
    {
      id: 'missions_shortcut',
      title: 'Kirim Tugas Siswa',
      icon: 'fa-paper-plane',
      color: 'indigo',
      desc: 'Kirimkan tugas instruksional atau tantangan tertulis langsung ke HP siswa.',
      feature: 'Terbit instan di dasbor petualang.'
    },
    {
      id: 'generator' as const,
      title: 'Buat Soal',
      icon: 'fa-file-signature',
      color: 'blue',
      desc: 'Generasi naskah soal asesmen profesional lengkap dengan kunci jawaban.',
      feature: 'Dilengkapi ilustrasi gambar AI otomatis.'
    },
    {
      id: 'buatgim' as const,
      title: 'Buat Gim',
      icon: 'fa-gamepad',
      color: 'emerald',
      desc: 'Merakit gim edukasi interaktif HTML5 tanpa perlu kemampuan coding.',
      feature: 'Dapat langsung dikirim ke dashboard siswa.'
    },
    {
      id: 'labmaya' as const,
      title: 'Buat Lab Maya',
      icon: 'fa-flask',
      color: 'purple',
      desc: 'Menciptakan simulasi STEM interaktif untuk eksplorasi sains digital.',
      feature: 'Dapat langsung dikirim ke dashboard siswa.'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {actions.map((action) => (
        <button 
          key={action.id}
          onClick={() => onAction(action.id)} 
          className={`group bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm hover:shadow-xl hover:border-${action.color}-400 transition-all duration-500 active:scale-95 text-left flex flex-col h-full relative overflow-hidden`}
        >
          {/* Decorative Gradient Background */}
          <div className={`absolute -right-6 -top-6 w-24 h-24 bg-${action.color}-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700`}></div>
          
          <div className={`w-16 h-16 bg-${action.color}-100 rounded-2xl flex items-center justify-center text-${action.color}-600 text-3xl mb-6 group-hover:scale-110 group-hover:bg-${action.color}-600 group-hover:text-white transition-all duration-500 shadow-sm`}>
            <i className={`fas ${action.icon}`}></i>
          </div>
          
          <h4 className="text-sm font-black uppercase text-slate-800 mb-4 tracking-wider Museum-Text">{action.title}</h4>
          
          <div className="flex-grow space-y-4 relative z-10">
            <div className={`pl-3 border-l-2 border-${action.color}-200`}>
              <span className={`text-[8px] font-black uppercase text-${action.color}-500 tracking-widest block mb-1`}>Fungsi Utama</span>
              <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase">{action.desc}</p>
            </div>
            
            <div className={`pl-3 border-l-2 border-slate-100 group-hover:border-${action.color}-100 transition-colors`}>
              <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest block mb-1">Keunggulan</span>
              <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase italic">
                <i className="fas fa-check-circle mr-1 text-[8px]"></i> {action.feature}
              </p>
            </div>
          </div>

          <div className={`mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-${action.color}-500`}>
             <span className="text-[9px] font-black uppercase tracking-tighter">Buka Alat AI</span>
             <i className="fas fa-arrow-right text-xs transform group-hover:translate-x-1 transition-transform"></i>
          </div>
        </button>
      ))}
    </div>
  );
};

export default TeacherActionCards;