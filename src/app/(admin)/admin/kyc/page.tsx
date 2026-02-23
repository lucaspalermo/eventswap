'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Shield,
  ShieldCheck,
  ShieldX,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
  Camera,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

interface KycSubmission {
  id: number;
  user_id: string;
  document_type: string;
  document_front_url: string;
  document_back_url: string | null;
  selfie_url: string;
  cpf: string;
  full_name: string;
  birth_date: string | null;
  status: string;
  rejection_reason: string | null;
  reviewed_at: string | null;
  created_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
    kyc_status: string;
    verification_level: string;
  };
}

const statusConfig: Record<string, { label: string; variant: 'warning' | 'success' | 'destructive' | 'secondary'; icon: typeof Clock }> = {
  pending: { label: 'Pendente', variant: 'warning', icon: Clock },
  approved: { label: 'Aprovado', variant: 'success', icon: ShieldCheck },
  rejected: { label: 'Rejeitado', variant: 'destructive', icon: ShieldX },
  resubmit: { label: 'Reenviar', variant: 'warning', icon: Shield },
};

const ITEMS_PER_PAGE = 20;

export default function AdminKycPage() {
  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [verificationLevel, setVerificationLevel] = useState('document');
  const [processingId, setProcessingId] = useState<number | null>(null);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        page: String(page),
        per_page: String(ITEMS_PER_PAGE),
      });

      const response = await fetch(`/api/admin/kyc?${params}`);
      if (!response.ok) throw new Error('Erro ao carregar');

      const result = await response.json();
      setSubmissions(result.data || []);
      setTotalCount(result.pagination?.total || 0);
    } catch {
      toast.error('Erro ao carregar submissoes KYC');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const handleApprove = async (id: number) => {
    setProcessingId(id);
    try {
      const response = await fetch('/api/admin/kyc', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action: 'approve',
          verification_level: verificationLevel,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      toast.success('Verificacao aprovada com sucesso!');
      loadSubmissions();
      setExpandedId(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao aprovar';
      toast.error(message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!rejectionReason.trim()) {
      toast.error('Informe o motivo da rejeicao');
      return;
    }

    setProcessingId(id);
    try {
      const response = await fetch('/api/admin/kyc', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action: 'reject',
          rejection_reason: rejectionReason,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      toast.success('Verificacao rejeitada');
      setRejectionReason('');
      loadSubmissions();
      setExpandedId(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao rejeitar';
      toast.error(message);
    } finally {
      setProcessingId(null);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
    setRejectionReason('');
    setVerificationLevel('document');
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Verificacao KYC
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Revise e aprove documentos de verificacao de identidade dos usuarios.
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Filtrar por status
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="approved">Aprovados</SelectItem>
                    <SelectItem value="rejected">Rejeitados</SelectItem>
                    <SelectItem value="resubmit">Reenviar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Submissions Table */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Usuario
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Documento
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      CPF
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Data
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Acoes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4" colSpan={6}>
                          <div className="flex items-center gap-4">
                            <div className="h-9 w-9 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 w-1/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                              <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : submissions.length === 0 ? (
                    <tr>
                      <td className="px-6 py-12 text-center text-sm text-zinc-500" colSpan={6}>
                        <div className="flex flex-col items-center gap-3">
                          <Shield className="h-10 w-10 text-neutral-300" />
                          <p>Nenhuma submissao encontrada com os filtros aplicados.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    submissions.map((sub) => {
                      const config = statusConfig[sub.status] || statusConfig.pending;
                      const isExpanded = expandedId === sub.id;
                      const initials = (sub.user?.name || sub.full_name || 'U')
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2);

                      return (
                        <tr key={sub.id} className="group">
                          <td className="px-6 py-4" colSpan={6}>
                            {/* Main Row */}
                            <div
                              className="flex items-center cursor-pointer"
                              onClick={() => toggleExpand(sub.id)}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#6C3CE1]/10 text-xs font-bold text-[#6C3CE1]">
                                  {initials}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                    {sub.full_name}
                                  </p>
                                  <p className="text-xs text-zinc-500 truncate">
                                    {sub.user?.email || '-'}
                                  </p>
                                </div>
                              </div>
                              <div className="w-24 hidden sm:block">
                                <Badge variant="secondary">{sub.document_type}</Badge>
                              </div>
                              <div className="w-36 hidden md:block">
                                <span className="text-sm text-zinc-600 dark:text-zinc-300">
                                  {sub.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                                </span>
                              </div>
                              <div className="w-28 hidden sm:block">
                                <Badge variant={config.variant}>{config.label}</Badge>
                              </div>
                              <div className="w-32 hidden lg:block">
                                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                  {new Date(sub.created_at).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                              <div className="w-10 flex items-center justify-end">
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4 text-zinc-400" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-zinc-400" />
                                )}
                              </div>
                            </div>

                            {/* Expanded Detail */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-4 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4 space-y-4">
                                    {/* User Info */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-xs font-medium text-zinc-500 mb-1">Nome Completo</p>
                                        <p className="text-sm text-zinc-900 dark:text-zinc-100">{sub.full_name}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs font-medium text-zinc-500 mb-1">CPF</p>
                                        <p className="text-sm text-zinc-900 dark:text-zinc-100">
                                          {sub.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs font-medium text-zinc-500 mb-1">Data de Nascimento</p>
                                        <p className="text-sm text-zinc-900 dark:text-zinc-100">
                                          {sub.birth_date
                                            ? new Date(sub.birth_date + 'T12:00:00').toLocaleDateString('pt-BR')
                                            : 'Nao informada'}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs font-medium text-zinc-500 mb-1">Tipo de Documento</p>
                                        <p className="text-sm text-zinc-900 dark:text-zinc-100">{sub.document_type}</p>
                                      </div>
                                    </div>

                                    {/* Document Images */}
                                    <div>
                                      <p className="text-xs font-medium text-zinc-500 mb-2">Documentos Enviados</p>
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <a
                                          href={sub.document_front_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                        >
                                          <FileText className="h-5 w-5 text-[#6C3CE1]" />
                                          <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                              Frente do Documento
                                            </p>
                                          </div>
                                          <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                                        </a>
                                        {sub.document_back_url && (
                                          <a
                                            href={sub.document_back_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                          >
                                            <FileText className="h-5 w-5 text-[#6C3CE1]" />
                                            <div className="flex-1 min-w-0">
                                              <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                                Verso do Documento
                                              </p>
                                            </div>
                                            <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                                          </a>
                                        )}
                                        <a
                                          href={sub.selfie_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                        >
                                          <Camera className="h-5 w-5 text-[#6C3CE1]" />
                                          <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                              Selfie com Documento
                                            </p>
                                          </div>
                                          <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                                        </a>
                                      </div>
                                    </div>

                                    {/* Existing Rejection Reason */}
                                    {sub.rejection_reason && (
                                      <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">
                                        <p className="font-medium text-xs mb-1">Motivo da rejeicao anterior:</p>
                                        <p className="text-xs">{sub.rejection_reason}</p>
                                      </div>
                                    )}

                                    {/* Actions (only for pending) */}
                                    {sub.status === 'pending' && (
                                      <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4 space-y-4">
                                        {/* Approval Section */}
                                        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
                                          <div className="flex-1">
                                            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                              Nivel de Verificacao
                                            </label>
                                            <Select value={verificationLevel} onValueChange={setVerificationLevel}>
                                              <SelectTrigger className="w-full sm:w-[200px]">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="document">Documento (R$ 50.000)</SelectItem>
                                                <SelectItem value="full">Completa (R$ 500.000)</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <Button
                                            onClick={() => handleApprove(sub.id)}
                                            disabled={processingId === sub.id}
                                            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                                          >
                                            {processingId === sub.id ? (
                                              <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                              <CheckCircle2 className="h-4 w-4" />
                                            )}
                                            Aprovar
                                          </Button>
                                        </div>

                                        {/* Rejection Section */}
                                        <div className="space-y-2">
                                          <Textarea
                                            label="Motivo da Rejeicao"
                                            placeholder="Informe o motivo da rejeicao..."
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            rows={2}
                                          />
                                          <div className="flex justify-end">
                                            <Button
                                              variant="outline"
                                              onClick={() => handleReject(sub.id)}
                                              disabled={processingId === sub.id || !rejectionReason.trim()}
                                              className="gap-2 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
                                            >
                                              {processingId === sub.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                              ) : (
                                                <XCircle className="h-4 w-4" />
                                              )}
                                              Rejeitar
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalCount > 0 && (
              <div className="flex items-center justify-between border-t border-zinc-100 px-6 py-4 dark:border-zinc-800">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Mostrando {((page - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(page * ITEMS_PER_PAGE, totalCount)} de {totalCount} submissoes
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <span className="text-sm text-zinc-500">
                    {page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Proximo
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
