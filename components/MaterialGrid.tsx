
import React from 'react';
import { InteractiveMaterial } from '../types';

interface MaterialGridProps {
  materials: InteractiveMaterial[];
  onOpenMaterial: (m: InteractiveMaterial) => void;
  onSync: () => void;
  isSyncing: boolean;
  title?: string;
  description?: string;
}

const MaterialGrid: React.FC<MaterialGridProps> = ({ 
  materials, 
  onOpenMaterial, 
  onSync, 
  isSyncing,
  title = "Materi Eksplorasi",
  description = "Laboratorium Digital Siswa"
}) => {
  return (
    <div className="bg-gradient-to-b from-white to-emerald-50/30 rounded-[3.5rem] p-6 md:p-10 border-4 border-emerald-100 shadow-2xl w-full relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
        <i className="fas fa-microscope text-[10rem]"></i>
      </div>
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg">
              <i className="fas fa-flask"></i>
           </div>
           <div>
              <h3 className="text-xl font-black text-slate-800 Museum-Text uppercase leading-none">{title}</h3>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">{description}</p>
           </div>
        </div>
        <button 
          onClick={onSync} 
          disabled={isSyncing} 
          className={`w-9 h-9 rounded-full flex items-center justify-center bg-white border-2 border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm ${isSyncing ? 'animate-spin' : 'active:scale-90'}`} 
          title="Segarkan Data"
        >
          <i className="fas fa-sync-alt text-[9px]"></i>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 overflow-y-auto pr-2 no-scrollbar max-h-[500px] lg:max-h-none relative z-10">
        {materials.length === 0 ? (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center opacity-30">
             <i className="fas fa-box-open text-5xl mb-3"></i>
             <p className="font-black uppercase text-[10px] tracking-widest">Belum ada materi lab hari ini.</p>
          </div>
        ) : (
          materials.map(m => (
            <div key={m.id} className="group p-5 md:p-6 bg-white border-2 border-slate-100 rounded-[2.5rem] flex flex-col gap-4 shadow-sm hover:shadow-xl hover:border-emerald-400 transition-all duration-500 relative overflow-hidden">
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-emerald-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 scale-0 group-hover:scale-100"></div>
              
              <div className="flex justify-between items-start z-10">
                 <div className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[7px] font-black uppercase tracking-wider">
                    {m.subject}
                 </div>
                 <i className="fas fa-atom text-slate-100 group-hover:text-emerald-200 transition-colors text-xl"></i>
              </div>

              <div className="z-10">
                <h4 className="text-base font-black text-slate-800 Museum-Text uppercase leading-tight group-hover:text-emerald-700 transition-colors truncate">
                  {m.title}
                </h4>
                <p className="text-[9px] font-semibold text-slate-400 uppercase mt-1.5 line-clamp-2">
                  {m.description || "Materi interaktif untuk dipelajari."}
                </p>
              </div>

              <button 
                onClick={() => onOpenMaterial(m)} 
                className="w-full py-3 bg-emerald-500 text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg shadow-emerald-50 active:scale-95 transition-all group-hover:bg-emerald-600 z-10"
              >
                Mulai Eksperimen
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MaterialGrid;
