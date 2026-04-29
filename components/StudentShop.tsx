
import React, { useState, useMemo } from 'react';
import { StudentProfile } from '../types';
import ProfilePreviewCard from './ProfilePreviewCard';
// Fix: Import getProfileStyles from utils/styleUtils instead of App
import { getProfileStyles } from '../utils/styleUtils';

interface StudentShopProps {
  profile: StudentProfile;
  shopCategory: string;
  setShopCategory: (cat: string) => void;
  filteredShopItems: any[];
  onPurchase: (item: any) => void;
  onClose: () => void;
}

const StudentShop: React.FC<StudentShopProps> = ({
  profile,
  shopCategory,
  setShopCategory,
  filteredShopItems,
  onPurchase,
  onClose
}) => {
  const [selectedItemForPreview, setSelectedItemForPreview] = useState<any>(null);

  const categories = [
    { id: 'all', label: 'Semua' },
    { id: 'bg', label: 'Latar' },
    { id: 'border', label: 'Bingkai' },
    { id: 'effect', label: 'Efek' },
    { id: 'font', label: 'Font' },
    { id: 'title', label: 'Gelar' },
    { id: 'avatar', label: 'Avatar' },
    { id: 'cash', label: 'Tunai' }
  ];

  const previewProfile = useMemo(() => {
    if (!selectedItemForPreview || selectedItemForPreview.isCash) return profile;

    const newProfile = { ...profile };
    const id = selectedItemForPreview.id;
    
    if (id.startsWith('bg_')) newProfile.activeBackground = id;
    else if (id.startsWith('border_')) newProfile.activeBorder = id;
    else if (id.startsWith('font_')) newProfile.activeFont = id;
    else if (id.startsWith('effect_') || id.startsWith('anim_')) newProfile.activeEffect = id;
    else if (id.startsWith('title_')) newProfile.activeTitle = id;
    else if (id.startsWith('av_')) newProfile.avatar = id;

    return newProfile;
  }, [profile, selectedItemForPreview]);

  const previewStyles = useMemo(() => getProfileStyles(previewProfile), [previewProfile]);

  const handleItemClick = (item: any) => {
    const isPurchased = !item.isCash && (profile.purchasedItems || []).includes(item.id);
    if (isPurchased) return;
    setSelectedItemForPreview(item);
  };

  return (
    <div className="fixed inset-0 z-[6500] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-2 md:p-8 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] border-2 md:border-4 border-emerald-400 shadow-2xl relative overflow-hidden flex flex-col w-full max-w-6xl h-[92vh] md:h-auto md:max-h-[95vh]">
        
        {/* Compact Header Section */}
        <div className="p-4 md:p-6 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-white border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-500 text-white text-lg md:text-xl shadow-lg flex items-center justify-center rotate-3 shrink-0">
              <i className="fas fa-shopping-cart"></i>
            </div>
            <div className="hidden sm:block">
              <h3 className="text-lg md:text-xl font-black text-blue-900 Museum-Text uppercase leading-none">Pasar Petualang</h3>
              <p className="text-[7px] md:text-[8px] font-black uppercase text-slate-400 tracking-widest mt-1">Koleksi Item Rare & Epic!</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white border-2 border-emerald-100 rounded-xl shadow-sm flex items-center gap-2">
              <span className="text-xs md:text-base font-black text-amber-600 uppercase Museum-Text">🪙 {profile.coins}</span>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-red-500 hover:text-white transition-all shadow-sm">
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* TOP PREVIEW AREA - FIXED AT TOP ON MOBILE */}
        <div className="bg-slate-50 p-4 md:p-6 border-b-4 border-emerald-100 shadow-inner shrink-0">
           <div className="flex flex-col lg:flex-row items-center justify-center gap-4 md:gap-8">
              <div className="w-full flex flex-col items-center">
                 <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Simulasi Tampilan</span>
                 <ProfilePreviewCard profile={previewProfile} styles={previewStyles} />
              </div>

              {selectedItemForPreview && (
                 <div className="flex flex-row lg:flex-col items-center gap-3 animate-in slide-in-from-bottom-2 duration-500 w-full lg:w-auto lg:min-w-[240px]">
                    <div className="px-4 py-2 bg-white rounded-xl border-2 border-emerald-200 shadow-sm flex-grow w-full">
                       <p className="text-[9px] font-black text-blue-900 uppercase Museum-Text truncate">{selectedItemForPreview.name}</p>
                       <p className="text-[8px] font-bold text-amber-600 uppercase">Harga: 🪙 {selectedItemForPreview.cost}</p>
                    </div>
                    
                    <div className="flex gap-2 shrink-0">
                       <button 
                          onClick={() => onPurchase(selectedItemForPreview)}
                          disabled={profile.coins < selectedItemForPreview.cost}
                          className={`px-6 py-2.5 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all active:scale-95 shadow-md ${profile.coins >= selectedItemForPreview.cost ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                       >
                          <i className="fas fa-cart-plus mr-1"></i> Beli
                       </button>
                       <button 
                          onClick={() => setSelectedItemForPreview(null)}
                          className="w-10 h-10 bg-white text-slate-400 border-2 border-slate-100 rounded-xl hover:text-red-500 transition-all active:scale-95 flex items-center justify-center"
                       >
                          <i className="fas fa-undo text-xs"></i>
                       </button>
                    </div>
                 </div>
              )}
           </div>
        </div>

        {/* BOTTOM CONTENT AREA - SCROLLABLE */}
        <div className="overflow-y-auto flex-grow no-scrollbar bg-white flex flex-col">
          {/* Sticky Categories on Scroll */}
          <div className="sticky top-0 bg-white/90 backdrop-blur-sm z-20 p-4 border-b border-slate-50">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {categories.map(cat => (
                <button 
                  key={cat.id} 
                  onClick={() => setShopCategory(cat.id)} 
                  className={`px-4 py-2 rounded-xl text-[8px] md:text-[9px] font-black uppercase whitespace-nowrap transition-all active:scale-95 border-2 ${shopCategory === cat.id ? 'bg-emerald-500 text-white border-emerald-400 shadow-md' : 'bg-slate-50 text-slate-400 border-transparent hover:bg-emerald-50 hover:text-emerald-500'}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 md:p-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6">
              {filteredShopItems.length === 0 ? (
                  <div className="col-span-full py-16 text-center opacity-20 flex flex-col items-center">
                      <i className="fas fa-ghost text-4xl mb-3"></i>
                      <p className="text-[9px] font-black uppercase tracking-widest">Kategori Belum Tersedia</p>
                  </div>
              ) : (
                  filteredShopItems.map(item => {
                      const isPurchased = !item.isCash && (profile.purchasedItems || []).includes(item.id);
                      const isSelected = selectedItemForPreview?.id === item.id;
                      const isEpic = item.cost >= 400 && item.cost < 800;
                      const isLegendary = item.cost >= 800;

                      return (
                          <button 
                            key={item.id} 
                            onClick={() => handleItemClick(item)} 
                            disabled={isPurchased} 
                            className={`flex flex-col items-center p-3 md:p-5 rounded-[1.5rem] md:rounded-[2rem] border-2 md:border-4 transition-all active:scale-90 relative group ${isPurchased ? 'bg-slate-50 border-slate-200 opacity-60 grayscale cursor-not-allowed' : isSelected ? 'bg-emerald-50 border-emerald-400 shadow-xl' : 'bg-white border-slate-50 hover:border-emerald-200'}`}
                          >
                          {isPurchased ? (
                              <div className="absolute top-2 right-2 text-emerald-500 animate-in zoom-in">
                                <i className="fas fa-check-circle text-base md:text-xl"></i>
                              </div>
                          ) : (
                              (isEpic || isLegendary) && (
                                <div className={`absolute top-2 left-2 px-1.5 py-0.5 rounded-full text-[5px] md:text-[6px] font-black uppercase text-white shadow-lg z-10 ${isLegendary ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}>
                                   {isLegendary ? 'LEG' : 'EPIC'}
                                </div>
                              )
                          )}

                          <div className={`w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-slate-50 flex items-center justify-center text-xl md:text-3xl mb-2 md:mb-4 transition-transform duration-500 group-hover:scale-110 ${item.color}`}>
                              <i className={`fas ${item.icon}`}></i>
                          </div>

                          <h4 className="text-[7px] md:text-[9px] font-black uppercase text-slate-800 text-center mb-2 h-6 md:h-7 flex items-center Museum-Text leading-tight overflow-hidden line-clamp-2">
                              {item.name}
                          </h4>

                          <div className={`w-full py-1.5 md:py-2 rounded-lg md:rounded-xl transition-all font-black text-[8px] md:text-[9px] text-center border-b-2 ${isPurchased ? 'bg-slate-200 text-slate-400 border-slate-300' : 'bg-amber-100 text-amber-700 border-amber-500 group-hover:bg-amber-500 group-hover:text-white'}`}>
                              {item.cost}
                          </div>
                          </button>
                      );
                  })
              )}
            </div>

            {profile.redemptions && profile.redemptions.length > 0 && shopCategory === 'cash' && (
              <div className="mt-12 pt-8 border-t-4 border-dashed border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm shadow-lg"><i className="fas fa-history"></i></div>
                   <h4 className="text-sm md:text-lg font-black uppercase text-blue-900 Museum-Text tracking-widest">Penukaran Terakhir</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {profile.redemptions.map(r => (
                    <div key={r.id} className="p-4 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] flex flex-col gap-2 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{r.date}</span>
                        <span className={`text-[6px] font-black uppercase px-2 py-0.5 rounded-full ${r.status === 'used' ? 'bg-slate-200 text-slate-500' : 'bg-emerald-100 text-emerald-600 animate-pulse'}`}>{r.status === 'used' ? 'SELESAI' : 'PROSES'}</span>
                      </div>
                      <span className="text-xs md:text-sm font-black text-blue-900 Museum-Text">Rp {r.amount}</span>
                      <div className="mt-1 p-2 bg-white rounded-xl border-2 border-slate-200 text-center shadow-inner">
                        <span className="text-sm md:text-base font-mono font-black text-blue-600 tracking-[0.2em]">{r.code}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentShop;
