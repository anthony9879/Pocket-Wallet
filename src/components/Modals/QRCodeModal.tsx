import React, { useState } from 'react';
import { X, QrCode, Scan, Copy, Check, Sparkles, Shield, Camera } from 'lucide-react';
import { UserProfile } from '../../types/wallet';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onScanSuccess: (mockRecipient: string, mockAmount: number) => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  user,
  onScanSuccess,
}) => {
  const [tab, setTab] = useState<'my_code' | 'scanner'>('my_code');
  const [copied, setCopied] = useState(false);
  const [scanning, setScanning] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`pocketpay://pay?user=${user.handle.replace('@', '')}&id=${user.pocketId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateScan = (recipient: string, amount: number) => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      onScanSuccess(recipient, amount);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab switch */}
        <div className="flex bg-slate-800/80 p-1 rounded-2xl mb-5 w-fit border border-slate-700/60">
          <button
            onClick={() => setTab('my_code')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              tab === 'my_code' ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" /> My QR Code
          </button>
          <button
            onClick={() => setTab('scanner')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              tab === 'scanner' ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scan className="w-3.5 h-3.5" /> Scan to Pay
          </button>
        </div>

        {tab === 'my_code' ? (
          <div className="flex flex-col items-center text-center space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white">Receive Instantly</h3>
              <p className="text-xs text-slate-400">Anyone with PocketPay or a camera can scan to transfer</p>
            </div>

            {/* QR Code Container */}
            <div className="p-4 bg-white rounded-3xl shadow-xl shadow-emerald-500/10 relative group">
              <div className="w-52 h-52 bg-white flex flex-col items-center justify-center p-2 relative">
                {/* Visual SVG QR representation */}
                <svg viewBox="0 0 100 100" className="w-full h-full fill-slate-950">
                  {/* Top-left position marker */}
                  <rect x="5" y="5" width="28" height="28" rx="4" />
                  <rect x="9" y="9" width="20" height="20" fill="white" rx="2" />
                  <rect x="13" y="13" width="12" height="12" rx="2" />
                  {/* Top-right position marker */}
                  <rect x="67" y="5" width="28" height="28" rx="4" />
                  <rect x="71" y="9" width="20" height="20" fill="white" rx="2" />
                  <rect x="75" y="13" width="12" height="12" rx="2" />
                  {/* Bottom-left position marker */}
                  <rect x="5" y="67" width="28" height="28" rx="4" />
                  <rect x="9" y="71" width="20" height="20" fill="white" rx="2" />
                  <rect x="13" y="75" width="12" height="12" rx="2" />

                  {/* QR Grid pattern blocks */}
                  <rect x="38" y="10" width="5" height="5" />
                  <rect x="48" y="10" width="5" height="5" />
                  <rect x="58" y="10" width="5" height="5" />
                  <rect x="38" y="20" width="10" height="5" />
                  <rect x="53" y="20" width="5" height="5" />
                  
                  <rect x="10" y="38" width="5" height="10" />
                  <rect x="20" y="43" width="10" height="5" />
                  <rect x="35" y="35" width="30" height="30" fill="none" />
                  
                  {/* Center PocketPay badge */}
                  <circle cx="50" cy="50" r="14" fill="#059669" />
                  <path d="M44 46 L49 51 L56 44" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />

                  <rect x="70" y="38" width="8" height="8" />
                  <rect x="83" y="42" width="6" height="6" />
                  <rect x="38" y="70" width="12" height="6" />
                  <rect x="55" y="72" width="8" height="8" />
                  <rect x="68" y="68" width="10" height="5" />
                  <rect x="82" y="78" width="8" height="8" />
                  <rect x="42" y="84" width="8" height="8" />
                  <rect x="58" y="88" width="10" height="6" />
                </svg>
              </div>

              {/* User badge */}
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-center gap-2">
                <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover ring-1 ring-emerald-500" />
                <span className="text-xs font-bold text-slate-800">{user.handle}</span>
              </div>
            </div>

            <div className="bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700/60 w-full flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Pocket ID</span>
                <span className="text-sm font-mono font-bold text-white tracking-wider">{user.pocketId}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-medium transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Payments go directly to your default primary balance</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-bold text-white">Scan PocketPay QR</h3>
              <p className="text-xs text-slate-400">Point at a friend or merchant's QR to pay instantly</p>
            </div>

            {/* Scanner Viewport Simulation */}
            <div className="relative w-full h-56 bg-slate-950 rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center overflow-hidden">
              {/* Animated scan bar */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse top-1/2 -translate-y-1/2" />
              
              {/* Corner brackets */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-emerald-400" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-emerald-400" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-emerald-400" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-emerald-400" />

              <Camera className="w-8 h-8 text-slate-600 mb-2" />
              <span className="text-xs text-slate-400 font-medium">
                {scanning ? 'Decoding QR Code...' : 'Scanning for PocketPay Code...'}
              </span>
            </div>

            {/* Quick Demo Scan Triggers */}
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-2">
                Simulate Nearby Merchant / Friend Scan:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSimulateScan('Blue Bottle Coffee', 6.75)}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors"
                >
                  <div className="text-xs font-semibold text-white">☕ Blue Bottle Coffee</div>
                  <div className="text-[11px] text-emerald-400 font-bold">$6.75</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateScan('Marcus Chen', 35.00)}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors"
                >
                  <div className="text-xs font-semibold text-white">👤 Marcus Chen (@marcus_c)</div>
                  <div className="text-[11px] text-emerald-400 font-bold">$35.00</div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
