
import { LessonFormData, GroundingSource } from '../types';
import { generateLessonPlan } from '../services/lessonPlanService';
import { AssemblyLoader, BlockingOverlay, ProRequirementNotice } from './SharedUI';
import { validateUsageCloud, getUsageStatusCloud } from '../services/validationService';
import { handleAiGenerationError } from '../utils/errorUtils';
import React, { useState, useRef, useEffect, useMemo } from 'react';

const NarasiAIPortal: React.FC<{ gasUrl?: string, isUnlocked: boolean, setGlobalBusy: (b: boolean) => void, myDeviceId?: string }> = ({ gasUrl, isUnlocked, setGlobalBusy, myDeviceId }) => {
  const initialFormData: LessonFormData = {
    namaNIP: '',
    sekolah: '',
    kelasFase: 'Kelas 1 / Fase A',
    mataPelajaran: 'IPAS',
    muatanLokalNama: '',
    tahunPelajaran: '2024/2025',
    semester: 'Semester 1',
    alokasiWaktu: '2',
    jumlahPertemuan: '1',
    jamPelajaran: '35',
    modelPembelajaran: 'Discovery Learning',
    strategiPenerapan: 'Prinsip Understanding by Design (UbD)',
    tujuanpembelajaran: '',
    materipokok: '',
    capaianPembelajaran: ''
  };

  const [formData, setFormData] = useState<LessonFormData>(initialFormData);
  const [tujuanList, setTujuanList] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isCloudBlocked, setIsCloudBlocked] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const [proNotice, setProNotice] = useState<{show: boolean, title: string, feature: string, benefit: string, canClaimBonus?: boolean}>({
    show: false, title: '', feature: '', benefit: '', canClaimBonus: false
  });
  
  const [dailyCount, setDailyCount] = useState(() => {
    const today = new Date().toLocaleDateString();
    const saved = localStorage.getItem(`usage_narasi_v2_${today}`);
    return saved ? parseInt(saved) : 0;
  });

  const [hasBonusToday, setHasBonusToday] = useState(() => {
    const today = new Date().toLocaleDateString();
    const saved = localStorage.getItem(`bonus_narasi_v2_${today}`);
    return saved === 'true';
  });

  const resultRef = useRef<HTMLDivElement>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const currentLimit = hasBonusToday ? 3 : 2;

  useEffect(() => {
    const checkCloud = async () => {
      if (!isUnlocked && myDeviceId) {
        setIsValidating(true);
        const isAllowed = await getUsageStatusCloud(myDeviceId, 'Modul Ajar', currentLimit, gasUrl || "NONE");
        if (!isAllowed) setIsCloudBlocked(true);
        setIsValidating(false);
      }
    };
    checkCloud();
  }, [isUnlocked, myDeviceId, currentLimit, gasUrl]);

  useEffect(() => {
    setFormData(prev => ({ 
      ...prev, 
      tujuanpembelajaran: tujuanList.filter(t => t.trim() !== '').join('\n') 
    }));
  }, [tujuanList]);

  const validationStatus = useMemo(() => {
    const missing = [];
    if (!formData.namaNIP.trim()) missing.push("Nama Pengajar / NIP");
    if (!formData.sekolah.trim()) missing.push("Nama Satuan Pendidikan (Sekolah)");
    if (!formData.tahunPelajaran.trim()) missing.push("Tahun Pelajaran");
    if (!formData.materipokok.trim()) missing.push("Materi Pokok / Judul Topik");
    if (!formData.capaianPembelajaran.trim()) missing.push("Capaian Pembelajaran (CP)");
    if (!tujuanList.some(t => t.trim() !== '')) missing.push("Minimal satu Tujuan Pembelajaran (TP)");
    return { isValid: missing.length === 0, missingFields: missing };
  }, [formData, tujuanList]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleReset = () => {
    if (window.confirm("Hapus semua data input?")) {
      setFormData(initialFormData);
      setTujuanList(['']);
      setResult(null);
      setSources([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleTujuanChange = (index: number, value: string) => {
    const newList = [...tujuanList];
    newList[index] = value;
    setTujuanList(newList);
  };

  const addTujuanField = () => {
    if (!isUnlocked) {
      setProNotice({
        show: true,
        title: 'Fitur Khusus Guru PRO',
        feature: 'Multi-Tujuan Pembelajaran',
        benefit: 'User PRO dapat memasukkan hingga 5 Tujuan Pembelajaran sekaligus untuk hasil modul yang lebih kompleks.'
      });
      return;
    }
    setTujuanList([...tujuanList, '']);
  };

  const removeTujuanField = (index: number) => {
    if (tujuanList.length > 1) {
      const newList = tujuanList.filter((_, i) => i !== index);
      setTujuanList(newList);
    }
  };

  const handleClaimBonus = () => {
    const today = new Date().toLocaleDateString();
    setHasBonusToday(true);
    localStorage.setItem(`bonus_narasi_v2_${today}`, 'true');
    setProNotice(prev => ({ ...prev, show: false }));
    setIsCloudBlocked(false); 
    alert("🌟 BONUS DIKLAIM!\n\nAnda mendapatkan 1 kesempatan tambahan untuk menyusun modul ajar hari ini. Silakan lanjutkan karya Anda!");
  };

  const handleGenerate = async () => {
    if (!isUnlocked) {
        if (dailyCount === 2 && !hasBonusToday) {
            setProNotice({
                show: true,
                title: 'Kuota Harian Penuh',
                feature: 'Kesempatan Ekstra Menanti',
                benefit: 'Bapak/Ibu masih bisa menyusun 1 modul ajar lagi hari ini secara GRATIS dengan membagikan aplikasi ini.',
                canClaimBonus: true
            });
            return;
        }
        if (dailyCount >= 3 || (isCloudBlocked && !hasBonusToday)) {
            setProNotice({
                show: true,
                title: 'Limit Harian Tercapai',
                feature: 'Generator Tanpa Batas',
                benefit: 'Akun Basic dibatasi pembuatan modul harian. Upgrade ke PRO untuk menikmati pembuatan modul sepuasnya tanpa batas waktu dan tanpa iklan share.',
                canClaimBonus: false
            });
            return;
        }
    }

    if (!validationStatus.isValid) {
      alert("Lengkapi data: " + validationStatus.missingFields.join(", "));
      return;
    }
    
    setIsLoading(true);
    setGlobalBusy(true);
    
    try {
      if (!isUnlocked && myDeviceId) {
        const isAllowed = await getUsageStatusCloud(myDeviceId, 'Modul Ajar', currentLimit, gasUrl || "NONE");
        if (!isAllowed) {
            setIsLoading(false);
            setGlobalBusy(false);
            setIsCloudBlocked(true);
            setProNotice({
                show: true,
                title: 'Limit Cloud Tercapai',
                feature: 'Keamanan Kuota Lintas Browser',
                benefit: 'Sistem mendeteksi perangkat atau kelas ini sudah menggunakan kuota harian. Gunakan akun PRO untuk akses tanpa batas.',
                canClaimBonus: !hasBonusToday
            });
            return; 
        }
      }

      setResult(null);
      const payload = { ...formData, tujuanpembelajaran: tujuanList.filter(t => t.trim() !== '').join('\n') };
      const { text, sources: rawSources } = await generateLessonPlan(payload);
      setResult(text);
      setSources(rawSources);

      if (!isUnlocked) {
        const today = new Date().toLocaleDateString();
        const newCount = dailyCount + 1;
        setDailyCount(newCount);
        localStorage.setItem(`usage_narasi_v2_${today}`, newCount.toString());
      }

      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 500);
    } catch (err: any) {
      handleAiGenerationError(err, 'menyusun Modul Ajar');
    } finally { 
        setIsLoading(false); 
        setGlobalBusy(false);
    }
  };

  const handleCopyToSpreadsheet = async () => {
    if (!printAreaRef.current) return;
    try {
      const htmlContent = printAreaRef.current.innerHTML;
      const type = "text/html";
      const blob = new Blob([htmlContent], { type });
      await navigator.clipboard.write([new ClipboardItem({ [type]: blob })]);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
      alert("Berhasil disalin!");
    } catch (err) { alert("Gagal menyalin data."); }
  };

  const handleDownloadDoc = () => {
    if (!printAreaRef.current) return;
    const content = printAreaRef.current.innerHTML;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Modul Ajar</title><style>body { font-family: 'Arial', sans-serif; font-size: 11pt; line-height: 1.4; } table { border-collapse: collapse; width: 100%; margin-bottom: 10pt; } th, td { border: 1px solid black; padding: 5pt 8pt; text-align: left; font-size: 10pt; color: black; line-height: 1.2; } h1 { text-align: center; text-transform: uppercase; border-bottom: 2pt solid black; color: black; font-size: 16pt; margin-top: 10pt; margin-bottom: 15pt; } h2 { margin-top: 15pt; margin-bottom: 8pt; text-transform: uppercase; border-bottom: 1pt solid #ccc; color: black; font-size: 13pt; font-weight: bold; } p { color: black; margin-top: 0; margin-bottom: 8pt; }</style></head><body>";
    const footer = "</body></html>";
    const blob = new Blob(['\ufeff', header + content + footer], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ModulAjar_${formData.mataPelajaran}_${formData.materipokok.replace(/\s+/g, '_')}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const parseInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => 
      part.startsWith('**') && part.endsWith('**') 
      ? <strong key={i} className="text-black font-bold">{part.slice(2, -2)}</strong> 
      : part
    );
  };

  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let currentTable: string[][] = [];
    let isInsideTable = false;

    const flushTable = (index: number) => {
      if (currentTable.length > 0) {
        // FILTER: Hilangkan baris separator Markdown (---)
        const filteredTable = currentTable.filter(row => {
          const rowText = row.join('').trim();
          return rowText !== '' && !rowText.match(/^[:\-\s|]+$/);
        });

        if (filteredTable.length > 0) {
          elements.push(
            <div key={`table-${index}`} className="mb-6 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full border-collapse bg-white text-black text-[11px]">
                <thead>
                  <tr className="bg-slate-50">
                    {filteredTable[0].map((cell, j) => (
                      <th key={j} className="border border-slate-200 py-3 px-4 font-bold text-left uppercase text-slate-700 tracking-wider">
                        {parseInline(cell.trim())}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTable.slice(1).map((row, i) => (
                    <tr key={i} className="hover:bg-blue-50/30 transition-colors border-b border-slate-100 last:border-0">
                      {row.map((cell, j) => (
                        <td key={j} className="border-r border-slate-100 last:border-0 py-2.5 px-4 align-top leading-relaxed">
                          {parseInline(cell.trim())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        currentTable = [];
      }
      isInsideTable = false;
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('Bondowoso,')) {
          flushTable(idx);
          elements.push(
            <div key={`sig-${idx}`} className="mt-12 ml-auto w-72 text-left text-sm">
                {lines.slice(idx).map((sigLine, sIdx) => {
                    const t = sigLine.trim();
                    if (!t || t === '[KOSONG]') return <div key={sIdx} className={t === '[KOSONG]' ? "h-16" : ""}></div>;
                    return <p key={sIdx} className={`mb-1 ${t.startsWith('NIP.') ? 'font-medium text-slate-500 italic' : 'font-bold text-slate-900'}`}>{parseInline(sigLine)}</p>;
                })}
            </div>
          );
          return;
      }
      if (lines.slice(0, idx).some(l => l.trim().startsWith('Bondowoso,'))) return;

      if (trimmed.startsWith('|')) {
        isInsideTable = true;
        currentTable.push(trimmed.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1));
        return;
      } else if (isInsideTable && !trimmed.startsWith('|')) { 
        flushTable(idx); 
      }

      if (trimmed.startsWith('# ')) {
        elements.push(<h1 key={idx} className="text-2xl font-extrabold text-blue-800 uppercase my-8 text-center pb-4 border-b-4 border-blue-500 Museum-Text">{parseInline(trimmed.substring(2))}</h1>);
      } else if (trimmed.startsWith('## ')) {
        elements.push(<h2 key={idx} className="text-lg font-bold mt-10 mb-4 text-blue-700 border-b-2 border-blue-100 pb-2 uppercase flex items-center gap-3 Museum-Text">
          <span className="w-2.5 h-8 bg-blue-600 rounded-full"></span>
          {parseInline(trimmed.substring(3))}
        </h2>);
      } else if (!isInsideTable && trimmed !== '') {
        elements.push(<p key={idx} className="mb-3 text-slate-700 leading-relaxed text-[14px]">{parseInline(trimmed)}</p>);
      }
    });
    return elements;
  };

  return (
    <div className="animate-in fade-in duration-700">
      <BlockingOverlay isVisible={isLoading} text="Menyusun Modul Ajar..." isUnlocked={isUnlocked} />
      
      <ProRequirementNotice 
        isOpen={proNotice.show}
        onClose={() => setProNotice({...proNotice, show: false})}
        featureName={proNotice.feature}
        benefitDesc={proNotice.benefit}
        title={proNotice.title}
        deviceId={myDeviceId}
        canClaimBonus={proNotice.canClaimBonus}
        onShareBonus={handleClaimBonus}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 space-y-8 no-print">
          <div className="glass-card rounded-[2.5rem] p-8 border-t-8 border-t-blue-500 shadow-xl bg-white">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-blue-600 flex items-center uppercase tracking-wider text-sm Museum-Text">
                <i className="fas fa-pencil-alt mr-3 text-xl"></i> Pengisian Modul
              </h2>
              <button onClick={handleReset} className="text-[10px] font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-full transition-all border border-red-200 active:scale-90">
                <i className="fas fa-undo mr-1"></i> RESET
              </button>
            </div>
            
            <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-blue-800/40 uppercase tracking-[0.2em] flex items-center gap-3">
                    <span className="w-8 h-1 bg-blue-400 rounded-full"></span> BIODATA
                  </h3>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase ml-1">Nama Pengajar / NIP <span className="text-red-500">*</span></label>
                      <input id="namaNIP" value={formData.namaNIP} onChange={handleInputChange} className="w-full input-futuristic bg-white px-5 py-3.5 text-sm font-semibold" placeholder="Contoh: Budi Santoso, S.Pd / 1985..." />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase ml-1">Nama Sekolah <span className="text-red-500">*</span></label>
                      <input id="sekolah" value={formData.sekolah} onChange={handleInputChange} className="w-full input-futuristic bg-white px-5 py-3.5 text-sm font-semibold" placeholder="SDN 1 Mentari" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black text-blue-800/40 uppercase tracking-[0.2em] flex items-center gap-3">
                    <span className="w-8 h-1 bg-yellow-400 rounded-full"></span> KURIKULUM & ALOKASI
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase ml-1">Fase / Kelas</label>
                      <select id="kelasFase" value={formData.kelasFase} onChange={handleInputChange} className="w-full input-futuristic px-4 py-3.5 text-sm font-semibold cursor-pointer">
                        <option>Kelas 1 / Fase A</option><option>Kelas 2 / Fase A</option><option>Kelas 3 / Fase B</option><option>Kelas 4 / Fase B</option><option>Kelas 5 / Fase C</option><option>Kelas 6 / Fase C</option><option>Kelas 7 / Fase D</option><option>Kelas 8 / Fase D</option><option>Kelas 9 / Fase D</option><option>Kelas 10 / Fase E</option><option>Kelas 11 / Fase F</option><option>Kelas 12 / Fase F</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase ml-1">Mata Pelajaran</label>
                      <select id="mataPelajaran" value={formData.mataPelajaran} onChange={handleInputChange} className="w-full input-futuristic px-4 py-3.5 text-sm font-semibold cursor-pointer">
                        <option value="IPAS">IPAS</option><option value="Bahasa Indonesia">Bahasa Indonesia</option><option value="Matematika">Matematika</option><option value="Pendidikan Pancasila">Pendidikan Pancasila</option><option value="Bahasa Inggris">Bahasa Inggris</option><option value="Seni Rupa">Seni Rupa</option><option value="Lainnya">Lainnya...</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase ml-1">Thn Pelajaran <span className="text-red-500">*</span></label>
                      <select id="tahunPelajaran" value={formData.tahunPelajaran} onChange={handleInputChange} className="w-full input-futuristic px-4 py-3.5 text-sm font-semibold cursor-pointer">
                        <option>2024/2025</option><option>2025/2026</option><option>2026/2027</option><option>2027/2028</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase ml-1">Semester</label>
                      <select id="semester" value={formData.semester} onChange={handleInputChange} className="w-full input-futuristic px-4 py-3.5 text-sm font-semibold">
                        <option>Semester 1</option><option>Semester 2</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* BARU: INPUT ALOKASI WAKTU & PERTEMUAN */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Alokasi (JP)</label>
                      <input type="number" id="alokasiWaktu" value={formData.alokasiWaktu} onChange={handleInputChange} className="w-full input-futuristic bg-slate-50 px-4 py-3 text-sm font-black text-blue-600 shadow-inner" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Pertemuan</label>
                      <input type="number" id="jumlahPertemuan" value={formData.jumlahPertemuan} onChange={handleInputChange} className="w-full input-futuristic bg-slate-50 px-4 py-3 text-sm font-black text-indigo-600 shadow-inner" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Menit / JP</label>
                      <input type="number" id="jamPelajaran" value={formData.jamPelajaran} onChange={handleInputChange} className="w-full input-futuristic bg-slate-50 px-4 py-3 text-sm font-black text-emerald-600 shadow-inner" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black text-blue-800/40 uppercase tracking-[0.2em] flex items-center gap-3">
                    <span className="w-8 h-1 bg-green-400 rounded-full"></span> MATERI
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase ml-1">Judul Topik <span className="text-red-500">*</span></label>
                      <input id="materipokok" value={formData.materipokok} onChange={handleInputChange} className="w-full input-futuristic bg-white px-5 py-3.5 text-sm font-semibold" placeholder="Contoh: Energi Alternatif" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between ml-1">
                        <label className="text-[11px] font-bold text-slate-600 uppercase">Tujuan Pembelajaran <span className="text-red-500">*</span></label>
                        <button onClick={addTujuanField} className="text-[10px] font-black uppercase text-blue-600 hover:underline">+ Tambah TP</button>
                      </div>
                      {tujuanList.map((tujuan, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input value={tujuan} onChange={(e) => handleTujuanChange(idx, e.target.value)} className="w-full input-futuristic px-4 py-3 text-sm font-semibold" placeholder={`TP ${idx + 1}...`} />
                          {tujuanList.length > 1 && (
                            <button onClick={() => removeTujuanField(idx)} className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center border-2 border-red-100"><i className="fas fa-trash-alt"></i></button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase ml-1">Capaian Pembelajaran <span className="text-red-500">*</span></label>
                      <textarea id="capaianPembelajaran" value={formData.capaianPembelajaran} onChange={handleInputChange} className="w-full input-futuristic rounded-2xl px-5 py-3.5 text-sm h-28 resize-none font-semibold Museum-Text" placeholder="Tulis atau salin CP di sini..." />
                    </div>
                  </div>
                </div>
            </div>
            
            <div className="mt-8">
              <button onClick={handleGenerate} disabled={isLoading || isValidating} className={`w-full py-5 font-bold rounded-2xl Museum-Text uppercase text-lg joyful-shadow bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all`}>
                {isLoading ? <><i className="fas fa-spinner fa-spin mr-3"></i>Menyusun...</> : <><i className="fas fa-wand-magic-sparkles mr-3"></i>Buat Modul Ajar</>}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7" ref={resultRef}>
          {!result && !isLoading && (
            <div className="h-full min-h-[700px] flex flex-col items-center justify-center bg-white/50 border-4 border-dashed border-blue-200 rounded-[3rem] p-20 text-center">
              <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mb-10"><i className="fas fa-file-invoice text-blue-200 text-6xl"></i></div>
              <h3 className="text-xl font-bold text-blue-300 uppercase Museum-Text">DRAFT KOSONG</h3>
            </div>
          )}
          {isLoading && <AssemblyLoader />}
          {result && (
            <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border-4 border-blue-500 flex flex-col h-full animate-in zoom-in">
              <div className="p-6 bg-blue-500 flex flex-wrap gap-4 justify-center no-print">
                <button onClick={() => { navigator.clipboard.writeText(result); alert("Disalin!"); }} className="px-6 py-3 text-xs font-bold rounded-xl bg-white text-blue-600 uppercase joyful-shadow"><i className="fas fa-copy mr-2"></i> Salin</button>
                <button onClick={handleDownloadDoc} className="px-6 py-3 text-xs font-bold bg-white text-blue-600 rounded-xl uppercase joyful-shadow"><i className="fas fa-file-word mr-2"></i> Word</button>
                <button onClick={() => window.print()} className="px-6 py-3 text-xs font-bold bg-white text-blue-600 rounded-xl uppercase joyful-shadow"><i className="fas fa-print mr-2"></i> Cetak PDF</button>
              </div>
              <div className="bg-slate-50 p-8 md:p-16 overflow-auto flex-grow">
                <div ref={printAreaRef} className="bg-white shadow-xl mx-auto w-full p-[15mm] text-black rounded-sm min-h-[1000px] document-body printable-area">
                  {renderFormattedContent(result)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NarasiAIPortal;
