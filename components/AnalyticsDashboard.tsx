
import React from 'react';
import { Student, GradeEntry, TeacherSettings } from '../types';

interface AnalyticsDashboardProps {
  students: Student[];
  grades: GradeEntry[];
  subjects: string[];
  passingGrade: number;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ students, grades, subjects, passingGrade }) => {
  // Hitung Statistik Per Mata Pelajaran
  const subjectStats = subjects.map(subject => {
    const subjectGrades = grades.filter(g => g.subject.toLowerCase() === subject.toLowerCase());
    const totalScore = subjectGrades.reduce((acc, curr) => acc + curr.score, 0);
    const avg = subjectGrades.length > 0 ? totalScore / subjectGrades.length : 0;
    
    // Ketercapaian (Siswa yang nilainya >= KKM)
    const passingCount = subjectGrades.filter(g => g.score >= passingGrade).length;
    const achievementRate = subjectGrades.length > 0 ? (passingCount / subjectGrades.length) * 100 : 0;

    return { subject, avg, achievementRate, count: subjectGrades.length };
  });

  // Hitung Rata-rata per Siswa untuk Ranking Laporan
  const studentRankings = students.map(student => {
    const studentGrades = grades.filter(g => g.studentId.toString().trim() === student.id.toString().trim());
    const total = studentGrades.reduce((acc, curr) => acc + curr.score, 0);
    const avg = studentGrades.length > 0 ? total / studentGrades.length : 0;
    
    // Ambil nilai per subject untuk laporan
    const subjectScores: Record<string, number> = {};
    subjects.forEach(sub => {
      const g = studentGrades.find(sg => sg.subject.toLowerCase() === sub.toLowerCase());
      subjectScores[sub] = g ? g.score : 0;
    });

    return { id: student.id, name: student.name, avg, subjectScores };
  }).sort((a, b) => b.avg - a.avg);

  const classAverage = studentRankings.length > 0 
    ? studentRankings.reduce((acc, curr) => acc + curr.avg, 0) / studentRankings.length 
    : 0;

  const downloadExcelReport = () => {
    // Header CSV
    let csvContent = "sep=,\n"; // Header agar Excel otomatis mengenali pemisah koma
    csvContent += "No,Nama Siswa," + subjects.join(",") + ",Rata-rata,Peringkat\n";

    studentRankings.forEach((s, index) => {
      const scores = subjects.map(sub => s.subjectScores[sub] || 0).join(",");
      csvContent += `${index + 1},"${s.name.toUpperCase()}",${scores},${s.avg.toFixed(2)},${index + 1}\n`;
    });

    // Ringkasan Kelas
    csvContent += "\n\nRINGKASAN KELAS\n";
    csvContent += `Rata-rata Kelas,${classAverage.toFixed(2)}\n`;
    csvContent += `KKM Kelas,${passingGrade}\n`;
    csvContent += "Mata Pelajaran,Rata-rata Nilai,Ketercapaian (%)\n";
    subjectStats.forEach(stat => {
      csvContent += `${stat.subject},${stat.avg.toFixed(2)},${stat.achievementRate.toFixed(0)}%\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Akademik_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-black text-slate-800 Museum-Text uppercase tracking-tight">Analisis Capaian Kelas</h2>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Statistik Kumulatif & Laporan Ekspor</p>
        </div>
        <button 
          onClick={downloadExcelReport}
          className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-3"
        >
          <i className="fas fa-file-excel text-base"></i> Download Laporan Excel
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KARTU RATA-RATA KELAS */}
        <div className="glass-card rounded-[2.5rem] p-8 bg-gradient-to-br from-blue-600 to-indigo-800 text-white shadow-xl relative overflow-hidden border-4 border-white/10">
          <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12"><i className="fas fa-users text-8xl"></i></div>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">Rata-rata Kumulatif Kelas</p>
          <h3 className="text-6xl font-black Museum-Text mb-4">{classAverage.toFixed(1)}</h3>
          <div className="flex items-center gap-2">
             <div className="px-3 py-1 bg-white/20 rounded-lg text-[9px] font-black uppercase backdrop-blur-md">KKM: {passingGrade}</div>
             <div className="px-3 py-1 bg-white/20 rounded-lg text-[9px] font-black uppercase backdrop-blur-md">{subjects.length} Mapel</div>
          </div>
        </div>

        {/* GRAFIK KETERCAPAIAN MAPEL */}
        <div className="lg:col-span-2 glass-card rounded-[2.5rem] p-8 border-4 border-slate-50 flex flex-col gap-6 bg-white shadow-sm">
           <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
             <i className="fas fa-chart-bar text-blue-500"></i> Ketercapaian per Mata Pelajaran
           </h4>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
              {subjectStats.map(stat => (
                <div key={stat.subject} className="space-y-2">
                   <div className="flex justify-between items-end">
                      <span className="text-[11px] font-black uppercase text-slate-700 truncate w-32">{stat.subject}</span>
                      <span className="text-[10px] font-black text-blue-600">{stat.achievementRate.toFixed(0)}% Capaian</span>
                   </div>
                   <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden shadow-inner flex">
                      <div 
                        className={`h-full transition-all duration-1000 ${stat.achievementRate >= 75 ? 'bg-emerald-500' : 'bg-amber-400'}`} 
                        style={{ width: `${stat.achievementRate}%` }}
                      ></div>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-[8px] font-bold text-slate-300 uppercase">Avg Nilai: {stat.avg.toFixed(1)}</span>
                      <span className="text-[8px] font-bold text-slate-300 uppercase">{stat.count} Data</span>
                   </div>
                </div>
              ))}
              {subjectStats.length === 0 && <p className="text-xs text-slate-300 uppercase italic">Belum ada data nilai masuk.</p>}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
