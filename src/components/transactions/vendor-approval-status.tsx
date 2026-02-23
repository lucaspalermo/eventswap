'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Send,
  Loader2,
  Mail,
  Phone,
  User,
  Copy,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VendorApproval {
  id: number;
  transaction_id: number;
  listing_id: number;
  vendor_name: string;
  vendor_email: string;
  vendor_phone: string | null;
  approval_token: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  approved_at: string | null;
  rejected_reason: string | null;
  created_at: string;
  expires_at: string;
}

interface VendorApprovalStatusProps {
  transactionId: number;
  vendorName?: string;
  vendorEmail?: string;
  vendorPhone?: string;
  /** Whether the listing requires vendor approval */
  vendorApprovesTransfer?: boolean;
  /** Whether user can send approval request (seller role) */
  canRequest?: boolean;
}

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const STATUS_CONFIG = {
  pending: {
    label: 'Pendente',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    borderColor: 'border-amber-200 dark:border-amber-800/50',
    icon: Clock,
    iconColor: 'text-amber-500',
  },
  approved: {
    label: 'Aprovado',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    borderColor: 'border-emerald-200 dark:border-emerald-800/50',
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
  },
  rejected: {
    label: 'Rejeitado',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    borderColor: 'border-red-200 dark:border-red-800/50',
    icon: XCircle,
    iconColor: 'text-red-500',
  },
  expired: {
    label: 'Expirado',
    color: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
    borderColor: 'border-neutral-200 dark:border-neutral-700',
    icon: AlertTriangle,
    iconColor: 'text-neutral-400',
  },
};

// ---------------------------------------------------------------------------
// Helper: mask email
// ---------------------------------------------------------------------------

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const visibleChars = Math.min(3, local.length);
  return `${local.slice(0, visibleChars)}***@${domain}`;
}

function maskPhone(phone: string): string {
  if (phone.length <= 4) return phone;
  return `${phone.slice(0, 4)}***${phone.slice(-2)}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function VendorApprovalStatus({
  transactionId,
  vendorName = '',
  vendorEmail = '',
  vendorPhone = '',
  vendorApprovesTransfer = false,
  canRequest = false,
}: VendorApprovalStatusProps) {
  const [approvals, setApprovals] = useState<VendorApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [formName, setFormName] = useState(vendorName);
  const [formEmail, setFormEmail] = useState(vendorEmail);
  const [formPhone, setFormPhone] = useState(vendorPhone);
  const [approvalUrl, setApprovalUrl] = useState<string | null>(null);

  // Fetch existing approvals
  useEffect(() => {
    fetch(`/api/vendor-approval?transaction_id=${transactionId}`)
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          setApprovals(json.data || []);
        }
      })
      .catch(() => {
        // Silently fail - will show empty state
      })
      .finally(() => setLoading(false));
  }, [transactionId]);

  async function handleSendRequest() {
    if (!formName.trim() || !formEmail.trim()) {
      toast.error('Preencha o nome e email do fornecedor');
      return;
    }

    setSendingRequest(true);

    try {
      const res = await fetch('/api/vendor-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_id: transactionId,
          vendor_name: formName,
          vendor_email: formEmail,
          vendor_phone: formPhone || null,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || 'Erro ao enviar solicitacao');
        return;
      }

      toast.success('Solicitacao de aprovacao enviada!', {
        description: `Um link de aprovacao foi gerado para ${formName}.`,
      });

      setApprovalUrl(json.data.approval_url);
      setShowRequestForm(false);

      // Reload approvals
      const reloadRes = await fetch(`/api/vendor-approval?transaction_id=${transactionId}`);
      if (reloadRes.ok) {
        const reloadJson = await reloadRes.json();
        setApprovals(reloadJson.data || []);
      }
    } catch {
      toast.error('Erro de conexao. Tente novamente.');
    } finally {
      setSendingRequest(false);
    }
  }

  function copyApprovalUrl() {
    if (approvalUrl) {
      navigator.clipboard.writeText(approvalUrl).then(
        () => toast.success('Link copiado!'),
        () => toast.error('Falha ao copiar')
      );
    }
  }

  // If vendor approval is not required, show nothing
  if (!vendorApprovesTransfer && approvals.length === 0) {
    return null;
  }

  const latestApproval = approvals[0];
  const statusConfig = latestApproval
    ? STATUS_CONFIG[latestApproval.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending
    : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#6C3CE1]" />
          Aprovacao do Fornecedor
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 text-neutral-400 animate-spin" />
          </div>
        ) : latestApproval ? (
          // Show existing approval status
          <div className="space-y-4">
            {/* Status Badge */}
            <div className={cn(
              'flex items-center gap-3 p-3 rounded-lg border',
              statusConfig?.borderColor
            )}>
              {statusConfig && (
                <statusConfig.icon className={cn('h-5 w-5 flex-shrink-0', statusConfig.iconColor)} />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge className={cn('text-xs', statusConfig?.color)}>
                    {statusConfig?.label}
                  </Badge>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  {latestApproval.status === 'pending' && 'Aguardando resposta do fornecedor'}
                  {latestApproval.status === 'approved' && latestApproval.approved_at &&
                    `Aprovado em ${new Date(latestApproval.approved_at).toLocaleDateString('pt-BR')}`}
                  {latestApproval.status === 'rejected' && 'Fornecedor rejeitou a transferencia'}
                  {latestApproval.status === 'expired' && 'Solicitacao expirou'}
                </p>
              </div>
            </div>

            {/* Rejection reason */}
            {latestApproval.status === 'rejected' && latestApproval.rejected_reason && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50">
                <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">
                  Motivo da rejeicao:
                </p>
                <p className="text-xs text-red-600 dark:text-red-300">
                  {latestApproval.rejected_reason}
                </p>
              </div>
            )}

            {/* Vendor Info (masked) */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-3.5 w-3.5 text-neutral-400" />
                <span className="text-neutral-600 dark:text-neutral-400">
                  {latestApproval.vendor_name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-3.5 w-3.5 text-neutral-400" />
                <span className="text-neutral-600 dark:text-neutral-400">
                  {maskEmail(latestApproval.vendor_email)}
                </span>
              </div>
              {latestApproval.vendor_phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-3.5 w-3.5 text-neutral-400" />
                  <span className="text-neutral-600 dark:text-neutral-400">
                    {maskPhone(latestApproval.vendor_phone)}
                  </span>
                </div>
              )}
            </div>

            {/* Timeline */}
            <Separator />
            <div className="space-y-2">
              <p className="text-xs font-medium text-neutral-500">Historico</p>
              <div className="space-y-2">
                <TimelineItem
                  label="Solicitacao criada"
                  date={latestApproval.created_at}
                  status="completed"
                />
                {latestApproval.status === 'approved' && (
                  <TimelineItem
                    label="Fornecedor aprovou"
                    date={latestApproval.approved_at || ''}
                    status="completed"
                    success
                  />
                )}
                {latestApproval.status === 'rejected' && (
                  <TimelineItem
                    label="Fornecedor rejeitou"
                    date={latestApproval.created_at}
                    status="completed"
                    error
                  />
                )}
                {latestApproval.status === 'pending' && (
                  <TimelineItem
                    label="Aguardando resposta"
                    date=""
                    status="pending"
                  />
                )}
                {latestApproval.status === 'expired' && (
                  <TimelineItem
                    label="Solicitacao expirou"
                    date={latestApproval.expires_at}
                    status="completed"
                    error
                  />
                )}
              </div>
            </div>

            {/* Approval URL (if just created) */}
            {approvalUrl && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs font-medium text-neutral-500">Link de aprovacao</p>
                  <div className="flex gap-2">
                    <Input
                      value={approvalUrl}
                      readOnly
                      className="text-xs font-mono"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyApprovalUrl}
                      className="flex-shrink-0"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(approvalUrl, '_blank')}
                      className="flex-shrink-0"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Re-send for expired/rejected */}
            {canRequest && (latestApproval.status === 'expired' || latestApproval.status === 'rejected') && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowRequestForm(true)}
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar nova solicitacao
              </Button>
            )}
          </div>
        ) : (
          // No approval request sent yet
          <div className="space-y-4">
            {vendorApprovesTransfer && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                      Aprovacao do fornecedor necessaria
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-300 mt-0.5">
                      O anuncio indica que a transferencia requer aprovacao do fornecedor original.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {canRequest && !showRequestForm && (
              <Button
                onClick={() => setShowRequestForm(true)}
                className="w-full bg-[#6C3CE1] hover:bg-[#5B32C1] text-white gap-2"
              >
                <Send className="h-4 w-4" />
                Solicitar Aprovacao do Fornecedor
              </Button>
            )}
          </div>
        )}

        {/* Request Form */}
        <AnimatePresence>
          {showRequestForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 overflow-hidden"
            >
              <Separator />
              <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Dados do Fornecedor
              </h4>
              <Input
                label="Nome do Fornecedor"
                placeholder="Ex: Villa Bianca Eventos"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
              <Input
                label="Email do Fornecedor"
                type="email"
                placeholder="contato@fornecedor.com"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
              />
              <Input
                label="Telefone (opcional)"
                placeholder="(11) 99999-9999"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowRequestForm(false)}
                  disabled={sendingRequest}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSendRequest}
                  disabled={sendingRequest || !formName.trim() || !formEmail.trim()}
                  className="flex-1 bg-[#6C3CE1] hover:bg-[#5B32C1] text-white gap-2"
                >
                  {sendingRequest ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Enviar Solicitacao
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Timeline Item
// ---------------------------------------------------------------------------

function TimelineItem({
  label,
  date,
  status,
  success,
  error: isError,
}: {
  label: string;
  date: string;
  status: 'completed' | 'pending';
  success?: boolean;
  error?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'h-2 w-2 rounded-full flex-shrink-0',
          status === 'completed'
            ? success
              ? 'bg-emerald-500'
              : isError
                ? 'bg-red-500'
                : 'bg-neutral-400'
            : 'bg-neutral-300 dark:bg-neutral-600 animate-pulse'
        )}
      />
      <div className="flex-1 flex items-center justify-between">
        <span className={cn(
          'text-xs',
          status === 'pending' ? 'text-neutral-400' : 'text-neutral-600 dark:text-neutral-400'
        )}>
          {label}
        </span>
        {date && (
          <span className="text-xs text-neutral-400">
            {new Date(date).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
      </div>
    </div>
  );
}
