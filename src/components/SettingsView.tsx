import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { 
  User, 
  Shield, 
  Bell, 
  Globe, 
  Key, 
  RotateCcw, 
  Check, 
  CheckCircle2, 
  AlertTriangle,
  Smartphone
} from 'lucide-react';
import { Currency } from '../types/wallet';
import { UserAvatar } from './UserAvatar';

interface SettingsViewProps {
  onClose?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onClose }) => {
  const { user, updateUser, currency, setCurrency, resetAllData, addToast } = useWallet();

  const [name, setName] = useState(user.name);
  const [handle, setHandle] = useState(user.handle);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [pinCode, setPinCode] = useState(user.pinCode);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  React.useEffect(() => {
    setName(user.name);
    setHandle(user.handle);
    setEmail(user.email);
    setPhone(user.phone);
    setPinCode(user.pinCode);
  }, [user]);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name,
      handle,
      email,
      phone,
      pinCode,
    });
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header with Back to Wallet */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Profile & Settings</h2>
          <p className="text-sm text-slate-500">Manage personal details, authentication PIN, and preferences</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <span>← Back to Wallet</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column Profile Summary */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center">
            <div className="relative inline-block mx-auto">
              <UserAvatar
                name={user.name}
                avatar={user.avatar}
                size="xl"
                className="w-24 h-24 text-2xl ring-4 ring-emerald-500/20"
              />
              <span className="absolute bottom-0 right-0 p-1.5 bg-emerald-600 text-white rounded-full shadow-sm">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>

            <h3 className="font-bold text-slate-900 text-lg mt-3">{user.name}</h3>
            <p className="text-xs font-mono text-emerald-600 font-semibold">{user.handle}</p>

            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>{user.tier} Verified Member</span>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 text-left space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Daily Transfer Limit:</span>
                <span className="font-semibold text-slate-900">${user.dailyTransferLimit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Monthly Limit:</span>
                <span className="font-semibold text-slate-900">${user.monthlyTransferLimit.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Reset Demo Data */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-900 text-sm">Demo Data Reset</h4>
            <p className="text-xs text-slate-500 mt-1">
              Reset transactions, virtual cards, and wallet balance to initial demo state.
            </p>
            <button
              onClick={resetAllData}
              className="mt-4 w-full py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Demo Wallet
            </button>
          </div>
        </div>

        {/* Right Column Profile and Security Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Details Form */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              Personal Information
            </h3>

            <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-500 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-500 uppercase mb-1">PocketPay Handle</label>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-500 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-500 uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-500 uppercase mb-1">
                  4-Digit Security PIN (used to reveal CVV and authorize transfers)
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-36 px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-sm tracking-widest focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>

          {/* Preferences & Security Toggles */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              Regional & Display Currency
            </h3>

            <div>
              <label className="block font-semibold text-slate-500 uppercase text-xs mb-2">
                Active Currency Format
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['USD', 'EUR', 'GBP', 'JPY'] as Currency[]).map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setCurrency(curr)}
                    className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      currency === curr
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 text-xs">Biometric Fast Authorization</div>
                  <div className="text-[11px] text-slate-500">Enable TouchID / FaceID for instant payments</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !biometricsEnabled;
                    setBiometricsEnabled(next);
                    addToast(`Biometric authentication ${next ? 'enabled' : 'disabled'}`, 'info');
                  }}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    biometricsEnabled ? 'bg-emerald-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      biometricsEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 text-xs">Real-Time Push Notifications</div>
                  <div className="text-[11px] text-slate-500">Alert me when transfers, deposits, or card charges occur</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !notificationsEnabled;
                    setNotificationsEnabled(next);
                    addToast(`Push notifications ${next ? 'enabled' : 'disabled'}`, 'info');
                  }}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notificationsEnabled ? 'bg-emerald-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      notificationsEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 text-xs">Two-Factor Authentication (2FA)</div>
                  <div className="text-[11px] text-slate-500">Require SMS or Authenticator verification for new cards</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !twoFactorEnabled;
                    setTwoFactorEnabled(next);
                    addToast(`Two-factor authentication ${next ? 'enabled' : 'disabled'}`, 'info');
                  }}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    twoFactorEnabled ? 'bg-emerald-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      twoFactorEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
