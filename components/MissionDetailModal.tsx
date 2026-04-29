
import React from 'react';
import { Mission } from '../types';

interface MissionDetailModalProps {
  mission: Mission;
  onClose: () => void;
  onStartGame: (m: Mission) => void;
  onMarkFinished: (id: string) => void;
}

const MissionDetailModal: React.FC<MissionDetailModalProps> = ({ mission, onClose, onStartGame, onMarkFinished }) => {
  // Fungsi untuk mendeteksi link dalam teks dan mengubahnya menjadi komponen <a>
  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={index} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 underline font-bold hover:text-blue-800 break-all inline-flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-md decoration-blue-300"
            onClick={(e) => e.stopPropagation()}
          >
            <i className="fas fa-external-link-alt text-[10px]"></i> Buka Link
          </a>
        );
      }
      return part;
    });
  };

  // Cek apakah misi memiliki kode game yang valid (minimal ada tag HTML atau script)
  const hasGameContent = mission.gameCode && mission.gameCode.trim().length > 20;

  return (
    <div className="fixed inset-0 z-[6000] bg-blue-900/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-[3rem] p-10 shadow-2xl relative flex flex-col border-4 border-white">
        <button onClick={onClose} className="absolute top-8 right-8 w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-red-500 hover:text-white transition-all"><i className="fas fa-times"></i></button>
        <div className="mb-6 border-b-2 border-slate-100 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase">{mission.subject}</span>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase">★ {mission.expReward} EXP</span>
              <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase">🪙 {mission.coinReward} Koin</span>
            </div>
          </div>
          <h2 className="text-3xl font-black text-blue-900 Museum-Text uppercase leading-tight">{mission.title}</h2>
        </div>
        <div className="flex-grow overflow-y-auto pr-2 no-scrollbar mb-8">
          <h4 className="text-xs font-black uppercase text-slate-400 mb-3 tracking-widest">Instruksi Misi:</h4>
          <div className="text-lg font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
            {renderTextWithLinks(mission.description)}
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-500 font-black uppercase text-sm hover:bg-slate-200 transition-all">Kembali</button>
          {hasGameContent ? (
            <button onClick={() => onStartGame(mission)} className="flex-[2] py-4 rounded-2xl bg-emerald-500 text-white font-black uppercase text-sm hover:bg-emerald-600 joyful-shadow active:scale-95 transition-all">
              <i className="fas fa-gamepad mr-2"></i> Mainkan Gim
            </button>
          ) : (
            <button onClick={() => onMarkFinished(mission.id.toString())} className="flex-[2] py-4 rounded-2xl bg-blue-600 text-white font-black uppercase text-sm hover:bg-blue-700 joyful-shadow active:scale-95 transition-all">
              <i className="fas fa-check-circle mr-2"></i> Tandai Selesai
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MissionDetailModal;
