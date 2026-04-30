import React, { useState, useRef, useMemo, useEffect } from 'react';
import { TeacherSettings, Student, GradeEntry, Mission, InteractiveMaterial, MissionSubmission, KindnessSubmission, RedemptionItem } from '../types';
import TabKonfigurasi from './guru/TabKonfigurasi';
import TabMisi from './guru/TabMisi';
import TabMateri from './guru/TabMateri';
import TabPoin from './guru/TabPoin';
import TabData from './guru/TabData';

const PanelGuruPortal: React.FC<{ 
  isUnlocked: boolean, 
  settings: TeacherSettings, 
  setSettings: (s: TeacherSettings) => void, 
  students: Student[], 
  setStudents: (s: Student[]) => void, 
  grades: GradeEntry[], 
  setGrades: (g: GradeEntry[]) => void,
  missions: Mission[],
  setMissions: (m: Mission[]) => void,
  materials: InteractiveMaterial[],
  setMaterials: (m: InteractiveMaterial[]) => void,
  teacherLabs: InteractiveMaterial[],
  setTeacherLabs: (m: InteractiveMaterial[]) => void,
  submissions: MissionSubmission[],
  setSubmissions: (s: MissionSubmission[]) => void,
  onSyncRequest: () => Promise<void>,
  setShowStudentDetail: (id: string | null) => void,
  kindnessSubmissions?: KindnessSubmission[],
  setKindnessSubmissions?: (k: KindnessSubmission[]) => void,
  setGlobalBusy?: (b: boolean) => void,
  setBusyMessage?: (m: string | undefined) => void,
  myDeviceId: string,
  onSubTabUpdate?: (tabId: string) => void
}> = ({ 
  isUnlocked, 
  settings, 
  setSettings, 
  students, 
  setStudents, 
  grades, 
  setGrades, 
  missions, 
  setMissions, 
  materials, 
  setMaterials, 
  teacherLabs,
  setTeacherLabs,
  submissions, 
  setSubmissions, 
  onSyncRequest, 
  setShowStudentDetail, 
  kindnessSubmissions = [], 
  setKindnessSubmissions = (_: KindnessSubmission[]) => {},
  setGlobalBusy = (_b: boolean) => {},
  setBusyMessage = (_m: string | undefined) => {},
  myDeviceId,
  onSubTabUpdate
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'config' | 'students' | 'missions' | 'materials' | 'point_management'>('missions');
  const [activePointSubTab, setActivePointSubTab] = useState<'system' | 'monitoring' | 'redemptions'>('system');

  useEffect(() => {
    if (onSubTabUpdate) onSubTabUpdate(activeSubTab);
  }, [activeSubTab, onSubTabUpdate]);

  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPin, setNewStudentPin] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [adjustExp, setAdjustExp] = useState<number>(0);
  const [adjustCoin, setAdjustCoin] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('');
  
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [actionedIds, setActionedIds] = useState<Set<string>>(new Set());

  const missionFileRef = useRef<HTMLInputElement>(null);
  const materialFileRef = useRef<HTMLInputElement>(null);

  const [missionForm, setMissionForm] = useState<Partial<Mission>>({
    title: '',
    subject: settings.subjects[0] || 'IPAS',
    description: '',
    expReward: 50,
    coinReward: 20,
    deadline: new Date(Date.now() + 86400000).toISOString().split('T')[0]
  });

  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  const pendingSubmissions = useMemo(() => 
    submissions.filter(s => s.status === 'finished' && !actionedIds.has((s.id || '').toString().trim()))
  , [submissions, actionedIds]);

  const pendingKindness = useMemo(() => 
    kindnessSubmissions.filter(k => k.status === 'pending' && !actionedIds.has((k.id || '').toString().trim()))
  , [kindnessSubmissions, actionedIds]);

  const missionAlertCount = useMemo(() => {
    return pendingSubmissions.length + pendingKindness.length;
  }, [pendingSubmissions, pendingKindness]);

  const pointsAlertCount = useMemo(() => {
    return students.reduce((acc, s) => {
      const pendingRedeems = (s.redemptions || []).filter(r => 
        r.status === 'pending' && !actionedIds.has(r.id.toString().trim())
      ).length;
      return acc + pendingRedeems;
    }, 0);
  }, [students, actionedIds]);

  const saveToGas = async (action: string, payload: any) => {
    if (!settings.gasUrl) return false;
    if (setGlobalBusy) setGlobalBusy(true);
    if (setBusyMessage) setBusyMessage("Sinkronisasi Cloud...");
    try {
      await fetch(settings.gasUrl, { 
        method: 'POST', 
        mode: 'no-cors', 
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action, ...payload }) 
      });
      return true;
    } catch (e) { 
      console.error("Sync Error:", e);
      return false;
    } finally { 
      if (setGlobalBusy) setGlobalBusy(false);
      if (setBusyMessage) setBusyMessage(undefined);
    }
  };

  const handleManualSync = async () => {
    if (!settings.gasUrl || !settings.gasUrl.startsWith('https://script.google.com/')) {
      alert("Harap masukkan Link GAS yang valid terlebih dahulu!");
      return;
    }
    setSyncStatus('syncing');
    try {
      await onSyncRequest();
      setSyncStatus('success');
    } catch (e) {
      setSyncStatus('error');
      alert("Gagal memuat data. Periksa kembali Link GAS Anda.");
    } finally {
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const copyShareLink = () => {
    if (!settings.gasUrl) {
      alert("Masukkan Link GAS Anda terlebih dahulu!");
      return;
    }
    const userApiKey = localStorage.getItem('USER_API_KEY') || '';
    const baseUrl = window.location.origin + window.location.pathname;
    
    // We bundle GAS URL and API Key (if available)
    const gasEncoded = btoa(settings.gasUrl);
    const keyEncoded = userApiKey ? `&key=${btoa(userApiKey)}` : '';
    
    const shareLink = `${baseUrl}?gas=${gasEncoded}${keyEncoded}`;
    navigator.clipboard.writeText(shareLink);
    alert("LINK BERHASIL DISALIN!\n(Sudah termasuk Kunci AI jika Anda mengaturnya)");
  };

  const handleFileUpload = (type: 'mission' | 'material', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const fileName = file.name.replace('.html', '').replace(/_/g, ' ');

      if (type === 'mission') {
        const newMission: Mission = {
          id: Date.now().toString(),
          title: `Upload: ${fileName}`,
          subject: missionForm.subject || settings.subjects[0],
          description: "Misi hasil unggah file HTML mandiri.",
          expReward: missionForm.expReward || 50,
          coinReward: missionForm.coinReward || 20,
          deadline: missionForm.deadline || new Date(Date.now() + 86400000).toISOString().split('T')[0],
          isActive: true,
          gameCode: content
        };
        const updated = [newMission, ...missions];
        setMissions(updated);
        await saveToGas('updateMissions', { missions: updated });
      } else {
        // Default to student explorations for manual upload if needed
        const newMat: InteractiveMaterial = {
          id: Date.now().toString(),
          title: `Upload: ${fileName}`,
          subject: settings.subjects[0],
          description: "Materi hasil unggah file HTML mandiri.",
          contentCode: content,
          createdAt: new Date().toISOString(),
          isActive: true
        };
        const updated = [newMat, ...materials];
        setMaterials(updated);
        await saveToGas('updateMaterials', { materials: updated });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleAddMission = async () => {
    if (!missionForm.title || !missionForm.description) return;
    const newMission: Mission = {
      id: Date.now().toString(),
      title: missionForm.title!,
      subject: missionForm.subject!,
      description: missionForm.description!,
      expReward: Number(missionForm.expReward),
      coinReward: Number(missionForm.coinReward),
      deadline: missionForm.deadline!,
      isActive: true
    };
    const updated = [newMission, ...missions];
    setMissions(updated);
    setMissionForm({ ...missionForm, title: '', description: '' });
    await saveToGas('updateMissions', { missions: updated });
  };

  const handleDeleteMission = async (id: string) => {
    const mid = id.toString().trim();
    if(!confirm("Hapus misi ini secara permanen dari basis data? (Siswa yang belum mengerjakan tidak akan bisa melihat misi ini lagi)")) return;
    
    const updated = missions.filter(m => m.id.toString().trim() !== mid);
    setMissions(updated);
    await saveToGas('updateMissions', { missions: updated });
  };

  const handleBulkDeleteMissions = async (ids: string[]) => {
    if (!confirm(`Hapus ${ids.length} misi terpilih secara permanen?`)) return;
    const normalizedIds = ids.map(id => id.toString().trim());
    const updated = missions.filter(m => !normalizedIds.includes(m.id.toString().trim()));
    setMissions(updated);
    await saveToGas('updateMissions', { missions: updated });
    alert("Berhasil menghapus misi terpilih!");
  };

  const handleDeleteSubmission = async (id: string) => {
    if (!confirm("Hapus laporan tugas ini dari daftar validasi?")) return;
    const sid = id.toString().trim();
    const updated = submissions.filter(s => (s.id || (s as any).ID).toString().trim() !== sid);
    setSubmissions(updated);
    await saveToGas('updateSubmissions', { submissions: updated });
  };

  const handleBulkDeleteSubmissions = async (ids: string[]) => {
    if (!confirm(`Hapus ${ids.length} laporan tugas terpilih dari daftar validasi?`)) return;
    const normalizedIds = ids.map(id => id.toString().trim());
    const updated = submissions.filter(s => !normalizedIds.includes((s.id || (s as any).ID).toString().trim()));
    setSubmissions(updated);
    await saveToGas('updateSubmissions', { submissions: updated });
    alert("Laporan tugas terpilih berhasil dihapus!");
  };

  const handleConfirmSubmission = async (sub: MissionSubmission, score: number) => {
    if (score < 0 || score > 100) { alert("Nilai harus 0-100!"); return; }
    const missionId = (sub.missionId || (sub as any).MissionId).toString().trim();
    const mission = missions.find(m => m.id.toString().trim() === missionId);
    if (!mission) return;

    const multiplier = score / 100;
    const finalExp = Math.round(mission.expReward * multiplier);
    const finalCoins = Math.round(mission.coinReward * multiplier);
    const targetSubId = (sub.id || (sub as any).ID).toString().trim();
    const targetStudentId = (sub.studentId || (sub as any).StudentId).toString().trim();

    setActionedIds(prev => new Set(prev).add(targetSubId));

    const updatedSubs = submissions.map(s => {
        const sId = (s.id || (s as any).ID).toString().trim();
        if (sId === targetSubId) return { ...s, status: 'confirmed' as const, score: score };
        return s;
    });
    setSubmissions(updatedSubs);

    const newGrade: GradeEntry = { studentId: targetStudentId, subject: mission.subject, score: score, date: new Date().toISOString(), missionId: missionId };
    const updatedGrades = [...grades, newGrade];
    setGrades(updatedGrades);

    const updatedStudents = students.map(st => {
      const stId = (st.id || (st as any).ID).toString().trim();
      if (stId === targetStudentId) {
        const newExp = Number(st.exp || 0) + finalExp;
        return { ...st, exp: newExp, coins: Number(st.coins || 0) + finalCoins, level: Math.floor(newExp / 200) + 1 };
      }
      return st;
    });
    setStudents(updatedStudents);

    await saveToGas('updateSubmissions', { submissions: updatedSubs });
    await saveToGas('updateGrades', { grades: updatedGrades });
    await saveToGas('updateStudents', { students: updatedStudents });
    alert("Berhasil dikonfirmasi!");
  };

  const handleApproveKindness = async (k: KindnessSubmission) => {
    if(!confirm(`Setujui kebaikan dari ${k.studentName}?`)) return;
    const targetId = (k.id || (k as any).ID).toString().trim();
    
    setActionedIds(prev => new Set(prev).add(targetId));

    const updatedKindness = kindnessSubmissions.map(item => {
        const itemId = (item.id || (item as any).ID).toString().trim();
        if (itemId === targetId) return { ...item, status: 'approved' as const };
        return item;
    });
    setKindnessSubmissions(updatedKindness);

    const updatedStudents = students.map(st => {
        const stId = (st.id || (st as any).ID).toString().trim();
        if (stId === k.studentId.toString().trim()) {
            return { ...st, coins: (st.coins || 0) + 10, kindnessCount: (st.kindnessCount || 0) + 1 };
        }
        return st;
    });
    setStudents(updatedStudents);

    await saveToGas('updateKindness', { submissions: updatedKindness });
    await saveToGas('updateStudents', { students: updatedStudents });
    alert("Kebaikan disetujui!");
  };

  const handleBulkApproveKindness = async (ids: string[]) => {
    if (!confirm(`Setujui ${ids.length} laporan kebaikan sekaligus?`)) return;
    
    const updatedKindness = [...kindnessSubmissions];
    const updatedStudents = [...students];
    const newActioned = new Set(actionedIds);
    const normalizedTargetIds = ids.map(id => id.toString().trim());

    normalizedTargetIds.forEach(targetId => {
      newActioned.add(targetId);
      const kIndex = updatedKindness.findIndex(item => (item.id || (item as any).ID).toString().trim() === targetId);
      
      if (kIndex !== -1 && updatedKindness[kIndex].status === 'pending') {
        updatedKindness[kIndex] = { ...updatedKindness[kIndex], status: 'approved' as const };
        const studentId = updatedKindness[kIndex].studentId.toString().trim();
        const sIndex = updatedStudents.findIndex(st => (st.id || (st as any).ID).toString().trim() === studentId);
        
        if (sIndex !== -1) {
          updatedStudents[sIndex] = { 
            ...updatedStudents[sIndex], 
            coins: (updatedStudents[sIndex].coins || 0) + 10,
            kindnessCount: (updatedStudents[sIndex].kindnessCount || 0) + 1 
          };
        }
      }
    });

    setKindnessSubmissions(updatedKindness);
    setStudents(updatedStudents);
    setActionedIds(newActioned);

    await saveToGas('updateKindness', { submissions: updatedKindness });
    await saveToGas('updateStudents', { students: updatedStudents });
    alert(`Berhasil menyetujui ${ids.length} kebaikan!`);
  };

  const handleRejectKindness = async (k: KindnessSubmission) => {
    if(!confirm("Tolak laporan ini?")) return;
    const targetId = (k.id || (k as any).ID).toString().trim();
    setActionedIds(prev => new Set(prev).add(targetId));
    const updatedKindness = kindnessSubmissions.map(item => {
        const itemId = (item.id || (item as any).ID).toString().trim();
        if (itemId === targetId) return { ...item, status: 'rejected' as const };
        return item;
    });
    setKindnessSubmissions(updatedKindness);
    await saveToGas('updateKindness', { submissions: updatedKindness });
  };

  const handleAddStudent = async () => {
    if (!newStudentName.trim() || !newStudentPin.trim()) return;
    const newStudent: Student = { id: Date.now().toString(), name: newStudentName.trim(), pin: newStudentPin.trim(), coins: 10, exp: 0, level: 1 };
    const updated = [...students, newStudent];
    setStudents(updated);
    setNewStudentName(''); setNewStudentPin('');
    await saveToGas('addStudent', { student: newStudent });
  };

  const handleApplyPoints = async () => {
    if (selectedStudentIds.length === 0) return;
    
    let updatedStudents = [...students];
    let updatedGrades = [...grades];
    
    selectedStudentIds.forEach(sid => {
        const targetSid = sid.toString().trim();
        const studentIndex = updatedStudents.findIndex(s => s.id.toString().trim() === targetSid);
        if (studentIndex !== -1) {
            const st = updatedStudents[studentIndex];
            const newExp = (st.exp || 0) + adjustExp;
            const newCoins = (st.coins || 0) + adjustCoin;
            updatedStudents[studentIndex] = {
                ...st,
                exp: newExp,
                coins: newCoins,
                level: Math.floor(newExp / 200) + 1
            };
            
            if (adjustExp !== 0 || adjustCoin !== 0) {
                updatedGrades.push({
                    studentId: targetSid,
                    subject: 'MANUAL REWARD',
                    score: 100,
                    date: new Date().toISOString(),
                    missionId: 'manual',
                    reason: adjustReason || 'Penyesuaian oleh Guru',
                    expChange: adjustExp,
                    coinChange: adjustCoin
                });
            }
        }
    });

    setStudents(updatedStudents);
    setGrades(updatedGrades);
    setSelectedStudentIds([]);
    setAdjustExp(0);
    setAdjustCoin(0);
    setAdjustReason('');

    await saveToGas('updateStudents', { students: updatedStudents });
    await saveToGas('updateGrades', { grades: updatedGrades });
    alert("Poin berhasil diperbarui!");
  };

  const handleProcessRedemption = async (studentId: string, redemptionId: string) => {
    if (!confirm("Konfirmasi bahwa hadiah fisik sudah diberikan kepada siswa?")) return;
    
    const sid = studentId.toString().trim();
    const rid = redemptionId.toString().trim();
    
    setActionedIds(prev => new Set(prev).add(rid));

    const updatedStudents = students.map(s => {
        if (s.id.toString().trim() === sid) {
            const redemptions = (s.redemptions || []).map(r => 
                r.id.toString().trim() === rid ? { ...r, status: 'used' as const } : r
            );
            
            let profileData = s.profileData;
            try {
                if (profileData) {
                    const pData = JSON.parse(profileData);
                    pData.redemptions = redemptions;
                    profileData = JSON.stringify(pData);
                }
            } catch (e) {}

            return { ...s, redemptions, profileData };
        }
        return s;
    });

    setStudents(updatedStudents);
    await saveToGas('updateStudents', { students: updatedStudents });
    alert("Penukaran berhasil diproses!");
  };

  const handleClearUsedRedemptions = async () => {
    if (!confirm("Hapus semua riwayat penukaran yang sudah selesai?")) return;
    
    const updatedStudents = students.map(s => {
        const redemptions = (s.redemptions || []).filter(r => r.status === 'pending');
        let profileData = s.profileData;
        try {
            if (profileData) {
                const pData = JSON.parse(profileData);
                pData.redemptions = redemptions;
                profileData = JSON.stringify(pData);
            }
        } catch (e) {}
        return { ...s, redemptions, profileData };
    });

    setStudents(updatedStudents);
    await saveToGas('updateStudents', { students: updatedStudents });
    alert("Histori dibersihkan!");
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex justify-center flex-wrap gap-2 md:gap-3 no-print">
        {[
          { id: 'missions', label: 'Manajemen Misi', icon: 'fa-tasks', alert: missionAlertCount },
          { id: 'materials', label: 'Manajemen Materi', icon: 'fa-flask' },
          { id: 'point_management', label: 'Manajemen Poin', icon: 'fa-coins', alert: pointsAlertCount },
          { id: 'students', label: 'Manajemen Data', icon: 'fa-database' },
          { id: 'config', label: 'Konfigurasi', icon: 'fa-cog' }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative flex items-center gap-3 ${activeSubTab === tab.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'bg-white text-slate-400 hover:text-blue-600 shadow-sm border border-slate-100'}`}
          >
            <i className={`fas ${tab.icon}`}></i>
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.alert !== undefined && tab.alert > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-white animate-bounce">
                {tab.alert}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {activeSubTab === 'config' && (
          <TabKonfigurasi 
            settings={settings} 
            setSettings={setSettings} 
            isUnlocked={isUnlocked} 
            setShowActivationModal={setShowActivationModal} 
            copyShareLink={copyShareLink} 
            handleManualSync={handleManualSync} 
            saveToGas={saveToGas}
            myDeviceId={myDeviceId}
          />
        )}
        {activeSubTab === 'missions' && (
          <TabMisi 
            missions={missions} 
            submissions={submissions} 
            kindnessSubmissions={kindnessSubmissions}
            settings={settings}
            missionForm={missionForm}
            setMissionForm={setMissionForm}
            handleAddMission={handleAddMission}
            handleFileUpload={handleFileUpload}
            missionFileRef={missionFileRef}
            handleManualSync={handleManualSync}
            syncStatus={syncStatus}
            handleDeleteMission={handleDeleteMission}
            handleBulkDeleteMissions={handleBulkDeleteMissions}
            handleDeleteSubmission={handleDeleteSubmission}
            handleBulkDeleteSubmissions={handleBulkDeleteSubmissions}
            handleConfirmSubmission={handleConfirmSubmission}
            handleApproveKindness={handleApproveKindness}
            handleBulkApproveKindness={handleBulkApproveKindness}
            handleRejectKindness={handleRejectKindness}
          />
        )}
        {activeSubTab === 'materials' && (
          <TabMateri 
            materials={materials} 
            setMaterials={setMaterials} 
            teacherLabs={teacherLabs}
            setTeacherLabs={setTeacherLabs}
            handleFileUpload={handleFileUpload} 
            materialFileRef={materialFileRef} 
            handleManualSync={handleManualSync} 
            syncStatus={syncStatus} 
            saveToGas={saveToGas}
          />
        )}
        {activeSubTab === 'point_management' && (
          <TabPoin 
            activePointSubTab={activePointSubTab}
            setActivePointSubTab={setActivePointSubTab}
            students={students}
            grades={grades}
            selectedStudentIds={selectedStudentIds}
            setSelectedStudentIds={setSelectedStudentIds}
            adjustExp={adjustExp}
            setAdjustExp={setAdjustExp}
            adjustCoin={adjustCoin}
            setAdjustCoin={setAdjustCoin}
            adjustReason={adjustReason}
            setAdjustReason={setAdjustReason}
            handleApplyPoints={handleApplyPoints}
            handleProcessRedemption={handleProcessRedemption}
            handleClearUsedRedemptions={handleClearUsedRedemptions}
            setShowStudentDetail={setShowStudentDetail}
          />
        )}
        {activeSubTab === 'students' && (
          <TabData 
            students={students} 
            setStudents={setStudents} 
            settings={settings} 
            setSettings={setSettings}
            newStudentName={newStudentName}
            setNewStudentName={setNewStudentName}
            newStudentPin={newStudentPin}
            setNewStudentPin={setNewStudentPin}
            newSubjectName={newSubjectName}
            setNewSubjectName={setNewSubjectName}
            handleAddStudent={handleAddStudent}
            saveToGas={saveToGas}
          />
        )}
      </div>

      {showActivationModal && (
        <div className="fixed inset-0 z-[10000] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6">
           <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl text-center border-b-8 border-amber-400">
              <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6"><i className="fas fa-crown"></i></div>
              <h3 className="text-2xl font-black Museum-Text uppercase text-slate-800 mb-2">Aktivasi Guru PRO</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed mb-8">Hubungi Admin Mentari untuk mengaktifkan lisensi perangkat Anda dan membuka akses fitur premium tanpa batas.</p>
              <div className="space-y-3">
                <button onClick={() => window.open(`https://wa.me/6285755332389?text=Halo%20Admin%20Mentari,%20saya%20ingin%20aktivasi%20LISENSI%20GURU%20PRO%20untuk%20Device%20ID:%20${myDeviceId}`, '_blank')} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-100 active:scale-95 transition-all flex items-center justify-center gap-3">
                   <i className="fab fa-whatsapp text-lg"></i> HUBUNGI VIA WHATSAPP
                </button>
                <button onClick={() => setShowActivationModal(false)} className="w-full py-3 text-slate-400 font-black uppercase text-[9px] tracking-widest">Tutup</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PanelGuruPortal;