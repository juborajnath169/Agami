import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const { t } = useApp();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900/90 dark:bg-slate-800/95 backdrop-blur-md px-4 py-2.5 text-xs font-medium text-amber-300 shadow-xl border border-amber-500/30">
      <WifiOff className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
      <span>{t('offlineBanner')}</span>
    </div>
  );
};
