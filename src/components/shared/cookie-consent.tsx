'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import Link from 'next/link';

const CONSENT_KEY = 'eventswap_cookie_consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Show after a short delay for better UX
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="mx-auto max-w-4xl rounded-2xl border border-neutral-200 bg-white/95 backdrop-blur-xl p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900/95">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                  Politica de Cookies
                </h3>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Utilizamos cookies essenciais para o funcionamento do site e cookies analiticos
                  para melhorar sua experiencia. Ao continuar navegando, voce concorda com nossa{' '}
                  <Link href="/privacy" className="text-[#2563EB] hover:underline">
                    Politica de Privacidade
                  </Link>{' '}
                  e{' '}
                  <Link href="/terms" className="text-[#2563EB] hover:underline">
                    Termos de Uso
                  </Link>.
                </p>
              </div>
              <button onClick={() => setVisible(false)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Button size="sm" onClick={accept}>
                Aceitar todos
              </Button>
              <Button size="sm" variant="outline" onClick={decline}>
                Apenas essenciais
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
