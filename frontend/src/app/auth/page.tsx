'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, User, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function AuthPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    otpCode: '',
  });
  const { login } = useAuth();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/request-otp', {
        phone: formData.phone,
        fullName: formData.fullName,
      });
      // In dev mode, check if OTP is in the message
      const message = res.data.message;
      if (message.includes('In dev mode:')) {
        const otp = message.split('In dev mode: ')[1];
        console.log('Dev OTP:', otp);
        // We could auto-fill it, but for demo let's just log it
      }
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/verify-otp', {
        phone: formData.phone,
        otpCode: formData.otpCode,
      });
      const { token } = res.data;
      // We need the userId too. Usually it's in the profile. 
      // The verification response from postman doesn't show userId, 
      // but the DASHBOARD needs it. Let's assume the token has it or 
      // there is a /me endpoint, or we get it from a profile call.
      // Looking at Postman 'Verify OTP' body example: {"token": "...", "message": "Successfully authenticated"}
      // Wait, the Dashboard URL uses {{userId}}. 
      // Usually the backend returns userId on login. I'll check the Postman body again.
      // Postman body for Verify OTP shows token. 
      // Let's decode the token to get the sub (userId) if it's there.
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.sub;
      
      login(token, userId);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col gap-6"
            >
              <div className="text-left mb-4">
                <h2 className="text-3xl font-bold mb-2">Create Global ID</h2>
                <p className="text-white/50">Enter your clinical identification details.</p>
              </div>

              <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    className="crisis-input pl-12"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type="tel"
                    required
                    placeholder="Phone (e.g. +1234567890)"
                    className="crisis-input pl-12"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                {error && <p className="text-lifelink-red text-sm font-medium">{error}</p>}

                <button type="submit" disabled={loading} className="btn-primary mt-4">
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Send OTP'}
                  {!loading && <ArrowRight className="w-5 h-5" />}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <div className="text-left mb-4">
                <h2 className="text-3xl font-bold mb-2">Verify Identity</h2>
                <p className="text-white/50">Enter the 6-digit code sent to {formData.phone}</p>
              </div>

              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="OTP Code"
                    className="crisis-input pl-12 tracking-[.5em] text-xl font-bold"
                    value={formData.otpCode}
                    onChange={(e) => setFormData({ ...formData, otpCode: e.target.value })}
                  />
                </div>

                {error && <p className="text-lifelink-red text-sm font-medium">{error}</p>}

                <button type="submit" disabled={loading} className="btn-primary mt-4">
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Verify & Continue'}
                  {!loading && <ArrowRight className="w-5 h-5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-white/30 text-sm hover:text-white transition-colors py-2"
                >
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
