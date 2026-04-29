
import React from 'react';
import RankingCard from './RankingCard';
import { StudentProfile } from '../types';
import { AvatarCircle } from './SharedUI';

interface RankingSectionProps {
  dailyData: any[];
  subjectChampions: any[];
  globalData: any[];
  getProfileStyles: (profile: Partial<StudentProfile>) => any;
  onStudentClick: (id: string) => void;
}

const RankingSection: React.FC<RankingSectionProps> = ({ dailyData, subjectChampions, globalData, getProfileStyles, onStudentClick }) => {
  const containers = [
    { title: 'Ranking Harian', desc: 'Aktifitas Hari Ini', icon: 'fa-bolt-lightning', color: 'from-blue-500 to-indigo-600', data: dailyData, type: 'period' as const },
    { title: 'Elite Akademik', desc: 'Juara Mapel', icon: 'fa-trophy', color: 'from-purple-500 to-fuchsia-600', isSubject: true },
    { title: 'Hall of Fame', desc: 'Peringkat Global', icon: 'fa-medal', color: 'from-amber-500 to-orange-600', data: globalData, type: 'global' as const }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {containers.map((c, i) => (
        <div key={i} className="glass-card rounded-[3.5rem] p-8 border-4 border-slate-100 flex flex-col h-[580px] relative overflow-hidden">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-slate-50 relative z-10">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-2xl bg-gradient-to-br ${c.color} shadow-2xl shadow-blue-200`}><i className={`fas ${c.icon}`}></i></div>
            <div>
              <h3 className="text-xl font-black uppercase text-slate-800 Museum-Text leading-none">{c.title}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{c.desc}</p>
            </div>
          </div>
          <div className="space-y-4 overflow-y-auto pr-2 no-scrollbar flex-grow relative z-10">
            {!c.isSubject ? (
              c.data && c.data.length > 0 ? c.data.map((s, idx) => <RankingCard key={s.id} student={s} index={idx} type={c.type} getProfileStyles={getProfileStyles} onClick={onStudentClick} />) : <div className="flex flex-col items-center justify-center h-full py-20 opacity-20"><i className="fas fa-hourglass-start text-5xl mb-4"></i><p className="font-black uppercase text-xs tracking-widest">Database Kosong</p></div>
            ) : (
              subjectChampions.map((item, idx) => {
                const s = item.student;
                if (!s) return <div key={idx} className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] opacity-50 text-center mb-4"><span className="px-4 py-1.5 bg-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-500 mb-2 inline-block">{item.subject}</span><p className="text-[11px] font-black text-slate-300 uppercase italic">Belum Ada Juara</p></div>;
                
                const sProfile = s.profileData ? JSON.parse(s.profileData) : {};
                const stl = getProfileStyles(sProfile);
                const isDark = stl.bgClass.includes('gradient') || stl.bgClass.includes('black') || stl.bgClass.includes('slate-900') || stl.bgClass.includes('blue-600') || stl.bgClass.includes('purple') || stl.bgClass.includes('emerald-900');
                const textColor = isDark ? 'text-white' : 'text-slate-800';

                return (
                  <div key={idx} className="relative group text-center mb-6 last:mb-0">
                    <div className="mb-3"><span className="px-5 py-2 bg-purple-50 border-2 border-purple-100 text-purple-700 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm">{item.subject}</span></div>
                    <div onClick={() => onStudentClick(s.id.toString())} className={`relative flex items-center gap-5 p-5 rounded-[2.2rem] border-2 shadow-sm transition-all cursor-pointer hover:scale-[1.05] ${stl.bgClass} ${stl.borderClass} ${stl.fontClass}`} style={stl.containerStyle}>
                      {stl.specialEffect}
                      <div className="relative z-10 shrink-0"><AvatarCircle avatarId={sProfile.avatar || 'av1'} size="w-12 h-12" animationClass={stl.animationClass} /></div>
                      <div className="flex flex-col z-10 overflow-hidden text-left flex-grow"><h4 className={`text-sm font-black uppercase truncate ${stl.textEffectClass} ${!stl.textEffectClass ? textColor : ''}`}>{s.name}</h4><div className="flex items-center gap-2 mt-1.5"><span className="px-3 py-1 rounded-full bg-yellow-400 text-white text-[10px] font-black shadow-lg shadow-yellow-400/20 ring-2 ring-white">SKOR {item.score}</span></div></div>
                      <i className="fas fa-crown text-yellow-400 absolute top-2 right-2 animate-bounce opacity-40 group-hover:opacity-100"></i>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RankingSection;
