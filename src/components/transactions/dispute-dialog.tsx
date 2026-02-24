'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, Paperclip, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { isDemoMode, getDemoSession } from '@/lib/demo-auth';

interface DisputeDialogProps {
  transactionId: number;
  transactionCode: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DISPUTE_REASONS = [
  { value: 'listing_mismatch', label: 'Anuncio nao corresponde ao descrito' },
  { value: 'transfer_rejected', label: 'Fornecedor nao aceita a transferencia' },
  { value: 'missing_documentation', label: 'Vendedor nao forneceu documentacao' },
  { value: 'payment_issues', label: 'Problemas com o pagamento' },
  { value: 'other', label: 'Outro motivo' },
] as const;

const DEMO_DISPUTES_KEY = 'eventswap_demo_disputes';

function generateProtocolNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `DSP-${year}-${random}`;
}

interface DemoDispute {
  id: number;
  protocol: string;
  transaction_id: number;
  transaction_code: string;
  opened_by: string;
  reason: string;
  description: string;
  evidence_urls: string[];
  status: 'OPEN';
  created_at: string;
}

function getDemoDisputes(): DemoDispute[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(DEMO_DISPUTES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveDemoDispute(dispute: DemoDispute): void {
  if (typeof window === 'undefined') return;
  const disputes = getDemoDisputes();
  disputes.unshift(dispute);
  localStorage.setItem(DEMO_DISPUTES_KEY, JSON.stringify(disputes));
}

export function DisputeDialog({
  transactionId,
  transactionCode,
  isOpen,
  onClose,
  onSuccess,
}: DisputeDialogProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceText, setEvidenceText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [protocol, setProtocol] = useState('');

  const descriptionLength = description.length;
  const isDescriptionValid = descriptionLength >= 50 && descriptionLength <= 2000;
  const canSubmit = reason !== '' && isDescriptionValid && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setSubmitting(true);

    try {
      const protocolNumber = generateProtocolNumber();

      if (isDemoMode()) {
        const demoSession = getDemoSession();
        saveDemoDispute({
          id: Date.now(),
          protocol: protocolNumber,
          transaction_id: transactionId,
          transaction_code: transactionCode,
          opened_by: demoSession?.id || 'demo-buyer',
          reason,
          description: description.trim(),
          evidence_urls: evidenceText
            ? evidenceText
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
          status: 'OPEN',
          created_at: new Date().toISOString(),
        });

        setProtocol(protocolNumber);
        setSubmitted(true);
        toast.success('Disputa aberta com sucesso!');
        onSuccess();
      } else {
        const res = await fetch('/api/disputes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transaction_id: transactionId,
            reason,
            description: description.trim(),
            evidence_urls: evidenceText
              ? evidenceText
                  .split('\n')
                  .map((s) => s.trim())
                  .filter(Boolean)
              : [],
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Falha ao abrir disputa');
        }

        const data = await res.json();
        setProtocol(data.data?.protocol || protocolNumber);
        setSubmitted(true);
        toast.success('Disputa aberta com sucesso!');
        onSuccess();
      }
    } catch (error) {
      console.error('[DisputeDialog] Error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Erro ao abrir disputa. Tente novamente.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    // Reset state when closing
    setReason('');
    setDescription('');
    setEvidenceText('');
    setSubmitted(false);
    setProtocol('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Abrir Disputa
          </DialogTitle>
          <DialogDescription>
            Transacao {transactionCode}
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          /* Success state */
          <div className="py-6 flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-base font-semibold text-neutral-900 dark:text-white">
                Disputa aberta com sucesso
              </p>
              <p className="text-sm text-neutral-500 mt-1">
                Nossa equipe analisara seu caso em ate 10 dias uteis.
              </p>
            </div>
            <div className="w-full rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-4 py-3">
              <p className="text-xs text-neutral-500 mb-1">Numero de protocolo</p>
              <p className="text-sm font-mono font-semibold text-[#2563EB]">{protocol}</p>
            </div>
            <p className="text-xs text-neutral-400">
              Guarde este numero para acompanhar o andamento da disputa.
            </p>
          </div>
        ) : (
          /* Form */
          <div className="space-y-4 py-1">
            {/* Warning banner */}
            <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-900/10 p-3">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                Ao abrir uma disputa, o valor em custodia sera retido ate a resolucao.
                Prazo de analise: ate 10 dias uteis.
              </p>
            </div>

            {/* Reason dropdown */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Motivo da disputa <span className="text-red-500">*</span>
              </label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o motivo..." />
                </SelectTrigger>
                <SelectContent>
                  {DISPUTE_REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description textarea */}
            <Textarea
              label="Descricao detalhada *"
              placeholder="Descreva detalhadamente o problema ocorrido. Inclua datas, valores e quaisquer acordos realizados fora da plataforma..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              maxLength={2000}
              hint={`${descriptionLength}/2000 caracteres${descriptionLength < 50 ? ` (minimo 50)` : ''}`}
              error={
                descriptionLength > 0 && descriptionLength < 50
                  ? 'Descricao muito curta. Minimo de 50 caracteres.'
                  : undefined
              }
            />

            {/* Evidence upload area */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Evidencias (opcional)
              </label>
              <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-4 text-center space-y-2 cursor-default">
                <div className="flex justify-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <Upload className="h-5 w-5 text-neutral-400" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Anexe prints, contratos ou comprovantes
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Cole os links ou nomes dos arquivos abaixo
                  </p>
                </div>
                <div className="relative">
                  <Paperclip className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400 pointer-events-none" />
                  <textarea
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-9 pr-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 focus:border-[#2563EB] resize-none"
                    rows={2}
                    placeholder="Ex: https://drive.google.com/... ou nome-do-arquivo.pdf (um por linha)"
                    value={evidenceText}
                    onChange={(e) => setEvidenceText(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {submitted ? (
            <Button
              onClick={handleClose}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
            >
              Fechar
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose} disabled={submitting}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Abrindo disputa...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Abrir Disputa
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { getDemoDisputes, DEMO_DISPUTES_KEY };
