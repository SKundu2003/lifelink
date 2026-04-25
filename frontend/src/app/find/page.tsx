'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, QrCode, ArrowRight, ArrowLeft, Hash, ShieldAlert } from 'lucide-react';
import dynamic from 'next/dynamic';

const QrScanner = dynamic(() => import('@/components/QrScanner'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-lifelink-red border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export default function FindPage() {
  const [tab, setTab] = useState<'code' | 'scan'>('code');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const VALID_CODE = /^[A-Z0-9]{2}-[A-Z0-9]{3,10}$/;

  const navigate = (raw: string) => {
    const trimmed = raw.trim().toUpperCase();
    if (!trimmed) return;
    router.push(`/v/${trimmed}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError('Please enter a LifeLink code');
      return;
    }
    if (!VALID_CODE.test(trimmed)) {
      setError('Invalid format — expected LL-XXXXX (e.g. LL-OE5MF)');
      return;
    }
    navigate(trimmed);
  };

  const handleScan = (result: string) => {
    // Handle URLs like https://lifelink.id/LL-XXXXX or /v/LL-XXXXX
    const urlMatch = result.match(/\/v\/([^/?#\s]+)/);
    if (urlMatch) {
      navigate(urlMatch[1]);
      return;
    }
    // Handle bare codes like LL-OE5MF
    const codeMatch = result.match(/^[A-Z0-9]{2}-[A-Z0-9]+$/i);
    if (codeMatch) {
      navigate(result);
      return;
    }
    setError('Not a valid LifeLink QR code.');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <div className="w-full max-w-md">

        {/* Back */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-10 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-lifelink-red/10 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-lifelink-red" />
          </div>
          <h1 className="text-3xl font-black">Find a LifeLink</h1>
        </div>
        <p className="text-white/40 text-sm mb-8 pl-[52px]">
          Enter a unique code or scan a QR to view an emergency profile.
        </p>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 bg-white/5 rounded-2xl">
          {(['code', 'scan'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                tab === t
                  ? 'bg-lifelink-red text-white shadow-lg'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {t === 'code' ? <Hash className="w-4 h-4" /> : <QrCode className="w-4 h-4" />}
              {t === 'code' ? 'Enter Code' : 'Scan QR'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {tab === 'code' ? (
            <motion.div
              key="code"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.18 }}
            >
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type="text"
                    placeholder="e.g. LL-OE5MF"
                    autoFocus
                    className="crisis-input pl-12 font-mono uppercase tracking-[.25em]"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      setError('');
                    }}
                  />
                </div>

                {error && (
                  <p className="text-lifelink-red text-sm font-medium bg-lifelink-red/10 px-4 py-3 rounded-xl">{error}</p>
                )}

                <button type="submit" className="btn-primary">
                  Find User
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="scan"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col gap-4"
            >
              <p className="text-white/40 text-sm text-center">
                Point your camera at a LifeLink QR code
              </p>
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                <QrScanner onScan={handleScan} />
              </div>
              {error && (
                <p className="text-lifelink-red text-sm font-medium bg-lifelink-red/10 px-4 py-3 rounded-xl text-center">{error}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
