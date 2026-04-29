import React from 'react';
import { StudentProfile } from '../types';
import { AvatarCircle } from './SharedUI';
import { SHOP_ITEMS } from '../constants';

interface ProfilePreviewCardProps {
  profile: StudentProfile;
  styles: any;
}

const ProfilePreviewCard: React.FC<ProfilePreviewCardProps> = ({ profile, styles }) => {
  const getRankData = (level: number) => {
    if (level <= 5) return { label: 'Pemula', icon: 'fa-seedling', color: 'text-emerald-500' };
    if (level <= 15) return { label: 'Penjelajah', icon: 'fa-route', color: 'text-blue-500' };
    if (level <= 30) return { label: 'Ksatria', icon: 'fa-shield-halved', color: 'text-indigo-600' };
    return { label: 'Legenda', icon: 'fa-crown', color: 'text-amber-500' };
  };

  const rank = getRankData(profile.level);

  const isDarkBg = styles.bgClass.includes('gradient') || 
                   styles.bgClass.includes('black') || 
                   styles.bgClass.includes('slate-900') || 
                   styles.bgClass.includes('blue-600') || 
                   styles.bgClass.includes('purple') || 
                   styles.bgClass.includes('emerald-900');
  
  const textColor = isDarkBg ? 'text-white' : 'text-slate-800';

  const getActiveTitle = () => {
    if (!profile.activeTitle) return null;
    const titleItem = SHOP_ITEMS.find(i => i.id === profile.activeTitle);
    if (!titleItem) return null;
    return (
      <span className="text-[7px] font-black uppercase opacity-70 tracking-widest ml-2">
        • {titleItem.name.replace('Gelar: ', '')}
      </span>
    );
  };

  return (
    <div 
      className={`relative flex items-center gap-4 p-4 rounded-[2rem] border-2 w-full max-w-md mx-auto ${styles.bgClass} ${styles.borderClass} ${styles.fontClass} overflow-hidden shadow-lg transition-all duration-500`}
      style={styles.containerStyle}
    >
      {styles.specialEffect}
      {styles.IndependentEffect && <styles.IndependentEffect />}
      
      <div className="relative z-10 shrink-0">
        <AvatarCircle avatarId={profile.avatar || 'av1'} size="w-14 h-14" animationClass={styles.animationClass} />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-lg flex items-center justify-center text-[10px] font-black text-blue-600 shadow-sm border border-blue-50">
          {profile.level}
        </div>
      </div>

      <div className="flex flex-col items-start z-10 overflow-hidden flex-grow">
        <div className="flex items-center">
          <h4 className={`text-sm font-black uppercase leading-tight truncate tracking-wide ${styles.textEffectClass} ${!styles.textEffectClass ? textColor : ''}`}>
            {profile.name || 'Siswa'}
          </h4>
          {getActiveTitle()}
        </div>
        
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase backdrop-blur-md border ${isDarkBg ? 'bg-white/20 border-white/20 text-yellow-300' : 'bg-yellow-50 border-yellow-200 text-yellow-600'} flex items-center gap-1`}>
            <i className={`fas ${rank.icon}`}></i> 🪙 {profile.coins}
          </div>
          <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase backdrop-blur-md border ${isDarkBg ? 'bg-white/20 border-white/20 text-cyan-300' : 'bg-cyan-50 border-cyan-200 text-cyan-600'}`}>
            ★ {profile.exp}
          </div>
          <span className={`text-[7px] font-bold uppercase opacity-50 ${textColor}`}>
            {profile.animal || 'Singa'} • {profile.hobby || 'Belajar'}
          </span>
        </div>
      </div>
      
      <div className={`absolute top-0 right-0 p-2 opacity-10 ${textColor}`}>
        <i className="fas fa-id-card text-2xl"></i>
      </div>
    </div>
  );
};

export default ProfilePreviewCard;