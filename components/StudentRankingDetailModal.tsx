
import React, { useState, useMemo } from 'react';
import { Student, GradeEntry, StudentProfile } from '../types';
import { getProfileStyles } from '../utils/styleUtils';
import ProfilePreviewCard from './ProfilePreviewCard';

interface StudentRankingDetailModalProps {
  student: Student;
  grades: GradeEntry[];
  subjects: string[];
  onClose: () => void;
  students: Student[];
}

const StudentRankingDetailModal: React.FC<StudentRankingDetailModalProps> = ({ student, grades, subjects, onClose, students }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'grades'>('profile');

  // Helper to normalize grade IDs
  const normalizeId = (id: any) => (id || '').toString().trim();
  const studentId = normalizeId(student.id);

  // Parse Student Profile Data
  const sProfile: StudentProfile = useMemo(() => {
    const defaults: StudentProfile = { 
      name: student.name || 'Siswa', 
      hobby: 'Belajar', 
      animal: 'Singa', 
      avatar: 'av1', 
      coins: student.coins || 0, 
      exp: student.exp || 0, 
      level: student.level || 1, 
      dailyTasks: [], 
      lastResetDate: '', 
      aiWorks: [], 
      kindnessCount: student.kindnessCount || 0, 
      completedAdventureIds: [], 
      purchasedItems: student.purchasedItems || [], 
      redemptions: student.redemptions || [] 
    };
    try {
      if (student.profileData) {
        return { ...defaults, ...JSON.parse(student.profileData) };
      }
    } catch (e) {}
    return defaults;
  }, [student]);

  const profileStyles = useMemo(() => getProfileStyles(sProfile), [sProfile]);

  // Calculate Global Ranking
  const globalRankingData = useMemo(() => {
    return students.map(s => {
      const sId = normalizeId(s.id);
      const sGrades = grades.filter(g => normalizeId(g.studentId) === sId);
      const avg = sGrades.length > 0 
        ? sGrades.reduce((acc, curr) => acc + Math.min(Number(curr.score || 0), 100), 0) / sGrades.length 
        : 0;
      return { id: sId, avg: Math.min(avg, 100) };
    }).sort((a, b) => b.avg - a.avg);
  }, [students, grades]);

  const globalRank = globalRankingData.findIndex(s => s.id === studentId) + 1;

  // Calculate Average Logic with Strict Clamping (Maksimal 100)
  const studentGrades = grades.filter(g => normalizeId(g.studentId) === studentId);
  
  // Rata-rata keseluruhan (Mastery Score) - FIXED: CLAMPED TO 100
  const overallAvg = useMemo(() => {
    if (studentGrades.length === 0) return 0;
    // Pastikan setiap skor individu yang masuk ke perhitungan maksimal adalah 100
    const total = studentGrades.reduce((acc, curr) => acc + Math.min(Number(curr.score || 0), 100), 0);
    const rawAvg = total / studentGrades.length;
    return Math.min(rawAvg, 100);
  }, [studentGrades]);

  // Perolehan rata-rata per mata pelajaran - FIXED: CLAMPED TO 100
  const subjectScores: { [key: string]: number } = useMemo(() => {
    const scores: { [key: string]: number } = {};
    subjects.forEach(subj => {
      const targetSubj = (subj || '').toString().trim().toLowerCase();
      const filtered = studentGrades.filter(g => (g.subject || '').toString().trim().toLowerCase() === targetSubj);
      
      const avg = filtered.length > 0
        ? filtered.reduce((acc, curr) => acc + Math.min(Number(curr.score || 0), 100), 0) / filtered.length
        : 0;
        
      scores[subj] = Math.round(Math.min(avg, 100));
    });
    return scores;
  }, [subjects, studentGrades]);

  // Visual Donut Chart Calculation
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (overallAvg / 100) * circumference;

  return (
    <div className="fixed inset-0 z-[7000] bg-blue-900/80 backdrop-blur-xl flex items-center justify-center p-4 md:p-6 animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl relative flex flex-col border-4 border-white overflow-hidden max-h-[90vh]">
        {/* MODAL HEADER */}
        <div className="p-6 md:p-8 bg-slate-50 border-b-2 border-slate-100 flex justify-between items-center shrink-0">
           <div>
              <h3 className="text-xl md:text-2xl font-black text-blue-900 Museum-Text uppercase leading-none">{student.name}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Informasi Lengkap Petualang</p>
           </div>
           <button onClick={onClose} className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-red-500 hover:text-white transition-all shadow-sm">
              <i className="fas fa-times"></i>
           </button>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex bg-white p-2 shrink-0">
           <button 
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-slate-400 hover:bg-slate-50'}`}
           >
              <i className="fas fa-user-circle"></i> Profil Siswa
           </button>
           <button 
              onClick={() => setActiveTab('grades')}
              className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${activeTab === 'grades' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-slate-400 hover:bg-slate-50'}`}
           >
              <i className="fas fa-award"></i> Detail Nilai
           </button>
        </div>

        {/* MODAL CONTENT */}
        <div className="flex-grow overflow-y-auto p-6 md:p-10 no-scrollbar bg-slate-50/30">
           {activeTab === 'profile' ? (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Visual Card Preview */}
                <div className="p-2">
                   <ProfilePreviewCard profile={sProfile} styles={profileStyles} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* STATS PANEL */}
                   <div className="space-y-4">
                      <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 shadow-sm flex items-center gap-5">
                         <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-lg shadow-amber-100"><i className="fas fa-medal"></i></div>
                         <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Ranking Global</p>
                            <p className="text-xl font-black text-slate-800 Museum-Text uppercase">#{globalRank} <span className="text-[10px] font-bold opacity-40">dari {students.length} Siswa</span></p>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="bg-white p-5 rounded-3xl border-2 border-slate-100 shadow-sm text-center">
                            <span className="text-[8px] font-black text-indigo-400 uppercase block mb-1">Level</span>
                            <span className="text-xl font-black text-indigo-600">LV {sProfile.level}</span>
                         </div>
                         <div className="bg-white p-5 rounded-3xl border-2 border-slate-100 shadow-sm text-center">
                            <span className="text-[8px] font-black text-amber-500 uppercase block mb-1">Koin</span>
                            <span className="text-xl font-black text-amber-600">🪙 {sProfile.coins}</span>
                         </div>
                      </div>

                      <div className="p-6 bg-blue-50/50 rounded-[2.5rem] border-2 border-dashed border-blue-100">
                         <div className="flex justify-between items-center mb-3">
                            <span className="text-[9px] font-black text-blue-900 uppercase">Identitas Petualang</span>
                            <i className="fas fa-id-card text-blue-300"></i>
                         </div>
                         <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold uppercase">
                               <span className="text-slate-400">Hewan Spirit</span>
                               <span className="text-blue-600">{sProfile.animal}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold uppercase">
                               <span className="text-slate-400">Hobi Utama</span>
                               <span className="text-blue-600">{sProfile.hobby}</span>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* PROGRESS PANEL (DONUT CHART - FIXED MAX 100) */}
                   <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                      <div className="relative mb-6">
                        <svg className="w-36 h-36 transform -rotate-90">
                          <circle cx="72" cy="72" r={radius} stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-100" />
                          <circle cx="72" cy="72" r={radius} stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={circumference} style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 1.5s ease' }} strokeLinecap="round" className="text-blue-600" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <span className="text-3xl font-black text-slate-800 Museum-Text leading-none">{overallAvg.toFixed(0)}</span>
                           <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Avg Score</span>
                        </div>
                      </div>
                      <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Mastery Progress</h4>
                      <p className="text-[8px] font-bold text-slate-400 uppercase leading-relaxed mt-1">Rata-rata tingkat penguasaan materi dari seluruh misi.</p>
                   </div>
                </div>
             </div>
           ) : (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-indigo-50/50 p-6 rounded-[2.5rem] border-2 border-indigo-100 flex items-center justify-between">
                   <div>
                      <h4 className="text-sm font-black text-indigo-900 uppercase Museum-Text leading-none">Rapor Akademik</h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total {subjects.length} Mata Pelajaran</p>
                   </div>
                   <div className="text-right">
                      <span className="block text-[8px] font-black text-indigo-400 uppercase">Rata-rata Nilai</span>
                      <span className="text-2xl font-black text-indigo-600">{overallAvg.toFixed(0)}</span>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subjects.map(subj => (
                    <div key={subj} className="flex justify-between items-center p-5 bg-white rounded-3xl border-2 border-slate-100 hover:border-indigo-200 transition-all shadow-sm group">
                      <div className="truncate">
                        <span className="font-black text-slate-700 text-[11px] uppercase truncate block w-40">{subj}</span>
                        <div className="flex items-center gap-1.5 mt-1">
                           <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                           <span className="text-[8px] font-bold text-slate-300 uppercase">Rata-rata Skor</span>
                        </div>
                      </div>
                      <div className="px-4 py-1.5 bg-slate-50 rounded-xl border border-slate-100 font-black text-indigo-600 text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        {subjectScores[subj] || 0}
                      </div>
                    </div>
                  ))}
                </div>
             </div>
           )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-6 md:p-8 border-t-2 border-slate-100 bg-white shrink-0">
           <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">
              Tutup Jendela Detail
           </button>
        </div>
      </div>
    </div>
  );
};

export default StudentRankingDetailModal;
