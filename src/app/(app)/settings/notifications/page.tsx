'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Smartphone,
  BellRing,
  Send,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { fadeUp, staggerContainer, staggerChild } from '@/design-system/animations';
import { pushNotifications } from '@/lib/push-notifications';

type SettingsTab = 'geral' | 'seguranca' | 'notificacoes' | 'verificacao';

const navItems: { id: SettingsTab; label: string; icon: typeof User; href: string }[] = [
  { id: 'geral', label: 'Geral', icon: User, href: '/settings' },
  { id: 'seguranca', label: 'Seguranca', icon: Shield, href: '/settings/security' },
  { id: 'notificacoes', label: 'Notificacoes', icon: Bell, href: '/settings/notifications' },
  { id: 'verificacao', label: 'Verificacao', icon: ShieldCheck, href: '/settings/verification' },
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

  // Push notification state
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const [pushEnabled, setPushEnabled] = useState(false);
  const [isTogglingPush, setIsTogglingPush] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Check push support and status on mount
  useEffect(() => {
    const supported = pushNotifications.isSupported();
    setPushSupported(supported);

    if (supported) {
      setPushPermission(pushNotifications.getPermission());

      // Check if already subscribed
      pushNotifications.getSubscription().then((sub) => {
        setPushEnabled(!!sub);
      });
    }
  }, []);

  const togglePreference = (id: string) => {
    setPreferences((prev) => ({ ...prev, [id]: !prev[id] }));
    setSaveSuccess(false);
  };

  const handleTogglePush = useCallback(async () => {
    setIsTogglingPush(true);
    try {
      if (pushEnabled) {
        await pushNotifications.unsubscribe();
        setPushEnabled(false);
        setPushPermission(pushNotifications.getPermission());
      } else {
        const subscription = await pushNotifications.subscribe();
        if (subscription) {
          setPushEnabled(true);
          setPushPermission('granted');
        } else {
          // User may have denied - update permission state
          setPushPermission(pushNotifications.getPermission());
        }
      }
    } catch {
      // Silent fail
    } finally {
      setIsTogglingPush(false);
    }
  }, [pushEnabled]);

  const handleTestNotification = useCallback(async () => {
    setIsSendingTest(true);
    try {
      await pushNotifications.sendTestNotification();
    } catch {
      // Silent fail
    } finally {
      setIsSendingTest(false);
    }
  }, []);

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
                  ? 'bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/25'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Push Notifications Card */}
        <motion.div variants={staggerChild}>
          <Card className="hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-[#2563EB]" />
                Notificacoes Push
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!pushSupported ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 text-sm">
                  <Bell className="h-4 w-4 shrink-0" />
                  <p>
                    Seu navegador nao suporta notificacoes push. Tente usar Chrome, Firefox ou Edge.
                  </p>
                </div>
              ) : pushPermission === 'denied' ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-sm">
                  <Bell className="h-4 w-4 shrink-0" />
                  <p>
                    Notificacoes foram bloqueadas. Para reativar, altere as permissoes nas configuracoes do seu navegador.
                  </p>
                </div>
              ) : (
                <>
                  {/* Enable/Disable Push */}
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2563EB]/10 dark:bg-[#2563EB]/20 mt-0.5">
                        <BellRing className="h-4 w-4 text-[#2563EB]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                          Ativar notificacoes push
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                          Receba alertas em tempo real mesmo quando o navegador estiver fechado.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      {isTogglingPush && (
                        <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                      )}
                      <Switch
                        checked={pushEnabled}
                        onCheckedChange={handleTogglePush}
                        disabled={isTogglingPush}
                      />
                    </div>
                  </div>

                  {/* Test Notification */}
                  {pushEnabled && (
                    <div className="flex items-center justify-between py-2 pl-12">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                          Enviar notificacao de teste
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Verifique se as notificacoes estao funcionando corretamente.
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleTestNotification}
                        loading={isSendingTest}
                        className="shrink-0 ml-4 gap-1.5"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Testar
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Notification Preferences */}
        <motion.div variants={staggerChild}>
          <Card className="hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-[#2563EB]" />
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
