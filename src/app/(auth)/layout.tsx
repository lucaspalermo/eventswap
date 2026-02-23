export const dynamic = 'force-dynamic';

import { Logo } from '@/components/shared/logo';
import { Shield, Zap, Lock, Star } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Transacoes protegidas',
    description: 'Pagamento seguro com intermediacao e garantia de entrega.',
  },
  {
    icon: Zap,
    title: 'Transferencia instantanea',
    description: 'Processo rapido e automatizado de troca de titularidade.',
  },
  {
    icon: Lock,
    title: 'Verificacao de identidade',
    description: 'Todos os usuarios sao verificados para sua seguranca.',
  },
  {
    icon: Star,
    title: 'Suporte dedicado',
    description: 'Equipe especializada para auxiliar em todas as etapas.',
  },
] as const;

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Hidden on mobile, visible on lg+ */}
      <div
        className="hidden lg:flex lg:w-[480px] xl:w-[560px] flex-col justify-between p-10 xl:p-12 relative overflow-hidden"
        style={{ background: 'var(--gradient-hero)' }}
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 -left-20 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-20 -right-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <Logo size="lg" className="[&_span]:!text-white" />
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-3">
            <h1 className="text-2xl font-bold tracking-tight text-white xl:text-3xl">
              O marketplace de reservas de eventos mais seguro do Brasil
            </h1>
            <p className="text-base text-white/70 leading-relaxed">
              Compre, venda e transfira reservas com total seguranca e transparencia.
            </p>
          </div>

          <div className="space-y-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
                    <Icon className="h-4.5 w-4.5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {feature.title}
                    </p>
                    <p className="text-sm text-white/60 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-xs text-white/40">
            &copy; 2026 EventSwap. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Right Panel - Form Content */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-8 lg:p-12 bg-white dark:bg-neutral-950">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
