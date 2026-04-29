
import React from 'react';
import { Mission } from '../types';

interface MissionGridProps {
  missions: Mission[];
  onViewMission: (m: Mission) => void;
  onSync: () => void;
  isSyncing: boolean;
}

const MissionGrid: React.FC<MissionGridProps> = ({ missions, onViewMission, onSync, isSyncing }) => {
  return (
    <div className="bg-gradient-to-b from-white to-blue-50/30 rounded-[3.5rem] p-6 md:p-10 border-4 border-blue-100 shadow-2xl w-full relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
        <i className="fas fa-bullseye text-[10rem]"></i>
      </div>

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
              <i className="fas fa-rocket"></i>
           </div>
           <div>
              <h3 className="text-xl font-black text-slate-800 Museum-Text uppercase leading-none">Misi Petualang</h3>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Tugas & Tantangan Kelas</p>
           </div>
        </div>
        <button 
          onClick={onSync} 
          disabled={isSyncing} 
          className={`w-9 h-9 rounded-full flex items-center justify-center bg-white border-2 border-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm ${isSyncing ? 'animate-spin' : 'active:scale-90'}`} 
          title="Segarkan Data"
        >
          <i className="fas fa-sync-alt text-[9px]"></i>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 overflow-y-auto pr-2 no-scrollbar max-h-[500px] lg:max-h-none relative z-10">
        {missions.length === 0 ? (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center opacity-30">
             <i className="fas fa-check-double text-5xl mb-3 text-emerald-400"></i>
             <p className="font-black uppercase text-[10px] tracking-widest">Semua misi telah selesai!</p>
          </div>
        ) : (
          missions.map(m => (
            <div key={m.id} className="group p-5 md:p-6 bg-white border-2 border-slate-100 rounded-[2.5rem] flex flex-col gap-4 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all duration-500 relative overflow-hidden">
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-blue-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 scale-0 group-hover:scale-100"></div>

              <div className="flex justify-between items-center z-10">
                <div className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-[7px] font-black uppercase tracking-wider">
                  {m.subject}
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black text-indigo-600">★ {m.expReward}</span>
                  <span className="text-[9px] font-black text-amber-500">🪙 {m.coinReward}</span>
                </div>
              </div>

              <div className="z-10">
                <h4 className="text-base font-black text-slate-800 Museum-Text uppercase leading-tight group-hover:text-blue-700 transition-colors truncate">
                  {m.title}
                </h4>
                <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">
                   Tenggat: {new Date(m.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </p>
              </div>

              <button 
                onClick={() => onViewMission(m)} 
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg shadow-blue-50 active:scale-95 transition-all group-hover:bg-blue-700 z-10 flex items-center justify-center gap-2"
              >
                <i className="fas fa-play text-[7px]"></i> Jalankan Misi
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MissionGrid;
