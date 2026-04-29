
export interface TopicEntry {
  materi: string;
  bobot: string; // percentage
}

export interface QuestionFormat {
  type: string;
  count: string;
}

export interface AssessmentFormData {
  jenjang: string;
  sekolah: string;
  judulAsesmen: string;
  mataPelajaran: string;
  kelasSemester: string;
  tahunPelajaran: string;
  namaGuru: string;
  tanggal: string;
  waktu: string;
  jumlahSoalTotal: string;
  formats: QuestionFormat[];
  topics: TopicEntry[];
  includeImages: boolean;
  imageCount: number;
  includeArabic: boolean;
  arabicCount: number;
}

export interface LessonFormData {
  namaNIP: string;
  sekolah: string;
  kelasFase: string;
  mataPelajaran: string;
  muatanLokalNama: string;
  tahunPelajaran: string;
  semester: string;
  alokasiWaktu: string;
  jumlahPertemuan: string;
  jamPelajaran: string;
  modelPembelajaran: string;
  strategiPenerapan: string;
  tujuanpembelajaran: string;
  materipokok: string;
  capaianPembelajaran: string;
}

export interface GameFormData {
  judul: string;
  genre: 'Visual Novel' | 'RPG 2D' | 'Platformer' | 'Puzzle' | 'Quiz Interaktif';
  targetAudiens: string;
  tujuanUtama: string;
  kendali: 'Mouse/Click' | 'Keyboard Arrows' | 'Drag-and-Drop' | 'Touch';
  kesulitan: 'Mudah/Linear' | 'Sulit/Menantang';
  temaVisual: 'Cyberpunk' | 'Minimalist/Clean' | 'Pixel Art' | 'Professional/Corporate';
  skemaWarna: string;
  asetGambar: 'Placeholder Warna' | 'Pixel Art API' | 'Unsplash API';
  branching: boolean;
  kontenNarasi: string;
  minScore: number; 
  isDuel: boolean; 
  isExamMode: boolean; 
  isAdventureMode: boolean; 
  platform: 'Mobile' | 'PC & Mobile'; 
  fiturTeknis: {
    skor: boolean;
    nyawa: boolean;
    timer: boolean;
    mobileFriendly: boolean;
    suara: boolean;
  };
}

export interface InteractiveMaterial {
  id: string;
  title: string;
  subject: string;
  description: string;
  contentCode: string;
  createdAt: string;
  isActive: boolean;
}

export interface GroundingSource {
  title?: string;
  uri: string;
}

export interface RegisteredUser {
  phoneNumber: string;
  serial: string;
  deviceId: string;
  createdAt: string;
  expiredAt: string;
  durationMonths: number;
}

export interface RedemptionItem {
  id: string;
  code: string;
  amount: number;
  date: string;
  status: 'pending' | 'used';
}

export interface Student {
  id: string;
  name: string;
  pin?: string; 
  coins?: number;
  level?: number;
  exp?: number;
  kindnessCount?: number;
  purchasedItems?: string[];
  redemptions?: RedemptionItem[];
  profileData?: string; 
}

export interface GradeEntry {
  studentId: string;
  subject: string;
  score: number;
  date: string;
  missionId?: string;
  reason?: string;
  expChange?: number;
  coinChange?: number;
}

export interface Mission {
  id: string;
  title: string;
  subject: string;
  description: string;
  expReward: number;
  coinReward: number;
  deadline: string;
  isActive: boolean;
  gameCode?: string;
  minScore?: number; 
  isExamMode?: boolean;
}

export interface MissionSubmission {
  id: string;
  missionId: string;
  studentId: string;
  studentName: string;
  status: 'pending' | 'finished' | 'confirmed';
  score?: number;
  submittedAt: string;
}

export interface KindnessSubmission {
  id: string;
  studentId: string;
  studentName: string;
  description: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface TeacherSettings {
  gasUrl: string;
  teacherName: string;
  schoolName: string;
  className: string;
  schoolCode: string; 
  password?: string;
  announcement: string;
  isAnnouncementActive: boolean;
  subjects: string[];
  passingGrade: number;
  aiModel?: string;
}

export interface VisualDesign {
    imageUrl: string;
    headline: string;
    points: string[];
    footer: string;
}

export interface AIWork {
  id: string;
  title: string;
  type: string;
  content: string;
  date: string;
}

export interface StudentProfile {
  id?: string;
  name: string;
  hobby: string;
  animal: string;
  avatar: string; 
  coins: number;
  exp: number;
  level: number;
  dailyTasks: string[]; 
  lastResetDate: string; 
  aiWorks: AIWork[];
  kindnessCount: number;
  lastKindnessDate?: string;
  lastAdventureDate?: string;
  completedAdventureIds: string[];
  purchasedItems: string[];
  viewedMaterialIds?: string[];
  redemptions: RedemptionItem[];
  activeBorder?: string;
  activeBackground?: string;
  activeFont?: string;
  activeEffect?: string;
  activeTitle?: string;
  lastWordOfDay?: {
    word: string;
    meaning: string;
    example: string;
    date: string;
  };
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export type TeacherToolType = 'lkpd' | 'summary' | 'rubric' | 'simplifier';
export type MediaToolType = 'lyrics' | 'mindmap' | 'infographic' | 'presentation' | 'table' | 'video_script';
export type EngagementToolType = 'certificate' | 'homeproject' | 'mystery';
export type CommunicationToolType = 'bulletin' | 'parent_msg';
