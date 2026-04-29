
import React from 'react';
import { Mission } from '../types';
import { sanitizeGeneratedCode } from '../utils/codeUtils';

interface GamePlayerOverlayProps {
  mission: Mission;
  onClose: () => void;
  gameContainerRef: React.RefObject<HTMLDivElement | null>;
  toggleFullscreen: () => void;
}

const GamePlayerOverlay: React.FC<GamePlayerOverlayProps> = ({ 
  mission, 
  onClose, 
  gameContainerRef, 
  toggleFullscreen 
}) => {
  return (
    <div ref={gameContainerRef} className="fixed inset-0 z-[7000] bg-slate-900 flex flex-col animate-in zoom-in duration-300">
      <div className="flex-grow w-full relative bg-black flex items-center justify-center overflow-hidden">
        <iframe 
          srcDoc={sanitizeGeneratedCode(mission.gameCode || "")} 
          className="w-full h-full border-none max-w-[100vw] max-h-[100vh]" 
          title="Game Player" 
          sandbox="allow-scripts allow-popups allow-forms" 
        />
      </div>
      <div className="bg-indigo-900 p-4 border-t-4 border-indigo-500 flex justify-between items-center z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white border-2 border-indigo-400 shadow-lg">
            <i className="fas fa-gamepad text-2xl animate-pulse"></i>
          </div>
          <div className="text-white hidden md:block">
            <h3 className="font-black uppercase text-lg Museum-Text text-yellow-300">{mission.title}</h3>
            <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">Selesaikan misi untuk mendapatkan hadiah!</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={toggleFullscreen} className="px-6 py-3 bg-indigo-700 text-white font-black uppercase rounded-xl hover:bg-indigo-600 transition-all text-xs border border-indigo-500"><i className="fas fa-expand mr-2"></i> Layar Penuh</button>
          <button onClick={onClose} className="px-6 py-3 bg-slate-700 text-slate-300 font-black uppercase rounded-xl hover:bg-slate-600 transition-all text-xs">Batalkan</button>
          <div className="px-8 py-3 bg-blue-900/50 border-2 border-blue-500/50 rounded-xl flex items-center gap-3 hidden sm:flex">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-white font-black uppercase text-[10px] tracking-widest">Target Skor: {mission.minScore || 70}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePlayerOverlay;
