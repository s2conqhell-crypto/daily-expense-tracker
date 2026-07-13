'use client';

import { useEffect, useState } from 'react';
import { X, WifiOff } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWARegistration() {
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [offline, setOffline] = useState(false);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    // Service Worker registration
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  if (confirm('New version available! Refresh to update.')) {
                    newWorker.postMessage('skipWaiting');
                    window.location.reload();
                  }
                }
              });
            }
          });
        } catch (e) { console.warn('[PWARegistration] SW registration failed', e); }
      });
    }

    // Install prompt
    const handler = (e: Event) => {
      if (localStorage.getItem('ef-install-dismissed')) return;
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Online/offline detection
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    (installPrompt as BeforeInstallPromptEvent).prompt();
    const result = await (installPrompt as BeforeInstallPromptEvent).userChoice;
    if (result.outcome === 'accepted') setShowInstall(false);
    setInstallPrompt(null);
  };

  return (
    <>
      {offline && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-[#FBBF24] text-[#09090B] px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium">
          <WifiOff className="h-4 w-4" />
          You are offline. Some features may be limited.
        </div>
      )}
      {showInstall && (
        <div className="fixed bottom-20 left-4 right-4 z-50 md:bottom-4 md:left-auto md:right-4 md:w-80 bg-[#111827] border border-white/[0.08] rounded-2xl p-4 shadow-2xl flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#00D09C] flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">EF</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">Install ExpenseFlow</p>
            <p className="text-[10px] text-[#94A3B8]">Add to home screen for quick access</p>
          </div>
          <button onClick={handleInstall} className="px-3 py-1.5 text-xs font-medium rounded-xl bg-[#7C5CFF] text-white hover:bg-[#6B4FE6] transition-colors shrink-0">
            Install
          </button>
          <button onClick={() => { setShowInstall(false); localStorage.setItem('ef-install-dismissed', 'true'); }} className="p-1 rounded-lg hover:bg-white/5 transition-colors shrink-0">
            <X className="h-4 w-4 text-[#94A3B8]" />
          </button>
        </div>
      )}
    </>
  );
}