
import React, { useMemo } from 'react';
import { StudentProfile } from '../types';
import { AvatarCircle } from './SharedUI';
import { AVATARS, SHOP_ITEMS } from '../constants';
import ProfilePreviewCard from './ProfilePreviewCard';
// Fix: Import getProfileStyles from utils/styleUtils instead of App
import { getProfileStyles } from '../utils/styleUtils';

interface InventoryModalProps {
  profile: StudentProfile;
  onUpdateProfile: (p: StudentProfile) => void;
  onClose: () => void;
  activeEditTab: 'identity' | 'avatar' | 'collection';
  setActiveEditTab: (tab: 'identity' | 'avatar' | 'collection') => void;
}

const InventoryModal: React.FC<InventoryModalProps> = ({ 
  profile, 
  onUpdateProfile, 
  onClose, 
  activeEditTab, 
  setActiveEditTab 
}) => {
  const previewStyles = useMemo(() => getProfileStyles(profile), [profile]);

  return (
    <div className="fixed inset-0 z-[6000] bg-blue-900/80 backdrop-blur-xl flex items-center justify-center p-2 md:p-6 animate-in fade-in">
      <div className="w-full max-w-4xl bg-white rounded-[2.5rem] md:rounded-[3rem] p-4 md:p-10 shadow-2xl relative flex flex-col h-[92vh] md:h-auto md:max-h-[95vh] border-2 md:border-4 border-white">
        <div className="flex items-center justify-between mb-4 md:mb-6 px-2">
          <h2 className="text-lg md:text-2xl font-black text-blue-900 Museum-Text uppercase">Ruang Ganti & Koleksi</h2>
          <button onClick={onClose} className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-red-500 hover:text-white transition-all"><i className="fas fa-times"></i></button>
        </div>

        {/* PROFIL PREVIEW SECTION - COMPACT & RESPONSIVE */}
        <div className="mb-4 md:mb-6 p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] bg-slate-50 border border-slate-100 flex flex-col items-center shrink-0">
           <span className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 md:mb-3">Pratinjau Kartu</span>
           <ProfilePreviewCard profile={profile} styles={previewStyles} />
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-1 md:gap-4 mb-4 md:mb-6 shrink-0 bg-slate-100 p-1 rounded-2xl">
          {(['identity', 'avatar', 'collection'] as const).map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveEditTab(tab)} 
              className={`flex-1 px-3 py-2.5 rounded-xl font-black uppercase text-[8px] md:text-[10px] tracking-widest transition-all ${activeEditTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {tab === 'identity' ? 'Identitas' : tab === 'avatar' ? 'Avatar' : 'Koleksi'}
            </button>
          ))}
        </div>

        {/* Content Scrollable Area */}
        <div className="flex-grow overflow-y-auto px-1 no-scrollbar mb-4">
          {activeEditTab === 'identity' && (
            <div className="space-y-4 max-w-md mx-auto py-2">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Hewan Favorit</label>
                <input value={profile.animal} onChange={e => onUpdateProfile({...profile, animal: e.target.value})} className="w-full input-futuristic px-5 py-3 text-xs md:text-sm font-bold" placeholder="Contoh: Singa, Elang..." />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Hobi Utama</label>
                <input value={profile.hobby} onChange={e => onUpdateProfile({...profile, hobby: e.target.value})} className="w-full input-futuristic px-5 py-3 text-xs md:text-sm font-bold" placeholder="Contoh: Membaca, Sepakbola..." />
              </div>
            </div>
          )}
          {activeEditTab === 'avatar' && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 py-2">
              {AVATARS.map(av => (
                <button key={av.id} onClick={() => onUpdateProfile({...profile, avatar: av.id})} className={`p-3 rounded-[1.5rem] border-2 md:border-4 transition-all flex flex-col items-center gap-2 ${profile.avatar === av.id ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-transparent bg-slate-50 hover:bg-slate-100'}`}>
                  <AvatarCircle avatarId={av.id} size="w-10 h-10 md:w-12 md:h-12" />
                </button>
              ))}
              {SHOP_ITEMS.filter(item => item.id.startsWith('av_') && profile.purchasedItems?.includes(item.id)).map(item => (
                <button key={item.id} onClick={() => onUpdateProfile({...profile, avatar: item.id})} className={`p-3 rounded-[1.5rem] border-2 md:border-4 transition-all flex flex-col items-center gap-2 ${profile.avatar === item.id ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-transparent bg-slate-50 hover:bg-slate-100'}`}>
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-white flex items-center justify-center text-xl shadow-sm ${item.color}`}><i className={`fas ${item.icon}`}></i></div>
                </button>
              ))}
            </div>
          )}
          {activeEditTab === 'collection' && (
            <div className="space-y-6 md:space-y-8 py-2">
              {[
                { label: 'Gelar (Title)', prefix: 'title_', key: 'activeTitle' },
                { label: 'Latar Belakang', prefix: 'bg_', key: 'activeBackground' },
                { label: 'Bingkai (Border)', prefix: 'border_', key: 'activeBorder' },
                { label: 'Gaya Font', prefix: 'font_', key: 'activeFont' },
                { label: 'Efek Spesial', prefix: ['effect_', 'anim_'], key: 'activeEffect' }
              ].map(cat => (
                <div key={cat.label}>
                  <h4 className="text-[8px] md:text-[9px] font-black uppercase text-slate-400 mb-3 ml-1 tracking-widest border-l-4 border-blue-500 pl-3">{cat.label}</h4>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => onUpdateProfile({...profile, [cat.key as any]: ''})} className={`px-4 py-2 rounded-lg font-bold text-[8px] md:text-[9px] uppercase border-2 transition-all ${!(profile as any)[cat.key as any] ? 'bg-slate-800 text-white border-slate-800 shadow-sm' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'}`}>Default</button>
                    {SHOP_ITEMS.filter(i => {
                      const matchesPrefix = Array.isArray(cat.prefix) ? cat.prefix.some(p => i.id.startsWith(p)) : i.id.startsWith(cat.prefix);
                      return matchesPrefix && (profile.purchasedItems || []).includes(i.id);
                    }).map(i => (
                      <button key={i.id} onClick={() => onUpdateProfile({...profile, [cat.key as any]: i.id})} className={`px-4 py-2 rounded-lg font-bold text-[8px] md:text-[9px] uppercase border-2 transition-all ${(profile as any)[cat.key as any] === i.id ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-blue-600 border-blue-100 hover:border-blue-400'}`}>
                        {i.name.replace('Gelar: ', '').replace('Latar: ', '').replace('Bingkai: ', '').replace('Font: ', '').replace('Efek: ', '').replace('Gaya: ', '')}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-center pt-2 md:pt-4 border-t border-slate-100 shrink-0">
           <button onClick={onClose} className="w-full md:w-auto px-10 py-3.5 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">Selesai Mengatur</button>
        </div>
      </div>
    </div>
  );
};

export default InventoryModal;
