import React from 'react';

interface DailyInsightsProps {
  dailyFact: any; 
  wordOfDay?: {
    word: string;
    meaning: string;
    example: string;
  };
}

const DailyInsights: React.FC<DailyInsightsProps> = ({ dailyFact, wordOfDay }) => {
  const isObject = typeof dailyFact === 'object' && dailyFact !== null;
  const category = isObject ? dailyFact.category : "Wawasan";
  const title = isObject ? dailyFact.title : "Fakta Unik Hari Ini";
  const content = isObject ? dailyFact.content : dailyFact;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
      <div className="glass-card rounded-[3.5rem] p-8 md:p-10 flex flex-col relative overflow-hidden group">
        <div className="absolute -top-12 -right-12 opacity-[0.03] group-hover:opacity-[0.06] transition-all duration-1000 group-hover:rotate-12 group-hover:scale-110">
           <i className="fas fa-brain text-[15rem]"></i>
        </div>
        <div className="flex items-center justify-between mb-8 z-10">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
                  <i className="fas fa-lightbulb"></i>
              </div>
              <span className="px-4 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-wider border-2 border-amber-100">
                  {category}
              </span>
           </div>
           <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></div><span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">AI Generated</span></div>
        </div>
        <div className="z-10 flex-grow">
          <h3 className="text-2xl md:text-3xl font-black text-slate-800 Museum-Text leading-tight mb-4 group-hover:text-amber-600 transition-colors">
            {title}
          </h3>
          <div className="p-6 bg-slate-50/80 rounded-[2.5rem] border-2 border-white shadow-inner relative">
             <i className="fas fa-quote-left absolute top-4 left-4 text-slate-200 text-3xl"></i>
             <p className="text-xs md:text-sm font-semibold text-slate-600 leading-relaxed uppercase italic pl-6">
               {content}
             </p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-[3.5rem] p-8 md:p-10 flex flex-col relative overflow-hidden group">
        <div className="absolute -bottom-12 -left-12 opacity-[0.03] group-hover:opacity-[0.06] transition-all duration-1000 group-hover:-rotate-12 group-hover:scale-110">
           <i className="fas fa-book-open text-[15rem]"></i>
        </div>
        <div className="flex items-center justify-between mb-8 z-10">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                  <i className="fas fa-feather-pointed"></i>
              </div>
              <span className="px-4 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-wider border-2 border-blue-100">
                  Pilar Literasi
              </span>
           </div>
           <i className="fas fa-sparkles text-yellow-400 animate-bounce"></i>
        </div>
        {wordOfDay ? (
          <div className="z-10 flex-grow animate-in slide-in-from-bottom-4">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-1 block">Kosakata Hari Ini:</span>
            <h3 className="text-4xl md:text-5xl font-black text-blue-900 Museum-Text italic tracking-tight mb-6 group-hover:scale-[1.02] transition-transform origin-left">"{wordOfDay.word}"</h3>
            <div className="space-y-4">
                <div className="p-5 bg-blue-50/50 rounded-2xl border-2 border-blue-100">
                   <p className="text-xs md:text-sm font-bold text-slate-600 uppercase leading-relaxed">{wordOfDay.meaning}</p>
                </div>
                <div className="p-5 bg-slate-50/80 rounded-2xl border-l-8 border-blue-500 italic">
                   <p className="text-[10px] md:text-xs font-medium text-slate-500 leading-relaxed uppercase tracking-tight">Contoh: "{wordOfDay.example}"</p>
                </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6"><div className="shimmer h-12 w-3/4 rounded-2xl"></div><div className="shimmer h-32 w-full rounded-3xl"></div></div>
        )}
      </div>
    </div>
  );
};

export default DailyInsights;