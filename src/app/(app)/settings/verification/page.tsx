'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  User,
  Shield,
  Bell,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  FileText,
  Camera,
  BadgeCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { fadeUp, staggerContainer, staggerChild } from '@/design-system/animations';
import { useAuth } from '@/hooks/use-auth';
import { KycWizard } from '@/components/kyc/kyc-wizard';
import { KycStatusCard } from '@/components/kyc/kyc-status-card';
import type { KycDocumentStatus, VerificationLevel } from '@/types/database.types';

type SettingsTab = 'geral' | 'seguranca' | 'notificacoes' | 'verificacao';

const navItems: { id: SettingsTab; label: string; icon: typeof User; href: string }[] = [
  { id: 'geral', label: 'Geral', icon: User, href: '/settings' },
  { id: 'seguranca', label: 'Seguranca', icon: Shield, href: '/settings/security' },
  { id: 'notificacoes', label: 'Notificacoes', icon: Bell, href: '/settings/notifications' },
  { id: 'verificacao', label: 'Verificacao', icon: ShieldCheck, href: '/settings/verification' },
];

interface KycData {
  profile: {
    kyc_status: string;
    verification_level: VerificationLevel;
    max_transaction_amount: number;
    is_verified: boolean;
  };
  latest: {
    id: number;
    status: KycDocumentStatus;
    rejection_reason: string | null;
    document_type: string;
    full_name: string;
    cpf: string;
    created_at: string;
  } | null;
  documents: Array<{
    id: number;
    status: KycDocumentStatus;
    document_type: string;
    created_at: string;
  }>;
}

export default function VerificationPage() {
  const { profile: authProfile, loading: authLoading } = useAuth();
  const [kycData, setKycData] = useState<KycData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadData = useCallback(async () => {
    try {
      const response = await fetch('/api/kyc');
      if (response.ok) {
        const result = await response.json();
        setKycData(result.data);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  const handleWizardComplete = () => {
    setRefreshKey((k) => k + 1);
  };

  const verificationLevel = kycData?.profile.verification_level || 'none';
  const latestStatus = kycData?.latest?.status || null;
  const isPending = latestStatus === 'pending' || kycData?.profile.kyc_status === 'SUBMITTED';
  const isApproved = latestStatus === 'approved' || kycData?.profile.kyc_status === 'APPROVED';
  const showWizard = !isPending && !isApproved;

  if (authLoading || loading) {
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
          const isActive = item.id === 'verificacao';
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
        {/* KYC Status Card */}
        <motion.div variants={staggerChild}>
          <KycStatusCard key={refreshKey} />
        </motion.div>

        {/* Submitted Document Info (when pending) */}
        {isPending && kycData?.latest && (
          <motion.div variants={staggerChild}>
            <Card className="hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-500" />
                  Documento Enviado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-sm text-neutral-500">Nome</span>
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">
                    {kycData.latest.full_name}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-sm text-neutral-500">CPF</span>
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">
                    {kycData.latest.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-sm text-neutral-500">Tipo de Documento</span>
                  <Badge variant="secondary">{kycData.latest.document_type}</Badge>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-neutral-500">Enviado em</span>
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {new Date(kycData.latest.created_at).toLocaleString('pt-BR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Verification Badges Earned (when approved) */}
        {isApproved && (
          <motion.div variants={staggerChild}>
            <Card className="hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-emerald-500" />
                  Selos de Verificacao
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Email Verificado</p>
                      <p className="text-[10px] text-emerald-600/70 dark:text-emerald-500/70">Confirmado</p>
                    </div>
                  </div>
                  <div className={cn(
                    'flex items-center gap-3 rounded-xl border p-3',
                    verificationLevel === 'document' || verificationLevel === 'full'
                      ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50'
                  )}>
                    <FileText className={cn(
                      'h-5 w-5',
                      verificationLevel === 'document' || verificationLevel === 'full'
                        ? 'text-emerald-500'
                        : 'text-neutral-400'
                    )} />
                    <div>
                      <p className={cn(
                        'text-xs font-medium',
                        verificationLevel === 'document' || verificationLevel === 'full'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-neutral-500'
                      )}>Documento Verificado</p>
                      <p className="text-[10px] text-neutral-500">
                        {verificationLevel === 'document' || verificationLevel === 'full' ? 'Confirmado' : 'Pendente'}
                      </p>
                    </div>
                  </div>
                  <div className={cn(
                    'flex items-center gap-3 rounded-xl border p-3',
                    verificationLevel === 'full'
                      ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50'
                  )}>
                    <Camera className={cn(
                      'h-5 w-5',
                      verificationLevel === 'full'
                        ? 'text-emerald-500'
                        : 'text-neutral-400'
                    )} />
                    <div>
                      <p className={cn(
                        'text-xs font-medium',
                        verificationLevel === 'full'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-neutral-500'
                      )}>Selfie Verificada</p>
                      <p className="text-[10px] text-neutral-500">
                        {verificationLevel === 'full' ? 'Confirmado' : 'Pendente'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* KYC Wizard (when not yet verified or rejected) */}
        {showWizard && (
          <motion.div variants={staggerChild}>
            <KycWizard
              onComplete={handleWizardComplete}
              existingData={{
                full_name: authProfile?.name || '',
                cpf: authProfile?.cpf || '',
              }}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
