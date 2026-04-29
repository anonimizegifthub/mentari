
import React, { useMemo } from 'react';
import { StudentProfile, GradeEntry, Mission, KindnessSubmission, RedemptionItem } from '../types';

interface HistoryAktifitasPortalProps {
  profile: StudentProfile;
  grades: GradeEntry[];
  missions: Mission[];
  kindnessSubmissions: KindnessSubmission[];
}

const HistoryAktifitasPortal: React.FC<HistoryAktifitasPortalProps> = ({ profile, grades, missions, kindnessSubmissions }) => {
  const studentId = profile.id?.toString().trim();

  const activityHistory = useMemo(() => {
    if (!studentId) return [];

    const history: any[] = [];
    
    // Tentukan batas waktu (7 hari yang lalu)
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - 7);
    limitDate.setHours(0, 0, 0, 0); 

    // Helper untuk mengecek apakah tanggal masuk dalam 7 hari terakhir
    const isRecent = (dateString: string) => {
        const d = new Date(dateString);
        return d >= limitDate;
    };

    // 1. Ambil dari Nilai/Grades (Misi & Tugas & Manual Adjustment)
    grades.filter(g => g.studentId.toString().trim() === studentId && isRecent(g.date)).forEach(g => {
      if (g.missionId === 'manual') {
        const isPositive = (g.expChange || 0) >= 0;
        history.push({
          id: `manual-${g.date}-${Math.random()}`,
          type: 'manual',
          title: 'Pesan / Hadiah Guru',
          desc: g.reason || 'Penyesuaian Poin Manual',
          date: new Date(g.date),
          exp: g.expChange || 0,
          coin: g.coinChange || 0,
          icon: isPositive ? 'fa-award' : 'fa-circle-exclamation',
          color: isPositive ? 'text-amber-500' : 'text-red-500',
          bg: isPositive ? 'bg-amber-50' : 'bg-red-50'
        });
      } else {
        const mission = missions.find(m => m.id.toString().trim() === g.missionId?.toString().trim());
        history.push({
          id: `grade-${g.date}-${g.missionId}`,
          type: 'mission',
          title: mission?.title || 'Aktivitas Kelas',
          date: new Date(g.date),
          exp: Math.round((mission?.expReward || 50) * (g.score / 100)),
          coin: Math.round((mission?.coinReward || 20) * (g.score / 100)),
          score: g.score,
          icon: 'fa-clipboard-check',
          color: 'text-blue-500',
          bg: 'bg-blue-50'
        });
      }
    });

    // 2. Ambil dari Kebaikan yang disetujui
    kindnessSubmissions.filter(k => k.studentId.toString().trim() === studentId && k.status === 'approved' && isRecent(k.date)).forEach(k => {
      history.push({
        id: `kindness-${k.id}`,
        type: 'kindness',
        title: 'Cahaya Kebaikan Disetujui',
        desc: k.description,
        date: new Date(k.date),
        exp: 0,
        coin: 10,
        icon: 'fa-heart',
        color: 'text-rose-500',
        bg: 'bg-rose-50'
      });
    });

    // 3. Ambil dari Petualangan AI (dari aiWorks di profil)
    (profile.aiWorks || []).filter(work => isRecent(work.date)).forEach(work => {
        history.push({
            id: `ai-${work.id}`,
            type: 'adventure',
            title: `Misi: ${work.title}`,
            date: new Date(work.date),
            exp: 50,
            coin: 20,
            icon: 'fa-wand-magic-sparkles',
            color: 'text-purple-500',
            bg: 'bg-purple-50'
        });
    });

    // 4. Ambil dari Penukaran Hadiah (Redemptions)
    (profile.redemptions || []).filter(r => isRecent(r.date)).forEach(r => {
      history.push({
        id: `redeem-${r.id}`,
        type: 'redeem',
        title: 'Penukaran Hadiah Tunai',
        desc: `Kode: ${r.code}`,
        date: new Date(r.date),
        exp: 0,
        coin: 0, 
        amount: r.amount,
        status: r.status,
        icon: 'fa-money-bill-wave',
        color: 'text-emerald-500',
        bg: 'bg-emerald-50'
      });
    });

    // SORTING CHRONOLOGICAL DESCENDING (NEWEST FIRST)
    return history.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [studentId, grades, missions, kindnessSubmissions, profile]);

  return (
    <div className="animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SIDE SUMMARY */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[3rem] p-8 text-white shadow-xl">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-6">Total Capaian</h3>
              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase">Total Koin Saat Ini</span>
                    <span className="text-2xl font-black">🪙 {profile.coins}</span>
                 </div>
                 <div className="h-px bg-white/10 w-full"></div>
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase">Total EXP Terkumpul</span>
                    <span className="text-2xl font-black">★ {profile.exp}</span>
                 </div>
                 <div className="h-px bg-white/10 w-full"></div>
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase">Aktivitas (7 Hari)</span>
                    <span className="text-2xl font-black">{activityHistory.length}</span>
                 </div>
              </div>
           </div>

           <div className="p-8 bg-amber-50 border-2 border-amber-100 rounded-[2.5rem]">
              <h4 className="text-[10px] font-black uppercase text-amber-600 mb-2 tracking-widest">Tips Petualang</h4>
              <p className="text-[10px] font-bold text-amber-800/60 uppercase leading-relaxed italic">
                "Setiap misi yang kamu selesaikan dengan nilai sempurna akan memberikan hadiah koin dan EXP maksimal. Teruslah berkarya!"
              </p>
           </div>
        </div>

        {/* MAIN TIMELINE */}
        <div className="lg:col-span-8 space-y-4">
           {activityHistory.length === 0 ? (
             <div className="bg-white rounded-[3rem] p-20 border-4 border-dashed border-slate-100 text-center opacity-40">
                <i className="fas fa-ghost text-6xl mb-4"></i>
                <p className="font-black uppercase text-sm">Belum ada catatan aktivitas dalam 7 hari terakhir.</p>
             </div>
           ) : (
             activityHistory.map((item) => (
               <div key={item.id} className="group bg-white rounded-[2.5rem] p-6 border-2 border-slate-50 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-500 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                  <div className={`w-14 h-14 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center text-2xl shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
                     <i className={`fas ${item.icon}`}></i>
                  </div>

                  <div className="flex-grow text-center md:text-left overflow-hidden">
                     <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                        <h4 className="text-sm font-black text-slate-800 Museum-Text uppercase truncate">{item.title}</h4>
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{item.date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                     </div>
                     {item.desc && <p className="text-[9px] font-bold text-slate-400 uppercase italic truncate">{item.desc}</p>}
                     {item.type === 'mission' && <p className="text-[9px] font-black text-blue-600 uppercase">Nilai Akhir: {item.score}/100</p>}
                     {item.type === 'redeem' && (
                        <span className={`inline-block px-3 py-1 rounded-full text-[7px] font-black uppercase mt-1 ${item.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                           {item.status === 'pending' ? 'Menunggu Validasi Guru' : 'Berhasil Dicairkan'}
                        </span>
                     )}
                  </div>

                  <div className="flex gap-3 shrink-0">
                     {(item.exp > 0 || item.exp < 0) && (
                        <div className={`px-4 py-2 rounded-xl border text-center min-w-[70px] ${item.exp >= 0 ? 'bg-indigo-50 border-indigo-100' : 'bg-red-50 border-red-100'}`}>
                           <span className={`block text-[7px] font-black uppercase ${item.exp >= 0 ? 'text-indigo-400' : 'text-red-400'}`}>EXP</span>
                           <span className={`text-sm font-black ${item.exp >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>{item.exp > 0 ? `+${item.exp}` : item.exp}</span>
                        </div>
                     )}
                     {(item.coin > 0 || item.coin < 0) && (
                        <div className={`px-4 py-2 rounded-xl border text-center min-w-[70px] ${item.coin >= 0 ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'}`}>
                           <span className={`block text-[7px] font-black uppercase ${item.coin >= 0 ? 'text-amber-400' : 'text-red-400'}`}>KOIN</span>
                           <span className={`text-sm font-black ${item.coin >= 0 ? 'text-amber-600' : 'text-red-600'}`}>{item.coin > 0 ? `+${item.coin}` : item.coin}</span>
                        </div>
                     )}
                     {item.type === 'redeem' && (
                        <div className="px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 text-center min-w-[70px]">
                           <span className="block text-[7px] font-black text-emerald-400 uppercase">TUNAI</span>
                           <span className="text-sm font-black text-emerald-600">Rp {item.amount}</span>
                        </div>
                     )}
                  </div>

                  <div className="absolute top-0 right-0 h-full w-1 bg-slate-50 group-hover:bg-blue-400 transition-colors"></div>
               </div>
             ))
           )}
        </div>
      </div>
    </div>
  );
};

export default HistoryAktifitasPortal;
