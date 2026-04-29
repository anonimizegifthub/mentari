import React from 'react';
import { StudentProfile } from '../types';
import { AvatarCircle } from './SharedUI';
import { SHOP_ITEMS } from '../constants';

interface StudentHeroCardProps {
  profile: StudentProfile;
  styles: any;
  onOpenInventory?: () => void;
  onOpenShop?: () => void;
  hideButtons?: boolean;
}

const StudentHeroCard: React.FC<StudentHeroCardProps> = ({ profile, styles, onOpenInventory, onOpenShop, hideButtons = false }) => {
  const getRankData = (level: number) => {
    if (level <= 5) return { label: 'Pemula', icon: 'fa-seedling', color: 'text-emerald-500' };
    if (level <= 15) return { label: 'Penjelajah', icon: 'fa-route', color: 'text-blue-500' };
    if (level <= 30) return { label: 'Ksatria', icon: 'fa-shield-halved', color: 'text-indigo-600' };
    return { label: 'Legenda', icon: 'fa-crown', color: 'text-amber-500' };
  };

  const rank = getRankData(profile.level);

  const getActiveTitle = () => {
    if (!profile.activeTitle) return null;
    const titleItem = SHOP_ITEMS.find(i => i.id === profile.activeTitle);
    if (!titleItem) return null;

    const baseColor = titleItem.color.replace('text-', '');
    const colorFamily = baseColor.split('-')[0];
    
    let bgColor = `bg-${colorFamily}-100`;
    let textColor = titleItem.color;

    if (profile.activeTitle === 'title_void') {
      bgColor = 'bg-fuchsia-100';
      textColor = 'text-fuchsia-700';
    } else if (profile.activeTitle === 'title_gold') {
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-700';
    }

    return (
      <span className={`px-4 py-1.5 ${bgColor} ${textColor} rounded-xl text-[10px] font-black uppercase shadow-xl border-2 border-white/40 animate-pulse tracking-widest z-20`}>
        {titleItem.name.replace('Gelar: ', '')}
      </span>
    );
  };

  const isDarkBg = styles.bgClass.includes('gradient') || 
                   styles.bgClass.includes('black') || 
                   styles.bgClass.includes('slate-900') || 
                   styles.bgClass.includes('blue-600') || 
                   styles.bgClass.includes('purple') || 
                   styles.bgClass.includes('emerald-900');
  
  const textColorMain = isDarkBg ? 'text-white' : 'text-slate-800';

  return (
    <div 
      className={`${styles.bgClass} rounded-[4rem] p-8 md:p-12 text-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden flex flex-col md:flex-row items-center gap-10 border-8 ${styles.borderClass} transition-all duration-700 group`}
      style={styles.containerStyle}
    >
      {styles.specialEffect}
      {styles.IndependentEffect && <styles.IndependentEffect />}
      
      <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent opacity-60 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[120px] -mr-48 -mt-48 group-hover:scale-125 transition-transform duration-1000"></div>

      {!hideButtons && (
        <div className="absolute top-8 right-8 z-20 flex flex-col gap-3 items-end">
          <button onClick={onOpenInventory} className="bg-white/10 backdrop-blur-xl px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase border-2 border-white/20 hover:bg-white hover:text-slate-900 transition-all active:scale-95 flex items-center gap-3 shadow-lg w-fit">
            <i className="fas fa-user-gear text-sm"></i> Edit Profil
          </button>
          <button onClick={onOpenShop} className="bg-emerald-500/20 backdrop-blur-xl px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase border-2 border-emerald-400/30 hover:bg-emerald-500 hover:text-white transition-all active:scale-95 flex items-center gap-3 shadow-lg w-fit">
            <i className="fas fa-shopping-bag text-sm"></i> Toko Item
          </button>
        </div>
      )}

      <div className="relative z-10 shrink-0 scale-110">
        <AvatarCircle avatarId={profile.avatar} size="w-32 h-32 md:w-44 md:h-44" animationClass={styles.animationClass} />
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white rounded-full text-blue-600 font-black text-[10px] shadow-xl border-2 border-blue-50 whitespace-nowrap flex items-center gap-2">
           <i className={`fas ${rank.icon} ${rank.color}`}></i>
           RANK #{rank.label.toUpperCase()}
        </div>
      </div>

      <div className="flex-grow text-center md:text-left z-10">
        <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start mb-2">
          <h3 className={`text-4xl md:text-6xl font-black Museum-Text uppercase leading-none ${styles.fontClass} ${styles.textEffectClass} ${!styles.textEffectClass ? textColorMain : ''} drop-shadow-2xl`}>
            {profile.name || 'Siswa'}
          </h3>
          {getActiveTitle()}
        </div>
        <p className="text-xs md:text-lg font-bold uppercase opacity-80 tracking-[0.3em] flex items-center justify-center md:justify-start gap-3">
          Level {profile.level} <span className="w-1.5 h-1.5 rounded-full bg-white opacity-40"></span> Siswa Mentari
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          {[
            { label: 'Koin Emas', val: `🪙 ${profile.coins}`, color: 'bg-amber-400/20 border-amber-400/30' },
            { label: 'Total EXP', val: `★ ${profile.exp}`, color: 'bg-indigo-400/20 border-indigo-400/30' },
            { label: 'Hewan Spirit', val: profile.animal || 'Singa', color: 'bg-white/10 border-white/20' },
            { label: 'Hobi Utama', val: profile.hobby || 'Belajar', color: 'bg-white/10 border-white/20' }
          ].map((stat, i) => (
            <div key={i} className={`p-5 rounded-3xl border-2 backdrop-blur-md transition-all hover:scale-105 ${stat.color}`}>
              <span className="text-[9px] font-black uppercase block opacity-60 mb-1 tracking-widest">{stat.label}</span>
              <span className="text-xl md:text-2xl font-black block truncate">{stat.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentHeroCard;