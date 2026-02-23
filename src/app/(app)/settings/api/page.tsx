'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  User,
  Shield,
  Bell,
  Key,
  ExternalLink,
  Zap,
  Lock,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fadeUp, staggerContainer, staggerChild } from '@/design-system/animations';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { ApiKeyManager } from '@/components/api/api-key-manager';

type SettingsTab = 'geral' | 'seguranca' | 'notificacoes' | 'api';

const navItems: { id: SettingsTab; label: string; icon: typeof User; href: string }[] = [
  { id: 'geral', label: 'Geral', icon: User, href: '/settings' },
  { id: 'seguranca', label: 'Seguranca', icon: Shield, href: '/settings/security' },
  { id: 'notificacoes', label: 'Notificacoes', icon: Bell, href: '/settings/notifications' },
  { id: 'api', label: 'API & Integracoes', icon: Key, href: '/settings/api' },
];

export default function ApiSettingsPage() {
  const { loading: authLoading } = useAuth();
  const [activeTab] = useState<SettingsTab>('api');

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#6C3CE1]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="text-2xl font-semibold text-neutral-950 dark:text-white">
          Configuracoes
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Gerencie suas chaves de API e integracoes
        </p>
      </motion.div>

      {/* Navigation Pills */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex items-center gap-2 overflow-x-auto pb-1"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeTab;
          return isActive ? (
            <button
              key={item.id}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap bg-[#6C3CE1] text-white shadow-md shadow-[#6C3CE1]/25"
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          ) : (
            <Link
              key={item.id}
              href={item.href}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </motion.div>

      {/* Content */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* API Key Manager */}
        <motion.div variants={staggerChild}>
          <ApiKeyManager />
        </motion.div>

        {/* Info Cards */}
        <motion.div variants={staggerChild}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Rate Limits */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Rate Limits
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-neutral-500 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span>Requisicoes/minuto</span>
                  <Badge variant="secondary">100</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Chaves ativas</span>
                  <Badge variant="secondary">Max 5</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Resultados por pagina</span>
                  <Badge variant="secondary">Max 50</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Permissions */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#6C3CE1]" />
                  Permissoes
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-neutral-500 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span>Listings (leitura)</span>
                  <Badge variant="success">Disponivel</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Categorias (leitura)</span>
                  <Badge variant="success">Disponivel</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Estatisticas (leitura)</span>
                  <Badge variant="success">Disponivel</Badge>
                </div>
              </CardContent>
            </Card>

            {/* API Docs */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-emerald-500" />
                  Documentacao
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-neutral-500 space-y-3">
                <p>
                  Acesse a documentacao completa da API com exemplos de codigo,
                  referencia de endpoints e guias de integracao.
                </p>
                <a
                  href="/api-docs"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-[#6C3CE1] hover:underline font-medium"
                >
                  Abrir Documentacao
                  <ExternalLink className="h-3 w-3" />
                </a>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
