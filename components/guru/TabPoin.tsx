
import React, { useMemo, useState } from 'react';
import { Student, GradeEntry } from '../../types';

interface TabPoinProps {
  activePointSubTab: 'system' | 'monitoring' | 'redemptions';
  setActivePointSubTab: (t: 'system' | 'monitoring' | 'redemptions') => void;
  students: Student[];
  grades: GradeEntry[];
  selectedStudentIds: string[];
  setSelectedStudentIds: (ids: string[]) => void;
  adjustExp: number;
  setAdjustExp: (v: number) => void;
  adjustCoin: number;
  setAdjustCoin: (v: number) => void;
  adjustReason: string;
  setAdjustReason: (v: string) => void;
  handleApplyPoints: () => void;
  handleProcessRedemption: (studentId: string, redemptionId: string) => void;
  handleClearUsedRedemptions: () => void;
  setShowStudentDetail: (id: string | null) => void;
}

const TabPoin: React.FC<TabPoinProps> = ({
  activePointSubTab, setActivePointSubTab, students, grades,
  selectedStudentIds, setSelectedStudentIds, adjustExp, setAdjustExp,
  adjustCoin, setAdjustCoin, adjustReason, setAdjustReason,
  handleApplyPoints, handleProcessRedemption, handleClearUsedRedemptions, setShowStudentDetail
}) => {
  const redemptionList = useMemo(() => {
    const all: { student: Student, redeem: any }[] = [];
    students.forEach(s => {
      const items = Array.isArray(s.redemptions) ? s.redemptions : [];
      items.forEach(r => {
        all.push({ student: s, redeem: r });
      });
    });
    return all.sort((a, b) => new Date(b.redeem.date).getTime() - new Date(a.redeem.date).getTime());
  }, [students]);

  const pendingRedemptionCount = useMemo(() => 
    redemptionList.filter(item => item.redeem.status === 'pending').length
  , [redemptionList]);

  const toggleStudentSelection = (id: string) => {
    const sid = id.toString();
    if (selectedStudentIds.includes(sid)) {
        setSelectedStudentIds(selectedStudentIds.filter(x => x !== sid));
    } else {
        setSelectedStudentIds([...selectedStudentIds, sid]);
    }
  };

  const selectAllStudents = () => {
    if (selectedStudentIds.length === students.length) {
        setSelectedStudentIds([]);
    } else {
        setSelectedStudentIds(students.map(s => s.id.toString()));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5 animate-in fade-in duration-500">
      <div className="bg-white rounded-[3.5rem] border-4 border-blue-100 shadow-2xl overflow-hidden flex flex-col min-h-[600px]">
        {/* INTERNAL TABS NAVIGATION */}
        <div className="flex bg-slate-50 border-b-2 border-slate-100 p-1.5">
          {(['system', 'monitoring', 'redemptions'] as const).map(sub => (
            <button 
              key={sub} 
              onClick={() => setActivePointSubTab(sub)} 
              className={`flex-1 py-4 md:py-5 rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all relative flex items-center justify-center gap-3 ${activePointSubTab === sub ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-slate-400 hover:bg-slate-100'}`}
            >
              <i className={`fas ${sub === 'system' ? 'fa-plus-minus' : sub === 'monitoring' ? 'fa-chart-pie' : 'fa-hand-holding-dollar'}`}></i>
              <span className="hidden sm:inline">{sub === 'system' ? 'Sistem Poin' : sub === 'monitoring' ? 'Pantauan' : 'Penukaran'}</span>
              {sub === 'redemptions' && pendingRedemptionCount > 0 && (
                  <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white rounded-full border-2 border-white animate-bounce flex items-center justify-center text-[9px] font-black">{pendingRedemptionCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* TAB CONTENT AREA */}
        <div className="p-6 md:p-10 flex-grow overflow-y-auto">
          {activePointSubTab === 'system' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full animate-in slide-in-from-left-4 duration-500">
                <div className="lg:col-span-1 bg-slate-50 rounded-[2.5rem] p-5 h-[500px] flex flex-col border-2 border-slate-100">
                  <div className="flex justify-between items-center mb-4 px-1">
                      <h3 className="text-xs font-black uppercase text-blue-800 Museum-Text flex items-center gap-2"><i className="fas fa-users"></i> Pilih Siswa</h3>
                      <button onClick={selectAllStudents} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[7px] font-black uppercase text-blue-500 hover:bg-blue-50">
                          {selectedStudentIds.length === students.length ? 'BATAL' : 'SEMUA'}
                      </button>
                  </div>
                  <div className="flex-grow overflow-y-auto pr-2 no-scrollbar space-y-1.5">
                    {students.map(s => (
                        <div 
                            key={s.id} 
                            onClick={() => toggleStudentSelection(s.id.toString())} 
                            className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${selectedStudentIds.includes(s.id.toString()) ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-100 hover:border-blue-200'}`}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${selectedStudentIds.includes(s.id.toString()) ? 'bg-white border-white text-blue-600' : 'bg-white border-slate-300'}`}>
                              {selectedStudentIds.includes(s.id.toString()) && <i className="fas fa-check text-[8px]"></i>}
                          </div>
                          <div className="truncate">
                            <p className="font-black text-[10px] uppercase truncate">{s.name}</p>
                            <p className={`text-[8px] font-bold uppercase ${selectedStudentIds.includes(s.id.toString()) ? 'text-blue-100' : 'text-slate-400'}`}>★ {s.exp || 0} EXP</p>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
                
                <div className="lg:col-span-2 flex flex-col justify-center space-y-6">
                  {selectedStudentIds.length === 0 ? (
                    <div className="text-center opacity-30 py-16 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[3rem] h-full flex flex-col items-center justify-center gap-4">
                       <i className="fas fa-hand-pointer text-5xl"></i>
                       <p className="font-black uppercase text-xs tracking-[0.2em]">Pilih siswa untuk memberi hadiah poin.</p>
                    </div>
                  ) : (
                    <div className="space-y-6 animate-in zoom-in duration-300 bg-white p-7 md:p-10 rounded-[3rem] border-2 border-blue-50 shadow-sm h-full flex flex-col justify-center">
                      <div className="flex items-center justify-between border-b-2 border-dashed border-slate-100 pb-5">
                          <div>
                            <h3 className="text-xl font-black uppercase text-blue-950 Museum-Text leading-none">Aksi Poin Massal</h3>
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mt-1.5 italic">{selectedStudentIds.length} Siswa Terpilih</p>
                          </div>
                          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-[1.2rem] flex items-center justify-center text-xl shadow-inner"><i className="fas fa-bolt"></i></div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                             <label className="text-[9px] font-black uppercase text-indigo-500 ml-1 tracking-widest">Kirim EXP (Bonus Level)</label>
                             <div className="flex items-center gap-3">
                                <button onClick={() => setAdjustExp(adjustExp - 10)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 font-black text-xs hover:bg-red-500 hover:text-white transition-all shadow-sm">-10</button>
                                <input type="number" value={adjustExp} onChange={e => setAdjustExp(Number(e.target.value))} className="flex-grow text-center input-futuristic py-3 font-black text-lg text-blue-900" />
                                <button onClick={() => setAdjustExp(adjustExp + 10)} className="w-10 h-10 rounded-xl bg-green-50 text-green-500 font-black text-xs hover:bg-green-500 hover:text-white transition-all shadow-sm">+10</button>
                             </div>
                          </div>
                          <div className="space-y-3">
                             <label className="text-[9px] font-black uppercase text-amber-500 ml-1 tracking-widest">Kirim Koin (Bonus Belanja)</label>
                             <div className="flex items-center gap-3">
                                <button onClick={() => setAdjustCoin(adjustCoin - 10)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 font-black text-xs hover:bg-red-500 hover:text-white transition-all shadow-sm">-10</button>
                                <input type="number" value={adjustCoin} onChange={e => setAdjustCoin(Number(e.target.value))} className="flex-grow text-center input-futuristic py-3 font-black text-lg text-amber-600" />
                                <button onClick={() => setAdjustCoin(adjustCoin + 10)} className="w-10 h-10 rounded-xl bg-green-50 text-green-500 font-black text-xs hover:bg-green-500 hover:text-white transition-all shadow-sm">+10</button>
                             </div>
                          </div>
                      </div>

                      <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">Alasan Pemberian Hadiah</label>
                          <textarea value={adjustReason} onChange={e => setAdjustReason(e.target.value)} className="w-full input-futuristic px-5 py-3 font-bold h-20 resize-none text-xs" placeholder="Ketik alasan di sini..." />
                      </div>
                      
                      <button onClick={handleApplyPoints} className="w-full py-5 bg-blue-600 text-white rounded-[1.8rem] font-black uppercase text-[11px] tracking-widest shadow-2xl shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all">
                        Simpan Perubahan Poin ({selectedStudentIds.length})
                      </button>
                    </div>
                  )}
                </div>
            </div>
          )}

          {activePointSubTab === 'redemptions' && (
            <div className="h-full animate-in slide-in-from-right-4 duration-500 flex flex-col">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-emerald-50/50 p-5 rounded-[2.2rem] border-2 border-emerald-100">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-lg shadow-lg"><i className="fas fa-money-bill-transfer"></i></div>
                     <div>
                        <h3 className="text-lg font-black uppercase text-emerald-700 Museum-Text leading-none">Validasi Penukaran</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Konfirmasi jika hadiah fisik sudah diterima siswa.</p>
                     </div>
                  </div>
                  <button onClick={handleClearUsedRedemptions} className="px-5 py-2.5 bg-white text-red-500 border-2 border-red-100 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm">
                      Bersihkan Histori
                  </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 flex-grow overflow-y-auto no-scrollbar pb-6">
                  {redemptionList.filter(item => item.redeem.status === 'pending').length === 0 ? (
                      <div className="col-span-full py-20 text-center opacity-30 flex flex-col items-center gap-4">
                         <i className="fas fa-inbox text-5xl"></i>
                         <p className="text-[10px] font-black uppercase tracking-widest">Tidak ada penukaran baru.</p>
                      </div>
                  ) : (
                    redemptionList.filter(item => item.redeem.status === 'pending').map(item => (
                        <div key={item.redeem.id} className="p-5 rounded-[2rem] border-2 bg-white border-emerald-100 hover:border-emerald-400 flex flex-col gap-3.5 shadow-sm group transition-all animate-in fade-in">
                            <div className="flex justify-between items-start">
                                <div>
                                   <p className="font-black uppercase text-[10px] truncate w-32 text-blue-900 group-hover:text-emerald-600 transition-colors">{item.student.name}</p>
                                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.redeem.date}</p>
                                </div>
                                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100"><i className="fas fa-money-bill-wave text-base animate-pulse"></i></div>
                            </div>
                            <div className="p-3 rounded-2xl text-center shadow-inner bg-emerald-500 relative overflow-hidden">
                                <span className="text-lg font-black text-white Museum-Text">Rp {item.redeem.amount.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl border-2 text-center border-slate-100 relative group/code">
                                <span className="text-xs font-mono font-black tracking-[0.3em] text-blue-600 uppercase">{item.redeem.code}</span>
                            </div>
                            <button onClick={() => handleProcessRedemption(item.student.id.toString(), item.redeem.id.toString())} className="w-full py-3.5 bg-blue-600 text-white rounded-2xl font-black uppercase text-[9px] tracking-widest shadow-xl shadow-blue-200 hover:bg-emerald-600 active:scale-95 transition-all">
                                Konfirmasi Cair
                            </button>
                        </div>
                    ))
                  )}
              </div>
            </div>
          )}

          {activePointSubTab === 'monitoring' && (
            <div className="h-full animate-in zoom-in-95 duration-500">
                <div className="flex items-center gap-4 mb-8 border-b-2 border-slate-50 pb-5">
                   <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-lg shadow-inner"><i className="fas fa-chart-line"></i></div>
                   <h3 className="text-lg font-black uppercase text-blue-900 Museum-Text leading-none">Radar Ekonomi Siswa</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 overflow-y-auto no-scrollbar pb-8">
                  {students.map(s => {
                    const sid = s.id.toString().trim();
                    const subjGrades = grades.filter(g => g.studentId.toString().trim() === sid);
                    const avg = subjGrades.length > 0 ? subjGrades.reduce((a, b) => a + b.score, 0) / subjGrades.length : 0;
                    return (
                      <div key={s.id} onClick={() => setShowStudentDetail(sid)} className="p-5 bg-white border-2 border-slate-50 rounded-[2.2rem] flex flex-col gap-3.5 hover:border-blue-400 hover:shadow-xl transition-all cursor-pointer group hover:-translate-y-1">
                          <div className="flex items-center gap-3 border-b border-slate-50 pb-2.5">
                             <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">#{s.level}</div>
                             <p className="font-black text-blue-900 uppercase text-[10px] truncate">{s.name}</p>
                          </div>
                          
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Mastery</span>
                                <span className={`text-[9px] font-black ${avg >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>{avg.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner flex">
                                <div className={`h-full transition-all duration-1000 ${avg >= 75 ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: `${avg}%` }}></div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <div className="bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100 text-center">
                                <span className="block text-[6px] font-black text-indigo-400 uppercase">EXP</span>
                                <span className="text-[10px] font-black text-indigo-600">★ {s.exp || 0}</span>
                            </div>
                            <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-100 text-center">
                                <span className="block text-[6px] font-black text-amber-400 uppercase">KOIN</span>
                                <span className="text-[10px] font-black text-amber-600">🪙 {s.coins || 0}</span>
                            </div>
                          </div>
                      </div>
                    );
                  })}
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TabPoin;
