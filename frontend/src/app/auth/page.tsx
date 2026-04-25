'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, User, Mail, AtSign, ArrowRight, ShieldCheck, RefreshCw, Baby, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

function validate(formData: {
  fullName: string; phone: string; email: string; username: string; isMinor: boolean;
}, isLogin: boolean) {
  const errs: Record<string, string> = {};
  
  if (!isLogin) {
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
    else if (formData.fullName.trim().length < 2) errs.fullName = 'Name must be at least 2 characters';
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errs.email = 'Enter a valid email address';

    if (formData.username && !/^[a-zA-Z0-9_.-]{3,30}$/.test(formData.username))
      errs.username = 'Username: 3-30 chars, letters/numbers/._- only';
  }

  if (!formData.phone.trim()) errs.phone = 'Phone number is required';
  else if (!/^\+?[0-9]{7,15}$/.test(formData.phone.trim())) errs.phone = 'Enter a valid phone number (e.g. +1234567890)';

  return errs;
}

const Field = ({ icon: Icon, error, ...props }: any) => (
  <div>
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 pointer-events-none" />
      <input
        {...props}
        className={`crisis-input pl-12 ${error ? 'ring-2 ring-lifelink-red' : ''}`}
      />
    </div>
    {error && <p className="text-lifelink-red text-xs mt-1 pl-1 font-medium">{error}</p>}
  </div>
);

export default function AuthPage() {
  const [step, setStep] = useState(1);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: '', username: '', isMinor: false, otpCode: '',
  });
  const { login } = useAuth();

  const set = (field: string, value: string | boolean) => {
    setFormData((p) => ({ ...p, [field]: value }));
    setFieldErrors((p) => { const n = { ...p }; delete n[field]; return n; });
    setServerError('');
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(formData, isLogin);
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setLoading(true);
    setServerError('');
    try {
      await api.post('/api/auth/request-otp', {
        phone: formData.phone.trim(),
        ...(isLogin ? {} : {
          fullName: formData.fullName.trim(),
          email: formData.email.trim() || null,
          username: formData.username.trim() || null,
          isMinor: formData.isMinor,
        })
      });
      setStep(2);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to send OTP. Please try again.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.otpCode || formData.otpCode.length !== 6) {
      setFieldErrors({ otpCode: 'Enter the 6-digit OTP code' }); return;
    }
    if (!/^\d{6}$/.test(formData.otpCode)) {
      setFieldErrors({ otpCode: 'OTP must be 6 digits only' }); return;
    }
    setLoading(true);
    setServerError('');
    try {
      const res = await api.post('/api/auth/verify-otp', {
        phone: formData.phone.trim(),
        otpCode: formData.otpCode,
      });
      const { token, userId } = res.data;
      const id = userId || JSON.parse(atob(token.split('.')[1])).sub;
      login(token, id);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid OTP. Please try again.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-2 p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
                  <button 
                    onClick={() => { setIsLogin(true); setServerError(''); setFieldErrors({}); }}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${isLogin ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white/60'}`}
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => { setIsLogin(false); setServerError(''); setFieldErrors({}); }}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${!isLogin ? 'bg-lifelink-red text-white shadow-lg' : 'text-white/40 hover:text-white/60'}`}
                  >
                    Signup
                  </button>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-1">
                  {isLogin ? 'Welcome Back' : 'Create Global ID'}
                </h2>
                <p className="text-white/50 text-sm">
                  {isLogin ? 'Sign in with your phone number code.' : 'Enter your identification details to get started.'}
                </p>
              </div>

              <form onSubmit={handleRequestOtp} className="flex flex-col gap-3" noValidate>
                {!isLogin && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
                    <Field icon={User} type="text" placeholder="Full Name *" value={formData.fullName}
                      onChange={(e: any) => set('fullName', e.target.value)} error={fieldErrors.fullName} />
                  </motion.div>
                )}

                <Field icon={Phone} type="tel" placeholder="Phone * (e.g. +1234567890)" value={formData.phone}
                  onChange={(e: any) => set('phone', e.target.value)} error={fieldErrors.phone}
                  inputMode="tel" />

                {!isLogin && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
                    <Field icon={Mail} type="email" placeholder="Email (optional)" value={formData.email}
                      onChange={(e: any) => set('email', e.target.value)} error={fieldErrors.email}
                      inputMode="email" />

                    <Field icon={AtSign} type="text" placeholder="Username (optional)" value={formData.username}
                      onChange={(e: any) => set('username', e.target.value)} error={fieldErrors.username}
                      autoCapitalize="none" />

                    <button type="button" onClick={() => set('isMinor', !formData.isMinor)}
                      className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl border transition-all text-left min-h-[56px] ${
                        formData.isMinor ? 'border-lifelink-red bg-lifelink-red/10 text-white' : 'border-white/10 bg-white/5 text-white/40'
                      }`}>
                      <Baby className={`w-5 h-5 shrink-0 ${formData.isMinor ? 'text-lifelink-red' : ''}`} />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">Minor (under 18)</span>
                        <span className="text-xs text-white/30">Toggle if this profile is for a minor</span>
                      </div>
                      <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                        formData.isMinor ? 'border-lifelink-red bg-lifelink-red' : 'border-white/20'
                      }`}>
                        {formData.isMinor && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </button>
                  </motion.div>
                )}

                {serverError && <p className="text-lifelink-red text-sm font-medium bg-lifelink-red/10 px-4 py-3 rounded-xl">{serverError}</p>}

                <button type="submit" disabled={loading} className="btn-primary mt-1 min-h-[52px]">
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <>Send OTP <ArrowRight className="w-5 h-5" /></>}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-5">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-1">Verify Identity</h2>
                <p className="text-white/50 text-sm">Enter the 6-digit code sent to <span className="text-white font-mono">{formData.phone}</span></p>
              </div>

              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-3" noValidate>
                <div>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="000000"
                      autoFocus
                      className={`crisis-input pl-12 tracking-[.5em] text-xl font-bold ${fieldErrors.otpCode ? 'ring-2 ring-lifelink-red' : ''}`}
                      value={formData.otpCode}
                      onChange={(e) => set('otpCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                    />
                  </div>
                  {fieldErrors.otpCode && <p className="text-lifelink-red text-xs mt-1 pl-1 font-medium">{fieldErrors.otpCode}</p>}
                </div>

                {serverError && <p className="text-lifelink-red text-sm font-medium bg-lifelink-red/10 px-4 py-3 rounded-xl">{serverError}</p>}

                <button type="submit" disabled={loading} className="btn-primary mt-1 min-h-[52px]">
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <>Verify & Continue <ArrowRight className="w-5 h-5" /></>}
                </button>

                <button type="button" onClick={() => { setStep(1); setServerError(''); setFieldErrors({}); }}
                  className="text-white/30 text-sm hover:text-white transition-colors py-3">
                  Change details?
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
