
import { AssessmentFormData, GameFormData } from './types';

export const QUESTION_TYPES = [
  "Pilihan Ganda", "Isian Short", "Uraian", "Benar/Salah", "Menjodohkan", "Melengkapi", "Studi Kasus"
];

export const MOODS = [
  { emoji: '😊', label: 'Senang', color: 'bg-green-100 border-green-200' },
  { emoji: '🤩', label: 'Bersemangat', color: 'bg-yellow-100 border-yellow-200' },
  { emoji: '🤔', label: 'Bingung', color: 'bg-blue-100 border-blue-200' },
  { emoji: '😴', label: 'Ngantuk', color: 'bg-purple-100 border-purple-200' },
  { emoji: '😕', label: 'Sedih', color: 'bg-red-100 border-red-200' },
];

export const AVATARS = [
  { id: 'av1', icon: 'fa-user-ninja', color: 'text-indigo-500', bg: 'bg-indigo-50' },
];

export const SHOP_ITEMS = [
  { id: 'title_gold', name: 'Gelar: Member Emas', cost: 80, icon: 'fa-medal', color: 'text-yellow-600' },
  { id: 'title_explorer', name: 'Gelar: Penjelajah', cost: 120, icon: 'fa-compass', color: 'text-emerald-500' },
  { id: 'title_scholar', name: 'Gelar: Cendekiawan', cost: 150, icon: 'fa-graduation-cap', color: 'text-blue-400' },
  { id: 'title_kind', name: 'Gelar: Anak Baik', cost: 50, icon: 'fa-heart', color: 'text-rose-400' },
  { id: 'title_genius', name: 'Gelar: Maha Jenius', cost: 220, icon: 'fa-brain', color: 'text-pink-500' },
  { id: 'title_hero', name: 'Gelar: Pahlawan Mentari', cost: 250, icon: 'fa-mask', color: 'text-blue-500' },
  { id: 'title_pixel', name: 'Gelar: Pixel Master', cost: 280, icon: 'fa-gamepad', color: 'text-purple-400' },
  { id: 'title_alchemist', name: 'Gelar: AI Alchemist', cost: 290, icon: 'fa-flask-vial', color: 'text-indigo-400' },
  { id: 'title_cyber', name: 'Gelar: Cyber Sentinel', cost: 420, icon: 'fa-shield-halved', color: 'text-cyan-400' },
  { id: 'title_void', name: 'Gelar: Void Walker', cost: 450, icon: 'fa-portal-exit', color: 'text-fuchsia-600' },
  { id: 'title_quantum', name: 'Gelar: Quantum Mind', cost: 470, icon: 'fa-atom', color: 'text-blue-400' },
  { id: 'title_sovereign', name: 'Gelar: Mythic Sovereign', cost: 495, icon: 'fa-bolt', color: 'text-yellow-400' },
  { id: 'title_overlord', name: 'Gelar: Grandmaster AI', cost: 499, icon: 'fa-crown', color: 'text-amber-500' },
  { id: 'title_neo', name: 'Gelar: Neo Architect', cost: 550, icon: 'fa-city', color: 'text-cyan-300' },
  { id: 'title_binary', name: 'Gelar: Binary Ghost', cost: 600, icon: 'fa-code', color: 'text-emerald-500' },
  
  { id: 'border_dashed', name: 'Bingkai: Minimalist', cost: 50, icon: 'fa-minus', color: 'text-slate-400' },
  { id: 'border_nature', name: 'Bingkai: Spirit Nature', cost: 150, icon: 'fa-leaf', color: 'text-green-600' },
  { id: 'border_wood', name: 'Bingkai: Old Wood', cost: 120, icon: 'fa-tree', color: 'text-amber-700' },
  { id: 'border_water', name: 'Bingkai: Water Aura', cost: 210, icon: 'fa-droplet', color: 'text-blue-400' },
  { id: 'border_neon_pulse', name: 'Bingkai: Neon Pulse', cost: 260, icon: 'fa-wave-square', color: 'text-cyan-500' },
  { id: 'border_chroma', name: 'Bingkai: Chroma Aura', cost: 290, icon: 'fa-rainbow', color: 'text-rose-400' },
  { id: 'border_obsidian', name: 'Bingkai: Dark Obsidian', cost: 280, icon: 'fa-gem', color: 'text-slate-900' },
  { id: 'border_neon', name: 'Bingkai: Cyber Neon', cost: 410, icon: 'fa-circle-dot', color: 'text-cyan-400' },
  { id: 'border_gold', name: 'Bingkai: Royal Gold', cost: 440, icon: 'fa-certificate', color: 'text-yellow-600' },
  { id: 'border_prism', name: 'Bingkai: Hologram Prism', cost: 470, icon: 'fa-gem', color: 'text-indigo-400' },
  { id: 'border_data', name: 'Bingkai: Data Stream', cost: 490, icon: 'fa-code-branch', color: 'text-emerald-400' },
  { id: 'border_lava', name: 'Bingkai: Magma Flow', cost: 495, icon: 'fa-fire', color: 'text-orange-600' },
  { id: 'border_diamond', name: 'Bingkai: Eternal Diamond', cost: 499, icon: 'fa-gem', color: 'text-slate-300' },
  { id: 'border_cyber_circuit', name: 'Bingkai: Tech Circuit', cost: 580, icon: 'fa-microchip', color: 'text-blue-500' },
  { id: 'border_glow_neon', name: 'Bingkai: Azure Glow', cost: 650, icon: 'fa-sun', color: 'text-cyan-400' },
  { id: 'border_glitch_binary', name: 'Bingkai: Glitch Binary', cost: 700, icon: 'fa-code', color: 'text-emerald-500' },
  { id: 'border_quantum', name: 'Bingkai: Quantum Field', cost: 850, icon: 'fa-atom', color: 'text-purple-400' },
  { id: 'border_cyber_hex', name: 'Bingkai: Hex Guard', cost: 900, icon: 'fa-shield-halved', color: 'text-cyan-400' },
  { id: 'border_neural_mesh', name: 'Bingkai: Neural Mesh', cost: 750, icon: 'fa-brain', color: 'text-blue-400' },
  
  { id: 'font_comic', name: 'Font: Bubble Pop', cost: 70, icon: 'fa-face-grin-wide', color: 'text-pink-500' },
  { id: 'font_elegant', name: 'Font: Classy Serif', cost: 150, icon: 'fa-pen-nib', color: 'text-slate-600' },
  { id: 'font_marker', name: 'Font: Graffiti Art', cost: 210, icon: 'fa-marker', color: 'text-slate-800' },
  { id: 'font_arcade', name: 'Font: Retro Arcade', cost: 240, icon: 'fa-ghost', color: 'text-orange-500' },
  { id: 'font_heavy', name: 'Font: Iron Strong', cost: 280, icon: 'fa-bold', color: 'text-blue-900' },
  { id: 'font_stencil', name: 'Font: Military Stencil', cost: 260, icon: 'fa-shield', color: 'text-emerald-800' },
  { id: 'font_retro', name: 'Font: 8-Bit Digital', cost: 420, icon: 'fa-microchip', color: 'text-slate-700' },
  { id: 'font_vapor', name: 'Font: Vaporwave', cost: 450, icon: 'fa-compact-disc', color: 'text-pink-400' },
  { id: 'font_scifi', name: 'Font: Techno Glitch', cost: 480, icon: 'fa-terminal', color: 'text-cyan-500' },
  { id: 'font_binary', name: 'Font: Binary Code', cost: 495, icon: 'fa-file-code', color: 'text-emerald-500' },
  { id: 'font_liquid', name: 'Font: Liquid Flow', cost: 490, icon: 'fa-water', color: 'text-blue-500' },
  
  { id: 'bg_library', name: 'Latar: Lost Archive', cost: 110, icon: 'fa-book', color: 'text-amber-800' },
  { id: 'bg_sky', name: 'Latar: Clear Sky', cost: 150, icon: 'fa-cloud', color: 'text-sky-400' },
  { id: 'bg_forest', name: 'Latar: Enchanted Forest', cost: 220, icon: 'fa-tree', color: 'text-emerald-400' },
  { id: 'bg_sunset', name: 'Latar: Eternal Dusk', cost: 250, icon: 'fa-sun', color: 'text-orange-500' },
  { id: 'bg_matrix', name: 'Latar: Matrix Grid', cost: 280, icon: 'fa-th', color: 'text-emerald-600' },
  { id: 'bg_ocean', name: 'Latar: Deep Ocean', cost: 260, icon: 'fa-fish', color: 'text-blue-700' },
  { id: 'bg_ice', name: 'Latar: Frozen Citadel', cost: 410, icon: 'fa-snowflake', color: 'text-cyan-300' },
  { id: 'bg_space', name: 'Latar: Deep Nebula', cost: 440, icon: 'fa-user-astronaut', color: 'text-indigo-400' },
  { id: 'bg_cyber', name: 'Latar: Neo Tokyo Night', cost: 470, icon: 'fa-city', color: 'text-fuchsia-400' },
  { id: 'bg_void', name: 'Latar: Void Reality', cost: 495, icon: 'fa-infinity', color: 'text-slate-900' },
  { id: 'bg_royal', name: 'Latar: Royal Palace', cost: 480, icon: 'fa-castle', color: 'text-yellow-600' },
  { id: 'bg_lava', name: 'Latar: Magma Core', cost: 495, icon: 'fa-fire-flame-curved', color: 'text-orange-600' },
  { id: 'bg_sakura', name: 'Latar: Cherry Blossom', cost: 450, icon: 'fa-spa', color: 'text-pink-300' },
  { id: 'bg_neural_link', name: 'Latar: Neural Link', cost: 680, icon: 'fa-brain', color: 'text-blue-400' },
  { id: 'bg_pixel_grid', name: 'Latar: Pixel Grid', cost: 620, icon: 'fa-th-large', color: 'text-indigo-400' },
  { id: 'bg_circuit_board', name: 'Latar: Data Route', cost: 750, icon: 'fa-microchip', color: 'text-yellow-500' },
  { id: 'bg_data_core', name: 'Latar: Core Processor', cost: 800, icon: 'fa-atom', color: 'text-blue-500' },
  { id: 'bg_digital_horizon', name: 'Latar: Digital Horizon', cost: 900, icon: 'fa-mountain', color: 'text-cyan-400' },
  { id: 'bg_hacker_space', name: 'Latar: Hacker Haven', cost: 850, icon: 'fa-terminal', color: 'text-emerald-500' },
  
  { id: 'effect_fireflies', name: 'Efek: Spirit Sparks', cost: 90, icon: 'fa-bug', color: 'text-yellow-300' },
  { id: 'effect_confetti', name: 'Efek: Party Time', cost: 120, icon: 'fa-cake-candles', color: 'text-pink-400' },
  { id: 'effect_leaves', name: 'Efek: Fall Leaves', cost: 210, icon: 'fa-leaf', color: 'text-orange-400' },
  { id: 'effect_snow', name: 'Efek: Winter Snow', cost: 240, icon: 'fa-snowflake', color: 'text-blue-200' },
  { id: 'effect_bloom', name: 'Efek: Particle Bloom', cost: 280, icon: 'fa-certificate', color: 'text-amber-400' },
  { id: 'anim_wiggle', name: 'Gaya: Happy Jiggle', cost: 250, icon: 'fa-face-laugh-squint', color: 'text-yellow-500' },
  { id: 'anim_float', name: 'Gaya: Zero Gravity', cost: 410, icon: 'fa-cloud', color: 'text-sky-400' },
  { id: 'effect_rain', name: 'Efek: Digital Rain', cost: 440, icon: 'fa-cloud-showers-heavy', color: 'text-indigo-400' },
  { id: 'effect_glitch', name: 'Efek: Glitch Aura', cost: 470, icon: 'fa-bolt-lightning', color: 'text-purple-400' },
  { id: 'effect_neon_text', name: 'Efek: Laser Glow', cost: 490, icon: 'fa-lightbulb', color: 'text-yellow-400' },
  { id: 'effect_cyber_aura', name: 'Efek: Cyber Aura', cost: 499, icon: 'fa-user-gear', color: 'text-cyan-400' },
  { id: 'effect_hearts', name: 'Efek: Love Aura', cost: 350, icon: 'fa-heart', color: 'text-rose-500' },
  { id: 'effect_data_flow', name: 'Efek: Data Flow', cost: 720, icon: 'fa-code-branch', color: 'text-emerald-500' },
  { id: 'effect_scanline', name: 'Efek: Scanline CRT', cost: 580, icon: 'fa-tv', color: 'text-slate-400' },
  
  { id: 'av_ghost', name: 'Avatar: Shadow Spirit', cost: 180, icon: 'fa-ghost', color: 'text-purple-400' },
  { id: 'av_cat', name: 'Avatar: Wisdom Cat', cost: 150, icon: 'fa-cat', color: 'text-amber-600' },
  { id: 'av_robot', name: 'Avatar: Prime Bot', cost: 270, icon: 'fa-robot', color: 'text-cyan-500' },
  { id: 'av_nomad', name: 'Avatar: Tech Nomad', cost: 295, icon: 'fa-user-secret', color: 'text-slate-600' },
  { id: 'av_fox', name: 'Avatar: Stealth Fox', cost: 280, icon: 'fa-fox', color: 'text-orange-500' },
  { id: 'av_knight', name: 'Avatar: Cyber Paladin', cost: 420, icon: 'fa-shield-halved', color: 'text-blue-400' },
  { id: 'av_wizard', name: 'Avatar: Archmage', cost: 450, icon: 'fa-hat-wizard', color: 'text-indigo-600' },
  { id: 'av_samurai', name: 'Avatar: Cyber Samurai', cost: 480, icon: 'fa-khanda', color: 'text-red-500' },
  { id: 'av_overlord', name: 'Avatar: AI Overlord', cost: 495, icon: 'fa-microchip', color: 'text-cyan-400' },
  { id: 'av_dragon', name: 'Avatar: Golden Dragon', cost: 499, icon: 'fa-dragon', color: 'text-yellow-500' },
  { id: 'av_cyborg', name: 'Avatar: Neural Cyborg', cost: 550, icon: 'fa-user-gear', color: 'text-blue-500' },
  { id: 'av_ai_core', name: 'Avatar: Core Processor', cost: 600, icon: 'fa-atom', color: 'text-fuchsia-400' },
  
  { id: 'cash_500', name: 'Tukar Rp 500', cost: 500, icon: 'fa-money-bill-wave', color: 'text-emerald-500', isCash: true, amount: 500 },
  { id: 'cash_1000', name: 'Tukar Rp 1000', cost: 1000, icon: 'fa-money-bill-1', color: 'text-emerald-600', isCash: true, amount: 1000 },
  { id: 'cash_2000', name: 'Tukar Rp 2000', cost: 2000, icon: 'fa-wallet', color: 'text-emerald-700', isCash: true, amount: 2000 },
  { id: 'cash_3000', name: 'Tukar Rp 3000', cost: 3000, icon: 'fa-coins', color: 'text-emerald-500', isCash: true, amount: 3000 },
  { id: 'cash_4000', name: 'Tukar Rp 4000', cost: 4000, icon: 'fa-sack-dollar', color: 'text-emerald-600', isCash: true, amount: 4000 },
  { id: 'cash_5000', name: 'Tukar Rp 5000', cost: 5000, icon: 'fa-piggy-bank', color: 'text-emerald-800', isCash: true, amount: 5000 },
  { id: 'cash_10000', name: 'Tukar Rp 10.000', cost: 10000, icon: 'fa-vault', color: 'text-emerald-900', isCash: true, amount: 10000 },
  { id: 'cash_20000', name: 'Tukar Rp 20.000', cost: 20000, icon: 'fa-sack-dollar', color: 'text-emerald-600', isCash: true, amount: 20000 },
];

export const getInitialAssessmentData = (): AssessmentFormData => ({
  jenjang: 'SD Sederajat',
  sekolah: '',
  judulAsesmen: '',
  mataPelajaran: '',
  kelasSemester: '',
  tahunPelajaran: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
  namaGuru: '',
  tanggal: new Date().toISOString().split('T')[0],
  waktu: '90',
  jumlahSoalTotal: '10',
  formats: QUESTION_TYPES.map(type => ({ type, count: type === 'Pilihan Ganda' ? '10' : '0' })),
  topics: [{ materi: '', bobot: '100' }],
  includeImages: false,
  imageCount: 0,
  includeArabic: false,
  arabicCount: 0
});

export const getInitialGameData = (): GameFormData => ({
  judul: '',
  genre: 'Visual Novel',
  targetAudiens: 'Siswa Sekolah Dasar',
  tujuanUtama: 'Belajar sambil bermain dan memenangkan misi',
  kendali: 'Mouse/Click',
  kesulitan: 'Mudah/Linear',
  temaVisual: 'Professional/Corporate',
  skemaWarna: 'Blue and Gold',
  asetGambar: 'Placeholder Warna',
  branching: false,
  kontenNarasi: '',
  minScore: 70, 
  isDuel: false,
  isExamMode: false,
  isAdventureMode: false,
  platform: 'Mobile',
  fiturTeknis: {
    skor: true,
    nyawa: true,
    timer: false,
    mobileFriendly: true,
    suara: false
  }
});

export const getBrowserFingerprint = (): string => {
  const n = window.navigator;
  const s = window.screen;
  const hardwareTraits = [
    n.language,
    s.colorDepth,
    s.width,
    s.height,
    n.hardwareConcurrency || '4',
    s.availWidth,
    s.availHeight,
    n.platform
  ].join('###');
  let hash = 0;
  for (let i = 0; i < hardwareTraits.length; i++) {
    const char = hardwareTraits.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; 
  }
  return "MTR-" + Math.abs(hash).toString(16).toUpperCase();
};
