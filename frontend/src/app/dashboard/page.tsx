'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, Plus, Save, RefreshCw, X,
  Download, AlertTriangle, CheckCircle, Info, ScanLine
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import api from '@/lib/api';
import LifeLinkCard from '@/components/LifeLinkCard';
import DynamicFieldInput from '@/components/DynamicFieldInput';

export default function DashboardPage() {
  const { userId, logout } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [dynamicFields, setDynamicFields] = useState<{ key: string; value: string; isPublic: boolean }[]>([]);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrBlob, setQrBlob] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setIsMounted(true);
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/api/users/${userId}`);
      const data = res.data;
      setProfile(data);
      
      // Convert dynamicInfo object to array
      const fields = Object.entries(data.dynamicInfo || {}).map(([key, value]) => ({
        key,
        value: value as string,
        isPublic: (data.publicFields || []).includes(key),
      }));
      setDynamicFields(fields);
    } catch (err) {
      showToast('Error loading profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addField = () => {
    setDynamicFields([...dynamicFields, { key: '', value: '', isPublic: false }]);
  };

  const removeField = (index: number) => {
    const newFields = [...dynamicFields];
    newFields.splice(index, 1);
    setDynamicFields(newFields);
  };

  const updateField = (index: number, key: string, value: string, isPublic: boolean) => {
    const newFields = [...dynamicFields];
    newFields[index] = { key, value, isPublic };
    setDynamicFields(newFields);
  };

  const handleSave = async () => {
    // Validate: no empty keys
    const emptyKey = dynamicFields.some((f) => !f.key.trim());
    if (emptyKey) { showToast('Each field must have a label name', 'error'); return; }

    // Validate: no duplicate keys
    const keys = dynamicFields.map((f) => f.key.trim().toLowerCase());
    const hasDupe = keys.length !== new Set(keys).size;
    if (hasDupe) { showToast('Duplicate field labels are not allowed', 'error'); return; }

    setSaving(true);
    try {
      const dynamicInfo = dynamicFields.reduce((acc, field) => {
        if (field.key.trim()) acc[field.key.trim()] = field.value;
        return acc;
      }, {} as Record<string, string>);

      const publicFields = dynamicFields
        .filter((f) => f.isPublic && f.key.trim())
        .map((f) => f.key.trim());

      await api.patch(`/api/users/${userId}/meta-info`, {
        dynamicInfo,
        publicFields,
      });
      showToast('Profile updated', 'success');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to sync data';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const fetchQrCode = async () => {
    setShowQrModal(true);
    if (qrBlob) return;
    try {
      const res = await api.get(`/api/users/${userId}/qr-code`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      setQrBlob(url);
    } catch (err) {
      showToast('Failed to load QR Code', 'error');
    }
  };

  if (!isMounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-lifelink-red" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-36">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 sm:mb-10 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 shrink-0 bg-lifelink-red rounded flex items-center justify-center font-black italic text-sm">LL</div>
          <span className="font-bold tracking-widest text-xs sm:text-sm text-white/50 truncate">LIFELINK</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/find"
            className="flex items-center gap-2 text-xs font-bold text-lifelink-red bg-lifelink-red/10 px-3 py-2 rounded-full hover:bg-lifelink-red/20 transition-all uppercase"
          >
            <ScanLine size={14} />
            <span className="hidden xs:inline">Find / Scan</span>
            <span className="xs:hidden">Scan</span>
          </Link>
          <button
            onClick={logout}
            className="p-2.5 text-white/40 hover:text-white transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Profile Card */}
      <section className="mb-12">
        <LifeLinkCard 
          name={profile?.fullName || 'User'}
          phone={profile?.phone || 'N/A'}
          uniqueCode={profile?.uniqueCode || 'LL-000000'}
          onShowQR={fetchQrCode}
        />
      </section>

      {/* Dynamic Fields Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/40 uppercase tracking-tighter font-bold text-xs">
            <Info size={14} className="text-lifelink-red" />
            Dynamic Clinical Identity
          </div>
          <button 
            onClick={addField}
            className="flex items-center gap-2 text-xs font-bold text-lifelink-red bg-lifelink-red/10 px-3 py-2 rounded-full hover:bg-lifelink-red/20 transition-all uppercase"
          >
            <Plus size={14} />
            Add Field
          </button>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {dynamicFields.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl text-white/20"
              >
                No dynamic fields added. 
              </motion.div>
            ) : (
              dynamicFields.map((field, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <DynamicFieldInput 
                    fieldKey={field.key}
                    fieldValue={field.value}
                    isPublic={field.isPublic}
                    onUpdate={(key, value, isPublic) => updateField(index, key, value, isPublic)}
                    onRemove={() => removeField(index)}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Save Button Sidebar/Footer (Floating Fixed Mobile) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-sm px-6 z-40">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full shadow-[0_10px_30px_rgba(225,29,72,0.4)] relative overflow-hidden"
        >
          {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          <span>{saving ? 'Syncing...' : 'Save & Secure Changes'}</span>
        </button>
      </div>

      {/* QR Modal */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQrModal(false)}
              className="absolute inset-0 bg-lifelink-slate/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xs crisis-card bg-white p-8 overflow-hidden rounded-3xl"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-lifelink-red" />
              <div className="flex flex-col items-center gap-6">
                <div className="text-center">
                  <h4 className="text-lifelink-slate font-black text-xl">Universal QR Code</h4>
                  <p className="text-lifelink-slate/40 text-xs font-bold uppercase tracking-widest mt-1">LifeLink Digital Protocol</p>
                </div>
                
                <div className="relative p-2 bg-white border-2 border-lifelink-slate/5 rounded-2xl">
                  {qrBlob ? (
                    <Image src={qrBlob} alt="QR Code" width={192} height={192} className="w-48 h-48" />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-lifelink-red">
                      <RefreshCw className="w-8 h-8 animate-spin" />
                    </div>
                  )}
                </div>

                <div className="w-full space-y-3">
                  <button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = qrBlob!;
                      link.download = `lifelink-${profile?.uniqueCode}.png`;
                      link.click();
                    }}
                    disabled={!qrBlob}
                    className="w-full flex items-center justify-center gap-2 bg-lifelink-slate text-white py-3 rounded-xl font-bold transition-all active:scale-95"
                  >
                    <Download size={18} />
                    Download PNG
                  </button>
                  <button 
                    onClick={() => setShowQrModal(false)}
                    className="w-full py-3 text-lifelink-slate/40 font-bold uppercase text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-2xl glass ${
              toast.type === 'success' ? 'border-green-500/50' : 'border-lifelink-red/50'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle className="text-green-500" /> : <AlertTriangle className="text-lifelink-red" />}
            <span className="font-bold text-sm">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
