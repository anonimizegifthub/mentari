import { RegisteredUser, Student, GradeEntry, TeacherSettings, StudentProfile, Mission, MissionSubmission, InteractiveMaterial, RedemptionItem, KindnessSubmission, Toast as ToastType } from './types';
import { getDailyInspiration, getWordOfDay } from './services/studentAiService';
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { SHOP_ITEMS, AVATARS, getBrowserFingerprint } from './constants';
import { KindnessBottle, BlockingOverlay, ToastContainer } from './components/SharedUI';
import { getProfileStyles } from './utils/styleUtils';
import { sanitizeGeneratedCode } from './utils/codeUtils';

// Import Portals
import PetualanganPortal from './components/PetualanganPortal';
import LabMayaPortal from './components/LabMayaPortal';
import RakitGimPortal from './components/RakitGimPortal';
import NarasiAIPortal from './components/NarasiAIPortal';
import RakitAIPortal from './components/RakitAIPortal';
import PanelGuruPortal from './components/PanelGuruPortal';
import LoginPortal from './components/LoginPortal';
import HistoryAktifitasPortal from './components/HistoryAktifitasPortal';
import GuruToolboxPortal from './components/GuruToolboxPortal';
import MediaKreatifPortal from './components/MediaKreatifPortal';
import EngagementPortal from './components/EngagementPortal';
import CommunicationPortal from './components/CommunicationPortal';

// Import Dashboard Components
import AnnouncementBanner from './components/AnnouncementBanner';
import TeacherActionCards from './components/TeacherActionCards';
import StudentHeroCard from './components/StudentHeroCard';
import DailyInsights from './components/DailyInsights';
import RankingSection from './components/RankingSection';
import StudentShop from './components/StudentShop';
import MaterialGrid from './components/MaterialGrid';
import MissionGrid from './components/MissionGrid';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import StudentAnalytics from './components/StudentAnalytics';

// Import Modal & Overlay Components
import InventoryModal from './components/InventoryModal';
import MissionDetailModal from './components/MissionDetailModal';
import StudentRankingDetailModal from './components/StudentRankingDetailModal';
import FullTutorialOverlay from './components/FullTutorialOverlay';
import GameResultOverlay from './components/GameResultOverlay';
import AppHeader from './components/AppHeader';

// Import Admin Panel (Hidden)
import AdminPanel from './components/AdminPanel';

const DEVELOPER_GLOBAL_GAS_URL: string = "https://script.google.com/macros/s/AKfycbwXepHxYva43P4jHMFc4_Cze-YmO5c-Kb2UX2EdiJUaNfQWVxb-vrvBHc4gIqvoe7r5/exec"; 
const HEADER_LOGO_URL = "https://i.ibb.co.com/fz5db4TZ/Gemini_Generated_Image_hjaq8uhjaq8uhjaq.png";

const parseBool = (val: any): boolean => {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    const s = val.toLowerCase().trim();
    return s === 'true' || s === '1' || s === 'yes' || s === 'aktif';
  }
  if (typeof val === 'number') return val === 1;
  return false;
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'beranda' | 'petualangan' | 'history' | 'ecosystem' | 'generator' | 'peralatan' | 'media' | 'gamifikasi' | 'komunikasi' | 'buatgim' | 'labmaya' | 'panelguru'>('beranda');
  const [activeSubTab, setActiveSubTab] = useState<string>('missions');
  const [isVerifying, setIsVerifying] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
  const [userRole, setUserRole] = useState<'student' | 'teacher' | null>(() => localStorage.getItem('userRole') as any || null);
  const [myDeviceId] = useState(getBrowserFingerprint());
  
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [showFullTutorial, setShowFullTutorial] = useState(false);
  const [toasts, setToasts] = useState<ToastType[]>([]);
  
  // Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth > 1024);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 2000);
  }, [removeToast]);

  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState(DEVELOPER_GLOBAL_GAS_URL);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [headerIsVisible, setHeaderIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  
  const [isGlobalBusy, setGlobalBusy] = useState(false);
  const [busyMessage, setBusyMessage] = useState<string | undefined>(undefined);

  const [dailyFact, setDailyFact] = useState<any>({ category: "Wawasan", title: "Memuat...", content: "Harap tunggu sebentar..." });

  const [activeGameMission, setActiveGameMission] = useState<Mission | null>(null);
  const [viewMission, setViewMission] = useState<Mission | null>(null); 
  const [activeLabMaterial, setActiveLabMaterial] = useState<InteractiveMaterial | null>(null);
  
  // Instance keys to fix reopening bug
  const [labInstanceKey, setLabInstanceKey] = useState<number>(0);
  const [gameInstanceKey, setGameInstanceKey] = useState<number>(0);

  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const materialContainerRef = useRef<HTMLDivElement>(null);

  const [shopCategory, setShopCategory] = useState<string>('all');
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [activeEditTab, setActiveEditTab] = useState<'identity' | 'avatar' | 'collection'>('identity');

  const [rankingSubject, setRankingSubject] = useState<string>(''); 
  const [selectedRankingStudent, setSelectedRankingStudent] = useState<string | null>(null);

  const [studentProfile, setStudentProfile] = useState<StudentProfile>(() => {
    try {
        const loggedId = localStorage.getItem('loggedStudentId');
        const defaults: StudentProfile = { 
          name: '', hobby: '', animal: '', avatar: 'av1', 
          coins: 10, exp: 0, level: 1, dailyTasks: [], 
          lastResetDate: new Date().toISOString().split('T')[0],
          aiWorks: [],
          kindnessCount: 0,
          completedAdventureIds: [],
          purchasedItems: [],
          viewedMaterialIds: [], 
          redemptions: []
        };
        if (loggedId) {
            const saved = localStorage.getItem(`student_profile_${loggedId}`);
            if (saved) return { ...defaults, ...JSON.parse(saved) };
        }
        return defaults;
    } catch (e) { return { name: '', hobby: '', animal: '', avatar: 'av1', coins: 10, exp: 0, level: 1, dailyTasks: [], lastResetDate: new Date().toISOString().split('T')[0], aiWorks: [], kindnessCount: 0, completedAdventureIds: [], purchasedItems: [], viewedMaterialIds: [], redemptions: [] }; }
  });

  const [teacherSettings, setTeacherSettings] = useState<TeacherSettings>(() => {
    try {
        const saved = localStorage.getItem('teacher_settings');
        const defaults = { gasUrl: '', teacherName: '', schoolName: '', className: '', schoolCode: '', password: 'guru123', announcement: '', isAnnouncementActive: false, subjects: ['IPAS', 'Bahasa Indonesia', 'Matematika', 'Pendidikan Pancasila', 'Bahasa Inggris'], passingGrade: 70, aiModel: 'gemini-3-flash-preview' };
        if (!saved) return defaults;
        const parsed = JSON.parse(saved);
        return { ...defaults, ...parsed };
    } catch (e) { return { gasUrl: '', teacherName: '', schoolName: '', className: '', schoolCode: '', password: 'guru123', announcement: '', isAnnouncementActive: false, subjects: ['IPAS', 'Bahasa Indonesia', 'Matematika', 'Pendidikan Pancasila', 'Bahasa Inggris'], passingGrade: 70, aiModel: 'gemini-3-flash-preview' }; }
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
        const saved = localStorage.getItem('teacher_students');
        const parsed = saved ? JSON.parse(saved) : [];
        if (Array.isArray(parsed)) {
            return parsed.map((s: any) => ({ ...s, name: s.name || s.Name || s.nama || 'Siswa Tanpa Nama', id: (s.id || s.ID || s.Id || Date.now().toString()).toString() }));
        }
        return [];
    } catch (e) { return []; }
  });
  
  const [grades, setGrades] = useState<GradeEntry[]>(() => {
    try {
        const saved = localStorage.getItem('teacher_grades');
        const parsed = saved ? JSON.parse(saved) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  });
  
  const [missions, setMissions] = useState<Mission[]>(() => {
    try {
        const saved = localStorage.getItem('teacher_missions');
        const parsed = saved ? JSON.parse(saved) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  });
  
  const [materials, setMaterials] = useState<InteractiveMaterial[]>(() => {
    try {
        const saved = localStorage.getItem('teacher_materials');
        const parsed = saved ? JSON.parse(saved) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  });

  const [teacherLabs, setTeacherLabs] = useState<InteractiveMaterial[]>(() => {
    try {
        const saved = localStorage.getItem('teacher_labs');
        const parsed = saved ? JSON.parse(saved) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  });
  
  const [submissions, setSubmissions] = useState<MissionSubmission[]>(() => {
    try {
        const saved = localStorage.getItem('teacher_submissions');
        const parsed = saved ? JSON.parse(saved) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  });

  const [kindnessSubmissions, setKindnessSubmissions] = useState<KindnessSubmission[]>(() => {
    try {
        const saved = localStorage.getItem('teacher_kindness');
        const parsed = saved ? JSON.parse(saved) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  });

  const [showStudentDetail, setShowStudentDetail] = useState<string | null>(null);

  const currentUser = useMemo(() => {
    if(!Array.isArray(registeredUsers)) return undefined;
    return registeredUsers.find(u => u.deviceId === myDeviceId);
  }, [registeredUsers, myDeviceId]);
  
  const isUnlocked = useMemo(() => !!currentUser && (new Date(currentUser.expiredAt) > new Date()), [currentUser]);

  const licenseInfo = useMemo(() => {
    if (!currentUser) return { daysLeft: 0, isNearExpiry: false };
    const expiryDate = new Date(currentUser.expiredAt);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { daysLeft, isNearExpiry: daysLeft > 0 && daysLeft <= 7 };
  }, [currentUser]);

  const [headerSequence, setHeaderSequence] = useState<'glitch' | 'cyber-exit' | 'data-stream' | 'wait'>('wait');
  const [cycleIndex, setCycleIndex] = useState(0);
  const [pendingGameResult, setPendingGameResult] = useState<{ score: number, mission: Mission } | null>(null);

  useEffect(() => {
    if (!isUnlocked || activeTab === 'beranda') {
        setHeaderSequence('wait');
        return;
    }
    
    setHeaderSequence('glitch');
    const t1 = setTimeout(() => setHeaderSequence('cyber-exit'), 1400);
    const t2 = setTimeout(() => setHeaderSequence('data-stream'), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [activeTab, isUnlocked]); 

  useEffect(() => {
    if (isUnlocked && isLoggedIn && activeTab === 'beranda') {
      const timer = setInterval(() => {
        setCycleIndex(prev => (prev + 1) % 3);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [isUnlocked, isLoggedIn, activeTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.altKey && (e.key === 'd' || e.key === 'D' || e.code === 'KeyD')) {
            e.preventDefault(); e.stopPropagation(); setIsAdminOpen(prev => !prev);
        }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  const fetchRegistry = async () => {
    if (!spreadsheetUrl) return;
    try {
        const urlObj = new URL(spreadsheetUrl);
        urlObj.searchParams.set('action', 'getUsers');
        urlObj.searchParams.set('_t', Date.now().toString());
        const res = await fetch(urlObj.toString());
        if (res.ok) {
           const data = await res.json();
           if (Array.isArray(data)) setRegisteredUsers(data);
        }
    } catch (e) { console.warn("Registry fetch failed."); }
  };

  const syncTeacherData = async (overrideUrl?: string, showOverlay: boolean = false) => {
    const targetGas = overrideUrl || teacherSettings.gasUrl;
    if (!targetGas) return;
    setIsSyncing(true);
    if (showOverlay) { setGlobalBusy(true); setBusyMessage("Sinkronisasi Data Kelas..."); }
    try {
      const url = new URL(targetGas);
      url.searchParams.set('action', 'getData');
      url.searchParams.set('_t', Date.now().toString()); 
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
            const raw = data.settings;
            let safeSubjects = ['IPAS', 'Bahasa Indonesia', 'Matematika', 'Pendidikan Pancasila', 'Bahasa Inggris'];
            if (Array.isArray(raw.subjects || raw.Subjects)) { safeSubjects = raw.subjects || raw.Subjects; }
            const updatedSettings = { 
              ...teacherSettings, 
              gasUrl: targetGas, 
              teacherName: raw.teacherName || raw.TeacherName || '', 
              schoolName: raw.schoolName || raw.SchoolName || '', 
              className: raw.className || raw.ClassName || '', 
              password: raw.password || raw.Password || 'guru123', 
              announcement: raw.announcement || raw.Announcement || '', 
              isAnnouncementActive: raw.isAnnouncementActive !== undefined ? parseBool(raw.isAnnouncementActive) : (raw.IsAnnouncementActive !== undefined ? parseBool(raw.IsAnnouncementActive) : false), 
              subjects: safeSubjects,
              passingGrade: Number(raw.passingGrade || raw.PassingGrade || 70),
              aiModel: raw.aiModel || raw.AiModel || 'gemini-3-flash-preview'
            };
            setTeacherSettings(updatedSettings);
            localStorage.setItem('teacher_settings', JSON.stringify(updatedSettings));
        }
        if (Array.isArray(data.students)) { 
            const cleanStudents = data.students.map((s: any) => {
                const profileDataStr = s.profileData || s.ProfileData || '';
                let redemptions = []; let purchasedItems = [];
                try { if (profileDataStr) { const pData = JSON.parse(profileDataStr); if (Array.isArray(pData.redemptions)) redemptions = pData.redemptions; if (Array.isArray(pData.purchasedItems)) purchasedItems = pData.purchasedItems; } } catch(e) {}
                return { name: s.name || s.Name || s.nama || 'Siswa', id: (s.id || s.ID || s.Id || Date.now().toString()).toString().trim(), pin: (s.pin || s.Pin || '').toString().trim(), coins: Number(s.coins || s.Coins || 0), exp: Number(s.exp || s.Exp || 0), level: Number(s.level || s.Level || 1), kindnessCount: Number(s.kindnessCount || s.KindnessCount || 0), redemptions: redemptions, purchasedItems: purchasedItems, profileData: profileDataStr };
            });
            setStudents(cleanStudents); localStorage.setItem('teacher_students', JSON.stringify(cleanStudents)); 
        }
        if (Array.isArray(data.grades)) { const cleanGrades = data.grades.map((g: any) => ({ studentId: (g.studentId || (g as any).StudentId || '').toString().trim(), subject: (g.subject || (g as any).Subject || '').toString().trim().toLowerCase(), score: Number(g.score || (g as any).Score || 0), date: g.date || g.Date || new Date().toISOString(), missionId: (g.missionId || g.MissionId || '').toString().trim(), reason: g.reason || undefined, expChange: g.expChange !== undefined ? Number(g.expChange) : undefined, coinChange: g.coinChange !== undefined ? Number(g.coinChange) : undefined })); setGrades(cleanGrades); localStorage.setItem('teacher_grades', JSON.stringify(cleanGrades)); }
        if (Array.isArray(data.missions)) { 
            const existingMissions = JSON.parse(localStorage.getItem('teacher_missions') || '[]');
            const cleanMissions = data.missions.map((m: any) => {
                const mid = (m.id || m.Id || m.ID || '').toString().trim();
                const existing = existingMissions.find((em: any) => em.id.toString().trim() === mid);
                let gCode = m.gameCode || m.GameCode || '';
                if (!gCode && existing && existing.gameCode) gCode = existing.gameCode;
                
                return { 
                    id: mid, 
                    title: m.title || m.Title || 'Tanpa Judul', 
                    subject: m.subject || m.Subject || '', 
                    description: m.description || m.Description || '', 
                    expReward: Number(m.expReward || m.ExpReward || 0), 
                    coinReward: Number(m.coinReward || m.CoinReward || 20), 
                    deadline: m.deadline || m.Deadline || '', 
                    isActive: m.isActive !== undefined ? parseBool(m.isActive) : true, 
                    gameCode: gCode, 
                    minScore: Number(m.minScore || m.MinScore || 70), 
                    isExamMode: m.isExamMode !== undefined ? parseBool(m.isExamMode) : false 
                };
            }); 
            setMissions(cleanMissions); 
            localStorage.setItem('teacher_missions', JSON.stringify(cleanMissions)); 
        }
        if (Array.isArray(data.materials)) { const cleanMaterials = data.materials.map((m: any) => ({ id: (m.id || m.Id || '').toString().trim(), title: m.title || m.Title || '', subject: m.subject || m.Subject || '', description: m.description || m.Description || '', contentCode: m.contentCode || m.ContentCode || '', createdAt: m.createdAt || m.CreatedAt || new Date().toISOString(), isActive: true })); setMaterials(cleanMaterials); localStorage.setItem('teacher_materials', JSON.stringify(cleanMaterials)); }

        // Fetch Teacher Labs if supported by GAS, otherwise rely on local
        if (Array.isArray(data.teacherLabs)) {
            const cleanLabs = data.teacherLabs.map((m: any) => ({ id: (m.id || m.Id || '').toString().trim(), title: m.title || m.Title || '', subject: m.subject || m.Subject || '', description: m.description || "Simulasi Lab Maya untuk Guru.", contentCode: m.contentCode || m.ContentCode || '', createdAt: m.createdAt || m.CreatedAt || new Date().toISOString(), isActive: true }));
            setTeacherLabs(cleanLabs); localStorage.setItem('teacher_labs', JSON.stringify(cleanLabs));
        }

        if (Array.isArray(data.submissions)) { const cleanSubmissions = data.submissions.map((s: any) => ({ id: (s.id || s.Id || '').toString().trim(), missionId: (s.missionId || s.MissionId || '').toString().trim(), studentId: (s.studentId || s.StudentId || '').toString().trim(), studentName: s.studentName || s.StudentName || 'Siswa', status: (s.status || s.Status || 'pending').toString().toLowerCase(), score: s.score !== undefined ? Number(s.score) : undefined, submittedAt: s.submittedAt || s.SubmittedAt || new Date().toISOString() })); setSubmissions(cleanSubmissions); localStorage.setItem('teacher_submissions', JSON.stringify(cleanSubmissions)); }
        
        if (Array.isArray(data.kindnessSubmissions)) { 
            const serverKindness = data.kindnessSubmissions.map((k: any) => ({ id: (k.id || k.Id || '').toString().trim(), studentId: (k.studentId || k.StudentId || '').toString().trim(), studentName: k.studentName || k.StudentName || '', description: k.description || k.Description || '', date: k.date || k.Date || '', status: (k.status || k.Status || 'pending').toString().toLowerCase() }));
            
            // SMART MERGE: Pertahankan data 'pending' lokal yang belum masuk ke server (Anti-Refresh vanishing)
            const localOnlyPending = kindnessSubmissions.filter(lk => lk.status === 'pending' && !serverKindness.some((sk: any) => sk.id === lk.id));
            const mergedKindness = [...serverKindness, ...localOnlyPending];
            
            setKindnessSubmissions(mergedKindness); 
            localStorage.setItem('teacher_kindness', JSON.stringify(mergedKindness)); 
        }

        setLastSyncTime(new Date().toLocaleTimeString());
        if (showOverlay) addToast("Data sinkronisasi berhasil!", "success");
      }
    } catch (e) { if (showOverlay) addToast("Sinkronisasi gagal. Cek koneksi.", "error"); }
    finally { setIsSyncing(false); if (showOverlay) { setGlobalBusy(false); setBusyMessage(undefined); } }
  };

  const handleUpdateStudentProfile = async (newProfile: StudentProfile) => {
    setStudentProfile(newProfile);
    if (newProfile.id) { localStorage.setItem(`student_profile_${newProfile.id}`, JSON.stringify(newProfile)); }
    if (teacherSettings.gasUrl && isLoggedIn && userRole === 'student') {
      try {
        const profileDataString = JSON.stringify(newProfile);
        await fetch(teacherSettings.gasUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ action: 'syncStudentProfile', id: newProfile.id, profile: newProfile, profileData: profileDataString, studentName: newProfile.name, timestamp: new Date().toISOString() }) });
        setLastSyncTime(new Date().toLocaleTimeString());
      } catch (e) { console.warn("Sync cloud gagal."); }
    }
  };

  const handleKindnessSubmit = async (text: string) => {
    if (!studentProfile.id || !studentProfile.name) { addToast("Profil tidak valid.", "error"); return; }
    const today = new Date().toISOString().split('T')[0];
    const sid = studentProfile.id.toString().trim();
    
    const countToday = kindnessSubmissions.filter(k => k.studentId.toString().trim() === sid && k.date === today).length;
    if (countToday >= 2) { addToast("Limit harian tercapai. Ayo kembali besok!", "warning"); return; }
    
    const hasAnyPending = kindnessSubmissions.some(k => k.studentId.toString().trim() === sid && k.status === 'pending');
    if (hasAnyPending) { addToast("Laporan sebelumnya sedang divalidasi guru.", "warning"); return; }

    setGlobalBusy(true); setBusyMessage("Mengirim Kebaikan Anda...");
    const newSubmission: KindnessSubmission = { id: Date.now().toString(), studentId: sid, studentName: studentProfile.name, description: text, date: today, status: 'pending' };
    
    const updatedSubmissions = [...kindnessSubmissions, newSubmission];
    setKindnessSubmissions(updatedSubmissions);
    localStorage.setItem('teacher_kindness', JSON.stringify(updatedSubmissions));
    
    if (teacherSettings.gasUrl) {
      try { 
        await fetch(teacherSettings.gasUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ action: 'submitKindness', submission: newSubmission }) }); 
        addToast("Kebaikanmu terkirim ke Guru!", "success"); 
      } catch (e) { 
        addToast("Tersimpan lokal (Gagal Cloud).", "info"); 
      }
    }
    setGlobalBusy(false); setBusyMessage(undefined);
  };

  const handleClaimKindnessReward = async () => {
    if (!studentProfile.id) return;
    setGlobalBusy(true); setBusyMessage("Mengklaim Hadiah Botol Kebaikan...");
    const bonusExp = 500; const bonusCoin = 500;
    const newTotalExp = (studentProfile.exp || 0) + bonusExp;
    const newLevel = Math.floor(newTotalExp / 200) + 1;
    const newProfile: StudentProfile = { ...studentProfile, exp: newTotalExp, coins: (studentProfile.coins || 0) + bonusCoin, level: newLevel, kindnessCount: 0 };
    const newGrade: GradeEntry = { studentId: studentProfile.id.toString(), subject: 'HADIAH BOTOL KEBAIKAN', score: 100, date: new Date().toISOString(), missionId: 'manual', reason: 'Selamat! Botol Kebaikanmu Penuh!', expChange: bonusExp, coinChange: bonusCoin };
    const updatedGrades = [...grades, newGrade]; setGrades(updatedGrades); localStorage.setItem('teacher_grades', JSON.stringify(updatedGrades));
    await handleUpdateStudentProfile(newProfile);
    const updatedStudents = students.map(s => s.id.toString().trim() === studentProfile.id!.toString().trim() ? { ...s, exp: newTotalExp, coins: (s.coins || 0) + bonusCoin, level: newLevel, kindnessCount: 0 } : s);
    setStudents(updatedStudents); localStorage.setItem('teacher_students', JSON.stringify(updatedStudents));
    if (teacherSettings.gasUrl) {
        try { await fetch(teacherSettings.gasUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ action: 'updateStudents', students: updatedStudents }) }); await fetch(teacherSettings.gasUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ action: 'updateGrades', grades: updatedGrades }) }); addToast("Hadiah 500 EXP & 500 KOIN Diklaim!", "success"); } catch (e) { addToast("Berhasil diklaim secara lokal.", "warning"); }
    }
    setGlobalBusy(false); setBusyMessage(undefined);
  };

  useEffect(() => {
    if (isLoggedIn && userRole === 'student' && studentProfile.id) {
        const updatedStudentData = students.find(s => s.id.toString().trim() === studentProfile.id!.toString().trim());
        if (updatedStudentData) {
            setStudentProfile(prev => {
                let hasChanges = false;
                const newProfile = { ...prev };
                if (prev.coins !== (updatedStudentData.coins || 0)) { newProfile.coins = updatedStudentData.coins || 0; hasChanges = true; }
                if (prev.exp !== (updatedStudentData.exp || 0)) { newProfile.exp = updatedStudentData.exp || 0; hasChanges = true; }
                if (prev.level !== (updatedStudentData.level || 1)) { newProfile.level = updatedStudentData.level || 1; hasChanges = true; }
                if (prev.kindnessCount !== (updatedStudentData.kindnessCount || 0)) { newProfile.kindnessCount = updatedStudentData.kindnessCount || 0; hasChanges = true; }
                const serverRedemptions = updatedStudentData.redemptions || [];
                if (JSON.stringify(prev.redemptions) !== JSON.stringify(serverRedemptions)) { newProfile.redemptions = serverRedemptions; hasChanges = true; }
                const serverItems = updatedStudentData.purchasedItems || [];
                if (serverItems.length > 0 && JSON.stringify(prev.purchasedItems) !== JSON.stringify(serverItems)) { const mergedItems = Array.from(new Set([...(prev.purchasedItems || []), ...serverItems])); if (mergedItems.length !== (prev.purchasedItems || []).length) { newProfile.purchasedItems = mergedItems; hasChanges = true; } }
                if (updatedStudentData.profileData) { try { const sData = JSON.parse(updatedStudentData.profileData); if (sData.activeBackground) { newProfile.activeBackground = sData.activeBackground; hasChanges = true; } if (sData.activeBorder) { newProfile.activeBorder = sData.activeBorder; hasChanges = true; } if (sData.activeFont) { newProfile.activeFont = sData.activeFont; hasChanges = true; } if (sData.activeEffect) { newProfile.activeEffect = sData.activeEffect; hasChanges = true; } if (sData.activeTitle) { newProfile.activeTitle = sData.activeTitle; hasChanges = true; } if (sData.avatar) { newProfile.avatar = sData.avatar; hasChanges = true; } if (Array.isArray(sData.viewedMaterialIds)) { newProfile.viewedMaterialIds = sData.viewedMaterialIds; hasChanges = true; } } catch(e) {} }
                if (hasChanges) { localStorage.setItem(`student_profile_${newProfile.id}`, JSON.stringify(newProfile)); return newProfile; }
                return prev;
            });
        }
    }
  }, [students, isLoggedIn, userRole]); 

  const handleAddMission = async (m: Partial<Mission>) => {
    const newMission: Mission = { id: Date.now().toString(), title: m.title!, subject: m.subject!, description: m.description!, expReward: m.expReward || 50, coinReward: m.coinReward || 20, deadline: m.deadline || new Date(Date.now() + 86400000).toISOString().split('T')[0], gameCode: m.gameCode, minScore: m.minScore || 70, isActive: true, isExamMode: m.isExamMode || false };
    if (teacherSettings.gasUrl) { setGlobalBusy(true); setBusyMessage("Mempublikasikan Misi...");
        try { await fetch(teacherSettings.gasUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ action: 'updateMissions', missions: [newMission, ...missions] }) }); const updated = [newMission, ...missions]; setMissions(updated); localStorage.setItem('teacher_missions', JSON.stringify(updated)); addToast("Misi berhasil diterbitkan!", "success"); } catch (e) { addToast("Gagal kirim ke Cloud.", "error"); } finally { setGlobalBusy(false); setBusyMessage(undefined); }
    }
  };

  const handleAddMaterial = async (m: Partial<InteractiveMaterial>) => {
    const newMat: InteractiveMaterial = { id: Date.now().toString(), title: m.title!, subject: m.subject!, description: m.description!, contentCode: m.contentCode!, createdAt: new Date().toISOString(), isActive: true };
    if (teacherSettings.gasUrl) { setGlobalBusy(true); setBusyMessage("Menerbitkan Materi...");
        try { await fetch(teacherSettings.gasUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ action: 'updateMaterials', materials: [newMat, ...materials] }) }); const updated = [newMat, ...materials]; setMaterials(updated); localStorage.setItem('teacher_materials', JSON.stringify(updated)); addToast("Materi diterbitkan!", "success"); } catch (e) { addToast("Cloud save failed.", "error"); } finally { setGlobalBusy(false); setBusyMessage(undefined); }
    }
  };

  const handleAddTeacherLab = async (m: Partial<InteractiveMaterial>) => {
    const newLab: InteractiveMaterial = { id: Date.now().toString(), title: m.title!, subject: m.subject!, description: m.description || "Simulasi Lab Maya untuk Guru.", contentCode: m.contentCode!, createdAt: new Date().toISOString(), isActive: true };
    const updated = [newLab, ...teacherLabs];
    setTeacherLabs(updated);
    localStorage.setItem('teacher_labs', JSON.stringify(updated));
    addToast("Lab dikirim ke Dashboard Guru!", "success");
    // Background cloud sync
    if (teacherSettings.gasUrl) {
      fetch(teacherSettings.gasUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ action: 'updateTeacherLabs', labs: updated }) }).catch(() => {});
    }
  };

  const handleFinishMission = useCallback(async (missionId: string, specificScore?: number) => {
    setIsSubmittingTask(true); setGlobalBusy(true); setBusyMessage("Mengumpulkan Hasil Misi...");
    try {
        const safeProfileName = (studentProfile.name || '').trim().toLowerCase();
        const student = students.find(s => (s.name || '').trim().toLowerCase() === safeProfileName);
        if (!student) { addToast("Siswa tidak terdaftar.", "error"); setIsSubmittingTask(false); setGlobalBusy(false); return; }
        
        const mission = missions.find(m => m.id.toString().trim() === missionId.toString().trim()); 
        if (!mission) throw new Error("Misi tidak ditemukan");
        
        const isAutoGraded = specificScore !== undefined; 
        const finalScore = isAutoGraded ? Math.min(specificScore, 100) : 100; 
        const statusStr = isAutoGraded ? 'confirmed' : 'finished';

        let earnedExp = 0; let earnedCoins = 0;
        if (isAutoGraded) { 
            const multiplier = finalScore / 100; 
            earnedExp = Math.round(mission.expReward * multiplier); 
            earnedCoins = Math.round(mission.coinReward * multiplier); 
        }

        const newSubmission: MissionSubmission = { 
            id: Date.now().toString(), 
            missionId: mission.id.toString().trim(), 
            studentId: student.id.toString().trim(), 
            studentName: student.name, 
            status: statusStr, 
            score: finalScore, 
            submittedAt: new Date().toISOString() 
        };
        
        setSubmissions(prev => [...prev, newSubmission]);
        
        let updatedStudents = [...students]; 
        let updatedGrades = [...grades];
        
        if (isAutoGraded) { 
            const newGrade: GradeEntry = { studentId: student.id.toString().trim(), subject: mission.subject, score: finalScore, date: new Date().toISOString(), missionId: missionId.toString().trim() }; 
            updatedGrades.push(newGrade); 
            updatedStudents = students.map(s => { 
                if (s.id.toString().trim() === student.id.toString().trim()) { 
                    const newTotalExp = (s.exp || 0) + earnedExp; 
                    const newLevel = Math.floor(newTotalExp / 200) + 1; 
                    return { ...s, exp: newTotalExp, coins: (s.coins || 0) + earnedCoins, level: newLevel }; 
                } 
                return s; 
            }); 
            
            setStudentProfile(prev => ({ 
                ...prev, 
                exp: (prev.exp || 0) + earnedExp, 
                coins: (prev.coins || 0) + earnedCoins, 
                level: Math.floor(((prev.exp || 0) + earnedExp) / 200) + 1 
            })); 
            setGrades(updatedGrades); 
            setStudents(updatedStudents);
        }

        const latestSubmissions = [...submissions, newSubmission];
        localStorage.setItem('teacher_submissions', JSON.stringify(latestSubmissions));
        
        if (isAutoGraded) { 
            localStorage.setItem('teacher_grades', JSON.stringify(updatedGrades)); 
            localStorage.setItem('teacher_students', JSON.stringify(updatedStudents)); 
            const updatedStudentData = updatedStudents.find(s => s.id.toString().trim() === student.id.toString().trim()); 
            if(updatedStudentData) { localStorage.setItem(`student_profile_${student.id}`, JSON.stringify(updatedStudentData)); } 
        }
        
        if (teacherSettings.gasUrl) { 
            await fetch(teacherSettings.gasUrl, { 
                method: 'POST', 
                mode: 'no-cors', 
                headers: { 'Content-Type': 'text/plain' }, 
                body: JSON.stringify({ action: 'submitMission', submission: newSubmission }) 
            });

            if (isAutoGraded) { 
                await fetch(teacherSettings.gasUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ action: 'updateGrades', grades: updatedGrades }) }); 
                await fetch(teacherSettings.gasUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ action: 'updateStudents', students: updatedStudents }) }); 
                setActiveGameMission(null); setViewMission(null); addToast(`Misi Selesai! Skor: ${finalScore}`, "success"); 
            } else { 
                setActiveGameMission(null); setViewMission(null); addToast("Tugas dikirim ke Guru!", "info"); 
            } 
        } else { 
            addToast("Database offline. Tersimpan lokal.", "warning"); setActiveGameMission(null); setViewMission(null); 
        }
        syncTeacherData(undefined, false).catch(() => console.warn("Background refresh failed"));
    } catch (err) { addToast("Gagal kirim tugas.", "error"); } finally { setIsSubmittingTask(false); setGlobalBusy(false); setBusyMessage(undefined); }
  }, [students, missions, grades, submissions, studentProfile, teacherSettings.gasUrl, addToast, syncTeacherData]);

  const handleOpenMaterial = (m: InteractiveMaterial) => {
    setLabInstanceKey(Date.now()); // Set instance key for fresh iframe load
    setActiveLabMaterial(m);
    if (userRole === 'student' && studentProfile.id) { const currentViewed = studentProfile.viewedMaterialIds || []; if (!currentViewed.includes(m.id.toString().trim())) { handleUpdateStudentProfile({ ...studentProfile, viewedMaterialIds: [...currentViewed, m.id.toString().trim()] }); } }
  };

  const toggleFullscreenGame = () => { if (gameContainerRef.current) { if (!document.fullscreenElement) { gameContainerRef.current.requestFullscreen().catch(err => { addToast("Gagal layar penuh.", "error"); }); } else { document.exitFullscreen(); } } };
  
  const toggleFullscreenMaterial = () => { if (materialContainerRef.current) { if (!document.fullscreenElement) { materialContainerRef.current.requestFullscreen().catch(err => { addToast("Gagal layar penuh.", "error"); }); } else { document.exitFullscreen(); } } };

  const handlePurchase = (item: typeof SHOP_ITEMS[0]) => {
    if (studentProfile.coins < item.cost) { addToast("Koin tidak cukup!", "warning"); return; }
    setGlobalBusy(true); setBusyMessage(`Membeli ${item.name}...`);
    const newCoins = studentProfile.coins - item.cost;
    let newPurchasedItems = [...(studentProfile.purchasedItems || [])];
    let newRedemptions = [...(studentProfile.redemptions || [])];
    if (item.isCash) { const code = Math.random().toString(36).substring(2, 10).toUpperCase(); const newRedemption: RedemptionItem = { id: Date.now().toString(), code, amount: item.amount!, date: new Date().toLocaleDateString(), status: 'pending' }; newRedemptions = [newRedemption, ...newRedemptions]; } else { if (newPurchasedItems.includes(item.id)) { setGlobalBusy(false); setBusyMessage(undefined); addToast("Sudah dimiliki!", "info"); return; } newPurchasedItems.push(item.id); }
    const newProfile: StudentProfile = { ...studentProfile, coins: newCoins, purchasedItems: newPurchasedItems, redemptions: newRedemptions };
    const updatedStudents = students.map(s => s.id.toString().trim() === studentProfile.id?.toString().trim() ? { ...s, coins: newCoins, purchasedItems: newPurchasedItems, redemptions: newRedemptions, profileData: JSON.stringify(newProfile) } : s);
    setStudents(updatedStudents); localStorage.setItem('teacher_students', JSON.stringify(updatedStudents));
    handleUpdateStudentProfile(newProfile);
    if (teacherSettings.gasUrl) { fetch(teacherSettings.gasUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ action: 'updateStudents', students: updatedStudents }) }).catch(err => console.warn("Background students sync failed", err)); }
    setGlobalBusy(false); setBusyMessage(undefined); addToast(item.isCash ? "Pembelian berhasil! Kode Tunai muncul di histori." : `${item.name} terbeli!`, "success");
  };

  const profileHeaderStyles = useMemo(() => getProfileStyles(studentProfile), [studentProfile]);

  useEffect(() => {
    const handleGameMessage = (event: MessageEvent) => {
        if (event.data?.type === 'GAME_COMPLETE' && activeGameMission) {
            const score = typeof event.data.score === 'number' ? Math.round(event.data.score) : 0;
            setPendingGameResult({ score, mission: activeGameMission });
        }
    };
    window.addEventListener('message', handleGameMessage);
    return () => window.removeEventListener('message', handleGameMessage);
  }, [activeGameMission]);

  const memoizedDailyInspiration = useMemo(async () => { const subjects = Array.isArray(teacherSettings.subjects) ? teacherSettings.subjects : []; return await getDailyInspiration(subjects); }, [teacherSettings.subjects]);
  useEffect(() => { const fetchDailyFact = async () => { try { const fact = await memoizedDailyInspiration; setDailyFact(fact); } catch (err) { setDailyFact({ category: "Wawasan", title: "Terjadi Kesalahan", content: "Waktu yang tepat untuk belajar hal baru!" }); } }; fetchDailyFact(); }, [memoizedDailyInspiration]);
  useEffect(() => { const fetchWord = async () => { const today = new Date().toISOString().split('T')[0]; if (studentProfile.name && studentProfile.lastWordOfDay?.date !== today) { try { const wordData = await getWordOfDay(studentProfile.name); handleUpdateStudentProfile({ ...studentProfile, lastWordOfDay: { ...wordData, date: today } }); } catch (err) { console.error(err); } } }; fetchWord(); }, [studentProfile.name]);
  
  useEffect(() => { 
    const initApp = async () => { 
      try { 
        await fetchRegistry(); 
        if (teacherSettings.gasUrl) { await syncTeacherData(undefined, false); } 
      } finally { 
        setTimeout(() => setIsVerifying(false), 2000);
      } 
    }; 
    initApp(); 
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 10);
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 10) {
        setHeaderIsVisible(false);
      } else {
        setHeaderIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    }; 
    window.addEventListener('scroll', handleScroll); 
    return () => window.removeEventListener('scroll', handleScroll); 
  }, []); 

  useEffect(() => {
    if (isLoggedIn && userRole === 'teacher') {
        const hasShown = localStorage.getItem('mentari_op_tutorial_done');
        if (!hasShown) {
            setShowFullTutorial(true);
        }
    }
  }, [isLoggedIn, userRole]);

  useEffect(() => { 
    if (isLoggedIn && teacherSettings.gasUrl) {
      if (activeTab === 'beranda' || activeTab === 'panelguru') {
        syncTeacherData(undefined, false).catch(e => console.warn("Periodic sync failed")); 
      }
    } 
  }, [activeTab, isLoggedIn]);

  useEffect(() => { localStorage.setItem('teacher_settings', JSON.stringify(teacherSettings)); localStorage.setItem('teacher_students', JSON.stringify(students)); localStorage.setItem('teacher_grades', JSON.stringify(grades)); localStorage.setItem('teacher_missions', JSON.stringify(missions)); localStorage.setItem('teacher_materials', JSON.stringify(materials)); localStorage.setItem('teacher_submissions', JSON.stringify(submissions)); localStorage.setItem('teacher_kindness', JSON.stringify(kindnessSubmissions)); localStorage.setItem('teacher_labs', JSON.stringify(teacherLabs)); }, [teacherSettings, students, grades, missions, materials, submissions, kindnessSubmissions, teacherLabs]);

  const { dailyData, subjectChampions, globalData } = useMemo(() => {
    if (!Array.isArray(students)) return { dailyData: [], subjectChampions: [], globalData: [] };
    const normalizedStudents = students.map(s => ({ ...s, id: (s.id || '').toString().trim() }));
    // FIX: Tambahkan clamping pada skor individual saat pemrosesan analytics global
    const normalizedGrades = (grades || []).map(g => ({ 
      studentId: (g.studentId || '').toString().trim(), 
      subject: (g.subject || '').toString().trim().toLowerCase(), 
      score: Math.min(Number(g.score || 0), 100), 
      date: g.date || new Date().toISOString() 
    }));
    
    const todayStr = new Date().toISOString().split('T')[0];
    const daily = normalizedStudents.map(s => { 
        const todayScore = normalizedGrades.filter(g => g.studentId === s.id && new Date(g.date).toISOString().split('T')[0] === todayStr).reduce((a, b) => a + b.score, 0); 
        return { ...s, _score: todayScore }; 
    }).filter(s => s._score > 0 || (s.exp || 0) > 0).sort((a, b) => b._score - a._score);
    
    const champions = teacherSettings.subjects.map(subj => { 
        const targetSubj = (subj || '').toString().trim().toLowerCase(); 
        const subjGrades = normalizedGrades.filter(g => g.subject === targetSubj); 
        const studentScores: Record<string, { total: number, count: number }> = {}; 
        
        subjGrades.forEach(g => { 
            if (!studentScores[g.studentId]) studentScores[g.studentId] = { total: 0, count: 0 };
            studentScores[g.studentId].total += g.score;
            studentScores[g.studentId].count += 1;
        }); 
        
        let topId = ''; 
        let maxAvg = 0; 
        Object.entries(studentScores).forEach(([sId, data]) => { 
            const avg = data.total / data.count;
            if (avg > maxAvg) { maxAvg = avg; topId = sId; } 
        }); 
        const champ = normalizedStudents.find(s => s.id === topId); 
        return { subject: subj, student: (maxAvg > 0 && champ) ? champ : null, score: Math.round(maxAvg) }; 
    });
    
    const global = normalizedStudents.map(s => { 
        const sg = normalizedGrades.filter(g => g.studentId === s.id); 
        const avg = sg.length > 0 ? sg.reduce((a, b) => a + b.score, 0) / sg.length : 0; 
        return { ...s, _avgScore: Math.min(avg, 100) }; 
    }).sort((a, b) => b._avgScore - a._avgScore);
    
    return { dailyData: daily, subjectChampions: champions, globalData: global };
  }, [students, grades, teacherSettings.subjects]);

  const activeMaterials = useMemo(() => { 
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return materials.filter(m => {
        if (!m.isActive) return false;
        const createdDate = new Date(m.createdAt || Date.now());
        return createdDate >= sevenDaysAgo;
    }); 
  }, [materials]);
  
  const activeMissions = useMemo(() => { 
    if (userRole !== 'student' || !studentProfile.id) return missions.filter(m => m.isActive); 
    const sid = studentProfile.id.toString().trim(); 
    return missions.filter(m => { 
      if (!m.isActive) return false; 
      const mid = m.id.toString().trim(); 
      const hasSubmitted = (submissions || []).some(s => 
        s.missionId.toString().trim() === mid && 
        s.studentId.toString().trim() === sid && 
        (s.status === 'confirmed' || s.status === 'finished')
      );
      return !hasSubmitted;
    }); 
  }, [missions, submissions, studentProfile.id, userRole]);

  const filteredShopItems = useMemo(() => { if (shopCategory === 'cash') return SHOP_ITEMS.filter(i => i.isCash); let items = SHOP_ITEMS.filter(i => !i.isCash); if (shopCategory === 'bg') items = items.filter(i => i.id.startsWith('bg_')); else if (shopCategory === 'border') items = items.filter(i => i.id.startsWith('border_')); else if (shopCategory === 'effect') items = items.filter(i => i.id.startsWith('effect_') || i.id.startsWith('anim_')); else if (shopCategory === 'font') items = items.filter(i => i.id.startsWith('font_')); else if (shopCategory === 'title') items = items.filter(i => i.id.startsWith('title_')); else if (shopCategory === 'avatar') items = items.filter(i => i.id.startsWith('av_')); return items; }, [shopCategory]);
  
  const kindnessStatus = useMemo(() => { 
    if (!studentProfile.id) return { countToday: 0, hasPending: false }; 
    const today = new Date().toISOString().split('T')[0]; 
    const sid = studentProfile.id.toString().trim(); 
    
    const allStudentSubs = kindnessSubmissions.filter(k => k.studentId.toString().trim() === sid);
    const todaySubs = allStudentSubs.filter(k => k.date === today);
    
    return { 
      countToday: todaySubs.length, 
      hasPending: allStudentSubs.some(k => k.status === 'pending') 
    }; 
  }, [studentProfile.id, kindnessSubmissions]);

  const handleFinishTutorial = () => {
    localStorage.setItem('mentari_op_tutorial_done', 'true');
    setShowFullTutorial(false);
  };

  const currentTabInfo = useMemo(() => {
    const infoMap = {
      'beranda': { title: '', sub: '', icon: 'fa-sun', desc: '' },
      'petualangan': { 
        title: 'Pintu Petualangan AI', 
        sub: 'EKSPLORASI 8 DIMENSI PROFIL LULUSAN', 
        icon: 'fa-compass', 
        desc: 'Hadapi tantangan naratif AI harian untuk membentuk karakter tangguh. Dapatkan Koin emas and EXP guna tingkatkan kasta profil petualangmu.' 
      },
      'history': { 
        title: 'History Aktifitas', 
        sub: 'JEJAK DIGITAL BELAJAR & HADIAH', 
        icon: 'fa-scroll', 
        desc: 'Pantau rekam jejak prestasimu, koin misi, dan status validasi penukaran hadiah tunai. Jejak digital ini adalah bukti nyata dedikasi belajarmu.' 
      },
      'ecosystem': { 
        title: 'Studio Modul Ajar AI', 
        sub: 'GENERATOR MODUL AJAR KURIKULUM', 
        icon: 'fa-magic', 
        desc: 'Rancang RPP & Modul Ajar otomatis dengan Gemini AI. Sistem ini mengintegrasikan kecerdasan buatan dalam merancang modul ajar deep learing dan dimensi profil lulusan yang siap cetak.' 
      },
      'generator': { 
        title: 'Studio Asesmen AI', 
        sub: 'GENERATOR NASKAH SOAL & BANK SOAL', 
        icon: 'fa-file-signature', 
        desc: 'Ciptakan naskah soal berkualitas tinggi dengan tipe pertanyaan dinamis. Dilengkapi generator ilustrasi AI untuk mempermudah pemahaman visual.' 
      },
      'peralatan': { 
        title: 'Peralatan Administrasi Guru', 
        sub: 'ASISTEN CERDAS TUGAS HARIAN', 
        icon: 'fa-toolbox', 
        desc: 'Gunakan asisten AI untuk mempermudah tugas rutin. Mulai dari merancang LKPD interaktif, menyusun ringkasan materi sistematis, hingga membuat rubrik penilaian proyek yang objektif.' 
      },
      'media': { 
        title: 'Media Pembelajaran Kreatif', 
        sub: 'STUDIO LAGU & VISUALISASI AI', 
        icon: 'fa-icons', 
        desc: 'Ubah materi membosankan menjadi lagu yang mudah dihafal atau mind map visual yang sistematis. Ciptakan pengalaman belajar yang artistik dan tak terlupakan di kelas Anda.' 
      },
      'gamifikasi': { 
        title: 'Engagement & Gamifikasi', 
        sub: 'APRESIASI & TANTANGAN EKSTRA', 
        icon: 'fa-award', 
        desc: 'Tingkatkan keterlibatan siswa melalui sertifikat otomatis, proyek eksperimen rumah yang seru, dan tantangan misteri detektif literasi yang melatih daya kritis.' 
      },
      'komunikasi': { 
        title: 'Komunikasi Sekolah', 
        sub: 'HUBUNGAN GURU & ORANG TUA', 
        icon: 'fa-bullhorn', 
        desc: 'Bangun kemitraan kuat dengan wali murid. Susun buletin mingguan kelas (surat kabar) yang membanggakan atau kirim pesan apresiasi khusus untuk prestasi setiap anak melalui WhatsApp.' 
      },
      'buatgim': { 
        title: 'Studio Gim & Kuis AI', 
        sub: 'RAKIT PETUALANGAN BELAJAR INTERAKTIF', 
        icon: 'fa-gamepad', 
        desc: 'Ubah materi ajar kompleks menjadi pengalaman bermain digital edukatif. Bangun gim HTML5 atau kuis otomatis dengan sistem skor yang bisa dikirim ke siswa.' 
      },
      'buatlab': { 
        title: 'Studio Lab Maya AI', 
        sub: 'SIMULASI DIGITAL STEM & PRAKTIKUM', 
        icon: 'fa-flask', 
        desc: 'Ciptakan simulasi STEM digital untuk eksperimen mandiri siswa atau eksplorasi materi naratif di depan kelas.' 
      },
      'panelguru': { 
        title: 'Panel Kendali Guru', 
        sub: 'MANAJEMEN CLOUD & VALIDASI MISI', 
        icon: 'fa-gears', 
        desc: 'Pusat operasional ekosistem kelas untuk kelola database siswa dan validasi tugas. Pantau statistik ketercapaian akademik secara real-time.' 
      }
    };

    if (activeTab === 'panelguru') {
      const subInfoMap: Record<string, any> = {
        'missions': { 
          title: 'Manajemen Misi & Validasi', 
          sub: 'KELOLA TUGAS & LAPORAN KEBAIKAN', 
          icon: 'fa-tasks', 
          desc: 'Tinjau tugas interaktif siswa dan berikan penilaian untuk cairkan koin. Validasi laporan karakter positif siswa melalui sistem terintegrasi.' 
        },
        'materials': { 
          title: 'Manajemen Lab Maya', 
          sub: 'PUBLIKASI SIMULASI DIGITAL STEM', 
          icon: 'fa-flask', 
          desc: 'Kelola daftar materi laboratorium virtual aktif dan pantau interaksi siswa. Publikasikan simulasi STEM baru untuk penguatan konsep praktikum.' 
        },
        'point_management': { 
          title: 'Manajemen Poin & Hadiah', 
          sub: 'MONITORING EKONOMI KELAS SISWA', 
          icon: 'fa-coins', 
          desc: 'Monitor arus ekonomi digital kelas, sesuaikan saldo EXP/Koin siswa, dan kelola peringkat global. Proses seluruh penukaran koin menjadi hadiah nyata.' 
        },
        'students': { 
          title: 'Database & Mata Pelajaran', 
          sub: 'ADMINISTRASI DATA ANGGOTA KELAS', 
          icon: 'fa-database', 
          desc: 'Administrasi data identitas anggota kelas secara aman. Tambahkan profil siswa baru, atur PIN akses, dan kelola mata pelajaran utama Anda.' 
        },
        'config': { 
          title: 'Konfigurasi Sistem', 
          sub: 'PENGATURAN SERVER & CLOUD PRIBADI', 
          icon: 'fa-cog', 
          desc: 'Konfigurasi server dan cloud database utama untuk sinkronisasi data. Atur nama sekolah, password, dan distribusi informasi penting kelas.' 
        }
      };
      return subInfoMap[activeSubTab] || infoMap['panelguru'];
    }

    const tabKey = activeTab === 'labmaya' ? 'buatlab' : activeTab;
    return infoMap[tabKey as keyof typeof infoMap] || infoMap['beranda'];
  }, [activeTab, activeSubTab]);

  if (isVerifying) { 
    if (isUnlocked) {
      return (
        <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center gap-8 z-[200000] overflow-hidden">
          <div className="cyber-grid-overlay opacity-20"></div>
          <div className="header-scanning-light opacity-60"></div>
          <div className="relative">
             <div className="w-48 h-48 rounded-full bg-blue-600/10 border-4 border-blue-50/30 flex items-center justify-center relative overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.3)]">
                <img src={HEADER_LOGO_URL} alt="Mentari Logo" className="w-32 h-32 object-contain logo-pro" />
                <div className="absolute inset-0 border-t-2 border-white/20 animate-spin-slow"></div>
             </div>
             <div className="absolute -inset-10 border-4 border-dashed border-blue-50/20 rounded-full animate-spin-slow opacity-20"></div>
          </div>
          <div className="text-center z-10">
             <h1 className="text-2xl md:text-3xl font-black text-white Museum-Text tracking-[0.2em] mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] effect-glitch-text uppercase">MENTARI PRO TERIDENTIFIKASI</h1>
             <p className="text-blue-400 font-black tracking-[0.5em] uppercase text-[10px] animate-pulse">Mengidentifikasi Kelas Digital • Version 17.0</p>
          </div>
          <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden relative border border-white/5">
             <div className="h-full bg-blue-50 shadow-[0_0_15px_rgba(59,130,246,1)] animate-loading"></div>
          </div>
          <style>{`.animate-spin-slow { animation: spin 12s linear infinite; } @keyframes spin { from {transform:rotate(0deg)} to {transform:rotate(360deg)} }`}</style>
        </div>
      );
    }
    return ( 
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center gap-8 z-[200000]"> 
        <div className="relative">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-8 border-slate-100 flex items-center justify-center">
             <img src={HEADER_LOGO_URL} alt="Mentari Logo" className="w-24 h-24 object-contain opacity-80" />
          </div> 
          <div className="absolute inset-0 border-8 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <div className="text-center">
          <p className="text-blue-600 font-black tracking-[0.3em] uppercase text-sm md:text-lg Museum-Text mb-2">MENYIAPKAN KELAS MENTARI...</p> 
          <p className="text-slate-400 font-bold tracking-widest uppercase text-[8px] md:text-[10px] animate-pulse">Menghubungkan Portal Belajar Digital</p>
        </div>
      </div> 
    ); 
  }

  const sidebarTabs = (userRole === 'teacher' 
    ? [
        { id: 'beranda', label: 'BERANDA', icon: 'fa-house' },
        { id: 'ecosystem', label: 'BUAT MODUL AJAR', icon: 'fa-book-open' },
        { id: 'generator', label: 'BUAT SOAL', icon: 'fa-file-signature' },
        { id: 'buatgim', label: 'BUAT GIM/KUIS', icon: 'fa-gamepad' },
        { id: 'labmaya', label: 'BUAT LAB', icon: 'fa-flask' },
        { id: 'peralatan', label: 'PERALATAN GURU', icon: 'fa-toolbox' },
        { id: 'media', label: 'MEDIA KREATIF', icon: 'fa-icons' },
        { id: 'gamifikasi', label: 'GAMIFIKASI', icon: 'fa-award' },
        { id: 'komunikasi', label: 'KOMUNIKASI', icon: 'fa-bullhorn' },
        { id: 'panelguru', label: 'PANEL KENDALI', icon: 'fa-gears' }
      ] 
    : [
        { id: 'beranda', label: 'BERANDA', icon: 'fa-house' },
        { id: 'petualangan', label: 'PETUALANGAN', icon: 'fa-compass' },
        { id: 'history', label: 'HISTORY', icon: 'fa-scroll' }
      ]
  );

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col bg-slate-50">
      <BlockingOverlay isVisible={isGlobalBusy} text={busyMessage} isUnlocked={isUnlocked} />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} gasUrl={DEVELOPER_GLOBAL_GAS_URL} myDeviceId={myDeviceId} onRefresh={fetchRegistry} registeredUsers={registeredUsers} />
      
      {showFullTutorial && <FullTutorialOverlay onClose={handleFinishTutorial} />}

      {pendingGameResult && (
          <GameResultOverlay 
            score={pendingGameResult.score}
            target={pendingGameResult.mission.minScore || 70}
            missionTitle={pendingGameResult.mission.title}
            isExamMode={pendingGameResult.mission.isExamMode}
            onClaim={() => { handleFinishMission(pendingGameResult.mission.id, pendingGameResult.score); setPendingGameResult(null); }}
            onRetry={() => { setPendingGameResult(null); }}
            onGiveUp={() => { setPendingGameResult(null); setActiveGameMission(null); addToast("Misi dibatalkan.", "info"); }}
          />
      )}

      {!isLoggedIn ? ( <LoginPortal students={students} teacherSettings={teacherSettings} setTeacherSettings={setTeacherSettings} syncTeacherData={(url) => syncTeacherData(url, true)} handleUpdateStudentProfile={handleUpdateStudentProfile} setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} /> ) : (
        <div className="relative min-h-screen">
          <AppHeader 
            isUnlocked={isUnlocked} 
            isScrolled={isScrolled} 
            headerIsVisible={headerIsVisible} 
            activeTab={activeTab} 
            cycleIndex={cycleIndex} 
            teacherSettings={teacherSettings} 
            currentTabInfo={currentTabInfo} 
            userRole={userRole} 
            setActiveTab={setActiveTab} 
            onLogout={() => { 
              if(window.confirm("Logout dari sesi saat ini?")) { 
                localStorage.removeItem('isLoggedIn'); 
                localStorage.removeItem('userRole');
                localStorage.removeItem('loggedStudentId');
                window.location.reload(); 
              } 
            }}
            logoUrl={HEADER_LOGO_URL}
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            gasUrl={teacherSettings.gasUrl}
            onOpenTutorial={() => setShowFullTutorial(true)}
          />

          <div className="relative pt-[64px] md:pt-[72px]">
            {/* SIDEBAR NAVIGATION - FIXED POSITION */}
            <aside className={`fixed ${headerIsVisible ? 'top-[64px] md:top-[72px]' : 'top-0'} left-0 bottom-0 z-[4000] sidebar-transition overflow-y-auto no-scrollbar border-r no-print ${isUnlocked ? 'bg-slate-900 border-white/5' : 'bg-blue-700 border-blue-800'} w-64 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4 space-y-2 min-w-[16rem]">
                   {sidebarTabs.map(tab => {
                     const isYellowTab = ['peralatan', 'media', 'gamifikasi', 'komunikasi'].includes(tab.id);
                     const descColorClass = isUnlocked ? 'text-blue-200/60' : 'text-blue-50/70';
                     const neonClass = isUnlocked ? 'neon-sidebar-text' : '';
                     
                     return (
                     <button 
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id as any);
                            if (window.innerWidth < 1024) setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 group relative overflow-hidden ${activeTab === tab.id ? (isUnlocked ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-white text-blue-600 shadow-xl') : `${isYellowTab ? 'text-yellow-400' : descColorClass} hover:bg-white/10 hover:text-white`}`}
                     >
                        <i className={`fas ${tab.icon} w-5 text-center text-sm ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}></i>
                        <span className={`truncate ${neonClass}`}>{tab.label}</span>
                        {activeTab === tab.id && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-l-full"></div>}
                     </button>
                   )})}
                </div>
                
                {/* User Status in Sidebar Footer */}
                <div className="mt-auto p-8 border-t border-white/10 min-w-[16rem]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white"><i className="fas fa-user-circle"></i></div>
                        <div>
                            <p className="text-[10px] font-black text-white uppercase truncate w-32">{isLoggedIn && userRole === 'student' ? studentProfile.name : 'GURU MENTARI'}</p>
                            <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">{userRole === 'teacher' ? 'Administrator' : 'Siswa Petualang'}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT WRAPPER - DYNAMIC PADDING TO PREVENT OVERFLOW */}
            <div className={`transition-all duration-500 pb-20 min-w-0 ${isSidebarOpen ? 'lg:pl-64' : 'pl-0'}`}>
                <div className={`max-w-7xl w-full mx-auto px-4 md:px-8 transition-all duration-1000 ${isScrolled ? 'pt-4 md:pt-6' : 'pt-6 md:pt-10'}`}>
                    <main className="animate-in fade-in duration-1000 w-full overflow-visible">
                    {activeTab === 'beranda' && ( <div className="space-y-8"> 
                        {licenseInfo.isNearExpiry && (
                        <div className="bg-gradient-to-r from-orange-50 to-amber-500 p-4 rounded-3xl shadow-xl text-white flex items-center justify-between gap-4 animate-bounce-subtle border-2 border-white/20">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-inner"><i className="fas fa-clock"></i></div>
                                <div>
                                <h4 className="text-sm font-black uppercase tracking-tight leading-none">Masa PRO Akan Berakhir</h4>
                                <p className="text-[10px] font-bold opacity-90 uppercase mt-1">Sisa masa aktif: {licenseInfo.daysLeft} Hari.</p>
                                </div>
                            </div>
                            <button onClick={() => window.open(`https://wa.me/6285755332389?text=Halo%20Admin%20Mentari,%20lisensi%20saya%20akan%20habis%20dalam%20${licenseInfo.daysLeft}%20hari.%0A%0AID:%20${myDeviceId}`, '_blank')} className="px-6 py-2 bg-white text-orange-600 rounded-2xl font-black uppercase text-[10px] shadow-lg active:scale-95 transition-all">Hubungi Admin</button>
                        </div>
                        )}
                        
                        <AnnouncementBanner isActive={teacherSettings.isAnnouncementActive} message={teacherSettings.announcement} isUnlocked={isUnlocked} /> 
                        {userRole === 'teacher' && <TeacherActionCards onAction={(id) => {
                          if (id === 'missions_shortcut') {
                            setActiveTab('panelguru');
                            setActiveSubTab('missions');
                          } else {
                            setActiveTab(id as any);
                          }
                        }} />} 
                        {userRole === 'student' && ( <StudentHeroCard profile={studentProfile} styles={profileHeaderStyles} onOpenInventory={() => setIsInventoryOpen(true)} onOpenShop={() => setIsShopOpen(true)} /> )} 
                        {userRole === 'student' && <DailyInsights dailyFact={dailyFact} wordOfDay={studentProfile.lastWordOfDay} />} 
                        <div className="flex flex-col gap-8"> 
                        {userRole === 'student' && ( <> <MaterialGrid materials={activeMaterials} onOpenMaterial={handleOpenMaterial} onSync={() => syncTeacherData(undefined, false)} isSyncing={isSyncing} /> <MissionGrid missions={activeMissions} onViewMission={setViewMission} onSync={() => syncTeacherData(undefined, false)} isSyncing={isSyncing} /> <StudentAnalytics profile={studentProfile} grades={grades} subjects={teacherSettings.subjects} students={students} passingGrade={teacherSettings.passingGrade} /> </> )} 
                        {userRole === 'teacher' && ( <> 
                          <MaterialGrid title="Laboratorium Digital Guru" description="Simulasi Front-of-Class" materials={teacherLabs} onOpenMaterial={handleOpenMaterial} onSync={() => syncTeacherData(undefined, false)} isSyncing={isSyncing} />
                          <AnalyticsDashboard students={students} grades={grades} subjects={teacherSettings.subjects} passingGrade={teacherSettings.passingGrade} /> 
                          <RankingSection dailyData={dailyData} subjectChampions={subjectChampions} globalData={globalData} getProfileStyles={getProfileStyles} onStudentClick={(id) => setSelectedRankingStudent(id)} /> 
                        </> )}
                        </div> 
                        {userRole === 'student' && ( <KindnessBottle count={studentProfile.kindnessCount || 0} lastDate={studentProfile.lastKindnessDate} pendingStatus={kindnessStatus.hasPending} countToday={kindnessStatus.countToday} onAdd={(text) => handleKindnessSubmit(text)} onClaimReward={handleClaimKindnessReward} /> )} 
                        {userRole === 'student' && isShopOpen && ( <StudentShop profile={studentProfile} shopCategory={shopCategory} setShopCategory={setShopCategory} filteredShopItems={filteredShopItems} onPurchase={handlePurchase} onClose={() => setIsShopOpen(false)} /> )} 
                    </div> )}
                    {activeTab === 'petualangan' && <PetualanganPortal profile={studentProfile} onUpdateProfile={handleUpdateStudentProfile} students={students} setGlobalBusy={setGlobalBusy} isUnlocked={isUnlocked} />}
                    {activeTab === 'history' && <HistoryAktifitasPortal profile={studentProfile} grades={grades} missions={missions} kindnessSubmissions={kindnessSubmissions} />}
                    {activeTab === 'labmaya' && <LabMayaPortal gasUrl={teacherSettings.gasUrl} subjects={teacherSettings.subjects} onPublish={handleAddMaterial} onPublishLab={handleAddTeacherLab} setGlobalBusy={setGlobalBusy} isUnlocked={isUnlocked} myDeviceId={myDeviceId} />}
                    {activeTab === 'buatgim' && <RakitGimPortal gasUrl={teacherSettings.gasUrl} isUnlocked={isUnlocked} subjects={teacherSettings.subjects} onPublish={handleAddMission} setGlobalBusy={setGlobalBusy} myDeviceId={myDeviceId} />}
                    {activeTab === 'ecosystem' && <NarasiAIPortal gasUrl={teacherSettings.gasUrl} isUnlocked={isUnlocked} setGlobalBusy={setGlobalBusy} myDeviceId={myDeviceId} />}
                    {activeTab === 'generator' && <RakitAIPortal gasUrl={teacherSettings.gasUrl} isUnlocked={isUnlocked} setGlobalBusy={setGlobalBusy} myDeviceId={myDeviceId} />}
                    {activeTab === 'peralatan' && <GuruToolboxPortal isUnlocked={isUnlocked} gasUrl={teacherSettings.gasUrl} setGlobalBusy={setGlobalBusy} myDeviceId={myDeviceId} settings={teacherSettings} />}
                    {activeTab === 'media' && <MediaKreatifPortal isUnlocked={isUnlocked} gasUrl={teacherSettings.gasUrl} setGlobalBusy={setGlobalBusy} myDeviceId={myDeviceId} settings={teacherSettings} />}
                    {activeTab === 'gamifikasi' && <EngagementPortal isUnlocked={isUnlocked} gasUrl={teacherSettings.gasUrl} students={students} settings={teacherSettings} setGlobalBusy={setGlobalBusy} />}
                    {activeTab === 'komunikasi' && <CommunicationPortal isUnlocked={isUnlocked} gasUrl={teacherSettings.gasUrl} students={students} settings={teacherSettings} setGlobalBusy={setGlobalBusy} />}
                    {activeTab === 'panelguru' && userRole === 'teacher' && ( <PanelGuruPortal isUnlocked={isUnlocked} settings={teacherSettings} setSettings={setTeacherSettings} students={students} setStudents={setStudents} grades={grades} setGrades={setGrades} missions={missions} setMissions={setMissions} materials={materials} setMaterials={setMaterials} teacherLabs={teacherLabs} setTeacherLabs={setTeacherLabs} submissions={submissions} setSubmissions={setSubmissions} onSyncRequest={() => syncTeacherData(undefined, true)} setShowStudentDetail={setShowStudentDetail} kindnessSubmissions={kindnessSubmissions} setKindnessSubmissions={setKindnessSubmissions} setGlobalBusy={setGlobalBusy} setBusyMessage={setBusyMessage} myDeviceId={myDeviceId} onSubTabUpdate={setActiveSubTab} /> )}
                    </main>
                </div>
            </div>
          </div>

          {selectedRankingStudent && (() => { const student = students.find(s => (s.id || '').toString().trim() === selectedRankingStudent.toString().trim()); if (!student) return null; return ( <StudentRankingDetailModal student={student} grades={grades} subjects={teacherSettings.subjects} onClose={() => setSelectedRankingStudent(null)} students={students} /> ); })()}
          
          {viewMission && ( <MissionDetailModal mission={viewMission} onClose={() => setViewMission(null)} onStartGame={(m) => { 
            setGameInstanceKey(Date.now()); // Unique key for fresh start
            setActiveGameMission(m); 
            setViewMission(null); 
          }} onMarkFinished={(id) => handleFinishMission(id)} /> )}
          
          {isInventoryOpen && ( <InventoryModal profile={studentProfile} onUpdateProfile={handleUpdateStudentProfile} onClose={() => setIsInventoryOpen(false)} activeEditTab={activeEditTab} setActiveEditTab={setActiveEditTab} /> )}
          
          {/* OVERLAY LAB MAYA / MATERI EKSPLORASI - SLIM HEADER */}
          {activeLabMaterial && ( 
            <div ref={materialContainerRef} className="fixed inset-0 z-[7000] bg-slate-100 flex flex-col h-screen overflow-hidden animate-in slide-in-from-bottom duration-300"> 
              <div className="bg-emerald-600 p-2 md:p-3 shadow-lg flex justify-between items-center z-10 shrink-0">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white"><i className="fas fa-flask text-sm"></i></div>
                  <div className="flex items-center">
                    <h3 className="text-white font-black uppercase text-[11px] md:text-xs Museum-Text leading-tight">{activeLabMaterial.title}</h3>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={toggleFullscreenMaterial} className="bg-white/10 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg transition-all font-black text-[9px] uppercase border border-white/20">
                    <i className="fas fa-expand mr-1.5"></i> Layar Penuh
                  </button>
                  <button onClick={() => setActiveLabMaterial(null)} className="bg-white/10 hover:bg-red text-white px-3 py-1.5 rounded-lg transition-all font-black text-[9px] uppercase border border-white/20">
                    <i className="fas fa-times mr-1.5"></i> Tutup
                  </button>
                </div>
              </div>
              <div className="flex-grow w-full relative bg-white min-h-0">
                <iframe 
                   key={`lab-instance-${activeLabMaterial.id}-${labInstanceKey}`} 
                   srcDoc={sanitizeGeneratedCode(activeLabMaterial.contentCode || "")} 
                   className="absolute inset-0 w-full h-full border-none" 
                   title="Lab Maya Player" 
                   sandbox="allow-scripts allow-popups allow-forms" 
                />
              </div> 
            </div> 
          )}

          {/* OVERLAY GAME MISSION - SLIM FOOTER */}
          {activeGameMission && ( 
            <div className="fixed inset-0 z-[7000] bg-slate-900 flex flex-col h-screen overflow-hidden animate-in zoom-in duration-300" ref={gameContainerRef}> 
              <div className="flex-grow w-full relative bg-black flex items-center justify-center overflow-hidden min-h-0"> 
                <iframe 
                  key={`game-instance-${activeGameMission.id}-${gameInstanceKey}`}
                  srcDoc={sanitizeGeneratedCode(activeGameMission.gameCode || "")} 
                  className="absolute inset-0 w-full h-full border-none max-w-[100vw]" 
                  title="Game Player" 
                  scrolling="no" 
                  sandbox="allow-scripts allow-popups allow-forms" 
                /> 
              </div> 
              <div className="bg-indigo-900 p-2 md:p-3 border-t-2 border-indigo-500 flex justify-between items-center z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] shrink-0"> 
                <div className="flex items-center gap-3"> 
                  <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white border border-indigo-400 shadow-lg"> 
                    <i className="fas fa-gamepad text-xl animate-pulse"></i> 
                  </div> 
                  <div className="text-white hidden md:block"> 
                    <h3 className="font-black uppercase text-[11px] md:text-xs Museum-Text text-yellow-300 leading-tight">{activeGameMission.title}</h3> 
                  </div> 
                </div> 
                <div className="flex gap-2"> 
                  <button onClick={toggleFullscreenGame} className="px-4 py-2 bg-indigo-700 text-white font-black uppercase rounded-lg hover:bg-indigo-600 transition-all text-[9px] border border-indigo-500"><i className="fas fa-expand mr-1.5"></i> Layar Penuh</button> 
                  <button onClick={() => setActiveGameMission(null)} className="px-4 py-2 bg-slate-700 text-slate-300 font-black uppercase rounded-lg hover:bg-slate-600 transition-all text-[9px]">Keluar</button> 
                  <div className="px-3 py-2 bg-blue-900/50 border border-blue-500/50 rounded-lg flex items-center gap-2 hidden sm:flex"> 
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div> 
                    <span className="text-white font-black uppercase text-[8px] tracking-widest whitespace-nowrap">Target: {activeGameMission.minScore || 70}</span> 
                  </div> 
                </div> 
              </div> 
            </div> 
          )}
        </div>
      )}
      
      {isLoggedIn && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[3999] animate-in fade-in lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <style>{`
        @keyframes bounce-subtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .pro-bracket { z-index: 50; }
        .scrolling-text { animation: scroll-marquee 20s linear infinite; display: inline-block; }
        @keyframes scroll-marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        @media print {
          .no-print, aside, header, .floating-action-menu, .toast-container, .blocking-overlay { display: none !important; }
          body, html { 
            background: white !important; 
            margin: 0 !important; 
            padding: 0 !important;
            overflow: visible !important;
            height: auto !important;
          }
          #root { width: 100% !important; }
          .max-w-7xl, .max-w-full, main, .transition-all { 
            padding: 0 !important; 
            margin: 0 !important; 
            max-width: none !important; 
            width: 100% !important; 
            transform: none !important;
            position: static !important;
          }
          .lg\:pl-64, .pl-0 { padding-left: 0 !important; }
          .pt-\[64px\], .md\:pt-\[72px\], .pt-4, .md\:pt-6, .pt-6, .md\:pt-10 { padding-top: 0 !important; }
          .pb-20 { padding-bottom: 0 !important; }
          .grid { display: block !important; }
          .lg\:col-span-7, .lg\:col-span-8, .lg\:col-span-12 { width: 100% !important; margin: 0 !important; }
          .shadow-2xl, .shadow-xl, .shadow-lg, .shadow-md, .shadow-sm { box-shadow: none !important; }
          .border-4, .border-8, .border-2 { border: 1px solid #e2e8f0 !important; }
          .rounded-\[3rem\], .rounded-\[4rem\], .rounded-\[3\.5rem\], .rounded-2xl { border-radius: 0 !important; }
          .printable-area { 
            display: block !important; 
            width: 100% !important; 
            position: static !important; 
            visibility: visible !important;
          }
        }
      `}</style>
    </div>
  );
};

export default App;