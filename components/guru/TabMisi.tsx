import React, { useState, useMemo } from 'react';
import { Mission, MissionSubmission, KindnessSubmission, TeacherSettings } from '../../types';

interface TabMisiProps {
  missions: Mission[];
  submissions: MissionSubmission[];
  kindnessSubmissions: KindnessSubmission[];
  settings: TeacherSettings;
  missionForm: Partial<Mission>;
  setMissionForm: (f: Partial<Mission>) => void;
  handleAddMission: () => void;
  handleFileUpload: (type: 'mission', e: React.ChangeEvent<HTMLInputElement>) => void;
  missionFileRef: React.RefObject<HTMLInputElement | null>;
  handleManualSync: () => void;
  syncStatus: string;
  handleDeleteMission: (id: string) => void;
  handleBulkDeleteMissions: (ids: string[]) => void;
  handleDeleteSubmission: (id: string) => void;
  handleBulkDeleteSubmissions: (ids: string[]) => void;
  handleConfirmSubmission: (sub: MissionSubmission, score: number) => void;
  handleApproveKindness: (k: KindnessSubmission) => void;
  handleBulkApproveKindness: (ids: string[]) => void;
  handleRejectKindness: (k: KindnessSubmission) => void;
}

const TabMisi: React.FC<TabMisiProps> = ({
  missions, submissions, kindnessSubmissions, settings, missionForm, setMissionForm,
  handleAddMission, handleFileUpload, missionFileRef, handleManualSync, syncStatus,
  handleDeleteMission, handleBulkDeleteMissions, handleDeleteSubmission, handleBulkDeleteSubmissions, 
  handleConfirmSubmission, handleApproveKindness, handleBulkApproveKindness, handleRejectKindness
}) => {
  const [activeInternalTab, setActiveInternalTab] = useState<'create' | 'list' | 'validate' | 'kindness'>('create');
  const [selectedMissions, setSelectedMissions] = useState<string[]>([]);
  const [selectedKindness, setSelectedKindness] = useState<string[]>([]);
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);

  // Handlers for Missions
  const toggleMission = (id: string) => {
    const sid = id.toString();
    setSelectedMissions(prev => prev.includes(sid) ? prev.filter(x => x !== sid) : [...prev, sid]);
  };

  const toggleAllMissions = () => {
    if (selectedMissions.length === missions.length) {
      setSelectedMissions([]);
    } else {
      setSelectedMissions(missions.map(m => m.id.toString()));
    }
  };

  // Handlers for Kindness
  const toggleKindness = (id: string) => {
    const sid = id.toString();
    setSelectedKindness(prev => prev.includes(sid) ? prev.filter(x => x !== sid) : [...prev, sid]);
  };

  const pendingKindnessList = useMemo(() => 
    kindnessSubmissions.filter(k => k.status === 'pending')
  , [kindnessSubmissions]);

  const toggleAllKindness = () => {
    if (selectedKindness.length === pendingKindnessList.length) {
      setSelectedKindness([]);
    } else {
      setSelectedKindness(pendingKindnessList.map(k => k.id.toString()));
    }
  };

  // Handlers for Submissions (Validasi Tugas)
  const pendingSubmissionsList = useMemo(() => 
    submissions.filter(s => s.status === 'finished')
  , [submissions]);

  const toggleSubmission = (id: string) => {
    const sid = id.toString();
    setSelectedSubmissions(prev => prev.includes(sid) ? prev.filter(x => x !== sid) : [...prev, sid]);
  };

  const toggleAllSubmissions = () => {
    if (selectedSubmissions.length === pendingSubmissionsList.length) {
      setSelectedSubmissions([]);
    } else {
      setSelectedSubmissions(pendingSubmissionsList.map(s => (s.id || (s as any).ID).toString()));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-[3.5rem] border-4 border-blue-100 shadow-2xl overflow-hidden flex flex-col min-h-[650px]">
        
        {/* TAB NAVIGATION HEADER */}
        <div className="flex bg-slate-50 border-b-2 border-slate-100 p-1.5 flex-wrap">
          <button 
            onClick={() => setActiveInternalTab('create')}
            className={`flex-1 min-w-[140px] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${activeInternalTab === 'create' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            <i className="fas fa-plus-circle"></i> Terbitkan Misi
          </button>
          <button 
            onClick={() => setActiveInternalTab('list')}
            className={`flex-1 min-w-[140px] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${activeInternalTab === 'list' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            <i className="fas fa-list-ul"></i> Misi Aktif ({missions.length})
          </button>
          <button 
            onClick={() => setActiveInternalTab('validate')}
            className={`flex-1 min-w-[140px] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative flex items-center justify-center gap-3 ${activeInternalTab === 'validate' ? 'bg-amber-500 text-white shadow-xl shadow-amber-200' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            <i className="fas fa-tasks"></i> Validasi Tugas
            {pendingSubmissionsList.length > 0 && (
              <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-white animate-bounce">
                {pendingSubmissionsList.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveInternalTab('kindness')}
            className={`flex-1 min-w-[140px] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative flex items-center justify-center gap-3 ${activeInternalTab === 'kindness' ? 'bg-rose-500 text-white shadow-xl shadow-rose-200' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            <i className="fas fa-heart"></i> Laporan Kebaikan
            {pendingKindnessList.length > 0 && (
              <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-white animate-bounce">
                {pendingKindnessList.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB CONTENT AREA */}
        <div className="p-8 md:p-10 flex-grow overflow-y-auto no-scrollbar">
          
          {/* 1. TAB TERBITKAN MISI */}
          {activeInternalTab === 'create' && (
            <div className="animate-in slide-in-from-left-4 duration-500">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8 border-b-2 border-slate-50 pb-5">
                   <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-xl shadow-inner"><i className="fas fa-bullhorn"></i></div>
                   <h3 className="text-xl font-black uppercase text-blue-900 Museum-Text leading-none">Terbitkan Misi Tugas Baru</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Judul Misi Tugas</label><input value={missionForm.title} onChange={e => setMissionForm({...missionForm, title: e.target.value})} className="w-full input-futuristic px-5 py-4 font-bold text-sm" placeholder="Contoh: Eksperimen Fotosintesis" /></div>
                    <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Mata Pelajaran</label><select value={missionForm.subject} onChange={e => setMissionForm({...missionForm, subject: e.target.value})} className="w-full input-futuristic px-5 py-4 font-bold text-sm cursor-pointer">{settings.subjects.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                    <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Instruksi & Detail Tugas</label><textarea value={missionForm.description} onChange={e => setMissionForm({...missionForm, description: e.target.value})} className="w-full input-futuristic px-5 py-4 font-bold text-xs h-32 resize-none leading-relaxed" placeholder="Berikan instruksi langkah-langkah pengerjaan tugas kepada siswa..." /></div>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Hadiah EXP</label><input type="number" value={missionForm.expReward} onChange={e => setMissionForm({...missionForm, expReward: Number(e.target.value)})} className="w-full input-futuristic px-5 py-4 font-black text-indigo-600" /></div>
                      <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Hadiah Koin</label><input type="number" value={missionForm.coinReward} onChange={e => setMissionForm({...missionForm, coinReward: Number(e.target.value)})} className="w-full input-futuristic px-5 py-4 font-black text-amber-600" /></div>
                    </div>
                    <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Batas Waktu (Deadline)</label><input type="date" value={missionForm.deadline} onChange={e => setMissionForm({...missionForm, deadline: e.target.value})} className="w-full input-futuristic px-5 py-4 font-bold text-sm" /></div>
                    <div className="pt-4 space-y-3">
                      <button onClick={handleAddMission} className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 text-xs">
                        <i className="fas fa-paper-plane mr-2"></i> PUBLIKASIKAN MISI KE SISWA
                      </button>
                      <div className="flex items-center gap-3">
                        <input type="file" accept=".html" ref={missionFileRef} onChange={(e) => handleFileUpload('mission', e)} className="hidden" />
                        <button onClick={() => missionFileRef.current?.click()} className="w-full py-4 bg-white text-blue-600 border-2 border-blue-100 rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest hover:bg-blue-50 transition-all active:scale-95 flex items-center justify-center gap-3">
                          <i className="fas fa-file-upload"></i> UNGGAH FILE MISI (.HTML)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. TAB MISI AKTIF */}
          {activeInternalTab === 'list' && (
            <div className="animate-in fade-in duration-500 flex flex-col h-full">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-slate-50 p-5 rounded-[2.2rem] border-2 border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-lg shadow-lg"><i className="fas fa-list-check"></i></div>
                  <div>
                    <h3 className="text-lg font-black uppercase text-blue-900 Museum-Text leading-none">Daftar Misi Aktif</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Kelola tugas yang sedang berjalan di kelas.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleManualSync} className={`px-4 py-2 bg-white text-blue-600 border-2 border-blue-100 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm ${syncStatus === 'syncing' ? 'opacity-50' : ''}`} title="Muat Misi Lalu">
                    <i className={`fas fa-sync-alt mr-2 ${syncStatus === 'syncing' ? 'fa-spin' : ''}`}></i> Sinkronisasi Cloud
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4 px-4">
                <div onClick={toggleAllMissions} className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedMissions.length === missions.length && missions.length > 0 ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white group-hover:border-blue-400'}`}>
                    {selectedMissions.length === missions.length && missions.length > 0 && <i className="fas fa-check text-[7px]"></i>}
                  </div>
                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Pilih Semua ({missions.length})</span>
                </div>
                {selectedMissions.length > 0 && (
                  <button 
                    onClick={() => { handleBulkDeleteMissions(selectedMissions); setSelectedMissions([]); }} 
                    className="px-4 py-2 bg-red-500 text-white rounded-xl font-black uppercase text-[8px] flex items-center gap-2 hover:bg-red-600 transition-colors shadow-lg animate-in zoom-in"
                  >
                    <i className="fas fa-trash"></i> Hapus Misi Terpilih ({selectedMissions.length})
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 flex-grow">
                {missions.length === 0 ? (
                  <div className="col-span-full py-20 text-center opacity-30 flex flex-col items-center gap-4 h-full justify-center">
                    <i className="fas fa-ghost text-5xl"></i>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Belum ada misi aktif di kelas.</p>
                  </div>
                ) : (
                  missions.slice().reverse().map(m => (
                    <div key={m.id} className={`p-5 border-2 rounded-[2rem] flex flex-col justify-between transition-all group relative overflow-hidden ${selectedMissions.includes(m.id.toString()) ? 'bg-blue-50 border-blue-400 shadow-lg scale-[1.02]' : 'bg-white border-slate-50 hover:border-blue-200'}`}>
                      <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none"><i className="fas fa-scroll text-5xl"></i></div>
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div onClick={() => toggleMission(m.id)} className={`w-5 h-5 shrink-0 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${selectedMissions.includes(m.id.toString()) ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 bg-white group-hover:border-blue-300'}`}>
                            {selectedMissions.includes(m.id.toString()) && <i className="fas fa-check text-[9px]"></i>}
                          </div>
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[7px] font-black uppercase tracking-widest">{m.subject}</span>
                        </div>
                        <h4 className="font-black text-blue-950 uppercase text-[11px] Museum-Text leading-tight mb-2 truncate">{m.title}</h4>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mb-4"><i className="fas fa-calendar-day mr-1"></i> Deadline: {m.deadline}</p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <div className="flex gap-2">
                           <span className="text-[8px] font-black text-indigo-600">★ {m.expReward}</span>
                           <span className="text-[8px] font-black text-amber-500">🪙 {m.coinReward}</span>
                        </div>
                        <button onClick={() => handleDeleteMission(m.id)} className="w-8 h-8 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shrink-0 shadow-sm"><i className="fas fa-trash-alt text-[10px]"></i></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 3. TAB VALIDASI TUGAS */}
          {activeInternalTab === 'validate' && (
            <div className="animate-in zoom-in duration-500 flex flex-col h-full">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-amber-50 p-5 rounded-[2.2rem] border-2 border-amber-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-lg shadow-lg"><i className="fas fa-check-double"></i></div>
                  <div>
                    <h3 className="text-lg font-black uppercase text-amber-700 Museum-Text leading-none">Validasi Laporan Tugas</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Tinjau dan berikan nilai pada tugas masuk.</p>
                  </div>
                </div>
                <div className="bg-white px-5 py-2 rounded-xl border border-amber-200">
                  <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Tugas Menunggu: {pendingSubmissionsList.length}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4 px-4">
                <div onClick={toggleAllSubmissions} className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedSubmissions.length === pendingSubmissionsList.length && pendingSubmissionsList.length > 0 ? 'bg-amber-600 border-amber-600 text-white' : 'border-slate-300 bg-white group-hover:border-amber-400'}`}>
                    {selectedSubmissions.length === pendingSubmissionsList.length && pendingSubmissionsList.length > 0 && <i className="fas fa-check text-[7px]"></i>}
                  </div>
                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Pilih Semua ({pendingSubmissionsList.length})</span>
                </div>
                {selectedSubmissions.length > 0 && (
                  <button 
                    onClick={() => { handleBulkDeleteSubmissions(selectedSubmissions); setSelectedSubmissions([]); }} 
                    className="px-4 py-2 bg-red-500 text-white rounded-xl font-black uppercase text-[8px] flex items-center gap-2 hover:bg-red-600 transition-colors shadow-lg animate-in zoom-in"
                  >
                    <i className="fas fa-trash-can"></i> Hapus Laporan Terpilih ({selectedSubmissions.length})
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-grow">
                {pendingSubmissionsList.length === 0 ? (
                  <div className="col-span-full py-20 text-center opacity-30 flex flex-col items-center gap-4 h-full justify-center">
                    <i className="fas fa-inbox text-5xl text-amber-200"></i>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Kotak masuk laporan tugas kosong.</p>
                  </div>
                ) : (
                  pendingSubmissionsList.map(sub => {
                    const subId = (sub.id || (sub as any).ID).toString().trim();
                    const mission = missions.find(m => m.id.toString().trim() === sub.missionId.toString().trim());
                    const isSelected = selectedSubmissions.includes(subId);
                    
                    return (
                      <div key={subId} className={`p-6 rounded-[2.2rem] border-2 flex flex-col gap-4 animate-in fade-in duration-300 transition-all relative ${isSelected ? 'bg-amber-100 border-amber-400 shadow-lg scale-[1.02]' : 'bg-amber-50/20 border-amber-50 hover:border-amber-200'}`}>
                          <button 
                            onClick={() => handleDeleteSubmission(subId)}
                            className="absolute top-4 right-4 text-amber-200 hover:text-red-500 transition-colors"
                          >
                            <i className="fas fa-times-circle text-xl"></i>
                          </button>
                          
                          <div className="flex items-center gap-4">
                            <div 
                              onClick={() => toggleSubmission(subId)}
                              className={`w-6 h-6 shrink-0 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${isSelected ? 'bg-amber-600 border-amber-600 text-white' : 'border-slate-200 bg-white group-hover:border-amber-300'}`}
                            >
                               {isSelected && <i className="fas fa-check text-[10px]"></i>}
                            </div>
                            <div className="truncate">
                              <p className="font-black text-blue-900 uppercase text-xs truncate w-32 md:w-48">{sub.studentName}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase truncate italic mt-1">{mission?.title || "Misi Selesai"}</p>
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-2xl border border-amber-100 space-y-3">
                            <div className="flex items-center justify-between px-1">
                               <span className="text-[8px] font-black text-slate-400 uppercase">Beri Nilai (0-100)</span>
                               <i className="fas fa-feather-pointed text-amber-400 text-xs"></i>
                            </div>
                            <input 
                              type="number" 
                              id={`score-${subId}`} 
                              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 text-sm font-black text-center text-blue-900 focus:border-amber-400 outline-none transition-all" 
                              placeholder="Ketik Skor..." 
                            />
                            <button 
                              onClick={() => { const input = document.getElementById(`score-${subId}`) as HTMLInputElement; handleConfirmSubmission(sub, Number(input.value)); }} 
                              className="w-full py-3.5 bg-emerald-500 text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-xl shadow-emerald-100 active:scale-95 transition-all hover:bg-emerald-600"
                            >
                              KONFIRMASI NILAI
                            </button>
                          </div>
                          <p className="text-[7px] font-bold text-slate-300 uppercase text-center tracking-widest italic">Dikirim: {new Date(sub.submittedAt).toLocaleString('id-ID')}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* 4. TAB LAPORAN KEBAIKAN */}
          {activeInternalTab === 'kindness' && (
            <div className="animate-in slide-in-from-right-4 duration-500 flex flex-col h-full">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-rose-50 p-5 rounded-[2.2rem] border-2 border-rose-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center text-lg shadow-lg"><i className="fas fa-hand-holding-heart"></i></div>
                  <div>
                    <h3 className="text-lg font-black uppercase text-rose-700 Museum-Text leading-none">Validasi Botol Kebaikan</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Konfirmasi aksi terpuji siswa untuk koin & cahaya.</p>
                  </div>
                </div>
                <div className="bg-white px-5 py-2 rounded-xl border border-rose-200">
                  <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Laporan Masuk: {pendingKindnessList.length}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4 px-4">
                <div onClick={toggleAllKindness} className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedKindness.length === pendingKindnessList.length && pendingKindnessList.length > 0 ? 'bg-rose-600 border-rose-600 text-white' : 'border-rose-300 bg-white group-hover:border-rose-500'}`}>
                    {selectedKindness.length === pendingKindnessList.length && pendingKindnessList.length > 0 && <i className="fas fa-check text-[7px]"></i>}
                  </div>
                  <span className="text-[9px] font-black uppercase text-rose-700 tracking-widest">Pilih Semua ({pendingKindnessList.length})</span>
                </div>
                {selectedKindness.length > 0 && (
                  <button 
                    onClick={() => { handleBulkApproveKindness(selectedKindness); setSelectedKindness([]); }} 
                    className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-black uppercase text-[8px] flex items-center gap-2 hover:bg-emerald-600 transition-colors shadow-lg animate-in zoom-in"
                  >
                    <i className="fas fa-check-double"></i> Setujui Masal ({selectedKindness.length})
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-grow">
                {pendingKindnessList.length === 0 ? (
                  <div className="col-span-full py-20 text-center opacity-30 flex flex-col items-center gap-4 h-full justify-center">
                    <i className="fas fa-heart-circle-check text-5xl text-rose-200"></i>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Belum ada laporan kebaikan siswa.</p>
                  </div>
                ) : (
                  pendingKindnessList.map(k => (
                    <div key={k.id} className={`p-6 border-2 rounded-[2.2rem] flex flex-col gap-4 animate-in fade-in transition-all relative ${selectedKindness.includes(k.id.toString()) ? 'bg-rose-100 border-rose-400 shadow-lg scale-[1.02]' : 'bg-white border-slate-50 hover:border-rose-200'}`}>
                        <div className="flex items-center gap-4 border-b border-rose-50 pb-3">
                          <div onClick={() => toggleKindness(k.id)} className={`w-6 h-6 shrink-0 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${selectedKindness.includes(k.id.toString()) ? 'bg-rose-600 border-rose-600 text-white' : 'border-slate-200 bg-white group-hover:border-rose-300'}`}>
                             {selectedKindness.includes(k.id.toString()) && <i className="fas fa-check text-[10px]"></i>}
                          </div>
                          <div className="truncate">
                             <p className="font-black text-blue-900 uppercase text-xs truncate w-32 md:w-48">{k.studentName}</p>
                             <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{k.date}</p>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-slate-50 rounded-2xl border-2 border-white shadow-inner min-h-[80px] flex items-center">
                          <p className="text-[10px] font-bold text-slate-600 italic leading-relaxed uppercase">
                            "{k.description}"
                          </p>
                        </div>
                        
                        <div className="flex gap-3 mt-auto">
                          <button onClick={() => handleApproveKindness(k)} className="flex-grow py-3.5 bg-emerald-500 text-white rounded-xl font-black uppercase text-[9px] shadow-xl shadow-emerald-100 active:scale-95 transition-all hover:bg-emerald-600">
                             SETUJUI (+10 KOIN)
                          </button>
                          <button onClick={() => handleRejectKindness(k)} className="px-5 py-3.5 bg-white text-rose-500 border-2 border-rose-100 rounded-xl font-black uppercase text-[9px] active:scale-95 hover:bg-rose-50 transition-all">
                             TOLAK
                          </button>
                        </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default TabMisi;