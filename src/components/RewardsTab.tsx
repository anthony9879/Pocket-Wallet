import React, { useState } from 'react';
import { PerkOffer, UserProfile } from '../types/wallet';
import { 
  Sparkles, 
  Gift, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Copy, 
  Check, 
  Tag, 
  Share2 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RewardsTabProps {
  user: UserProfile;
  perks: PerkOffer[];
  onTogglePerk: (perkId: string) => void;
  onRedeemCashback: (amount: number) => void;
}

export const RewardsTab: React.FC<RewardsTabProps> = ({
  user,
  perks,
  onTogglePerk,
  onRedeemCashback,
}) => {
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [redeemedNotice, setRedeemedNotice] = useState(false);

  const referralLink = `https://pocketpay.me/join/${user.handle.replace('@', '')}`;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  const handleRedeem = () => {
    if (user.cashbackPoints <= 0) return;

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    onRedeemCashback(user.cashbackPoints);
    setRedeemedNotice(true);
    setTimeout(() => setRedeemedNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Hero Cashback Vault */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5" /> Pocket Perks & Cashback
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                ${user.cashbackPoints.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400 font-semibold uppercase">Claimable Cash</span>
            </div>
            <p className="text-xs text-slate-300 max-w-md">
              Instant cashback automatically credited whenever you swipe your Pocket Card or pay with PocketPay at partner stores.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRedeem}
              disabled={user.cashbackPoints <= 0}
              className={`py-3.5 px-6 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
                user.cashbackPoints > 0
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-amber-500/20 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{redeemedNotice ? 'Transferred to Wallet!' : 'Redeem to Wallet Balance'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Merchant Boosters */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div>
          <h3 className="font-bold text-base text-white">Merchant Boosters</h3>
          <p className="text-xs text-slate-400">Activate boosts before paying with your Pocket Card for instant cashback bonuses</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {perks.map((perk) => (
            <div
              key={perk.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                perk.isActive
                  ? 'bg-slate-800/80 border-amber-500/40 shadow-sm'
                  : 'bg-slate-900 border-slate-800 opacity-80 hover:opacity-100'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-2 rounded-xl bg-slate-800 border border-slate-700">
                      {perk.logo}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-white">{perk.merchant}</h4>
                      <span className="text-[11px] text-slate-400">{perk.category}</span>
                    </div>
                  </div>
                  <span className="text-sm font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                    {perk.cashbackPercent}% Back
                  </span>
                </div>

                <p className="text-xs text-slate-300">{perk.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">{perk.expiresIn}</span>
                <button
                  type="button"
                  onClick={() => onTogglePerk(perk.id)}
                  className={`px-3 py-1 rounded-xl font-bold text-xs transition-all ${
                    perk.isActive
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
                  }`}
                >
                  {perk.isActive ? 'Boost Active' : 'Activate Boost'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Refer a Friend Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base text-white">Give $15, Get $15 Referral Bonus</h3>
          </div>
          <p className="text-xs text-slate-300 max-w-lg">
            Share your unique PocketPay link with friends. When they create a wallet and complete their first transfer, both of your accounts receive a $15 cash bonus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 truncate max-w-xs">
            {referralLink}
          </div>
          <button
            onClick={handleCopyReferral}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 transition-colors"
          >
            {copiedReferral ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedReferral ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
