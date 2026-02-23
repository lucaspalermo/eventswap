import Link from 'next/link';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <header className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-[#6C3CE1]">Event</span>
            <span className="text-neutral-900 dark:text-white">Swap</span>
          </Link>
          <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
            Voltar ao inicio
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-12">
        {children}
      </main>
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-8">
        <div className="mx-auto max-w-4xl px-6 text-center text-xs text-neutral-400">
          EventSwap {new Date().getFullYear()}. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
