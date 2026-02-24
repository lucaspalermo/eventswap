'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Tag,
  Eye,
  Heart,
  CheckCircle2,
  XCircle,
  Ban,
  AlertTriangle,
  User,
  ShieldCheck,
  ImageIcon,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { RatingStars } from '@/components/shared/rating-stars';
import { formatCurrency } from '@/lib/utils';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};



type ListingReport = {
  id: number;
  reason: string;
  description: string;
  reportedBy: string;
  date: string;
  status: 'open' | 'resolved';
};

type ListingData = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  originalPrice: number;
  discount: number;
  status: string;
  eventDate: string;
  location: string;
  views: number;
  favorites: number;
  images: number;
  protection: string;
  createdAt: string;
  updatedAt: string;
  seller: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    rating: number;
    totalSales: number;
    memberSince: string;
    verified: boolean;
  };
  reports: ListingReport[];
};

const categoryLabels: Record<string, string> = {
  WEDDING_VENUE: 'Espaco',
  BUFFET: 'Buffet',
  PHOTOGRAPHER: 'Fotografia',
  VIDEOGRAPHER: 'Filmagem',
  DJ_BAND: 'Musica e DJ',
  DECORATION: 'Decoracao',
  CATERING: 'Catering',
  WEDDING_DRESS: 'Vestido de Noiva',
  BEAUTY_MAKEUP: 'Beleza',
  PARTY_VENUE: 'Espaco Festa',
  TRANSPORT: 'Transporte',
  ACCOMMODATION: 'Hospedagem',
  OTHER: 'Outro',
};

export default function AdminEventDetailPage() {
  const params = useParams();
  const listingId = Number(params.id);

  const [moderationReason, setModerationReason] = useState('');
  const [listing, setListing] = useState<ListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function loadListing() {
      try {
        const data = await adminService.getListingById(listingId);
        if (data) {
          const seller = data.seller as Record<string, unknown> | null;
          const discount =
            Number(data.original_price) > Number(data.asking_price)
              ? Math.round(
                  ((Number(data.original_price) - Number(data.asking_price)) /
                    Number(data.original_price)) *
                    100
                )
              : 0;

          setListing({
            id: data.id as number,
            title: (data.title as string) || 'Sem titulo',
            description: (data.description as string) || '',
            category:
              categoryLabels[(data.category as string)] ||
              (data.category as string) ||
              'Outro',
            price: Number(data.asking_price) || 0,
            originalPrice: Number(data.original_price) || 0,
            discount,
            status: (data.status as string) || 'DRAFT',
            eventDate: (data.event_date as string) || '',
            location: `${(data.venue_city as string) || ''}, ${(data.venue_state as string) || ''}`,
            views: (data.view_count as number) || 0,
            favorites: (data.favorite_count as number) || 0,
            images: ((data.images as string[]) || []).length,
            protection: 'standard',
            createdAt: data.created_at as string,
            updatedAt: data.updated_at as string,
            seller: {
              id: String(seller?.id || ''),
              name: (seller?.name as string) || 'Vendedor',
              email: (seller?.email as string) || '',
              avatar: ((seller?.name as string) || 'V')
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2),
              rating: Number(seller?.rating_avg) || 0,
              totalSales: (seller?.totalSales as number) || 0,
              memberSince: (seller?.created_at as string) || '',
              verified: (seller?.is_verified as boolean) || false,
            },
            reports: [],
          });
        } else {
          setListing(null);
        }
      } catch {
        setListing(null);
      } finally {
        setLoading(false);
      }
    }
    loadListing();
  }, [listingId]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await adminService.approveListing(listingId);
      setListing((prev) => prev ? { ...prev, status: 'ACTIVE' } : prev);
      toast.success('Anuncio aprovado com sucesso!');
    } catch {
      toast.error('Erro ao aprovar anuncio. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await adminService.rejectListing(listingId);
      setListing((prev) => prev ? { ...prev, status: 'CANCELLED' } : prev);
      toast.success('Anuncio rejeitado.');
    } catch {
      toast.error('Erro ao rejeitar anuncio. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  };

  if (!loading && !listing) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle className="h-12 w-12 text-zinc-300 dark:text-zinc-600 mb-4" />
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          Anuncio nao encontrado
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          O anuncio solicitado nao existe ou nao pode ser carregado.
        </p>
        <Link href="/admin/events">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Anuncios
          </Button>
        </Link>
      </div>
    );
  }

  const statusLabel =
    listing?.status === 'PENDING_REVIEW'
      ? 'Pendente'
      : listing?.status === 'ACTIVE'
        ? 'Ativo'
        : listing?.status === 'CANCELLED'
          ? 'Cancelado'
          : listing?.status || '';

  const statusVariant =
    listing?.status === 'PENDING_REVIEW'
      ? 'warning'
      : listing?.status === 'ACTIVE'
        ? 'success'
        : listing?.status === 'CANCELLED'
          ? 'destructive'
          : ('outline' as const);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Back button */}
      <motion.div variants={itemVariants}>
        <Link href="/admin/events">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Anuncios
          </Button>
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 xl:col-span-2">
          {/* Listing Details */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                {loading ? (
                  <div className="space-y-4">
                    <div className="h-6 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                    <div className="h-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                    <div className="grid grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-12 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                      ))}
                    </div>
                  </div>
                ) : listing && (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-mono text-zinc-400">#{listing.id}</span>
                          <Badge variant={statusVariant as 'warning' | 'success' | 'destructive' | 'outline'}>
                            {statusLabel}
                          </Badge>
                        </div>
                        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                          {listing.title}
                        </h1>
                      </div>
                      <Button variant="destructive" size="sm" className="gap-2 shrink-0">
                        <Ban className="h-4 w-4" />
                        Suspender Anuncio
                      </Button>
                    </div>

                    <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                      {listing.description}
                    </p>

                    <Separator />

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <div className="space-y-1">
                        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Preco</p>
                        <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(listing.price)}
                        </p>
                        {listing.originalPrice > listing.price && (
                          <p className="text-xs text-zinc-400 line-through">
                            {formatCurrency(listing.originalPrice)}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Categoria</p>
                        <div className="flex items-center gap-1.5">
                          <Tag className="h-4 w-4 text-[#2563EB]" />
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {listing.category}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Data do Evento</p>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-zinc-400" />
                          <span className="text-sm text-zinc-900 dark:text-zinc-100">
                            {listing.eventDate ? new Date(listing.eventDate).toLocaleDateString('pt-BR') : 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Localizacao</p>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-zinc-400" />
                          <span className="text-sm text-zinc-900 dark:text-zinc-100">
                            {listing.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Stats row */}
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                        <Eye className="h-4 w-4" />
                        {listing.views} visualizacoes
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                        <Heart className="h-4 w-4" />
                        {listing.favorites} favoritos
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                        <ImageIcon className="h-4 w-4" />
                        {listing.images} imagens
                      </div>
                      {listing.discount > 0 && (
                        <Badge variant="success">{listing.discount}% OFF</Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-zinc-400">
                      <span>Criado: {new Date(listing.createdAt).toLocaleDateString('pt-BR')}</span>
                      <span>Atualizado: {new Date(listing.updatedAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Moderation Section */}
          {listing?.status === 'PENDING_REVIEW' && (
            <motion.div variants={itemVariants}>
              <Card className="border-amber-200 dark:border-amber-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <ShieldCheck className="h-5 w-5" />
                    Moderacao
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    label="Motivo (opcional para aprovacao, obrigatorio para rejeicao)"
                    placeholder="Informe o motivo da sua decisao..."
                    value={moderationReason}
                    onChange={(e) => setModerationReason(e.target.value)}
                    rows={3}
                  />
                  <div className="flex items-center gap-3">
                    <Button
                      className="gap-2"
                      onClick={handleApprove}
                      disabled={actionLoading}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Aprovar Anuncio
                    </Button>
                    <Button
                      variant="destructive"
                      className="gap-2"
                      onClick={handleReject}
                      disabled={actionLoading}
                    >
                      <XCircle className="h-4 w-4" />
                      Rejeitar Anuncio
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Report History */}
          {listing && listing.reports.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card className="border-red-200 dark:border-red-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <AlertTriangle className="h-5 w-5" />
                    Historico de Denuncias ({listing.reports.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {listing.reports.map((report) => (
                      <div
                        key={report.id}
                        className="rounded-lg border border-red-100 bg-red-50/50 p-4 dark:border-red-900 dark:bg-red-950/30"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-red-700 dark:text-red-400">
                            {report.reason}
                          </span>
                          <Badge variant={report.status === 'open' ? 'destructive' : 'secondary'}>
                            {report.status === 'open' ? 'Aberta' : 'Resolvida'}
                          </Badge>
                        </div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-2">
                          {report.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-zinc-400">
                          <span>Denunciado por: {report.reportedBy}</span>
                          <span>{new Date(report.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Sidebar - Seller Info */}
        <div className="space-y-6">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informacoes do Vendedor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-700" />
                      <div className="space-y-2 flex-1">
                        <div className="h-5 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                        <div className="h-4 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                      </div>
                    </div>
                  </div>
                ) : listing && (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#2563EB]/10 text-lg font-bold text-[#2563EB]">
                        {listing.seller.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {listing.seller.name}
                          </h3>
                          {listing.seller.verified && (
                            <ShieldCheck className="h-4 w-4 text-emerald-500" />
                          )}
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {listing.seller.email}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">Avaliacao</span>
                        <RatingStars rating={listing.seller.rating} size="sm" showValue />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">Vendas</span>
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {listing.seller.totalSales}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">Membro desde</span>
                        <span className="text-sm text-zinc-600 dark:text-zinc-300">
                          {listing.seller.memberSince ? new Date(listing.seller.memberSince).toLocaleDateString('pt-BR') : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <Link href={`/admin/users/${listing.seller.id}`}>
                      <Button variant="outline" className="w-full mt-2 gap-2">
                        <User className="h-4 w-4" />
                        Ver Perfil Completo
                      </Button>
                    </Link>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
