'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Clock,
  AlertCircle,
  ArrowRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency } from '@/lib/utils';
import type { KycDocumentStatus, VerificationLevel } from '@/types/database.types';

interface KycStatusCardProps {
  className?: string;
  compact?: boolean;
}

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
    created_at: string;
  } | null;
}

const levelLabels: Record<VerificationLevel, string> = {
  none: 'Nao verificado',
  email: 'Email verificado',
  document: 'Documento verificado',
  full: 'Verificacao completa',
};

const levelLimits: Record<VerificationLevel, number> = {
  none: 0,
  email: 5000,
  document: 50000,
  full: 500000,
};

const levelProgress: Record<VerificationLevel, number> = {
  none: 0,
  email: 33,
  document: 66,
  full: 100,
};

function getStatusConfig(kycStatus: string, latestDocStatus: KycDocumentStatus | null) {
  if (latestDocStatus === 'approved' || kycStatus === 'APPROVED') {
    return {
      icon: ShieldCheck,
      label: 'Verificado',
      variant: 'success' as const,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
    };
  }
  if (latestDocStatus === 'pending' || kycStatus === 'SUBMITTED') {
    return {
      icon: Clock,
      label: 'Pendente',
      variant: 'warning' as const,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      borderColor: 'border-amber-200 dark:border-amber-800',
    };
  }
  if (latestDocStatus === 'rejected' || kycStatus === 'REJECTED') {
    return {
      icon: ShieldX,
      label: 'Rejeitado',
      variant: 'destructive' as const,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      borderColor: 'border-red-200 dark:border-red-800',
    };
  }
  if (latestDocStatus === 'resubmit') {
    return {
      icon: ShieldAlert,
      label: 'Reenviar',
      variant: 'warning' as const,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      borderColor: 'border-amber-200 dark:border-amber-800',
    };
  }
  return {
    icon: Shield,
    label: 'Nao verificado',
    variant: 'destructive' as const,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-800',
  };
}

export function KycStatusCard({ className, compact = false }: KycStatusCardProps) {
  const [data, setData] = useState<KycData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadKycStatus() {
      try {
        const response = await fetch('/api/kyc');
        if (!response.ok) throw new Error('Erro ao carregar status');
        const result = await response.json();
        setData(result.data);
      } catch {
        setError('Erro ao carregar status de verificacao');
      } finally {
        setLoading(false);
      }
    }
    loadKycStatus();
  }, []);

  if (loading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-1/3 rounded bg-neutral-200 dark:bg-neutral-700" />
              <div className="h-3 w-2/3 rounded bg-neutral-200 dark:bg-neutral-700" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn(className)}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-sm text-neutral-500">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const verificationLevel = data?.profile.verification_level || 'none';
  const maxAmount = data?.profile.max_transaction_amount || 0;
  const latestDocStatus = data?.latest?.status || null;
  const rejectionReason = data?.latest?.rejection_reason || null;
  const statusConfig = getStatusConfig(data?.profile.kyc_status || 'PENDING', latestDocStatus);
  const StatusIcon = statusConfig.icon;
  const progress = levelProgress[verificationLevel];

  const needsVerification = verificationLevel === 'none' && !latestDocStatus;
  const isPending = latestDocStatus === 'pending' || data?.profile.kyc_status === 'SUBMITTED';
  const isRejected = latestDocStatus === 'rejected' || latestDocStatus === 'resubmit';

  if (compact) {
    return (
      <Link href="/settings/verification" className={cn('block', className)}>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', statusConfig.bgColor)}>
                  <StatusIcon className={cn('h-5 w-5', statusConfig.color)} />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    Verificacao de Identidade
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant={statusConfig.variant} className="text-[10px]">
                      {statusConfig.label}
                    </Badge>
                    {verificationLevel !== 'none' && (
                      <span className="text-xs text-neutral-500">
                        Limite: {formatCurrency(maxAmount)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-neutral-400" />
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StatusIcon className={cn('h-5 w-5', statusConfig.color)} />
          Verificacao de Identidade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', statusConfig.bgColor)}>
            <StatusIcon className={cn('h-6 w-6', statusConfig.color)} />
          </div>
          <div>
            <Badge variant={statusConfig.variant}>
              {statusConfig.label}
            </Badge>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              {levelLabels[verificationLevel]}
            </p>
          </div>
        </div>

        {/* Verification Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500">Nivel de Verificacao</span>
            <span className="font-medium text-neutral-700 dark:text-neutral-300">{progress}%</span>
          </div>
          <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
            <div
              className={cn(
                'h-2 rounded-full transition-all duration-500',
                progress === 100
                  ? 'bg-emerald-500'
                  : progress > 50
                    ? 'bg-[#2563EB]'
                    : progress > 0
                      ? 'bg-amber-500'
                      : 'bg-neutral-300'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-neutral-400">
            <span>Nenhuma</span>
            <span>Email</span>
            <span>Documento</span>
            <span>Completa</span>
          </div>
        </div>

        {/* Transaction Limits */}
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 p-3 space-y-2">
          <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Limites de Transacao</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(levelLimits).map(([level, limit]) => (
              <div
                key={level}
                className={cn(
                  'flex items-center justify-between rounded-lg px-2.5 py-1.5',
                  level === verificationLevel
                    ? 'bg-[#2563EB]/10 text-[#2563EB] font-medium'
                    : 'text-neutral-500'
                )}
              >
                <span className="capitalize">{level === 'none' ? 'Nenhuma' : level === 'email' ? 'Email' : level === 'document' ? 'Documento' : 'Completa'}</span>
                <span>{limit === 0 ? 'R$ 0' : formatCurrency(limit)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rejection Reason */}
        {isRejected && rejectionReason && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">
            <p className="font-medium mb-1">Motivo da rejeicao:</p>
            <p className="text-xs">{rejectionReason}</p>
          </div>
        )}

        {/* Action Button */}
        {needsVerification && (
          <Link href="/settings/verification">
            <Button className="w-full gap-2">
              <Shield className="h-4 w-4" />
              Iniciar Verificacao
            </Button>
          </Link>
        )}

        {isPending && (
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Sua verificacao esta sendo analisada. Aguarde ate 24 horas.
          </div>
        )}

        {isRejected && (
          <Link href="/settings/verification">
            <Button variant="outline" className="w-full gap-2 text-amber-600 border-amber-200 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400">
              <RefreshCw className="h-4 w-4" />
              Reenviar Documentos
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
