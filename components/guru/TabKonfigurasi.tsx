
import React, { useState } from 'react';
import { TeacherSettings } from '../../types';

interface TabKonfigurasiProps {
  settings: TeacherSettings;
  setSettings: (s: TeacherSettings) => void;
  isUnlocked: boolean;
  setShowActivationModal: (v: boolean) => void;
  copyShareLink: () => void;
  handleManualSync: () => void;
  saveToGas: (action: string, payload: any) => Promise<boolean>;
  myDeviceId: string;
}

const TabKonfigurasi: React.FC<TabKonfigurasiProps> = ({
  settings, setSettings, isUnlocked, setShowActivationModal, copyShareLink, handleManualSync, saveToGas, myDeviceId
}) => {
  
  const handleToggleAnnouncement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSettings({
      ...settings,
      isAnnouncementActive: !settings.isAnnouncementActive
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-in fade-in duration-500">
      <div className="glass-card rounded-[2.5rem] p-7 space-y-6 border-4 border-white bg-white shadow-xl">
        <h3 className="text-lg font-black Museum-Text uppercase text-blue-600 text-center flex items-center justify-center gap-4"><i className="fas fa-cogs"></i> Pengaturan Sistem</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-1.5"><label className="text-[9px] font-black uppercase text-slate-400 ml-1">Nama Guru</label><input value={settings.teacherName} onChange={e => setSettings({...settings, teacherName: e.target.value})} className="w-full input-futuristic px-5 py-3 font-bold text-xs" /></div>
            <div className="space-y-1.5"><label className="text-[9px] font-black uppercase text-slate-400 ml-1">Sekolah</label><input value={settings.schoolName} onChange={e => setSettings({...settings, schoolName: e.target.value})} className="w-full input-futuristic px-5 py-3 font-bold text-xs" /></div>
            <div className="space-y-1.5"><label className="text-[9px] font-black uppercase text-slate-400 ml-1">Kelas</label><input value={settings.className} onChange={e => setSettings({...settings, className: e.target.value})} className="w-full input-futuristic px-5 py-3 font-bold text-xs" /></div>
            
            {/* PARAMETER MODEL AI DENGAN KETERANGAN DETAIL */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-indigo-500 ml-1 flex items-center gap-2">
                <i className="fas fa-brain"></i> Engine Kecerdasan AI
              </label>
              <select 
                value={settings.aiModel || 'gemini-3-flash-preview'} 
                onChange={e => setSettings({...settings, aiModel: e.target.value})} 
                className="w-full input-futuristic px-5 py-3 font-black text-[10px] text-blue-600 uppercase tracking-widest cursor-pointer border-2 border-indigo-50"
              >
                <option value="gemini-3-flash-preview">Gemini 3 Flash (Cepat & Efisien)</option>
                <option value="gemini-3-pro-preview">Gemini 3 Pro (Pintar - Banana Pro)</option>
              </select>
              
              <div className="mt-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <i className="fas fa-bolt text-[10px]"></i>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-blue-600 uppercase tracking-wider mb-0.5">GEMINI 3 FLASH (STANDARD)</p>
                    <p className="text-[7px] font-bold text-slate-500 uppercase leading-relaxed">
                      <span className="text-emerald-600">KELEBIHAN:</span> Respons sangat instan, stabil untuk perakitan cepat, dan efisien dalam penggunaan token.
                      <br/>
                      <span className="text-rose-500">KONSEKUENSI:</span> Kedalaman analisis materi bersifat umum dan instruksi kompleks kadang disederhanakan.
                    </p>
                  </div>
                </div>

                <div className="h-px bg-indigo-100 w-full"></div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <i className="fas fa-microchip text-[10px]"></i>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-indigo-600 uppercase tracking-wider mb-0.5">GEMINI 3 PRO (PREMIUM ENGINE)</p>
                    <p className="text-[7px] font-bold text-slate-500 uppercase leading-relaxed">
                      <span className="text-emerald-600">KELEBIHAN:</span> Penalaran superior (Advanced Reasoning). Menghasilkan narasi materi yang jauh lebih detail, kreatif, dan presisi.
                      <br/>
                      <span className="text-rose-500">KONSEKUENSI:</span> Waktu tunggu (Latency) lebih lama saat merakit. Mengonsumsi token API secara masif.
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-[7px] font-bold text-slate-400 uppercase mt-2 ml-1">* Perubahan engine akan diterapkan pada sesi perakitan AI berikutnya.</p>
            </div>
          </div>

          <div className="flex flex-col h-full space-y-4">
            <div className="flex flex-col flex-grow space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[9px] font-black uppercase text-slate-400">Buat Pengumuman</label>
                <button 
                  type="button"
                  onClick={handleToggleAnnouncement} 
                  className={`text-[8px] px-4 py-1 rounded-full font-black uppercase transition-all duration-300 shadow-sm border-2 ${settings.isAnnouncementActive ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-red-500 text-white border-red-400'}`}
                >
                  <i className={`fas ${settings.isAnnouncementActive ? 'fa-check-circle' : 'fa-times-circle'} mr-1`}></i>
                  {settings.isAnnouncementActive ? 'Aktif' : 'Nonaktif'}
                </button>
              </div>
              {/* Ukuran diperlebar menjadi h-[26.5rem] agar sejajar dengan tinggi konten di kolom kiri */}
              <textarea 
                value={settings.announcement} 
                onChange={e => setSettings({...settings, announcement: e.target.value})} 
                className="w-full flex-grow input-futuristic px-5 py-4 font-bold h-[26.5rem] resize-none text-xs leading-relaxed shadow-inner" 
                placeholder="Tulis pengumuman kelas di sini agar muncul di dashboard siswa..." 
              />
            </div>
            <button 
              onClick={async () => { const success = await saveToGas('updateSettings', { settings }); if (success) alert("PENGATURAN TERSIMPAN!"); }} 
              className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-lg hover:bg-emerald-700 transition-all active:scale-95"
            >
              <i className="fas fa-cloud-upload-alt"></i> Simpan ke Cloud
            </button>
          </div>
        </div>

        <div className="pt-5 border-t-2 border-dashed border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 flex flex-col gap-1.5">
                <span className="text-[8px] font-black uppercase text-slate-400 ml-1">Device ID:</span>
                <div className="flex items-center gap-2">
                    <code className="flex-grow bg-white px-3 py-2 rounded-lg border border-slate-200 font-mono text-[9px] font-black text-blue-600 break-all">{myDeviceId}</code>
                    <button onClick={() => { navigator.clipboard.writeText(myDeviceId); alert("ID Copied!"); }} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"><i className="fas fa-copy text-xs"></i></button>
                </div>
            </div>
            <div className="flex flex-col gap-2.5">
                {!isUnlocked ? (
                  <button onClick={() => setShowActivationModal(true)} className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-xl border-b-4 border-orange-700 active:scale-95 transition-all">
                      AKTIVASI GURU PRO
                  </button>
                ) : (
                  <div className="w-full py-3.5 bg-slate-900 border-2 border-amber-400/50 text-amber-400 rounded-xl font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-3">
                      <i className="fas fa-shield-check"></i> PRO AKTIF
                  </div>
                )}
                <button onClick={copyShareLink} className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-black uppercase text-[9px] tracking-widest shadow-xl border-b-4 border-blue-800 active:scale-95 transition-all hover:bg-blue-700">
                  SALIN LINK LOGIN SISWA
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TabKonfigurasi;
