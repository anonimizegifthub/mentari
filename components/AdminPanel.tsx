
import React, { useState, useEffect } from 'react';
import { RegisteredUser } from '../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  gasUrl: string;
  myDeviceId: string;
  onRefresh: () => void;
  registeredUsers: RegisteredUser[];
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, gasUrl, myDeviceId, onRefresh, registeredUsers }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [authError, setAuthError] = useState(false);

  // Fungsi Helper untuk generate Serial Key unik otomatis
  const generateSerialKey = () => {
    const year = new Date().getFullYear();
    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `MTR-${year}-${randomPart}`;
  };

  const [formData, setFormData] = useState({
    phoneNumber: '',
    serial: generateSerialKey(),
    deviceId: '',
    duration: '12',
    targetUrl: gasUrl
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');

  useEffect(() => {
    setFormData(prev => ({ ...prev, targetUrl: gasUrl }));
  }, [gasUrl]);

  useEffect(() => {
    if (activeTab === 'add') {
      setFormData(prev => ({ ...prev, serial: generateSerialKey() }));
    }
  }, [activeTab]);

  // Reset auth state when panel is closed
  useEffect(() => {
    if (!isOpen) {
      setIsAuthenticated(false);
      setAdminPin('');
      setAuthError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // PIN MASTER: Anda bisa mengganti '2309' dengan PIN rahasia Anda sendiri
    if (adminPin === '0610') {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
      setTimeout(() => setAuthError(false), 2000);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phoneNumber || !formData.deviceId || !formData.targetUrl) {
        alert("Mohon lengkapi seluruh data!");
        return;
    }
    
    setIsSubmitting(true);
    try {
      await fetch(formData.targetUrl, {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'addUser',
          user: {
            phoneNumber: formData.phoneNumber,
            serial: formData.serial,
            deviceId: formData.deviceId,
            durationMonths: Number(formData.duration)
          }
        })
      });
      
      alert("AKTIVASI BERHASIL!\nPerangkat telah terdaftar di database cloud.");
      setFormData({ ...formData, phoneNumber: '', deviceId: '', serial: generateSerialKey() });
      onRefresh();
    } catch (e) {
      alert("Gagal menghubungi server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (deviceId: string) => {
    if (!confirm("Hapus lisensi perangkat ini secara permanen?")) return;
    setIsSubmitting(true);
    try {
      await fetch(formData.targetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'deleteUser', deviceId })
      });
      onRefresh();
      alert("Lisensi telah dihapus.");
    } catch (e) {
      alert("Gagal menghapus.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isUrlValid = formData.targetUrl.startsWith('https://script.google.com/');

  // UI UNTUK LAYAR KUNCI (AUTHENTICATION GATE)
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[200000] bg-slate-950/98 backdrop-blur-3xl flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 rounded-[3rem] p-10 border-4 border-slate-800 shadow-[0_0_50px_rgba(239,68,68,0.1)] text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
          
          <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center text-red-500 text-3xl mb-8 mx-auto border-2 border-slate-700 shadow-inner">
            <i className={`fas ${authError ? 'fa-shield-virus animate-shake' : 'fa-fingerprint'}`}></i>
          </div>
          
          <h2 className="text-xl font-black text-white Museum-Text uppercase tracking-widest mb-2">Restricted Access</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-8">Masukkan Master PIN Developer</p>
          
          <form onSubmit={handleAdminAuth} className="space-y-6">
             <div className="relative">
                <input 
                  type="password" 
                  maxLength={4}
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  autoFocus
                  className={`w-full bg-slate-950 border-2 rounded-2xl px-6 py-4 text-center text-2xl font-black tracking-[1em] text-white outline-none transition-all ${authError ? 'border-red-500 bg-red-500/10' : 'border-slate-800 focus:border-blue-600'}`}
                  placeholder="****"
                />
                {authError && <p className="absolute -bottom-6 left-0 right-0 text-[9px] font-black text-red-500 uppercase tracking-widest">Akses Ditolak: PIN Salah</p>}
             </div>
             
             <div className="flex gap-4 pt-4">
                <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-800 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-700 transition-all">Batalkan</button>
                <button type="submit" className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all">Buka Panel</button>
             </div>
          </form>
          
          <style>{`
            .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
            @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
          `}</style>
        </div>
      </div>
    );
  }

  // TAMPILAN PANEL UTAMA (SUDAH TERAUTENTIKASI)
  return (
    <div className="fixed inset-0 z-[200000] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
      <div className="w-full max-w-5xl bg-slate-900 rounded-[3rem] border-4 border-slate-800 shadow-[0_0_100px_rgba(59,130,246,0.2)] flex flex-col h-full overflow-hidden">
        
        {/* HEADER */}
        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <i className="fas fa-user-shield"></i>
            </div>
            <div>
              <h2 className="text-xl font-black text-white Museum-Text uppercase tracking-widest">MENTARI ADMIN CENTER</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Authorized Session Active</p>
            </div>
          </div>
          <div className="flex gap-3">
             <button onClick={() => setIsAuthenticated(false)} className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-400 font-black text-[9px] uppercase hover:bg-red-500/10 hover:text-red-500 transition-all border border-slate-700">Logout</button>
             <button onClick={onClose} className="w-12 h-12 rounded-xl bg-slate-800 text-slate-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-inner"><i className="fas fa-times text-xl"></i></button>
          </div>
        </div>

        <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
          {/* SIDE NAV */}
          <div className="w-full md:w-64 border-r border-slate-800 p-6 space-y-3 bg-slate-900/30 shrink-0">
            <button 
              onClick={() => setActiveTab('list')}
              className={`w-full p-4 rounded-2xl flex items-center gap-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'list' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-800'}`}
            >
              <i className="fas fa-list-ul"></i> Daftar User
            </button>
            <button 
              onClick={() => setActiveTab('add')}
              className={`w-full p-4 rounded-2xl flex items-center gap-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'add' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-800'}`}
            >
              <i className="fas fa-user-plus"></i> Aktivasi Baru
            </button>
            
            <div className="mt-10 p-5 bg-slate-800/50 rounded-2xl border border-slate-700/50">
               <span className="text-[8px] font-black text-slate-500 uppercase block mb-1">Hardware ID Target:</span>
               <code className="text-[10px] font-mono text-blue-400 break-all select-all cursor-pointer" onClick={() => {navigator.clipboard.writeText(myDeviceId); alert("ID Copied!");}}>{myDeviceId}</code>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-grow p-8 overflow-y-auto no-scrollbar bg-slate-950/20">
            {activeTab === 'list' ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest flex items-center gap-3">
                      <i className="fas fa-users text-blue-500"></i> Lisensi PRO Terdaftar ({registeredUsers.length})
                   </h3>
                   <button onClick={onRefresh} className="p-2 bg-slate-800 text-blue-400 rounded-lg text-xs hover:bg-slate-700 transition-all"><i className="fas fa-sync-alt"></i></button>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {registeredUsers.length === 0 && <p className="text-center py-20 text-slate-600 uppercase font-black text-xs italic tracking-widest">Data Tidak Ditemukan</p>}
                  {registeredUsers.map((u) => (
                    <div key={u.deviceId} className="p-6 bg-slate-900 border border-slate-800 rounded-[2rem] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group hover:border-blue-500/30 transition-all">
                      <div className="flex items-center gap-5">
                         <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-blue-400 group-hover:bg-blue-900/30 transition-all">
                            <i className="fas fa-mobile-screen-button"></i>
                         </div>
                         <div>
                            <p className="text-white font-black uppercase text-xs tracking-wide">{u.phoneNumber}</p>
                            <p className="text-[9px] font-mono text-slate-500 mt-1 break-all uppercase">ID: {u.deviceId}</p>
                         </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                           <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Expired At</span>
                           <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-lg border ${new Date(u.expiredAt) > new Date() ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                              {new Date(u.expiredAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                           </span>
                        </div>
                        <button onClick={() => handleDeleteUser(u.deviceId)} className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto py-10 animate-in slide-in-from-bottom-4">
                 <div className="text-center mb-10">
                    <i className="fas fa-key text-5xl text-blue-500 mb-4 block"></i>
                    <h3 className="text-xl font-black text-white Museum-Text uppercase tracking-widest">Aktivasi User PRO</h3>
                    <p className="text-xs font-bold text-slate-500 uppercase mt-2 italic">Daftarkan Perangkat Baru</p>
                 </div>

                 <form onSubmit={handleAddUser} className="space-y-6">
                    <div className="space-y-2 p-5 bg-blue-900/20 border-2 border-dashed border-blue-800 rounded-3xl mb-4">
                       <label className="text-[9px] font-black text-blue-400 uppercase ml-2 tracking-widest">Cloud Database Target</label>
                       <input 
                         value={formData.targetUrl} 
                         onChange={e => setFormData({...formData, targetUrl: e.target.value.trim()})} 
                         className={`w-full bg-slate-950 border-2 rounded-2xl px-6 py-3 text-blue-300 font-mono text-[10px] focus:ring-4 outline-none transition-all ${isUrlValid ? 'border-blue-600' : 'border-red-500'}`} 
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Nomor WA / Identitas</label>
                       <input value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-blue-600 outline-none transition-all" placeholder="08..." />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Device Hardware ID</label>
                       <input value={formData.deviceId} onChange={e => setFormData({...formData, deviceId: e.target.value})} className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl px-6 py-4 text-blue-400 font-mono text-sm focus:border-blue-600 outline-none transition-all" placeholder="ID Perangkat Target" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest flex justify-between">
                            <span>Serial Key</span>
                            <button type="button" onClick={() => setFormData({...formData, serial: generateSerialKey()})} className="text-blue-400 hover:text-blue-300 transition-colors"><i className="fas fa-sync-alt text-[8px]"></i></button>
                          </label>
                          <input value={formData.serial} onChange={e => setFormData({...formData, serial: e.target.value})} className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-blue-600 outline-none transition-all" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Durasi Berlangganan</label>
                          <select value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl px-6 py-4 text-white font-bold focus:border-blue-600 outline-none transition-all">
                             <option value="1">1 Bulan</option>
                             <option value="12">1 Tahun</option>
                             <option value="60">5 Tahun (Lifetime)</option>
                          </select>
                       </div>
                    </div>
                    
                    <button 
                      disabled={isSubmitting || !isUrlValid}
                      type="submit" 
                      className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-shield-check"></i>}
                      {isSubmitting ? 'MEMPROSES...' : 'DAFTARKAN LISENSI PRO'}
                    </button>
                 </form>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-slate-800 text-center bg-slate-900/50 flex justify-center items-center gap-4">
           <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em]">Secret Admin Interface • v2.0 Secured</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
