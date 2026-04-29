
import React, { useState } from 'react';
import { InteractiveMaterial } from '../../types';

interface TabMateriProps {
  materials: InteractiveMaterial[];
  setMaterials: (m: InteractiveMaterial[]) => void;
  teacherLabs: InteractiveMaterial[];
  setTeacherLabs: (m: InteractiveMaterial[]) => void;
  handleFileUpload: (type: 'material', e: React.ChangeEvent<HTMLInputElement>) => void;
  materialFileRef: React.RefObject<HTMLInputElement | null>;
  handleManualSync: () => void;
  syncStatus: string;
  saveToGas: (action: string, payload: any) => Promise<boolean>;
}

const TabMateri: React.FC<TabMateriProps> = ({
  materials, setMaterials, teacherLabs, setTeacherLabs, handleFileUpload, materialFileRef, handleManualSync, syncStatus, saveToGas
}) => {
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);

  const toggleSelectStudent = (id: string) => {
    const sid = id.toString();
    setSelectedStudentIds(prev => prev.includes(sid) ? prev.filter(x => x !== sid) : [...prev, sid]);
  };

  const toggleSelectTeacher = (id: string) => {
    const sid = id.toString();
    setSelectedTeacherIds(prev => prev.includes(sid) ? prev.filter(x => x !== sid) : [...prev, sid]);
  };

  const toggleSelectAllStudent = () => {
    if (selectedStudentIds.length === materials.length && materials.length > 0) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(materials.map(m => m.id.toString()));
    }
  };

  const toggleSelectAllTeacher = () => {
    if (selectedTeacherIds.length === teacherLabs.length && teacherLabs.length > 0) {
      setSelectedTeacherIds([]);
    } else {
      setSelectedTeacherIds(teacherLabs.map(m => m.id.toString()));
    }
  };

  const handleBulkDeleteStudent = async () => {
    if (selectedStudentIds.length === 0) return;
    if (!confirm(`Hapus ${selectedStudentIds.length} materi eksplorasi siswa terpilih secara permanen?`)) return;

    const remainingMaterials = materials.filter(m => !selectedStudentIds.includes(m.id.toString()));
    setMaterials(remainingMaterials);
    setSelectedStudentIds([]);
    await saveToGas('updateMaterials', { materials: remainingMaterials });
    alert("Materi siswa terpilih berhasil dihapus!");
  };

  const handleBulkDeleteTeacher = async () => {
    if (selectedTeacherIds.length === 0) return;
    if (!confirm(`Hapus ${selectedTeacherIds.length} lab maya guru terpilih secara permanen?`)) return;

    const remainingLabs = teacherLabs.filter(m => !selectedTeacherIds.includes(m.id.toString()));
    setTeacherLabs(remainingLabs);
    setSelectedTeacherIds([]);
    await saveToGas('updateTeacherLabs', { labs: remainingLabs });
    alert("Lab guru terpilih berhasil dihapus!");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-white p-5 rounded-[2.5rem] border-4 border-emerald-100 shadow-xl no-print">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-emerald-100"><i className="fas fa-flask"></i></div>
           <div>
              <h3 className="text-xl font-black Museum-Text uppercase text-emerald-600">Manajemen Lab Maya</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kelola seluruh simulasi dan materi literasi aktif.</p>
           </div>
        </div>
        <button onClick={handleManualSync} className={`px-6 py-3 bg-white text-emerald-600 border-2 border-emerald-100 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm ${syncStatus === 'syncing' ? 'opacity-50' : ''}`}>
           <i className={`fas fa-sync-alt mr-2 ${syncStatus === 'syncing' ? 'fa-spin' : ''}`}></i> Sinkronisasi Cloud
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* BAGIAN 1: LABORATORIUM GURU */}
        <div className="glass-card rounded-[3.5rem] p-7 border-4 border-white bg-white shadow-xl flex flex-col min-h-[500px]">
           <div className="flex items-center justify-between mb-6 border-b-2 border-slate-50 pb-4">
              <h4 className="text-sm font-black uppercase text-blue-600 flex items-center gap-3"><i className="fas fa-chalkboard-user"></i> Laboratorium Guru</h4>
              <div className="flex items-center gap-3">
                 <input type="file" accept=".html" ref={materialFileRef} onChange={(e) => handleFileUpload('material', e)} className="hidden" />
                 {selectedTeacherIds.length > 0 && (
                   <button onClick={handleBulkDeleteTeacher} className="px-3 py-1.5 bg-red-500 text-white rounded-xl font-black uppercase text-[8px] animate-in zoom-in"><i className="fas fa-trash"></i> Hapus ({selectedTeacherIds.length})</button>
                 )}
              </div>
           </div>

           <div onClick={toggleSelectAllTeacher} className="flex items-center gap-3 cursor-pointer group mb-4 px-2">
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedTeacherIds.length === teacherLabs.length && teacherLabs.length > 0 ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'}`}>
                 {selectedTeacherIds.length === teacherLabs.length && teacherLabs.length > 0 && <i className="fas fa-check text-[7px]"></i>}
              </div>
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Pilih Semua ({teacherLabs.length})</span>
           </div>

           <div className="space-y-2.5 flex-grow overflow-y-auto pr-2 no-scrollbar">
              {teacherLabs.length === 0 ? (
                  <div className="py-12 text-center opacity-30 flex flex-col items-center gap-4">
                     <i className="fas fa-vial text-4xl"></i>
                     <p className="text-[10px] font-black uppercase tracking-widest">Belum ada lab guru.</p>
                  </div>
              ) : (
                teacherLabs.slice().reverse().map(m => (
                  <div key={m.id} className={`p-3.5 border-2 rounded-2xl flex justify-between items-center transition-all group ${selectedTeacherIds.includes(m.id.toString()) ? 'bg-blue-50 border-blue-400 shadow-md' : 'bg-slate-50 border-slate-100 hover:border-blue-300'}`}>
                    <div className="flex items-center gap-4 truncate">
                      <div onClick={() => toggleSelectTeacher(m.id.toString())} className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center cursor-pointer transition-all ${selectedTeacherIds.includes(m.id.toString()) ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'}`}>
                         {selectedTeacherIds.includes(m.id.toString()) && <i className="fas fa-check text-[7px]"></i>}
                      </div>
                      <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 shrink-0"><i className="fas fa-vial text-sm"></i></div>
                      <div className="truncate">
                        <p className="font-black text-slate-800 uppercase text-[10px] truncate w-40">{m.title}</p>
                        <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest">{m.subject}</p>
                      </div>
                    </div>
                    <button onClick={async () => { if(confirm("Hapus lab guru ini?")) { const updated = teacherLabs.filter(x => x.id !== m.id); setTeacherLabs(updated); await saveToGas('updateTeacherLabs', { labs: updated }); }}} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><i className="fas fa-trash-alt text-[9px]"></i></button>
                  </div>
                ))
              )}
           </div>
        </div>

        {/* BAGIAN 2: EKSPLORASI SISWA */}
        <div className="glass-card rounded-[3.5rem] p-7 border-4 border-white bg-white shadow-xl flex flex-col min-h-[500px]">
           <div className="flex items-center justify-between mb-6 border-b-2 border-slate-50 pb-4">
              <h4 className="text-sm font-black uppercase text-emerald-600 flex items-center gap-3"><i className="fas fa-book-open"></i> Eksplorasi Siswa</h4>
              {selectedStudentIds.length > 0 && (
                 <button onClick={handleBulkDeleteStudent} className="px-3 py-1.5 bg-red-500 text-white rounded-xl font-black uppercase text-[8px] animate-in zoom-in"><i className="fas fa-trash"></i> Hapus ({selectedStudentIds.length})</button>
              )}
           </div>

           <div onClick={toggleSelectAllStudent} className="flex items-center gap-3 cursor-pointer group mb-4 px-2">
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedStudentIds.length === materials.length && materials.length > 0 ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'}`}>
                 {selectedStudentIds.length === materials.length && materials.length > 0 && <i className="fas fa-check text-[7px]"></i>}
              </div>
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Pilih Semua ({materials.length})</span>
           </div>

           <div className="space-y-2.5 flex-grow overflow-y-auto pr-2 no-scrollbar">
              {materials.length === 0 ? (
                  <div className="py-12 text-center opacity-30 flex flex-col items-center gap-4">
                     <i className="fas fa-book-open text-4xl"></i>
                     <p className="text-[10px] font-black uppercase tracking-widest">Belum ada materi siswa.</p>
                  </div>
              ) : (
                materials.slice().reverse().map(m => (
                  <div key={m.id} className={`p-3.5 border-2 rounded-2xl flex justify-between items-center transition-all group ${selectedStudentIds.includes(m.id.toString()) ? 'bg-emerald-50 border-emerald-400 shadow-md' : 'bg-slate-50 border-slate-100 hover:border-emerald-300'}`}>
                    <div className="flex items-center gap-4 truncate">
                      <div onClick={() => toggleSelectStudent(m.id.toString())} className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center cursor-pointer transition-all ${selectedStudentIds.includes(m.id.toString()) ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'}`}>
                         {selectedStudentIds.includes(m.id.toString()) && <i className="fas fa-check text-[7px]"></i>}
                      </div>
                      <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 shrink-0"><i className="fas fa-book text-sm"></i></div>
                      <div className="truncate">
                        <p className="font-black text-slate-800 uppercase text-[10px] truncate w-40">{m.title}</p>
                        <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest">{m.subject}</p>
                      </div>
                    </div>
                    <button onClick={async () => { if(confirm("Hapus materi siswa ini?")) { const updated = materials.filter(x => x.id !== m.id); setMaterials(updated); await saveToGas('updateMaterials', { materials: updated }); }}} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><i className="fas fa-trash-alt text-[9px]"></i></button>
                  </div>
                ))
              )}
           </div>
        </div>

      </div>
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default TabMateri;
