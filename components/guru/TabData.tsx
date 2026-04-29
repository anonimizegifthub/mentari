
import React, { useState, useEffect, useRef } from 'react';
import { Student, TeacherSettings } from '../../types';

interface TabDataProps {
  students: Student[];
  setStudents: (s: Student[]) => void;
  settings: TeacherSettings;
  setSettings: (s: TeacherSettings) => void;
  newStudentName: string;
  setNewStudentName: (v: string) => void;
  newStudentPin: string;
  setNewStudentPin: (v: string) => void;
  newSubjectName: string;
  setNewSubjectName: (v: string) => void;
  handleAddStudent: () => void;
  saveToGas: (action: string, payload: any) => Promise<boolean>;
}

const TabData: React.FC<TabDataProps> = ({
  students, setStudents, settings, setSettings,
  newStudentName, setNewStudentName, newStudentPin, setNewStudentPin,
  newSubjectName, setNewSubjectName, handleAddStudent, saveToGas
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [internalTab, setInternalTab] = useState<'students' | 'subjects'>('students');
  
  // LOGIK KKM BARU: Local state agar slider leluasa digeser tanpa lag/langsung simpan
  const [localKKM, setLocalKKM] = useState(settings.passingGrade || 70);
  const isDirty = localKKM !== settings.passingGrade;
  
  // Ref untuk menyimpan nilai terbaru guna kebutuhan auto-save saat unmount
  const kkmRef = useRef(localKKM);
  const settingsRef = useRef(settings);

  useEffect(() => {
    kkmRef.current = localKKM;
  }, [localKKM]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Sync lokal jika settings berubah dari luar (misal: sync cloud)
  useEffect(() => {
    setLocalKKM(settings.passingGrade || 70);
  }, [settings.passingGrade]);

  const toggleSelectAll = () => {
    if (selectedIds.length === students.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map(s => s.id.toString()));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Hapus ${selectedIds.length} siswa terpilih secara permanen?`)) return;
    const remainingStudents = students.filter(s => !selectedIds.includes(s.id.toString()));
    setStudents(remainingStudents);
    setSelectedIds([]);
    await saveToGas('updateStudents', { students: remainingStudents });
    alert("Berhasil menghapus siswa terpilih!");
  };

  // Fungsi simpan manual
  const handleManualSaveKKM = async () => {
    if (!isDirty) return;
    const updatedSettings = { ...settings, passingGrade: localKKM };
    setSettings(updatedSettings);
    const success = await saveToGas('updateSettings', { settings: updatedSettings });
    if (success) alert("Standar KKM Berhasil Disimpan!");
  };

  // Fungsi auto-save saat keluar tab
  const handleAutoSaveOnExit = async () => {
    if (kkmRef.current !== settingsRef.current.passingGrade) {
      const updatedSettings = { ...settingsRef.current, passingGrade: kkmRef.current };
      setSettings(updatedSettings);
      await saveToGas('updateSettings', { settings: updatedSettings });
    }
  };

  // Jalankan auto-save saat berpindah internal tab (subjects -> students)
  const handleSwitchTab = (tab: 'students' | 'subjects') => {
    if (internalTab === 'subjects' && tab === 'students') {
      handleAutoSaveOnExit();
    }
    setInternalTab(tab);
  };

  // Jalankan auto-save saat unmount (pindah tab utama Panel Guru atau menu lain)
  useEffect(() => {
    return () => {
      // Kita panggil fungsi simpan jika ada perubahan yang tertinggal
      if (kkmRef.current !== settingsRef.current.passingGrade) {
        const updated = { ...settingsRef.current, passingGrade: kkmRef.current };
        // Post ke GAS tanpa mempedulikan state React yang akan hilang (unmount)
        fetch(updated.gasUrl, { 
          method: 'POST', 
          mode: 'no-cors', 
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ action: 'updateSettings', settings: updated }) 
        }).catch(e => console.warn("Auto-save unmount failed", e));
      }
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-in fade-in duration-500">
      <div className="glass-card rounded-[3rem] p-1.5 bg-white border-4 border-blue-100 shadow-xl overflow-hidden">
        {/* INTERNAL TABS */}
        <div className="flex bg-slate-50 border-b-2 border-slate-100 rounded-t-[2.5rem]">
          <button 
            onClick={() => handleSwitchTab('students')}
            className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest transition-all Museum-Text flex items-center justify-center gap-3 ${internalTab === 'students' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            <i className="fas fa-user-group"></i> Daftar Siswa
          </button>
          <button 
            onClick={() => handleSwitchTab('subjects')}
            className={`flex-1 py-4 text-[11px] font-black uppercase tracking-widest transition-all Museum-Text flex items-center justify-center gap-3 ${internalTab === 'subjects' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            <i className="fas fa-book"></i> Mata Pelajaran
          </button>
        </div>

        <div className="p-6 md:p-8">
           {internalTab === 'students' && (
             <div className="animate-in slide-in-from-left-4 duration-500 space-y-5">
                <div className="bg-blue-50 p-5 rounded-[2rem] border-2 border-blue-100">
                   <h4 className="text-[9px] font-black uppercase text-blue-600 mb-3 ml-1">Registrasi Siswa Baru</h4>
                   <div className="flex flex-col sm:flex-row gap-3">
                      <input value={newStudentName} onChange={e => setNewStudentName(e.target.value)} className="flex-[2] input-futuristic px-5 py-3 font-bold uppercase text-[10px]" placeholder="Nama Siswa..." />
                      <input value={newStudentPin} onChange={e => setNewStudentPin(e.target.value)} type="password" maxLength={6} className="flex-1 input-futuristic px-5 py-3 font-bold text-center tracking-[0.5em] text-xs" placeholder="PIN" />
                      <button onClick={handleAddStudent} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-[9px] shadow-lg active:scale-95 transition-all">Simpan</button>
                   </div>
                </div>

                <div className="flex flex-col">
                    <div className="flex justify-between items-center px-4 mb-3">
                       <div onClick={toggleSelectAll} className="flex items-center gap-2 cursor-pointer group">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedIds.length === students.length && students.length > 0 ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white group-hover:border-blue-400'}`}>
                             {selectedIds.length === students.length && students.length > 0 && <i className="fas fa-check text-[7px]"></i>}
                          </div>
                          <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Pilih Semua ({students.length})</span>
                       </div>
                       {selectedIds.length > 0 && (
                          <button onClick={handleBulkDelete} className="px-3.5 py-1.5 bg-red-500 text-white rounded-xl font-black uppercase text-[7px] shadow-lg flex items-center gap-1.5 animate-in zoom-in">
                            <i className="fas fa-trash-can"></i> Hapus ({selectedIds.length})
                          </button>
                       )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-2 no-scrollbar max-h-[350px] p-1">
                        {students.length === 0 ? (
                            <div className="col-span-full py-16 text-center opacity-30 text-[10px] font-black uppercase flex flex-col items-center gap-4">
                               <i className="fas fa-user-slash text-4xl"></i>
                               <p>Belum ada data siswa terdaftar.</p>
                            </div>
                        ) : (
                          students.map(s => (
                            <div key={s.id} className={`p-3.5 rounded-2xl border-2 flex justify-between items-center transition-all group ${selectedIds.includes(s.id.toString()) ? 'bg-blue-50 border-blue-400 shadow-md' : 'bg-slate-50 border-slate-100 hover:border-blue-200'}`}>
                                <div className="flex items-center gap-3">
                                   <div onClick={() => toggleSelect(s.id.toString())} className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-all ${selectedIds.includes(s.id.toString()) ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'}`}>
                                      {selectedIds.includes(s.id.toString()) && <i className="fas fa-check text-[6px]"></i>}
                                   </div>
                                   <div className="truncate">
                                      <p className="font-black text-slate-700 uppercase text-[10px] truncate w-32">{s.name}</p>
                                      <p className="text-[8px] font-black text-blue-400 uppercase">Lv {s.level || 1} • PIN: {s.pin}</p>
                                   </div>
                                </div>
                                <button onClick={async () => { if(confirm(`Hapus ${s.name}?`)) { const updated = students.filter(x => x.id !== s.id); setStudents(updated); await saveToGas('updateStudents', { students: updated }); }}} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><i className="fas fa-trash-alt text-[9px]"></i></button>
                            </div>
                          ))
                        )}
                    </div>
                </div>
             </div>
           )}

           {internalTab === 'subjects' && (
             <div className="animate-in slide-in-from-right-4 duration-500 space-y-8">
                {/* STANDAR KETUNTASAN (KKM) PARAMETER */}
                <div className="bg-indigo-50/50 p-6 rounded-[2rem] border-2 border-indigo-100 shadow-inner">
                   <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Standar Ketuntasan (KKM)</h4>
                        <p className="text-[8px] font-bold text-slate-400 uppercase italic">Gunakan slider untuk mengatur ambang batas capaian.</p>
                      </div>
                      <div className={`w-14 h-14 rounded-2xl border-4 flex items-center justify-center text-xl font-black shadow-sm Museum-Text transition-all ${isDirty ? 'bg-amber-400 text-white border-amber-200 animate-pulse' : 'bg-white text-indigo-600 border-indigo-200'}`}>
                         {localKKM}
                      </div>
                   </div>
                   
                   <div className="flex flex-col gap-4">
                     <input 
                        type="range" 
                        min="50" 
                        max="95" 
                        step="1" 
                        value={localKKM} 
                        onChange={(e) => setLocalKKM(Number(e.target.value))}
                        className="w-full h-2 bg-indigo-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                     />
                     <div className="flex justify-between px-1">
                        <span className="text-[7px] font-black text-slate-300">MIN: 50</span>
                        <span className="text-[7px] font-black text-slate-300">MAX: 95</span>
                     </div>
                     
                     {/* TOMBOL SIMPAN MANUAL */}
                     {isDirty && (
                       <div className="flex justify-center animate-in slide-in-from-top-2">
                         <button 
                           onClick={handleManualSaveKKM}
                           className="px-6 py-2.5 bg-amber-500 text-white rounded-xl font-black uppercase text-[9px] tracking-[0.2em] shadow-lg shadow-amber-200 hover:bg-amber-600 active:scale-95 transition-all flex items-center gap-2"
                         >
                           <i className="fas fa-cloud-arrow-up"></i> SIMPAN STANDAR KKM
                         </button>
                       </div>
                     )}
                   </div>
                </div>

                <div className="bg-emerald-50 p-5 rounded-[2rem] border-2 border-emerald-100">
                   <h4 className="text-[9px] font-black uppercase text-emerald-600 mb-3 ml-1">Tambah Mata Pelajaran</h4>
                   <div className="flex gap-3">
                      <input value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)} className="flex-grow input-futuristic px-5 py-3 font-bold uppercase text-[10px]" placeholder="Nama Mapel..." />
                      <button onClick={async () => { if(!newSubjectName.trim()) return; const updated = [...settings.subjects, newSubjectName.trim()]; setSettings({...settings, subjects: updated}); setNewSubjectName(''); await saveToGas('updateSettings', { settings: {...settings, subjects: updated} }); }} className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-black text-[9px] uppercase shadow-lg active:scale-95 transition-all">Tambah</button>
                   </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto pr-2 no-scrollbar max-h-[350px] p-1">
                    {settings.subjects.length === 0 ? (
                        <div className="col-span-full py-16 text-center opacity-30 text-[10px] font-black uppercase flex flex-col items-center gap-4">
                           <i className="fas fa-book-open text-4xl"></i>
                           <p>Belum ada mata pelajaran.</p>
                        </div>
                    ) : (
                      settings.subjects.map(subj => (
                        <div key={subj} className="p-3.5 bg-white border-2 border-emerald-100 rounded-2xl flex justify-between items-center hover:shadow-lg hover:border-emerald-300 transition-all group">
                            <p className="font-black text-emerald-700 uppercase text-[10px] truncate w-32">{subj}</p>
                            <button onClick={async () => { if(confirm(`Hapus ${subj}?`)) { const updated = settings.subjects.filter(x => x !== subj); setSettings({...settings, subjects: updated}); await saveToGas('updateSettings', { settings: {...settings, subjects: updated} }); }}} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><i className="fas fa-times text-[9px]"></i></button>
                        </div>
                      ))
                    )}
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default TabData;
