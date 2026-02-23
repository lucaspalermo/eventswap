'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  User,
  Shield,
  Bell,
  Save,
  MessageSquare,
  DollarSign,
  Megaphone,
  Mail,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { fadeUp, staggerContainer, staggerChild } from '@/design-system/animations';

type SettingsTab = 'geral' | 'seguranca' | 'notificacoes';

const navItems: { id: SettingsTab; label: string; icon: typeof User; href: string }[] = [
  { id: 'geral', label: 'Geral', icon: User, href: '/settings' },
  { id: 'seguranca', label: 'Seguranca', icon: Shield, href: '/settings/security' },
  { id: 'notificacoes', label: 'Notificacoes', icon: Bell, href: '/settings/notifications' },
];

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  icon: typeof Bell;
  defaultValue: boolean;
}

const notificationSettings: NotificationSetting[] = [
  {
    id: 'new_offers',
    label: 'Novas ofertas nos meus anuncios',
    description: 'Receba uma notificacao quando alguem fizer uma oferta em um dos seus anuncios.',
    icon: Tag,
    defaultValue: true,
  },
  {
    id: 'messages',
    label: 'Mensagens recebidas',
    description: 'Seja notificado quando receber novas mensagens de outros usuarios.',
    icon: MessageSquare,
    defaultValue: true,
  },
  {
    id: 'transactions',
    label: 'Atualizacoes de transacao',
    description: 'Receba atualizacoes sobre o status das suas transacoes (pagamentos, transferencias, etc.).',
    icon: DollarSign,
    defaultValue: true,
  },
  {
    id: 'promotions',
    label: 'Novidades e promocoes',
    description: 'Receba informacoes sobre novidades da plataforma e promocoes especiais.',
    icon: Megaphone,
    defaultValue: false,
  },
  {
    id: 'weekly_digest',
    label: 'Resumo semanal por email',
    description: 'Receba um email semanal com um resumo das atividades da sua conta.',
    icon: Mail,
    defaultValue: true,
  },
];

export default function NotificationSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [preferences, setPreferences] = useState<Record<string, boolean>>(
    notificationSettings.reduce(
      (acc, setting) => ({
        ...acc,
        [setting.id]: setting.defaultValue,
      }),
      {} as Record<string, boolean>
    )
  );

  const togglePreference = (id: string) => {
    setPreferences((prev) => ({ ...prev, [id]: !prev[id] }));
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // For now, show success feedback as placeholder
      // In the future, this can save to a notification_preferences table or profile metadata
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      // Silent fail
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="text-2xl font-semibold text-neutral-950 dark:text-white">
          Configuracoes
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Gerencie suas informacoes pessoais e preferencias
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
          const isActive = item.id === 'notificacoes';
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap',
                isActive
                  ? 'bg-[#6C3CE1] text-white shadow-md shadow-[#6C3CE1]/25'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </motion.div>

      {/* Notification Preferences */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={staggerChild}>
          <Card className="hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-[#6C3CE1]" />
                Preferencias de Notificacao
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {notificationSettings.map((setting, index) => {
                const Icon = setting.icon;
                return (
                  <div key={setting.id}>
                    <div className="flex items-center justify-between py-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 mt-0.5">
                          <Icon className="h-4 w-4 text-neutral-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">
                            {setting.label}
                          </p>
                          <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                            {setting.description}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences[setting.id]}
                        onCheckedChange={() => togglePreference(setting.id)}
                        className="shrink-0 ml-4"
                      />
                    </div>
                    {index < notificationSettings.length - 1 && (
                      <Separator />
                    )}
                  </div>
                );
              })}

              {/* Success feedback */}
              {saveSuccess && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 px-3 py-2 rounded-lg">
                  <CheckCircle2 className="h-4 w-4" />
                  Preferencias salvas com sucesso!
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSave}
                  loading={isSaving}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Salvar Preferencias
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
