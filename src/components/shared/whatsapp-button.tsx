'use client';

import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const WHATSAPP_NUMBER = '5548991420313';
const WHATSAPP_MESSAGE = 'Ola! Preciso de ajuda com o EventSwap.';

function getWhatsAppUrl() {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
}

export { getWhatsAppUrl, WHATSAPP_NUMBER };

export function WhatsAppButton() {
  return (
    <a
      href={getWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale conosco pelo WhatsApp"
      className={cn(
        'fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300',
        'bg-[#25D366] text-white hover:bg-[#20BD5A] hover:scale-110 hover:shadow-xl',
        'animate-in fade-in slide-in-from-bottom-4 duration-500'
      )}
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
