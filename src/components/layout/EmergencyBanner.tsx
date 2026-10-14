import React, { useState } from 'react';
import { PhoneCall, ShieldAlert, X } from 'lucide-react';

export const EmergencyBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside aria-label="Emergency Contact Information" className="relative z-30 bg-red-600 text-white px-4 py-2 text-xs shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-white" />
          <span className="font-bold tracking-wide">FOR IMMEDIATE LIFE-THREATENING EMERGENCY:</span>
          <span>Dial National Emergency</span>
          <a
            href="tel:112"
            className="inline-flex items-center gap-1 font-extrabold text-white underline decoration-white decoration-2 underline-offset-2 ml-1"
          >
            <PhoneCall className="w-3 h-3 inline" /> 112
          </a>
          <span className="text-red-200 hidden sm:inline">|</span>
          <span className="text-red-100 hidden md:inline">Ballari District Control Room:</span>
          <a href="tel:08392277100" className="text-white font-semibold underline hidden md:inline">
            08392-277100 / 1077
          </a>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-red-100 text-[11px] hidden lg:inline">
            Web requests assist coordination; call 112 for direct dispatch.
          </span>
          <button
            onClick={() => setDismissed(true)}
            className="text-white hover:text-red-100 p-0.5 rounded transition-colors"
            title="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
