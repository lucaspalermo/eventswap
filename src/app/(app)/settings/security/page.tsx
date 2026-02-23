'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  User,
  Shield,
  Bell,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  LogOut,
  Globe,
  Clock,
  CheckCircle2,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { isDemoMode } from '@/lib/demo-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { fadeUp, staggerContainer, staggerChild } from '@/design-system/animations';
import { createClient } from '@/lib/supabase/client';

type SettingsTab = 'geral' | 'seguranca' | 'notificacoes' | 'verificacao';

const navItems: { id: SettingsTab; label: string; icon: typeof User; href: string }[] = [
  { id: 'geral', label: 'Geral', icon: User, href: '/settings' },
  { id: 'seguranca', label: 'Seguranca', icon: Shield, href: '/settings/security' },
  { id: 'notificacoes', label: 'Notificacoes', icon: Bell, href: '/settings/notifications' },
  { id: 'verificacao', label: 'Verificacao', icon: ShieldCheck, href: '/settings/verification' },
];

const mockSessions = [
  {
    id: 1,
    browser: 'Chrome',
    os: 'Windows',
    location: 'Sao Paulo, SP',
    lastActive: 'Agora',
    isCurrent: true,
    icon: Monitor,
  },
  {
    id: 2,
    browser: 'Safari',
    os: 'iPhone',
    location: 'Rio de Janeiro, RJ',
    lastActive: '2 dias atras',
    isCurrent: false,
    icon: Smartphone,
  },
];

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: 'Fraca', color: 'bg-red-500' };
  if (score <= 2) return { score: 2, label: 'Razoavel', color: 'bg-orange-500' };
  if (score <= 3) return { score: 3, label: 'Boa', color: 'bg-amber-500' };
  if (score <= 4) return { score: 4, label: 'Forte', color: 'bg-emerald-500' };
  return { score: 5, label: 'Muito forte', color: 'bg-emerald-600' };
}

export default function SecuritySettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const strength = useMemo(
    () => getPasswordStrength(passwordForm.newPassword),
    [passwordForm.newPassword]
  );

  const updatePassword = (field: string, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword) {
      setPasswordError('Informe a senha atual');
      return;
    }
    if (!passwordForm.newPassword) {
      setPasswordError('Informe a nova senha');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('A nova senha deve ter pelo menos 8 caracteres');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('As senhas nao coincidem');
      return;
    }

    setIsSaving(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      setPasswordSuccess('Senha alterada com sucesso!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao alterar senha. Tente novamente.';
      setPasswordError(message);
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
          const isActive = item.id === 'seguranca';
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

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Change Password */}
        <motion.div variants={staggerChild}>
          <Card className="hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-[#6C3CE1]" />
                Alterar Senha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Input
                  label="Senha Atual"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => updatePassword('currentPassword', e.target.value)}
                  placeholder="Digite sua senha atual"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-[34px] text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Nova Senha"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => updatePassword('newPassword', e.target.value)}
                  placeholder="Digite a nova senha"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-[34px] text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Password Strength */}
              {passwordForm.newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <div
                          key={i}
                          className={cn(
                            'h-1.5 flex-1 rounded-full transition-all duration-300',
                            i < strength.score
                              ? strength.color
                              : 'bg-neutral-200 dark:bg-neutral-700'
                          )}
                        />
                      ))}
                    </div>
                    <span
                      className={cn(
                        'text-xs font-medium',
                        strength.score <= 2
                          ? 'text-red-500'
                          : strength.score <= 3
                            ? 'text-amber-500'
                            : 'text-emerald-500'
                      )}
                    >
                      {strength.label}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Use pelo menos 8 caracteres com letras maiusculas, minusculas,
                    numeros e simbolos.
                  </p>
                </div>
              )}

              <div className="relative">
                <Input
                  label="Confirmar Nova Senha"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => updatePassword('confirmPassword', e.target.value)}
                  placeholder="Confirme a nova senha"
                  error={
                    passwordForm.confirmPassword &&
                    passwordForm.newPassword !== passwordForm.confirmPassword
                      ? 'As senhas nao coincidem'
                      : undefined
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-[34px] text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {passwordError && (
                <p className="text-xs font-medium text-red-500">{passwordError}</p>
              )}

              {passwordSuccess && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 px-3 py-2 rounded-lg">
                  <CheckCircle2 className="h-4 w-4" />
                  {passwordSuccess}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleChangePassword}
                  loading={isSaving}
                  className="gap-2"
                >
                  <Lock className="h-4 w-4" />
                  Alterar Senha
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Two-Factor Auth */}
        <motion.div variants={staggerChild}>
          <Card className="hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-[#6C3CE1]" />
                Autenticacao em Dois Fatores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center text-center py-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 mb-4">
                  <Shield className="h-8 w-8 text-neutral-400" />
                </div>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-1">
                  Em breve
                </h3>
                <p className="text-sm text-neutral-500 max-w-sm">
                  A autenticacao em dois fatores (2FA) estara disponivel em breve
                  para aumentar a seguranca da sua conta. Fique ligado!
                </p>
                <Badge variant="secondary" className="mt-4">
                  Disponivel em breve
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Sessions */}
        <motion.div variants={staggerChild}>
          <Card className="hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#6C3CE1]" />
                Sessoes Ativas
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-800 dark:hover:bg-red-950/20"
              >
                <LogOut className="h-3.5 w-3.5" />
                Encerrar Todas as Sessoes
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {!isDemoMode() ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Info className="h-10 w-10 text-neutral-300 mb-3" />
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Dados de sessão não disponíveis
                  </p>
                  <p className="text-xs text-neutral-500">
                    O gerenciamento de sessões ativas estará disponível em breve.
                  </p>
                </div>
              ) : mockSessions.map((session) => {
                const SessionIcon = session.icon;
                return (
                  <div
                    key={session.id}
                    className={cn(
                      'flex items-center gap-4 rounded-lg border p-4 transition-colors',
                      session.isCurrent
                        ? 'border-[#6C3CE1]/30 bg-[#6C3CE1]/5 dark:border-[#6C3CE1]/20 dark:bg-[#6C3CE1]/10'
                        : 'border-neutral-200 dark:border-neutral-700'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg',
                        session.isCurrent
                          ? 'bg-[#6C3CE1]/10'
                          : 'bg-neutral-100 dark:bg-neutral-800'
                      )}
                    >
                      <SessionIcon
                        className={cn(
                          'h-5 w-5',
                          session.isCurrent
                            ? 'text-[#6C3CE1]'
                            : 'text-neutral-500'
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                          {session.browser} - {session.os}
                        </p>
                        {session.isCurrent && (
                          <Badge variant="success" className="text-[10px]">
                            Sessao atual
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-neutral-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {session.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {session.lastActive}
                        </span>
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        Encerrar
                      </Button>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
