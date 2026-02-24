'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  User,
  Shield,
  Bell,
  Upload,
  Save,
  Camera,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Key,
  ArrowRight,
  Code2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BRAZILIAN_STATES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { fadeUp, staggerContainer, staggerChild } from '@/design-system/animations';
import { useAuth } from '@/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { uploadAvatar, deleteFile } from '@/lib/storage';
import { KycStatusCard } from '@/components/kyc/kyc-status-card';

type SettingsTab = 'geral' | 'seguranca' | 'notificacoes' | 'verificacao' | 'api';

const navItems: { id: SettingsTab; label: string; icon: typeof User; href: string }[] = [
  { id: 'geral', label: 'Geral', icon: User, href: '/settings' },
  { id: 'seguranca', label: 'Seguranca', icon: Shield, href: '/settings/security' },
  { id: 'notificacoes', label: 'Notificacoes', icon: Bell, href: '/settings/notifications' },
  { id: 'verificacao', label: 'Verificacao', icon: ShieldCheck, href: '/settings/verification' },
  { id: 'api', label: 'API & Integracoes', icon: Key, href: '/settings/api' },
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function SettingsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [activeTab] = useState<SettingsTab>('geral');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [form, setForm] = useState({
    name: '',
    displayName: '',
    phone: '',
    cpf: '',
    bio: '',
    city: '',
    state: '',
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Populate form from profile when it loads
  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        displayName: profile.display_name || '',
        phone: profile.phone || '',
        cpf: profile.cpf || '',
        bio: profile.bio || '',
        city: profile.address_city || '',
        state: profile.address_state || '',
      });
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile]);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
    setSaveError('');
  };

  const handleAvatarSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !user) return;

      // Validate file
      if (!file.type.startsWith('image/')) {
        setSaveError('Selecione um arquivo de imagem (JPG, PNG ou GIF).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setSaveError('A imagem deve ter no maximo 5MB.');
        return;
      }

      setIsUploadingAvatar(true);
      setSaveError('');

      try {
        const url = await uploadAvatar(file, user.id);

        // Update profile with new avatar URL
        const supabase = createClient();
        const { error } = await supabase
          .from('profiles')
          .update({ avatar_url: url, updated_at: new Date().toISOString() })
          .eq('id', user.id);

        if (error) throw error;

        setAvatarUrl(url);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro ao enviar foto. Tente novamente.';
        setSaveError(message);
      } finally {
        setIsUploadingAvatar(false);
        // Reset input so the same file can be selected again
        e.target.value = '';
      }
    },
    [user]
  );

  const handleAvatarRemove = useCallback(async () => {
    if (!user) return;

    setIsUploadingAvatar(true);
    setSaveError('');

    try {
      // Delete old file from storage if it exists
      if (avatarUrl) {
        try {
          await deleteFile('avatars', avatarUrl);
        } catch {
          // Silently ignore delete errors
        }
      }

      // Update profile to remove avatar URL
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;

      setAvatarUrl(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao remover foto. Tente novamente.';
      setSaveError(message);
    } finally {
      setIsUploadingAvatar(false);
    }
  }, [user, avatarUrl]);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError('');

    try {
      const supabase = createClient();
      // Format CPF: remove non-digits
      const cleanCpf = form.cpf.replace(/\D/g, '');

      const { error } = await supabase
        .from('profiles')
        .update({
          name: form.name,
          display_name: form.displayName || null,
          phone: form.phone || null,
          cpf: cleanCpf || null,
          bio: form.bio || null,
          address_city: form.city || null,
          address_state: form.state || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar alteracoes. Tente novamente.';
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#2563EB]" />
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
          const isActive = item.id === activeTab;
          return item.id === 'geral' ? (
            <button
              key={item.id}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap',
                isActive
                  ? 'bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/25'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          ) : (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap',
                'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </motion.div>

      {/* General Tab Content */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Avatar Upload */}
        <motion.div variants={staggerChild}>
          <Card className="hover:shadow-md">
            <CardHeader>
              <CardTitle>Foto de Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarUrl || ''} alt={form.name} />
                    <AvatarFallback className="text-xl font-semibold bg-[#2563EB]/10 text-[#2563EB]">
                      {getInitials(form.name || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/25 hover:bg-[#1D4ED8] transition-colors disabled:opacity-50"
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarSelect}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Alterar foto de perfil
                  </p>
                  <p className="text-xs text-neutral-500 mb-3">
                    JPG, PNG ou GIF. Maximo 5MB.
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                    >
                      {isUploadingAvatar ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Upload className="h-3.5 w-3.5" />
                      )}
                      {isUploadingAvatar ? 'Enviando...' : 'Enviar Foto'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                      onClick={handleAvatarRemove}
                      disabled={isUploadingAvatar || !avatarUrl}
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Identity Verification */}
        <motion.div variants={staggerChild}>
          <KycStatusCard compact />
        </motion.div>

        {/* Profile Form */}
        <motion.div variants={staggerChild}>
          <Card className="hover:shadow-md">
            <CardHeader>
              <CardTitle>Informacoes do Perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nome Completo"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Seu nome completo"
                />
                <Input
                  label="Nome de Exibicao"
                  value={form.displayName}
                  onChange={(e) => updateField('displayName', e.target.value)}
                  placeholder="Como deseja ser chamado"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Telefone"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
                <Input
                  label="CPF"
                  value={form.cpf}
                  onChange={(e) => {
                    // Auto-format CPF: 123.456.789-00
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
                    let formatted = digits;
                    if (digits.length > 9) {
                      formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
                    } else if (digits.length > 6) {
                      formatted = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
                    } else if (digits.length > 3) {
                      formatted = `${digits.slice(0, 3)}.${digits.slice(3)}`;
                    }
                    updateField('cpf', formatted);
                  }}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  hint="Necessario para realizar compras"
                />
              </div>

              <Textarea
                label="Bio"
                value={form.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                placeholder="Conte um pouco sobre voce..."
                rows={4}
                hint="Sua bio sera exibida no seu perfil publico"
              />

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Cidade"
                  value={form.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="Sua cidade"
                />
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Estado
                  </label>
                  <Select
                    value={form.state}
                    onValueChange={(val) => updateField('state', val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRAZILIAN_STATES.map((state) => (
                        <SelectItem key={state.uf} value={state.uf}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Success/Error feedback */}
              {saveSuccess && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 px-3 py-2 rounded-lg">
                  <CheckCircle2 className="h-4 w-4" />
                  Alteracoes salvas com sucesso!
                </div>
              )}
              {saveError && (
                <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 px-3 py-2 rounded-lg">
                  {saveError}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSave}
                  loading={isSaving}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Salvar Alteracoes
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* API & Integracoes Card */}
        <motion.div variants={staggerChild}>
          <Card className="hover:shadow-md group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-[#2563EB]" />
                API & Integracoes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                Integre seu sistema com o EventSwap usando nossa API publica.
                Ideal para cerimonialistas, espacos de eventos e plataformas parceiras
                que desejam acessar listagens e dados da plataforma.
              </p>
              <div className="flex items-center gap-3">
                <Link href="/settings/api">
                  <Button variant="outline" className="gap-2">
                    <Key className="h-4 w-4" />
                    Gerenciar Chaves de API
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
                <a
                  href="/api-docs"
                  target="_blank"
                  className="text-sm text-[#2563EB] hover:underline font-medium"
                >
                  Ver Documentacao
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
