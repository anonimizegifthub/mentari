import React from 'react';
import { StudentProfile } from '../types';
import { AvatarCircle } from './SharedUI';

interface RankingCardProps {
  student: any;
  index: number;
  type: 'period' | 'global' | 'subject';
  getProfileStyles: (profile: Partial<StudentProfile>) => any;
  onClick: (id: string) => void;
}

const RankingCard: React.FC<RankingCardProps> = ({ student, index, type, getProfileStyles, onClick }) => {
  let sProfile: Partial<StudentProfile> = { avatar: 'av1' };
  try {
    const profileDataStr = student.profileData || (student as any).ProfileData || '';
    if (profileDataStr) sProfile = { ...sProfile, ...JSON.parse(profileDataStr) };
  } catch (e) {}

  const styles = getProfileStyles(sProfile);
  const rankColor = index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-600 ring-4 ring-yellow-200' : 
                   index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 ring-4 ring-slate-100' : 
                   index === 2 ? 'bg-gradient-to-br from-orange-400 to-amber-700 ring-4 ring-orange-100' : 
                   'bg-slate-700 ring-2 ring-slate-200';

  const isDarkBg = styles.bgClass.includes('gradient') || styles.bgClass.includes('black') || styles.bgClass.includes('slate-900') || styles.bgClass.includes('blue-600') || styles.bgClass.includes('purple') || styles.bgClass.includes('emerald-900');
  const textColor = isDarkBg ? 'text-white' : 'text-slate-800';

  return (
    <div 
      onClick={() => onClick(student.id.toString())} 
      className={`relative flex items-center gap-5 p-5 rounded-[2.2rem] border-2 cursor-pointer transition-all duration-500 group w-full ${styles.bgClass} ${styles.borderClass} ${styles.fontClass} overflow-hidden hover:shadow-2xl hover:scale-[1.02]`}
      style={styles.containerStyle}
    >
      {styles.specialEffect}
      <div className={`absolute top-2 left-2 w-7 h-7 rounded-xl flex items-center justify-center font-black text-white text-[11px] shadow-lg ${rankColor} z-20`}>{index + 1}</div>
      <div className="relative z-10 shrink-0"><AvatarCircle avatarId={sProfile.avatar || 'av1'} size="w-14 h-14" animationClass={styles.animationClass} /></div>
      <div className="flex flex-col items-start z-10 overflow-hidden relative flex-grow">
        <h4 className={`text-sm font-black uppercase leading-tight truncate w-full tracking-wide ${styles.textEffectClass} ${textColor}`}>{student.name}</h4>
        <div className="flex items-center gap-2 mt-2">
          <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase backdrop-blur-md border ${isDarkBg ? 'bg-white/20 border-white/20 text-yellow-300' : 'bg-yellow-50 border-yellow-200 text-yellow-600'}`}>
            {type === 'global' ? 'Avg' : type === 'subject' ? 'Skor' : 'Poin'} {type === 'global' ? (student._avgScore ? Number(student._avgScore).toFixed(1) : '0') : (student._score || 0)}
          </div>
          {type === 'period' && <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase backdrop-blur-md border ${isDarkBg ? 'bg-white/20 border-white/20 text-cyan-300' : 'bg-cyan-50 border-cyan-200 text-cyan-600'}`}>EXP {student.exp || 0}</div>}
        </div>
      </div>
      <i className={`fas fa-chevron-right text-xs opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 ${isDarkBg ? 'text-white' : 'text-slate-300'}`}></i>
    </div>
  );
};

export default RankingCard;