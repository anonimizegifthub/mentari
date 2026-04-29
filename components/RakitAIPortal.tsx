import { AssessmentFormData } from '../types';
import { generateAssessment } from '../services/assessmentService';
import { getInitialAssessmentData } from '../constants';
import { AssemblyLoader, AIImage, BlockingOverlay, ProRequirementNotice } from './SharedUI';
import { validateUsageCloud, getUsageStatusCloud } from '../services/validationService';
import { handleAiGenerationError } from '../utils/errorUtils';
import React, { useState, useRef, useEffect, useMemo } from 'react';

const RakitAIPortal: React.FC<{ gasUrl?: string, isUnlocked: boolean, setGlobalBusy: (b: boolean) => void, myDeviceId?: string }> = ({ gasUrl, isUnlocked, setGlobalBusy, myDeviceId }) => {
  const [formData, setFormData] = useState<AssessmentFormData>(getInitialAssessmentData());
  const [activeFormTab, setActiveFormTab] = useState<'identity' | 'structure' | 'topics'>('identity');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isCloudBlocked, setIsCloudBlocked] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const [dailyCount, setDailyCount] = useState(() => {
    const today = new Date().toLocaleDateString();
    const saved = localStorage.getItem(`usage_asesmen_v1_${today}`);
    return saved ? parseInt(saved) : 0;
  });

  const [hasBonusToday, setHasBonusToday] = useState(() => {
    const today = new Date().toLocaleDateString();
    const saved = localStorage.getItem(`bonus_asesmen_v1_${today}`);
    return saved === 'true';
  });

  const [proNotice, setProNotice] = useState<{show: boolean, title: string, feature: string, benefit: string, canClaimBonus?: boolean}>({
    show: false, title: '', feature: '', benefit: '', canClaimBonus: false
  });
  
  const [showConfirmModal, setShowConfirmModal] = useState<{show: boolean, missing: string[]}>({show: false, missing: []});

  const resultRef = useRef<HTMLDivElement>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);

  const currentLimit = hasBonusToday ? 2 : 1;

  useEffect(() => {
    const checkCloud = async () => {
      if (!isUnlocked && myDeviceId) {
        setIsValidating(true);
        const isAllowed = await getUsageStatusCloud(myDeviceId, 'Asesmen', currentLimit, gasUrl || "NONE");
        if (!isAllowed) setIsCloudBlocked(true);
        setIsValidating(false);
      }
    };
    checkCloud();
  }, [isUnlocked, myDeviceId, currentLimit, gasUrl]);

  const calculateTotalFromFormats = () => formData.formats.reduce((acc, curr) => acc + (parseInt(curr.count) || 0), 0);
  const calculateTotalWeight = () => formData.topics.reduce((acc, curr) => acc + (parseInt(curr.bobot) || 0), 0);
  const totalCalculatedSoal = calculateTotalFromFormats();
  const totalWeight = calculateTotalWeight();
  const isSoalMatching = (parseInt(formData.jumlahSoalTotal) || 0) === totalCalculatedSoal && totalCalculatedSoal > 0;
  const isWeightMatching = totalWeight === 100;

  const handleClaimBonus = () => {
    const today = new Date().toLocaleDateString();
    setHasBonusToday(true);
    localStorage.setItem(`bonus_asesmen_v1_${today}`, 'true');
    setProNotice(prev => ({ ...prev, show: false }));
    setIsCloudBlocked(false); 
    alert("🌟 BONUS DIKLAIM!\n\nSatu kesempatan tambahan untuk membuat asesmen telah aktif. Ayo selesaikan naskah soal Anda!");
  };

  const handleGenerate = async () => {
    if (!isUnlocked) {
        if (dailyCount === 1 && !hasBonusToday) {
            setProNotice({
                show: true,
                title: 'Kuota Harian Penuh',
                feature: 'Hadiah Kejutan Petualang',
                benefit: 'Bapak/Ibu masih bisa membuat 1 naskah soal lagi hari ini secara GRATIS dengan membagikan kabar baik ini ke rekan sejawat.',
                canClaimBonus: true
            });
            return;
        }
        if (dailyCount >= 2 || (isCloudBlocked && !hasBonusToday)) {
            setProNotice({
                show: true,
                title: 'Limit Harian Tercapai',
                feature: 'Generator Soal Tak Terbatas',
                benefit: 'User Basic dibatasi 1 asesmen per hari (+1 bonus share). Upgrade ke GURU PRO untuk membuat naskah sepuasnya tanpa batasan.',
                canClaimBonus: false
            });
            return;
        }
    }

    const missing = [];
    if (!formData.judulAsesmen.trim()) missing.push("Judul Asesmen belum diisi.");
    if (!isSoalMatching) missing.push("Jumlah rincian soal tidak sesuai target total.");
    if (!isWeightMatching) missing.push(`Total bobot materi harus tepat 100% (saat ini ${totalWeight}%).`);
    
    if (missing.length > 0) { 
      setShowConfirmModal({ show: true, missing }); 
      return; 
    }
    
    setIsLoading(true);
    setGlobalBusy(true);

    try {
      setResult(null);
      const { text } = await generateAssessment(formData);
      setResult(text);

      if (!isUnlocked) {
        const today = new Date().toLocaleDateString();
        const newCount = dailyCount + 1;
        setDailyCount(newCount);
        localStorage.setItem(`usage_asesmen_v1_${today}`, newCount.toString());
      }

      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 500);
    } catch (err) {
      handleAiGenerationError(err, 'menyusun naskah asesmen');
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
    } catch (err) { alert("Gagal menyalin."); }
  };

  const handleDownloadDoc = () => {
    if (!printAreaRef.current) return;
    const content = printAreaRef.current.innerHTML;
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Asesmen</title><style>table { border-collapse: collapse; width: 100%; color: #000000; margin-bottom: 8pt; border: 1px solid black; } td, th { padding: 4pt 6pt; vertical-align: top; border: 1px solid black; font-family: 'Arial', sans-serif; font-size: 10pt; line-height: 1.2; } .kop-table-container table { border: none !important; } .kop-table-container td { border: none !important; padding: 1pt 2pt; } p { margin: 0; padding: 0; margin-bottom: 3pt; line-height: 1.2; } .section-header { font-weight: bold; border-bottom: 1.5pt solid black; margin-top: 10pt; margin-bottom: 5pt; display: block; text-transform: uppercase; font-size: 11pt; }</style></head><body>`;
    const footer = "</body></html>";
    const blob = new Blob(['\ufeff', header + content + footer], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Asesmen_${formData.judulAsesmen.replace(/\s+/g, '_')}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let currentTable: string[][] = [];
    let inTable = false;
    
    const parseFormattedText = (text: string) => {
      let html = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
      html = html.replace(/__(.*?)__/g, '<i>$1</i>');
      return <span dangerouslySetInnerHTML={{ __html: html }} />;
    };

    const flushTable = (idx: number) => {
      if (currentTable.length > 0) {
        // FILTER: Sembunyikan baris separator Markdown (---)
        const filteredRows = currentTable.filter(row => {
          const rowText = row.join('').trim();
          return rowText !== '' && !rowText.match(/^[:\-\s|]+$/);
        });

        if (filteredRows.length > 0) {
          const isIdentity = filteredRows.some(row => row.some(cell => cell.toLowerCase().includes('siswa') || cell.toLowerCase().includes('sekolah')));
          elements.push(
            <div key={`tbl-${idx}`} className={`w-full mb-6 overflow-x-auto ${isIdentity ? 'kop-table-container' : 'border border-black'}`}>
              <table className={`w-full border-collapse text-[11px] leading-tight`} border={isIdentity ? 0 : 1} style={{ width: '100%', color: 'black', borderCollapse: 'collapse' }}>
                <tbody>{filteredRows.map((r, i) => (<tr key={i}>{r.map((c, j) => <td key={j} className={`align-top px-3 py-2 ${isIdentity ? '' : 'border border-black'}`} style={isIdentity ? { border: 'none' } : { border: '1px solid black' }}>{parseFormattedText(c.trim())}</td>)}</tr>))}</tbody>
              </table>
            </div>
          );
        }
        currentTable = [];
      }
      inTable = false;
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('|')) { 
        inTable = true; 
        currentTable.push(trimmed.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1)); 
      } else { 
        if (inTable) flushTable(idx); 
        if (trimmed !== '') {
          const isSectionHeader = /^[I|V|X|0-9]+\.\s[A-Z\s]+$/.test(trimmed);
          if (isSectionHeader) {
            elements.push(<div key={idx} className="font-bold text-[12.5px] mt-6 mb-3 border-b-2 border-black uppercase tracking-wider Museum-Text">{parseFormattedText(trimmed)}</div>);
          } else {
            elements.push(<div key={idx} style={{ paddingLeft: '5px', marginBottom: '6px', color: 'black', fontSize: '11px' }}>{parseFormattedText(trimmed)}</div>);
          }
        } 
      }
    });

    if (inTable) flushTable(lines.length);
    return elements;
  };

  return (
    <div className="animate-in fade-in duration-700">
      <BlockingOverlay isVisible={isLoading} text="Menyusun Soal..." isUnlocked={isUnlocked} />
      
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5 space-y-6 no-print sticky top-10">
          <div className="rounded-[3rem] shadow-xl overflow-hidden border-4 border-yellow-400 bg-white">
            <div className="flex bg-yellow-50">{(['identity', 'structure', 'topics'] as const).map(tab => (<button key={tab} onClick={() => setActiveFormTab(tab)} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all relative Museum-Text active:scale-95 ${activeFormTab === tab ? 'text-blue-600' : 'text-slate-400 hover:text-blue-400'}`}>{activeFormTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-blue-500"></div>}{tab === 'identity' ? 'IDENTITAS' : tab === 'structure' ? 'STRUKTUR' : 'MATERI'}</button>))}</div>
            <div className="p-7">
              {activeFormTab === 'identity' && (<div className="space-y-5 animate-in fade-in duration-300"><div className="space-y-1.5"><label className="text-[11px] font-bold uppercase text-slate-500 ml-1">Jenjang</label><select value={formData.jenjang} onChange={e => setFormData({...formData, jenjang: e.target.value})} className="w-full input-futuristic bg-white px-5 py-3 text-sm font-semibold"><option>SD Sederajat</option><option>SMP Sederajat</option><option>SMA Sederajat</option><option>Perguruan Tinggi</option><option>Profesional</option></select></div><div className="space-y-1.5"><label className="text-[11px] font-bold uppercase text-slate-500 ml-1">Institusi (Opsional)</label><input value={formData.sekolah} onChange={e => setFormData({...formData, sekolah: e.target.value})} className="w-full input-futuristic bg-white px-5 py-3 text-sm font-semibold" placeholder="Contoh: SDN 1 Mentari" /></div><div className="space-y-1.5"><label className="text-[11px] font-bold uppercase text-slate-500 ml-1">Judul Asesmen <span className="text-red-500">*</span></label><input value={formData.judulAsesmen} onChange={e => setFormData({...formData, judulAsesmen: e.target.value})} className="w-full input-futuristic bg-white px-5 py-3 text-sm font-semibold" placeholder="Sumatif Akhir Semester" /></div><div className="grid grid-cols-2 gap-4"><div className="space-y-1.5"><label className="text-[11px] font-bold uppercase text-slate-500 ml-1">Mapel</label><input value={formData.mataPelajaran} onChange={e => setFormData({...formData, mataPelajaran: e.target.value})} className="w-full input-futuristic bg-white px-5 py-3 text-sm font-semibold" placeholder="IPAS" /></div><div className="space-y-1.5"><label className="text-[11px] font-bold uppercase text-slate-500 ml-1">Kelas/Smt</label><input value={formData.kelasSemester} onChange={e => setFormData({...formData, kelasSemester: e.target.value})} className="w-full input-futuristic bg-white px-5 py-3 text-sm font-semibold" placeholder="IV / 1" /></div></div></div>)}
              {activeFormTab === 'structure' && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="p-6 rounded-3xl border-4 border-blue-50 flex flex-col gap-3 bg-blue-50/50">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-black uppercase text-blue-700 Museum-Text">Target Soal</span>
                      <input type="number" value={formData.jumlahSoalTotal} onChange={e => setFormData({...formData, jumlahSoalTotal: e.target.value})} className="w-24 rounded-xl px-3 py-1.5 text-center font-bold bg-white border-2 border-blue-200 text-blue-600" />
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t-2 border-blue-100">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">Input Saat Ini:</span>
                      <span className={`text-2xl font-black ${isSoalMatching ? 'text-green-500' : 'text-red-400'}`}>{totalCalculatedSoal} / {formData.jumlahSoalTotal}</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-3xl border-4 border-purple-50 bg-purple-50/30 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black uppercase text-purple-700 Museum-Text">Opsi Visualisasi</span>
                        <span className="text-[9px] font-bold text-purple-400 uppercase">Sertakan Gambar Ilustrasi</span>
                      </div>
                      <button 
                        onClick={() => setFormData({...formData, includeImages: !formData.includeImages, imageCount: !formData.includeImages ? Math.min(2, parseInt(formData.jumlahSoalTotal) || 0) : 0})}
                        className={`w-12 h-6 rounded-full transition-all relative ${formData.includeImages ? 'bg-purple-500 border-2 border-purple-200 shadow-inner' : 'bg-slate-300'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.includeImages ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </div>
                    {formData.includeImages && (
                      <div className="flex justify-between items-center pt-2 border-t border-purple-100 flex-wrap gap-2">
                        <span className="text-[10px] font-bold text-purple-600 uppercase">Jumlah Soal Bergambar:</span>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setFormData({...formData, imageCount: Math.max(1, formData.imageCount - 1)})}
                            className="w-8 h-8 rounded-lg bg-white border border-purple-200 text-purple-600 flex items-center justify-center font-bold active:scale-95"
                          >-</button>
                          <span className="w-8 text-center font-black text-purple-700">{formData.imageCount}</span>
                          <button 
                            onClick={() => setFormData({...formData, imageCount: Math.min(parseInt(formData.jumlahSoalTotal) || 0, formData.imageCount + 1)})}
                            className="w-8 h-8 rounded-lg bg-white border border-purple-200 text-purple-600 flex items-center justify-center font-bold active:scale-95"
                          >+</button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-5 rounded-3xl border-4 border-emerald-50 bg-emerald-50/30 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black uppercase text-emerald-700 Museum-Text">Teks Arab / Ayat</span>
                        <span className="text-[9px] font-bold text-emerald-400 uppercase">Sertakan Ayat/Hadist</span>
                      </div>
                      <button 
                        onClick={() => setFormData({...formData, includeArabic: !formData.includeArabic, arabicCount: !formData.includeArabic ? Math.min(2, parseInt(formData.jumlahSoalTotal) || 0) : 0})}
                        className={`w-12 h-6 rounded-full transition-all relative ${formData.includeArabic ? 'bg-emerald-500 border-2 border-emerald-200 shadow-inner' : 'bg-slate-300'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.includeArabic ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </div>
                    {formData.includeArabic && (
                      <div className="flex justify-between items-center pt-2 border-t border-emerald-100 flex-wrap gap-2">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Jumlah Soal Berteks Arab:</span>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setFormData({...formData, arabicCount: Math.max(1, formData.arabicCount - 1)})}
                            className="w-8 h-8 rounded-lg bg-white border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold active:scale-95"
                          >-</button>
                          <span className="w-8 text-center font-black text-emerald-700">{formData.arabicCount}</span>
                          <button 
                            onClick={() => setFormData({...formData, arabicCount: Math.min(parseInt(formData.jumlahSoalTotal) || 0, formData.arabicCount + 1)})}
                            className="w-8 h-8 rounded-lg bg-white border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold active:scale-95"
                          >+</button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">{formData.formats.map((f, i) => (<div key={f.type} className={`p-3 rounded-2xl border-2 transition-all ${parseInt(f.count) > 0 ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 opacity-60'}`}><label className="text-[10px] font-black uppercase mb-1.5 block truncate Museum-Text">{f.type}</label><input type="number" value={f.count} onChange={e => { const nf = [...formData.formats]; nf[i].count = e.target.value; setFormData({...formData, formats: nf})}} className={`w-full bg-transparent border-none p-0 text-xl font-black focus:outline-none ${parseInt(f.count) > 0 ? 'text-white' : 'text-slate-400'}`} /></div>))}</div>
                </div>
              )}
              {activeFormTab === 'topics' && (<div className="space-y-5 animate-in fade-in duration-300"><div className="p-5 rounded-2xl border-4 border-green-50 bg-green-50/30 flex justify-between items-center"><span className="text-[11px] font-black uppercase text-green-700 Museum-Text">Total Bobot</span><div className={`px-6 py-2 rounded-xl text-xl font-black ${isWeightMatching ? 'text-green-600 bg-white' : 'text-red-500 bg-red-50'}`}>{totalWeight}%</div></div><div className="space-y-3"><div className="flex items-center justify-between ml-1"><label className="text-[11px] font-bold uppercase text-slate-500">Daftar Materi Pokok</label><button onClick={() => setFormData({...formData, topics: [...formData.topics, {materi: '', bobot: '0'}]})} className="text-[10px] font-black uppercase text-blue-600 hover:underline">+ Tambah Baris</button></div>{formData.topics.map((t, i) => (<div key={i} className="flex gap-3 animate-in slide-in-from-left-2 duration-300"><input value={t.materi} onChange={e => { const nt = [...formData.topics]; nt[i].materi = e.target.value; setFormData({...formData, topics: nt})}} className="flex-grow input-futuristic bg-white px-5 py-2.5 text-sm font-bold" placeholder="Materi..." /><div className="relative w-24"><input type="number" value={t.bobot} onChange={e => { const nt = [...formData.topics]; nt[i].bobot = e.target.value; setFormData({...formData, topics: nt})}} className="w-full input-futuristic bg-white px-3 py-2.5 text-sm font-black text-center" /><span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300">%</span></div>{formData.topics.length > 1 && (<button onClick={() => { const nt = formData.topics.filter((_, idx) => idx !== i); setFormData({...formData, topics: nt})}} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center border-2 border-red-100 transition-all active:scale-90"><i className="fas fa-trash-alt text-xs"></i></button>)}</div>))}</div></div>)}
            </div>
            <div className="p-7 pt-0">
               <div className="flex gap-4">
                  {activeFormTab !== 'identity' && (
                    <button onClick={() => { if(activeFormTab === 'structure') setActiveFormTab('identity'); else setActiveFormTab('structure'); }} className="flex-1 py-3.5 rounded-2xl bg-slate-100 text-slate-500 font-black uppercase text-xs hover:bg-slate-200 transition-all">Kembali</button>
                  )}
                  <button 
                    onClick={() => { if(activeFormTab === 'identity') setActiveFormTab('structure'); else if(activeFormTab === 'structure') setActiveFormTab('topics'); else handleGenerate(); }} 
                    disabled={isValidating}
                    className={`flex-[2] py-4 font-bold rounded-2xl Museum-Text uppercase text-sm joyful-shadow bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all`}
                  >
                    {activeFormTab === 'topics' ? (isLoading ? 'Menyusun...' : 'Buat Asesmen') : 'Selanjutnya'}
                  </button>
               </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7" ref={resultRef}>
          {!result && !isLoading && (
            <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-white/50 border-4 border-dashed border-yellow-200 rounded-[3rem] p-20 text-center">
              <div className="w-32 h-32 bg-yellow-50 rounded-full flex items-center justify-center mb-10"><i className="fas fa-file-invoice text-yellow-200 text-6xl"></i></div>
              <h3 className="text-xl font-bold text-yellow-300 uppercase Museum-Text">NASKAH KOSONG</h3>
            </div>
          )}
          {isLoading && <AssemblyLoader />}
          {result && (
            <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border-4 border-yellow-400 flex flex-col h-full animate-in zoom-in">
               <div className="p-6 bg-yellow-400 flex flex-wrap gap-4 justify-center no-print">
                  <button onClick={() => { navigator.clipboard.writeText(result); alert("Disalin!"); }} className={`px-6 py-3 text-xs font-bold rounded-xl bg-white text-blue-600 uppercase joyful-shadow`}><i className={`fas fa-copy mr-2`}></i> Salin Data</button>
                  <button onClick={handleDownloadDoc} className="px-6 py-3 text-xs font-bold bg-white text-blue-600 rounded-xl uppercase joyful-shadow"><i className="fas fa-file-word mr-2"></i> Word</button>
                  <button onClick={() => window.print()} className="px-6 py-3 text-xs font-bold bg-white text-blue-600 rounded-xl uppercase joyful-shadow"><i className="fas fa-print mr-2"></i> Cetak</button>
               </div>
               <div className="bg-slate-50 p-8 md:p-16 overflow-auto flex-grow">
                  <div ref={printAreaRef} className="bg-white shadow-xl mx-auto w-full p-[15mm] text-black rounded-sm min-h-[1000px] document-body printable-area">
                    {renderContent(result)}
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RakitAIPortal;