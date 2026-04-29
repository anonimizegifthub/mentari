
import React from 'react';

interface GameResultOverlayProps {
    score: number;
    target: number;
    onClaim: () => void;
    onRetry: () => void;
    onGiveUp?: () => void;
    missionTitle: string;
    isExamMode?: boolean;
}

const GameResultOverlay: React.FC<GameResultOverlayProps> = ({ score, target, onClaim, onRetry, onGiveUp, missionTitle, isExamMode = false }) => {
    const isSuccess = score >= target;
    const canRetry = !isExamMode || (isExamMode && !isSuccess);

    return (
        <div className="fixed inset-0 z-[8500] flex items-center justify-center p-4 md:p-6 animate-in fade-in zoom-in duration-300">
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"></div>
            <div className="relative bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl max-w-sm w-full text-center border-4 border-white overflow-hidden">
                {isSuccess && (
                    <div className="absolute inset-0 pointer-events-none opacity-20">
                        {Array.from({ length: 15 }).map((_, i) => (
                            <div key={i} className="absolute w-1.5 h-1.5 rounded-full animate-bounce" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, backgroundColor: ['#fbbf24', '#3b82f6', '#10b981', '#ef4444'][i % 4], animationDelay: `${i * 0.1}s` }}></div>
                        ))}
                    </div>
                )}
                
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl border-2 border-white ${isSuccess ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                    <i className={`fas ${isSuccess ? 'fa-trophy text-2xl md:text-3xl' : 'fa-rotate-left text-2xl md:text-3xl'} floating`}></i>
                </div>

                <h2 className="text-xl md:text-2xl font-black Museum-Text uppercase text-slate-800 leading-tight mb-1">
                    {isSuccess ? 'Misi Berhasil!' : 'Coba Lagi Yuk!'}
                </h2>
                <div className="flex flex-col items-center gap-1 mb-6">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] truncate w-full px-4">{missionTitle}</p>
                  {isExamMode && isSuccess && (
                    <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-[7px] font-black uppercase tracking-widest border border-red-100 animate-pulse">Mode Ujian: Final</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
                        <span className="text-[7px] font-black text-slate-400 uppercase block mb-0.5">Skor Kamu</span>
                        <span className={`text-2xl font-black ${isSuccess ? 'text-emerald-600' : 'text-amber-600'}`}>{score}</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-100">
                        <span className="text-[7px] font-black text-slate-400 uppercase block mb-0.5">Target</span>
                        <span className="text-2xl font-black text-slate-800">{target}</span>
                    </div>
                </div>

                {isSuccess ? (
                    <div className="space-y-3">
                        <button onClick={onClaim} className="w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">
                            KLAIM HADIAH & SELESAI
                        </button>
                        <p className="text-[7px] font-bold text-slate-400 uppercase">Koin & EXP otomatis masuk ke profil!</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {canRetry ? (
                          <>
                            <button onClick={onRetry} className="w-full py-4 bg-amber-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-amber-200 active:scale-95 transition-all">
                                ULANGI PERMAINAN
                            </button>
                            {isExamMode && onGiveUp && (
                                <button onClick={onGiveUp} className="w-full py-3 bg-slate-100 text-slate-500 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-red-50 hover:text-red-500 transition-all border border-slate-200">
                                    MENYERAH & COBA NANTI
                                </button>
                            )}
                            {!isExamMode && <button onClick={() => window.location.reload()} className="text-[8px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors">Tutup Misi</button>}
                          </>
                        ) : (
                           <div className="p-3 bg-red-50 border-2 border-red-100 rounded-xl">
                              <p className="text-[8px] font-black text-red-600 uppercase">Sudah lulus mode ujian. Tidak bisa mengulang.</p>
                              <button onClick={() => window.location.reload()} className="mt-2 text-[7px] font-black text-slate-400 underline">Tutup</button>
                           </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GameResultOverlay;
