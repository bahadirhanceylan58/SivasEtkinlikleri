"use client";

import Link from 'next/link';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: name
      });
      router.push('/login');
    } catch (err: any) {
      setError('Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md relative z-10 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Kayıt Ol</h1>
          <p className="text-gray-400">Sivas Etkinlikleri dünyasına katılın</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Ad Soyad</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Adınız Soyadınız"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              />
              <User className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">E-posta Adresi</label>
            <div className="relative">
              <input
                type="email"
                placeholder="ornek@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              />
              <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Şifre</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
              />
              <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-500" />
            </div>
          </div>

          <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transform hover:-translate-y-0.5 mt-2 flex items-center justify-center gap-2">
            Hesap Oluştur
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-gray-400 text-sm">
            Zaten hesabınız var mı?{' '}
            <Link href="/login" className="text-primary hover:text-primary-hover font-bold ml-1 transition-colors">
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
