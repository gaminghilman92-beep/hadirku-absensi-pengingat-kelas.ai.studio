import React from 'react';
import {WifiOff} from 'lucide-react';
import {useOnlineStatus} from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-20 left-4 right-4 z-50 mx-auto flex max-w-md items-center gap-2.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-900 shadow-lg md:bottom-4 md:left-auto md:right-4"
    >
      <WifiOff className="h-4 w-4 shrink-0 text-amber-700" />
      <span>Mode Offline — Data absensi tersimpan aman di perangkat.</span>
    </div>
  );
};
