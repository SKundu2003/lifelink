'use client';

import { QrCode, User, Phone, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface LifeLinkCardProps {
  name: string;
  phone: string;
  uniqueCode: string;
  onShowQR: () => void;
}

export default function LifeLinkCard({ name, phone, uniqueCode, onShowQR }: LifeLinkCardProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(uniqueCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden crisis-card bg-gradient-to-br from-lifelink-slate-light to-lifelink-slate shadow-2xl">
      {/* Aesthetic Background Pattern */}
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
        <HeartPulse size={200} className="text-white" />
      </div>

      <div className="flex flex-col gap-6 relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-white/40 uppercase tracking-tighter font-bold text-xs mb-1">
              <User size={12} />
              Identity Owner
            </div>
            <h3 className="text-2xl font-black">{name}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-lifelink-red/10 flex items-center justify-center text-lifelink-red border border-lifelink-red/20 shadow-[0_0_15px_rgba(225,29,72,0.2)]">
            <ShieldCheck size={28} />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-white/40 uppercase tracking-tighter font-bold text-xs mb-1">
              <Phone size={12} />
              Verified Phone
            </div>
            <p className="font-mono text-lg">{phone}</p>
          </div>
        </div>

        <div className="mt-2 space-y-3">
          <div className="flex items-center gap-2 text-white/40 uppercase tracking-tighter font-bold text-xs">
            Global Identity Code
          </div>
          <div className="flex items-center gap-2">
            <div 
              onClick={copyCode}
              className="flex-1 flex items-center justify-between bg-black/40 px-4 py-4 rounded-xl border border-white/5 cursor-pointer active:bg-black/60 transition-all"
            >
              <span className="font-mono text-2xl font-black tracking-widest text-lifelink-red">
                {uniqueCode}
              </span>
              {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} className="text-white/20" />}
            </div>
            <button 
              onClick={onShowQR}
              className="p-4 bg-lifelink-red rounded-xl shadow-lg active:scale-95 transition-all text-white border border-white/10"
            >
              <QrCode size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Internal icons helper for the gradient
function HeartPulse({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
    </svg>
  );
}

function ShieldCheck({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
