"use client";

import Link from 'next/link';
import { User, Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Password strength calculator
  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;
    return Math.min(strength, 3); // Max 3 levels
  };

  const passwordStrength = getPasswordStrength();
  const strengthLabels = ['', 'Zayıf', 'Orta', 'Güçlü'];
  const strengthColors = ['', 'text-red-400', 'text-yellow-400', 'text-green-400'];

  const validateName = () => {
    if (!name.trim()) {
      setNameError('Ad soyad gereklidir');
      return false;
    }
    if (name.trim().length < 2) {
      setNameError('Ad soyad en az 2 karakter olmalıdır');
      return false;
    }
    const nameRegex = /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/;
    if (!nameRegex.test(name)) {
      setNameError('Sadece harf ve boşluk kullanabilirsiniz');
      return false;
    }
    setNameError('');
    return true;
  };

  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError('E-posta adresi gereklidir');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Geçerli bir e-posta adresi girin');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = () => {
    if (!password) {
      setPasswordError('Şifre gereklidir');
      return false;
    }
    if (password.length < 8) {
      setPasswordError('Şifre en az 8 karakter olmalıdır');
      return false;
    }
    if (!/[0-9]/.test(password)) {
      setPasswordError('Şifre en az bir rakam içermelidir');
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setPasswordError('Şifre en az bir büyük harf içermelidir');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = () => {
    if (!confirmPassword) {
      setConfirmPasswordError('Şifre tekrarı gereklidir');
      return false;
    }
    if (confirmPassword !== password) {
      setConfirmPasswordError('Şifreler eşleşmiyor');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();

    if (!isNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    if (!acceptTerms) {
      setError('Kullanım koşullarını kabul etmelisiniz');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: name
      });

      // Firestore 'users' koleksiyonuna kaydet
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name,
        email,
        role: "user", // Varsayılan rol
        createdAt: serverTimestamp()
      });

      router.push('/login');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Bu e-posta adresi zaten kullanılıyor');
      } else {
        setError('Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = name && email && password && confirmPassword && !nameError && !emailError && !passwordError && !confirmPasswordError && acceptTerms;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden transition-colors duration-300">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      {/* Top Gradient */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

      <div className="w-full max-w-md glass-strong rounded-2xl p-8 relative z-10 shadow-2xl animate-scaleIn">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Kayıt Ol</h1>
          <p className="text-muted-foreground">Sivas Etkinlikleri dünyasına katılın</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg text-center animate-slideInDown flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Name Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground ml-1">Ad Soyad</label>
            <div className="relative group">
              <input
                type="text"
                placeholder="Adınız Soyadınız"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError('');
                }}
                onBlur={validateName}
                className={`w-full glass border rounded-xl px-4 py-3 pl-11 text-foreground placeholder-muted-foreground focus:outline-none transition-all ${nameError
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/30'
                  : 'border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/30'
                  }`}
              />
              <User className={`absolute left-3.5 top-3.5 w-5 h-5 transition-colors ${nameError ? 'text-red-500' : 'text-muted-foreground group-focus-within:text-primary'
                }`} />
            </div>
            {nameError && (
              <div className="flex items-center gap-2 text-red-400 text-xs mt-1 animate-slideInDown ml-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{nameError}</span>
              </div>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground ml-1">E-posta Adresi</label>
            <div className="relative group">
              <input
                type="email"
                placeholder="ornek@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                onBlur={validateEmail}
                className={`w-full glass border rounded-xl px-4 py-3 pl-11 text-foreground placeholder-muted-foreground focus:outline-none transition-all ${emailError
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/30'
                  : 'border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/30'
                  }`}
              />
              <Mail className={`absolute left-3.5 top-3.5 w-5 h-5 transition-colors ${emailError ? 'text-red-500' : 'text-muted-foreground group-focus-within:text-primary'
                }`} />
            </div>
            {emailError && (
              <div className="flex items-center gap-2 text-red-400 text-xs mt-1 animate-slideInDown ml-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{emailError}</span>
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground ml-1">Şifre</label>
            <div className="relative group">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                  if (confirmPassword && confirmPasswordError) validateConfirmPassword();
                }}
                onBlur={validatePassword}
                className={`w-full glass border rounded-xl px-4 py-3 pl-11 pr-11 text-foreground placeholder-muted-foreground focus:outline-none transition-all ${passwordError
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/30'
                  : 'border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/30'
                  }`}
              />
              <Lock className={`absolute left-3.5 top-3.5 w-5 h-5 transition-colors ${passwordError ? 'text-red-500' : 'text-muted-foreground group-focus-within:text-primary'
                }`} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-muted-foreground hover:text-primary transition-colors"
                aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password && !passwordError && (
              <div className="mt-2 ml-1">
                <div className="flex gap-1 mb-1">
                  <div className={`h-1 flex-1 rounded transition-colors ${passwordStrength >= 1 ? 'bg-red-500' : 'bg-muted'}`} />
                  <div className={`h-1 flex-1 rounded transition-colors ${passwordStrength >= 2 ? 'bg-yellow-500' : 'bg-muted'}`} />
                  <div className={`h-1 flex-1 rounded transition-colors ${passwordStrength >= 3 ? 'bg-green-500' : 'bg-muted'}`} />
                </div>
                <p className={`text-xs ${strengthColors[passwordStrength]}`}>
                  Şifre gücü: {strengthLabels[passwordStrength]}
                </p>
              </div>
            )}

            {passwordError && (
              <div className="flex items-center gap-2 text-red-400 text-xs mt-1 animate-slideInDown ml-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{passwordError}</span>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground ml-1">Şifre Tekrarı</label>
            <div className="relative group">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (confirmPasswordError) setConfirmPasswordError('');
                }}
                onBlur={validateConfirmPassword}
                className={`w-full glass border rounded-xl px-4 py-3 pl-11 pr-11 text-foreground placeholder-muted-foreground focus:outline-none transition-all ${confirmPasswordError
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/30'
                  : confirmPassword && !confirmPasswordError && confirmPassword === password
                    ? 'border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/30'
                    : 'border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/30'
                  }`}
              />
              <Lock className={`absolute left-3.5 top-3.5 w-5 h-5 transition-colors ${confirmPasswordError ? 'text-red-500'
                : confirmPassword && !confirmPasswordError && confirmPassword === password ? 'text-green-500'
                  : 'text-muted-foreground group-focus-within:text-primary'
                }`} />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3.5 text-muted-foreground hover:text-primary transition-colors"
                aria-label={showConfirmPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {confirmPasswordError && (
              <div className="flex items-center gap-2 text-red-400 text-xs mt-1 animate-slideInDown ml-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{confirmPasswordError}</span>
              </div>
            )}
            {confirmPassword && !confirmPasswordError && confirmPassword === password && (
              <div className="flex items-center gap-2 text-green-400 text-xs mt-1 animate-slideInDown ml-1">
                <Check className="w-3.5 h-3.5" />
                <span>Şifreler eşleşiyor</span>
              </div>
            )}
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3 mb-4">
            <div className="flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="w-4 h-4 border border-gray-600 rounded bg-zinc-800 focus:ring-3 focus:ring-yellow-500 text-yellow-500 cursor-pointer"
              />
            </div>
            <label htmlFor="terms" className="text-sm text-gray-400 select-none">
              <Link href="/uyelik-sozlesmesi" target="_blank" className="text-yellow-500 hover:underline">Üyelik Sözleşmesi</Link>'ni, <Link href="/kullanim-kosullari" target="_blank" className="text-yellow-500 hover:underline">Kullanım Koşulları</Link>'nı ve <Link href="/acik-riza-beyani" target="_blank" className="text-yellow-500 hover:underline">Açık Rıza Metni</Link>'ni okudum, onaylıyorum.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className={`w-full font-bold py-3.5 rounded-xl transition-all transform mt-4 flex items-center justify-center gap-2 group ${loading || !isFormValid
              ? 'opacity-50 cursor-not-allowed bg-primary text-black'
              : 'bg-primary hover:bg-primary-hover text-black shadow-glow hover:shadow-glow-lg hover:scale-[1.02]'
              }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Hesap oluşturuluyor...
              </>
            ) : (
              <>
                Hesap Oluştur
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-muted-foreground text-sm">
            Zaten hesabınız var mı?{' '}
            <Link href="/login" className="text-primary hover:text-primary-hover font-bold ml-1 transition-colors hover:underline">
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
