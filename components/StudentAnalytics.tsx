
import React, { useMemo } from 'react';
import { StudentProfile, GradeEntry, Student } from '../types';

interface StudentAnalyticsProps {
  profile: StudentProfile;
  grades: GradeEntry[];
  subjects: string[];
  students: Student[];
  passingGrade: number;
}

const StudentAnalytics: React.FC<StudentAnalyticsProps> = ({ profile, grades, subjects, students, passingGrade }) => {
  const studentId = profile.id?.toString().trim();
  
  // Helper to normalize grade IDs
  const normalizeId = (id: any) => (id || '').toString().trim();
  
  // Pre-normalize current student grades with clamping
  const studentGrades = grades
    .filter(g => normalizeId(g.studentId) === studentId)
    .map(g => ({ ...g, score: Math.min(Number(g.score || 0), 100) }));

  // 1. Calculate GLOBAL RANKING with clamped logic
  const globalRankingData = useMemo(() => {
    return students.map(s => {
      const sId = normalizeId(s.id);
      const sGrades = grades.filter(g => normalizeId(g.studentId) === sId);
      // Rata-rata terkunci maksimal 100
      const avg = sGrades.length > 0 
        ? sGrades.reduce((acc, curr) => acc + Math.min(Number(curr.score || 0), 100), 0) / sGrades.length 
        : 0;
      return { id: sId, avg: Math.min(avg, 100) };
    }).sort((a, b) => b.avg - a.avg);
  }, [students, grades]);

  const globalRank = globalRankingData.findIndex(s => s.id === studentId) + 1;

  // 2. Calculate SUBJECT MASTERY and SUBJECT RANKINGS with clamped logic
  const subjectAnalysis = useMemo(() => {
    return subjects.map(subject => {
      const targetSubj = subject.toLowerCase().trim();
      
      // All students average for this specific subject (Clamped)
      const allScoresForSubj = students.map(s => {
        const sId = normalizeId(s.id);
        const sSubjGrades = grades.filter(g => 
          normalizeId(g.studentId) === sId && 
          g.subject.toLowerCase().trim() === targetSubj
        );
        const avg = sSubjGrades.length > 0 
          ? sSubjGrades.reduce((acc, curr) => acc + Math.min(Number(curr.score || 0), 100), 0) / sSubjGrades.length 
          : 0;
        return { id: sId, avg: Math.min(avg, 100) };
      }).sort((a, b) => b.avg - a.avg);

      const subjRank = allScoresForSubj.findIndex(s => s.id === studentId) + 1;
      
      const currentStudentSubjGrades = studentGrades.filter(g => g.subject.toLowerCase().trim() === targetSubj);
      const avg = currentStudentSubjGrades.length > 0 
        ? currentStudentSubjGrades.reduce((acc, curr) => acc + curr.score, 0) / currentStudentSubjGrades.length 
        : 0;
      
      const finalAvg = Math.min(avg, 100);
      
      let status = "Belum Ada Data";
      let color = "text-slate-300";
      let bg = "bg-slate-100";

      if (finalAvg > 0) {
        if (finalAvg >= passingGrade + 15) { status = "Sangat Mahir"; color = "text-emerald-600"; bg = "bg-emerald-50"; }
        else if (finalAvg >= passingGrade) { status = "Kompeten"; color = "text-blue-600"; bg = "bg-blue-50"; }
        else if (finalAvg >= passingGrade - 15) { status = "Perlu Latihan"; color = "text-amber-600"; bg = "bg-amber-50"; }
        else { status = "Butuh Bimbingan"; color = "text-rose-600"; bg = "bg-rose-50"; }
      }

      return { 
        subject, 
        avg: finalAvg, 
        status, 
        color, 
        bg, 
        count: currentStudentSubjGrades.length,
        rank: subjRank 
      };
    });
  }, [subjects, students, grades, studentId, studentGrades, passingGrade]);

  const overallAvg = useMemo(() => {
    if (subjectAnalysis.length === 0) return 0;
    const total = subjectAnalysis.reduce((acc, curr) => acc + curr.avg, 0);
    return Math.min(total / subjectAnalysis.length, 100);
  }, [subjectAnalysis]);

  // Visual Donut Chart Calculation
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (overallAvg / 100) * circumference;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-2 bg-blue-600 rounded-full"></div>
          <h3 className="text-xl font-black text-slate-800 Museum-Text uppercase tracking-tight">Rapor Kemajuan Sementara</h3>
        </div>
        <div className="px-5 py-2 bg-amber-50 border-2 border-amber-200 rounded-2xl flex items-center gap-3 shadow-sm">
           <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center text-sm shadow-md">
              <i className="fas fa-medal"></i>
           </div>
           <div>
              <p className="text-[7px] font-black text-amber-600 uppercase tracking-widest leading-none">Peringkat Global</p>
              <p className="text-xs font-black text-amber-900 Museum-Text uppercase">#{globalRank} <span className="opacity-40 font-bold">dari {students.length} Siswa</span></p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* DONUT CHART CARD */}
        <div className="lg:col-span-4 glass-card rounded-[3.5rem] p-8 flex flex-col items-center justify-center text-center bg-white border-4 border-blue-50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none"></div>
          
          <div className="relative mb-6">
            <svg className="w-48 h-48 transform -rotate-90">
              <circle
                cx="96" cy="96" r={radius}
                stroke="currentColor" strokeWidth="12" fill="transparent"
                className="text-slate-100"
              />
              <circle
                cx="96" cy="96" r={radius}
                stroke="currentColor" strokeWidth="12" fill="transparent"
                strokeDasharray={circumference}
                style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 1.5s ease-in-out' }}
                strokeLinecap="round"
                className="text-blue-600 drop-shadow-[0_0_10px_rgba(37,99,235,0.3)]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className="text-4xl font-black text-slate-800 Museum-Text leading-none">{overallAvg.toFixed(0)}</span>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Mastery Score</span>
            </div>
          </div>

          <div className="z-10">
            <h4 className="text-sm font-black text-blue-900 uppercase Museum-Text mb-1">Penguasaan Umum</h4>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
              Berdasarkan ambang batas KKM: {passingGrade}
            </p>
          </div>
        </div>

        {/* SUBJECT MASTERY GRID */}
        <div className="lg:col-span-8 glass-card rounded-[3.5rem] p-8 md:p-10 border-4 border-slate-50 bg-white">
           <div className="flex items-center justify-between mb-8">
              <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em] flex items-center gap-3">
                 <i className="fas fa-list-check text-blue-500"></i> Detail Capaian & Peringkat Mapel
              </h4>
              <div className="flex items-center gap-2">
                 <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Update Otomatis</span>
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {subjectAnalysis.map((item, idx) => (
                <div key={idx} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                         <span className="text-[11px] font-black text-slate-700 uppercase tracking-wide truncate w-32">{item.subject}</span>
                         {item.avg > 0 && (
                            <span className="text-[9px] font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">#{item.rank}</span>
                         )}
                      </div>
                      <span className={`text-[8px] font-black uppercase ${item.color} mt-0.5`}>{item.status}</span>
                    </div>
                    <span className="text-sm font-black text-slate-800 Museum-Text">{item.avg.toFixed(0)}</span>
                  </div>
                  
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner flex">
                     <div 
                        className={`h-full transition-all duration-1000 ${item.avg >= passingGrade ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : item.avg > 0 ? 'bg-amber-400' : 'bg-slate-200'}`} 
                        style={{ width: `${item.avg}%` }}
                     ></div>
                  </div>

                  <div className="flex justify-between mt-1.5">
                     <span className="text-[7px] font-bold text-slate-300 uppercase italic">{item.count} Tugas Selesai</span>
                     {item.rank === 1 && item.avg > 0 && (
                        <span className="text-[7px] font-black text-amber-500 uppercase flex items-center gap-1">
                           <i className="fas fa-trophy"></i> Juara Kelas
                        </span>
                     )}
                  </div>
                </div>
              ))}
           </div>

           <div className="mt-10 p-5 bg-blue-50/50 rounded-2xl border-2 border-dashed border-blue-100 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-200">
                <i className="fas fa-award text-lg"></i>
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-900 uppercase">Saran Petualang:</p>
                <p className="text-[9px] font-medium text-blue-700 uppercase leading-relaxed mt-0.5 italic">
                  {overallAvg >= passingGrade ? "Kerja bagus! Pertahankan fokusmu dan bantu temanmu yang membutuhkan." : "Ayo selesaikan lebih banyak misi dengan teliti untuk menaikkan skor penguasaanmu!"}
                </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAnalytics;
