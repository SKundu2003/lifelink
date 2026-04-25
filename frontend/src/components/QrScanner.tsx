'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { QrCode, CameraOff } from 'lucide-react';

interface Props {
  onScan: (result: string) => void;
}

export default function QrScanner({ onScan }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameraError, setCameraError] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const id = 'qr-scanner-view';
    const scanner = new Html5Qrcode(id);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded) => {
          onScan(decoded);
        },
        undefined
      )
      .then(() => setStarted(true))
      .catch(() => setCameraError(true));

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  if (cameraError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-white/30 p-8">
        <CameraOff className="w-10 h-10" />
        <p className="text-sm text-center">Camera access denied or unavailable.<br />Use the code input tab instead.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {!started && (
        <div className="absolute inset-0 flex items-center justify-center h-64 z-10">
          <div className="w-6 h-6 border-2 border-lifelink-red border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div id="qr-scanner-view" className="w-full" />
    </div>
  );
}
