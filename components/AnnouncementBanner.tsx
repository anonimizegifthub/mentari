
import React from 'react';

interface AnnouncementBannerProps {
  isActive: boolean;
  message: string;
  isUnlocked?: boolean;
}

const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ isActive, message, isUnlocked = false }) => {
  if (!isActive || !message) return null;

  if (isUnlocked) {
    return (
      <div className="relative group overflow-hidden rounded-[1.5rem] md:rounded-[2rem] p-0.5 animate-in slide-in-from-top-4 duration-700 shadow-xl mb-0">
        {/* Animated Neon Border Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600 animate-pulse"></div>
        
        <div className="relative bg-slate-950 rounded-[1.4rem] md:rounded-[1.9rem] p-3 flex items-center gap-4 md:gap-6 overflow-hidden border border-white/5">
          {/* Internal Grid Effect */}
          <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          {/* Scanning Light Effect */}
          <div className="header-scanning-light opacity-30"></div>

          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-xl flex items-center justify-center text-white text-lg shrink-0 z-10 shadow-[0_0_20px_rgba(245,158,11,0.5)] border border-white/20">
            <i className="fas fa-bullhorn animate-bounce"></i>
          </div>

          <div className="flex-grow flex flex-col justify-center overflow-hidden z-10 relative h-8 md:h-10">
            <div className="overflow-hidden whitespace-nowrap relative flex items-center">
              <p className="text-yellow-400 font-black Museum-Text scrolling-text text-xs md:text-sm uppercase tracking-wider drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">
                {message}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // BASIC STYLE
  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 p-3 rounded-xl shadow-md animate-in slide-in-from-left-4 duration-700 flex items-center gap-4 overflow-hidden relative border border-amber-100 mb-0">
      <div className="w-10 h-10 bg-amber-400 rounded-lg flex items-center justify-center text-white text-lg shrink-0 z-10">
        <i className="fas fa-bullhorn animate-bounce"></i>
      </div>
      <div className="flex-grow overflow-hidden whitespace-nowrap relative h-6 flex items-center">
        <p className="text-amber-900 font-bold Museum-Text scrolling-text text-[10px] md:text-xs uppercase">
          {message}
        </p>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
