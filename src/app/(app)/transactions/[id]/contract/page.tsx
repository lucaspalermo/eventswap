'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { staggerContainer, staggerChild } from '@/design-system/animations';
import { ContractPreview } from '@/components/transactions/contract-preview';
import { type ContractData } from '@/lib/contract-template';
import { transactionsService } from '@/services/transactions.service';
import { isDemoMode } from '@/lib/demo-auth';

// ---------------------------------------------------------------------------
// Demo / mock contract data (used when in demo mode or API fails)
// ---------------------------------------------------------------------------
const demoContractData: ContractData = {
  transactionCode: 'TXN-2026-0001',
  sellerName: 'Maria Silva',
  sellerCpf: '123.456.789-00',
  sellerEmail: 'maria.silva@email.com',
  buyerName: 'João Comprador',
  buyerCpf: '987.654.321-00',
  buyerEmail: 'joao.comprador@email.com',
  eventTitle: 'Buffet Premium para 200 pessoas - Villa Bianca',
  eventDate: '2026-06-15',
  venueName: 'Villa Bianca',
  venueAddress: 'Av. das Flores, 1234 - Jardins, São Paulo/SP',
  providerName: 'Villa Bianca Eventos Ltda.',
  originalPrice: 40000,
  agreedPrice: 32000,
  platformFee: 1600,
  platformName: 'EventSwap',
  transactionDate: new Date().toISOString().split('T')[0],
};

// ---------------------------------------------------------------------------
// Status order helper — contract available from ESCROW_HELD onward
// ---------------------------------------------------------------------------
const STATUS_ORDER = [
  'INITIATED',
  'AWAITING_PAYMENT',
  'PAYMENT_CONFIRMED',
  'ESCROW_HELD',
  'TRANSFER_PENDING',
  'COMPLETED',
  'DISPUTE_OPENED',
  'DISPUTE_RESOLVED',
];

function isContractAvailable(status: string): boolean {
  const escrowIndex = STATUS_ORDER.indexOf('ESCROW_HELD');
  const currentIndex = STATUS_ORDER.indexOf(status);
  // Also allow DISPUTE statuses
  if (status === 'DISPUTE_OPENED' || status === 'DISPUTE_RESOLVED') return true;
  return currentIndex >= escrowIndex;
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------
function ContractSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-40" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-56" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-16 w-full rounded-xl" />
        <div className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-[500px] w-full" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------
export default function ContractPage() {
  const params = useParams();
  const transactionId = Number(params.id);

  const [contractData, setContractData] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notAvailable, setNotAvailable] = useState(false);

  useEffect(() => {
    if (!transactionId) {
      setError('ID de transação inválido.');
      setLoading(false);
      return;
    }

    // In demo mode, skip API call and use mock data directly
    if (isDemoMode()) {
      setContractData({ ...demoContractData, transactionCode: `TXN-2026-${String(transactionId).padStart(4, '0')}` });
      setLoading(false);
      return;
    }

    transactionsService
      .getById(transactionId)
      .then((data) => {
        if (!data) {
          setError('Transação não encontrada.');
          return;
        }

        if (!isContractAvailable(data.status)) {
          setNotAvailable(true);
          return;
        }

        const listing = data.listing;
        const seller = data.seller;
        const buyer = data.buyer;

        const built: ContractData = {
          transactionCode: data.code,
          sellerName: seller?.name || seller?.display_name || 'Cedente',
          sellerCpf: seller?.cpf || '000.000.000-00',
          sellerEmail: seller?.email || '',
          buyerName: buyer?.name || buyer?.display_name || 'Cessionário',
          buyerCpf: buyer?.cpf || '000.000.000-00',
          buyerEmail: buyer?.email || '',
          eventTitle: listing?.title || 'Reserva de Evento',
          eventDate: listing?.event_date || '',
          venueName: listing?.venue_name || '',
          venueAddress: listing?.venue_address
            ? `${listing.venue_address}${listing.venue_city ? ` - ${listing.venue_city}` : ''}${listing.venue_state ? `/${listing.venue_state}` : ''}`
            : `${listing?.venue_city || ''}${listing?.venue_state ? `/${listing.venue_state}` : ''}`,
          providerName: listing?.provider_name || '',
          originalPrice: listing?.original_price || listing?.asking_price || data.agreed_price,
          agreedPrice: data.agreed_price,
          platformFee: data.platform_fee,
          platformName: 'EventSwap',
          transactionDate: data.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        };

        setContractData(built);
      })
      .catch(() => {
        // Fallback to demo data on API error
        setContractData({
          ...demoContractData,
          transactionCode: `TXN-2026-${String(transactionId).padStart(4, '0')}`,
        });
      })
      .finally(() => setLoading(false));
  }, [transactionId]);

  // --------------------------------------------------------------------------
  // Loading state
  // --------------------------------------------------------------------------
  if (loading) {
    return <ContractSkeleton />;
  }

  // --------------------------------------------------------------------------
  // Not available (status too early)
  // --------------------------------------------------------------------------
  if (notAvailable) {
    return (
      <div className="space-y-6">
        <Link
          href={`/purchases/${transactionId}`}
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para a Transação
        </Link>
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            Contrato ainda nao disponivel
          </h2>
          <p className="text-sm text-neutral-500 max-w-md">
            O contrato de cessao so estara disponivel apos a confirmacao do pagamento e
            retencao do valor em garantia (escrow). Aguarde a evolucao da transacao.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-2">
            <Link href={`/purchases/${transactionId}`}>
              Ver Status da Transacao
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Error state
  // --------------------------------------------------------------------------
  if (error || !contractData) {
    return (
      <div className="space-y-6">
        <Link
          href="/purchases"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Compras
        </Link>
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <FileText className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            Nao foi possivel carregar o contrato
          </h2>
          <p className="text-sm text-neutral-500">
            {error || 'Ocorreu um erro inesperado. Tente novamente mais tarde.'}
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Main render
  // --------------------------------------------------------------------------
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Back navigation */}
      <motion.div variants={staggerChild}>
        <Link
          href={`/purchases/${transactionId}`}
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para a Transacao
        </Link>
      </motion.div>

      {/* Page header */}
      <motion.div variants={staggerChild}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-950 dark:text-white">
              Contrato de Cessao
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Instrumento Particular de Cessao de Contrato de Evento &bull; Cod.{' '}
              <span className="font-mono text-[#6C3CE1]">{contractData.transactionCode}</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Contract preview */}
      <motion.div variants={staggerChild}>
        <ContractPreview contractData={contractData} />
      </motion.div>
    </motion.div>
  );
}
