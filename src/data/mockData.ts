import { Mic2, Compass, GraduationCap, Tent, Baby, Trophy, Briefcase, PartyPopper } from 'lucide-react';

export interface Event {
  id: string;
  title: string;
  date: string; // ISO 8601 format: YYYY-MM-DDTHH:mm:ss
  location: string;
  category: string; // Main category ID (e.g., 'sanat')
  subCategory?: string; // e.g., 'Konser'
  imageUrl: string;
  isFeatured?: boolean;
  ticketTypes?: { name: string; price: number }[];
  badges?: string[]; // e.g., 'Kontenjanlı', 'Sertifikalı'
  createdAt: string; // ISO 8601 format
  salesType?: 'internal' | 'external';
  externalUrl?: string;
}

export interface Club {
  id: string;
  name: string;
  memberCount: number;
  category: string;
}

export const CATEGORIES = [
  { id: 'sanat', name: 'Sanat & Sahne', icon: Mic2, sub: ['Konser', 'Tiyatro', 'Stand-up', 'Opera/Bale'] },
  { id: 'egitim', name: 'Eğitim & Gelişim', icon: GraduationCap, sub: ['Workshop', 'Seminer', 'Söyleşi', 'Sertifikalı Eğitim'] },
  { id: 'gezi', name: 'Gezi & Deneyim', icon: Compass, sub: ['Doğa Yürüyüşü', 'Kamp', 'Şehir Turu', 'Gastronomi Turu'] },
  { id: 'macera', name: 'Macera & Aktivite', icon: Tent, sub: ['Off-road', 'Rafting', 'Kayak', 'Bisiklet Turu'] },
  { id: 'aile', name: 'Aile & Çocuk', icon: Baby, sub: ['Çocuk Atölyesi', 'Masal Saati', 'Oyunlar'] },
  { id: 'eglence', name: 'Eğlence & Oyun', icon: PartyPopper, sub: ['Quiz Night', 'Karaoke', 'Kutu Oyunları', 'Bilgi Yarışması', 'Dart Turnuvası'] },
  { id: 'spor', name: 'Spor', icon: Trophy, sub: ['Turnuva', 'E-Spor', 'Müsabaka'] },
  { id: 'kurumsal', name: 'Kurumsal', icon: Briefcase, sub: ['Networking', 'Lansman', 'Gala'] }
];

export const EVENTS: Event[] = [
  {
    id: '1',
    title: 'Melek Mosso Konseri',
    date: '2026-02-03T21:00:00',
    location: 'Sivas 4 Eylül Kültür Merkezi',
    category: 'sanat',
    subCategory: 'Konser',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    isFeatured: true,
    ticketTypes: [
      { name: 'Öğrenci', price: 300 },
      { name: 'Tam', price: 450 },
      { name: 'VIP', price: 900 }
    ],
    badges: ['Kontenjanlı', 'Hızlı Tükeniyor'],
    createdAt: '2026-01-20T10:00:00'
  },
  {
    id: '2',
    title: 'Hamlet Tiyatrosu',
    date: '2026-02-05T19:30:00',
    location: 'Muhsin Yazıcıoğlu Kültür Merkezi',
    category: 'sanat',
    subCategory: 'Tiyatro',
    imageUrl: 'https://images.unsplash.com/photo-1507676184212-d0339e2df33c?auto=format&fit=crop&w=800&q=80',
    ticketTypes: [
      { name: 'Öğrenci', price: 100 },
      { name: 'Tam', price: 200 }
    ],
    badges: ['Aileye Uygun'],
    createdAt: '2026-01-21T14:30:00'
  },
  {
    id: '3',
    title: 'Doğu Demirkol Stand-up',
    date: '2026-02-10T20:00:00',
    location: 'The Green Park Sivas',
    category: 'sanat',
    subCategory: 'Stand-up',
    imageUrl: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=800&q=80',
    ticketTypes: [
      { name: 'Genel Giriş', price: 400 },
      { name: 'Sahne Önü', price: 750 }
    ],
    badges: ['+18'],
    createdAt: '2026-01-22T09:15:00'
  },
  {
    id: '4',
    title: 'Sivas Gençlik Festivali',
    date: '2026-02-15T14:00:00',
    location: 'Sivas Kent Meydanı',
    category: 'sanat',
    subCategory: 'Konser',
    imageUrl: 'https://images.unsplash.com/photo-1459749411177-0473ef71607b?auto=format&fit=crop&w=800&q=80',
    ticketTypes: [
      { name: 'Günlük', price: 150 },
      { name: 'Kombine', price: 350 }
    ],
    badges: ['Açık Hava', 'Yiyecek Stadı'],
    createdAt: '2026-01-23T11:00:00'
  },
  {
    id: '5',
    title: 'Dolu Kadehi Ters Tut',
    date: '2026-02-20T21:30:00',
    location: '4 Eylül Kültür Merkezi',
    category: 'sanat',
    subCategory: 'Konser',
    imageUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80',
    ticketTypes: [
      { name: 'Öğrenci', price: 350 },
      { name: 'Tam', price: 500 }
    ],
    createdAt: '2026-01-24T16:20:00'
  },
  {
    id: '6',
    title: 'Ayna Süsleme Workshop',
    date: '2026-02-22T13:00:00',
    location: 'Terra Coffee',
    category: 'egitim',
    subCategory: 'Workshop',
    imageUrl: 'https://images.unsplash.com/photo-1605218427306-635ba2439715?auto=format&fit=crop&w=800&q=80',
    ticketTypes: [
      { name: 'Katılım', price: 600 }
    ],
    badges: ['Malzeme Dahil', 'Sertifikalı'],
    createdAt: '2026-01-25T13:00:00'
  },
  {
    id: '7',
    title: 'Yıldız Dağı Kayak Turu',
    date: '2026-02-28T08:00:00',
    location: 'Yıldız Dağı',
    category: 'macera',
    subCategory: 'Kayak',
    imageUrl: 'https://images.unsplash.com/photo-1551524559-8afcb2604586?auto=format&fit=crop&w=800&q=80',
    ticketTypes: [
      { name: 'Ulaşım Dahil', price: 1200 }
    ],
    badges: ['Rehberli', 'Ekipman Kiralama'],
    createdAt: '2026-01-26T08:00:00'
  },
  {
    id: '8',
    title: 'Büyük Sivas Quiz Night: Yeşilçam Özel',
    date: '2026-01-30T20:00:00',
    location: 'Kaktüs Etkinlik & Cafe',
    category: 'eglence',
    subCategory: 'Quiz Night',
    imageUrl: 'https://images.unsplash.com/photo-1544654271-558694080eb2?auto=format&fit=crop&w=800&q=80',
    ticketTypes: [
      { name: 'Katılım (İçecek Dahil)', price: 150 }
    ],
    badges: ['Kontenjanlı', 'Ödüllü', 'Takım Katılımı'],
    createdAt: '2026-01-29T19:00:00'
  }
];

export const CLUBS: Club[] = [
  { id: '1', name: 'Sivas Gezi Merkezi', memberCount: 53, category: 'gezi' },
  { id: '2', name: 'Kaktüs Etkinlik', memberCount: 52, category: 'sanat' },
  { id: '3', name: 'Blend House Sivas', memberCount: 52, category: 'sanat' },
  { id: '4', name: 'Cumhuriyet Psikoloji Kulübü', memberCount: 43, category: 'egitim' },
  { id: '5', name: 'Gece Bar', memberCount: 36, category: 'sanat' },
];
