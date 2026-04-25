'use client';

import { use } from 'react';
import { useState, useEffect } from 'react';
import { 
  ShieldAlert, User, Phone, Info, Heart, 
  MapPin, Activity, AlertCircle, RefreshCw 
} from 'lucide-react';
import api from '@/lib/api';
import { motion } from 'framer-motion';

export default function DiscoveryPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDiscovery();
  }, [code]);

  const fetchDiscovery = async () => {
    try {
      const res = await api.get(`/api/discovery/${code}`);
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.status === 404 ? 'Profile Not Found' : 'Discovery Error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-lifelink-slate">
        <RefreshCw className="w-8 h-8 animate-spin text-lifelink-red" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 text-center bg-lifelink-slate">
        <AlertCircle size={48} className="text-lifelink-red mb-4" />
        <h2 className="text-2xl font-bold mb-2">{error}</h2>
        <p className="text-white/40 max-w-xs">The requested LifeLink identity code is either invalid or inactive.</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="btn-secondary mt-8 w-full max-w-xs"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lifelink-slate flex flex-col items-center px-4 sm:px-6 py-8 sm:py-12">
      {/* Critical Alert Header */}
      <div className="w-full max-w-md bg-lifelink-red p-4 rounded-t-3xl flex items-center gap-3">
        <ShieldAlert className="text-white animate-pulse shrink-0" size={22} />
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 leading-none">Emergency Identity</span>
          <span className="text-sm font-bold text-white uppercase leading-tight">Public Protocol Active</span>
        </div>
      </div>

      <div className="w-full max-w-md crisis-card rounded-t-none border-t-0 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col gap-6 sm:gap-8">
          {/* Main ID Section */}
          <section>
            <div className="flex items-center gap-2 text-white/40 uppercase tracking-tighter font-bold text-xs mb-3">
              <User size={14} />
              Full Name
            </div>
            <h1 className="text-3xl sm:text-4xl font-black break-words">{data.fullName}</h1>
            <div className="mt-4 flex items-center gap-2 text-lifelink-red bg-lifelink-red/5 w-fit px-3 py-1 rounded-full border border-lifelink-red/20 font-mono font-bold">
              {data.uniqueCode}
            </div>
          </section>

          {/* Contact Section */}
          <section className="p-4 bg-lifelink-slate-lighter rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 text-white/40 uppercase tracking-tighter font-bold text-xs mb-2">
              <Phone size={14} />
              Primary Contact (Masked)
            </div>
            <p className="text-xl sm:text-2xl font-mono tracking-wider break-all">{data.phone}</p>
            <p className="text-[10px] text-white/20 mt-1 italic uppercase">Identification purposes only</p>
          </section>

          {/* Dynamic Public Fields */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-white/40 uppercase tracking-tighter font-bold text-xs">
              <Info size={14} className="text-lifelink-red" />
              Public Clinical Data
            </div>

            <div className="grid gap-3">
              {Object.keys(data.dynamicInfo || {}).length === 0 ? (
                <div className="py-8 text-center bg-white/5 rounded-2xl text-white/20 text-sm italic">
                  No public clinical identifiers available.
                </div>
              ) : (
                Object.entries(data.dynamicInfo).map(([key, value]) => (
                  <div key={key} className="flex flex-col gap-1 p-4 bg-white/5 rounded-2xl border-l-4 border-lifelink-red">
                    <span className="text-[10px] uppercase font-black text-white/40 tracking-widest">{key}</span>
                    <span className="text-lg sm:text-xl font-bold break-words">{value as string}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          <footer className="mt-4 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-white/20 text-[10px] font-bold uppercase tracking-widest">
              Generated by LifeLink Digital Hub
            </div>
            <Heart size={20} className="text-lifelink-red/20" />
          </footer>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-white/20 text-xs mb-4">LifeLink v0 Protocol • Clinical Vanguard Design System</p>
        <button 
          onClick={() => window.print()}
          className="text-lifelink-red font-bold uppercase text-xs tracking-widest hover:underline"
        >
          Generate Identity Summary (PDF)
        </button>
      </div>
    </div>
  );
}
