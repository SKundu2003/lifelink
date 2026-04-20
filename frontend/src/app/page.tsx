'use client';

import Link from 'next/link';
import { Shield, Search, UserPlus, HeartPulse } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-2xl bg-lifelink-red/10 animate-pulse">
          <HeartPulse className="w-12 h-12 text-lifelink-red" />
        </div>
        <h1 className="text-5xl font-black tracking-tight mb-4 uppercase">
          LifeLink
        </h1>
        <p className="text-xl text-lifelink-red font-medium tracking-widest uppercase mb-8">
          Crisis-Ready Identity
        </p>
        <p className="text-lg text-white/60 max-w-xs mx-auto mb-12">
          Your digital lifesaver. Instant access to critical identity info when every second counts.
        </p>
      </motion.div>

      <div className="flex flex-col w-full max-w-sm gap-4">
        <Link href="/auth" className="btn-primary w-full text-lg">
          <UserPlus className="w-5 h-5" />
          Create My LifeLink
        </Link>
        <button className="btn-secondary w-full text-lg">
          <Search className="w-5 h-5" />
          Find/Scan a User
        </button>
      </div>

      <div className="mt-auto pt-12 flex items-center gap-2 text-white/30 text-sm">
        <Shield className="w-4 h-4" />
        SECURE & ENCRYPTED
      </div>
    </div>
  );
}
