'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Building2,
  Heart,
  Share2,
  ShieldCheck,
  MessageSquare,
  FileText,
  CheckCircle2,
  User,
  BadgeCheck,
  Tag,
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { getEventCategory, PROTECTION_LEVELS_MAP } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { RatingStars } from '@/components/shared/rating-stars';
import { PriceTag } from '@/components/marketplace/price-tag';
import { PurchaseDialog } from '@/components/transactions/purchase-dialog';
import { TrustBadge } from '@/components/shared/trust-badge';
import { TrustScore } from '@/components/shared/trust-score';
import { getInitials } from '@/lib/utils';
import { listingsService } from '@/services/listings.service';
import { chatService } from '@/services/chat.service';
import { useAuth } from '@/hooks/use-auth';
import { isDemoMode } from '@/lib/demo-auth';
import type { Listing, Profile } from '@/types/database.types';

// ---------------------------------------------------------------------------
// DB category -> UI category mapping
// ---------------------------------------------------------------------------
const DB_TO_UI_CATEGORY: Record<string, string> = {
  WEDDING_VENUE: 'casamento',
  BUFFET: 'buffet',
  PHOTOGRAPHER: 'fotografia',
  VIDEOGRAPHER: 'video',
  DJ_BAND: 'musica',
  DECORATION: 'decoracao',
  CATERING: 'buffet',
  WEDDING_DRESS: 'vestido-noiva',
  BEAUTY_MAKEUP: 'outro',
  PARTY_VENUE: 'espaco',
  TRANSPORT: 'outro',
  ACCOMMODATION: 'outro',
  OTHER: 'outro',
};

// ---------------------------------------------------------------------------
// Mock data as fallback
// ---------------------------------------------------------------------------
const mockEvent = {
  id: 1,
  title: 'Buffet Premium para 200 pessoas - Villa Bianca',
  slug: 'buffet-premium-villa-bianca',
  category: 'buffet',
  status: 'active',
  description:
    'Reserva de buffet premium na Villa Bianca para ate 200 convidados. O pacote inclui entrada, prato principal, sobremesa, estacao de drinks e servico de garcom. Menu exclusivo com opcoes de culinaria internacional e brasileira. A Villa Bianca e reconhecida como um dos melhores espacos gastronomicos de Sao Paulo, com cozinha propria e equipe altamente qualificada. A reserva original foi feita para um casamento que precisou ser cancelado por motivos pessoais. Todos os detalhes do contrato original serao transferidos integralmente para o comprador, incluindo as mesmas condicoes de menu, quantidade de convidados e horario do evento.',
  images: [] as string[],
  venueName: 'Villa Bianca Eventos',
  venueCity: 'Sao Paulo',
  venueState: 'SP',
  venueAddress: 'Rua Augusta, 2500 - Jardins, Sao Paulo - SP',
  eventDate: '2026-06-15',
  eventTime: '19:00',
  originalPrice: 45000,
  askingPrice: 32000,
  protectionLevel: 'standard',
  hasOriginalContract: true,
  transferConditions:
    'A transferencia da reserva e feita diretamente com o fornecedor (Villa Bianca). O comprador assume todas as condicoes do contrato original, incluindo data, horario e quantidade de convidados. E possivel fazer ajustes no menu diretamente com o fornecedor apos a transferencia. Taxa de transferencia de R$ 500,00 cobrada pelo fornecedor ja esta inclusa no preco.',
  providerName: 'Villa Bianca Gastronomia Ltda.',
  providerContact: true,
  createdAt: '2026-01-15',
  sellerId: 'demo-seller',
  seller: {
    id: 10,
    name: 'Maria Silva',
    avatar: null as string | null,
    rating: 4.8,
    totalReviews: 23,
    memberSince: '2025-03-10',
    isVerified: true,
    totalSales: 12,
  },
};

type EventData = typeof mockEvent;

/**
 * Transforms a Supabase Listing (with joined seller) into the local view model.
 */
function mapListingToEventData(listing: Listing & { seller?: Profile | null }): EventData {
  const seller = listing.seller;
  return {
    id: listing.id,
    title: listing.title,
    slug: listing.slug,
    category: DB_TO_UI_CATEGORY[listing.category] || 'outro',
    status: listing.status.toLowerCase(),
    description: listing.description || '',
    images: listing.images ?? [],
    venueName: listing.venue_name,
    venueCity: listing.venue_city,
    venueState: listing.venue_state ?? '',
    venueAddress: listing.venue_address ?? '',
    eventDate: listing.event_date,
    eventTime: '19:00', // not stored in DB, default
    originalPrice: listing.original_price,
    askingPrice: listing.asking_price,
    protectionLevel: 'standard',
    hasOriginalContract: listing.has_original_contract,
    transferConditions: listing.transfer_conditions || '',
    providerName: listing.provider_name || '',
    providerContact: !!listing.provider_phone || !!listing.provider_email,
    createdAt: listing.created_at,
    sellerId: listing.seller_id,
    seller: {
      id: seller ? Number(seller.id.slice(0, 8)) : 0,
      name: seller?.name || 'Vendedor',
      avatar: seller?.avatar_url ?? null,
      rating: seller?.rating_avg ?? 0,
      totalReviews: seller?.rating_count ?? 0,
      memberSince: seller?.created_at || '',
      isVerified: seller?.is_verified ?? false,
      totalSales: 0,
    },
  };
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slugOrId = params.id as string;
  const { user } = useAuth();

  const [event, setEvent] = useState<EventData>(mockEvent);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  useEffect(() => {
    if (!slugOrId) return;
    setLoading(true);
    setNotFound(false);

    // Try fetching by numeric id first, fallback to slug
    const isNumericId = /^\d+$/.test(slugOrId);
    const fetchPromise = isNumericId
      ? listingsService.getById(Number(slugOrId))
      : listingsService.getBySlug(slugOrId);

    fetchPromise
      .then((data) => {
        setEvent(mapListingToEventData(data));
        setIsLive(true);
      })
      .catch(() => {
        // If the slug matches the mock, show it; otherwise 404
        if (slugOrId === mockEvent.slug || slugOrId === String(mockEvent.id)) {
          setEvent(mockEvent);
        } else {
          setNotFound(true);
        }
      })
      .finally(() => setLoading(false));
  }, [slugOrId]);

  const handleFavoriteToggle = async () => {
    if (user && isLive) {
      try {
        const result = await listingsService.toggleFavorite(event.id, user.id);
        setIsFavorited(result);
      } catch {
        setIsFavorited(!isFavorited);
      }
    } else {
      setIsFavorited(!isFavorited);
    }
  };

  // Check if current user is the seller of this listing
  const isOwnListing = user ? user.id === event.sellerId : false;

  const handleBuyClick = () => {
    if (!user) {
      toast.info('Faca login para comprar', {
        description: 'Voce precisa estar logado para comprar uma reserva.',
      });
      router.push('/login');
      return;
    }
    setPurchaseDialogOpen(true);
  };

  const handleSendMessage = async () => {
    if (!user) {
      toast.info('Faca login para enviar mensagem', {
        description: 'Voce precisa estar logado para enviar mensagens.',
      });
      router.push('/login');
      return;
    }

    setIsSendingMessage(true);

    try {
      if (isDemoMode()) {
        // In demo mode, simulate conversation creation
        await new Promise((resolve) => setTimeout(resolve, 600));

        const demoConversationId = `demo-conv-${event.id}`;

        // Store a mock conversation in localStorage for the chat page
        const existingConversations = JSON.parse(
          localStorage.getItem('eventswap_demo_conversations') || '[]'
        );
        const alreadyExists = existingConversations.some(
          (c: { id: string }) => c.id === demoConversationId
        );

        if (!alreadyExists) {
          existingConversations.unshift({
            id: demoConversationId,
            participant_1: user.id,
            participant_2: event.sellerId,
            seller_name: event.seller.name,
            listing_title: event.title,
            created_at: new Date().toISOString(),
          });
          localStorage.setItem(
            'eventswap_demo_conversations',
            JSON.stringify(existingConversations)
          );
        }

        toast.success('Conversa iniciada!', {
          description: `Voce pode conversar com ${event.seller.name} agora.`,
        });

        router.push(`/chat/${demoConversationId}`);
      } else {
        // Real mode: get or create conversation
        const conversation = await chatService.getOrCreateConversation(
          user.id,
          event.sellerId
        );

        toast.success('Conversa iniciada!', {
          description: `Voce pode conversar com ${event.seller.name} agora.`,
        });

        router.push(`/chat/${conversation.id}`);
      }
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Erro ao iniciar conversa', {
        description: 'Tente novamente em alguns instantes.',
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-[#6C3CE1] animate-spin" />
          <p className="text-sm text-zinc-500">Carregando anuncio...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (notFound) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Anuncio nao encontrado
          </h1>
          <p className="text-zinc-500">
            O anuncio que voce procura nao existe ou foi removido.
          </p>
          <Button asChild>
            <Link href="/marketplace">Voltar ao Marketplace</Link>
          </Button>
        </div>
      </div>
    );
  }

  const categoryData = getEventCategory(event.category);
  const hasDiscount = event.originalPrice > event.askingPrice;
  const discountPercent = hasDiscount
    ? Math.round(
        ((event.originalPrice - event.askingPrice) /
          event.originalPrice) *
          100
      )
    : 0;
  const protection = PROTECTION_LEVELS_MAP[event.protectionLevel];

  // Generate placeholder images for gallery
  const galleryImages = event.images.length > 0
    ? event.images
    : Array.from({ length: 5 }, (_, i) => `placeholder-${i}`);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Top Bar */}
      <div className="bg-white border-b border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-[#6C3CE1] transition-colors dark:text-zinc-400 dark:hover:text-[#A78BFA]"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Marketplace
            </Link>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavoriteToggle}
                className={cn(
                  isFavorited && 'text-red-500 hover:text-red-600'
                )}
              >
                <Heart
                  className={cn(
                    'h-4 w-4 mr-1.5',
                    isFavorited && 'fill-red-500'
                  )}
                />
                {isFavorited ? 'Favoritado' : 'Favoritar'}
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4 mr-1.5" />
                Compartilhar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="overflow-hidden">
                <div className="relative">
                  {/* Main Image */}
                  <div className="relative h-64 sm:h-80 md:h-96 w-full bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-200 dark:from-zinc-800 dark:via-zinc-750 dark:to-zinc-800 flex items-center justify-center">
                    <div className="text-zinc-400 dark:text-zinc-600 text-center">
                      <svg
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mx-auto mb-2"
                      >
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                      </svg>
                      <p className="text-sm">Imagem {selectedImageIndex + 1} de {galleryImages.length}</p>
                    </div>

                    {/* Navigation Arrows */}
                    {galleryImages.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setSelectedImageIndex(
                              selectedImageIndex === 0
                                ? galleryImages.length - 1
                                : selectedImageIndex - 1
                            )
                          }
                          className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-md backdrop-blur-sm hover:bg-white transition-colors dark:bg-zinc-900/80 dark:hover:bg-zinc-900"
                          aria-label="Imagem anterior"
                        >
                          <ChevronLeft className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                        </button>
                        <button
                          onClick={() =>
                            setSelectedImageIndex(
                              selectedImageIndex === galleryImages.length - 1
                                ? 0
                                : selectedImageIndex + 1
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-md backdrop-blur-sm hover:bg-white transition-colors dark:bg-zinc-900/80 dark:hover:bg-zinc-900"
                          aria-label="Proxima imagem"
                        >
                          <ChevronRight className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                        </button>
                      </>
                    )}

                    {/* Discount Overlay */}
                    {hasDiscount && (
                      <div className="absolute top-4 left-4">
                        <Badge className="border-0 bg-red-500 text-white text-sm font-bold shadow-lg px-3 py-1">
                          -{discountPercent}% OFF
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Thumbnails */}
                  <div className="flex gap-2 p-3 overflow-x-auto">
                    {galleryImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={cn(
                          'h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200',
                          'bg-gradient-to-br from-zinc-200 to-zinc-100 dark:from-zinc-700 dark:to-zinc-800',
                          'flex items-center justify-center',
                          selectedImageIndex === index
                            ? 'border-[#6C3CE1] ring-2 ring-[#6C3CE1]/20'
                            : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-600'
                        )}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="text-zinc-400 dark:text-zinc-500"
                        >
                          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Title & Badges */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge
                  className="border-0 text-white"
                  style={{ backgroundColor: categoryData.color }}
                >
                  {categoryData.label}
                </Badge>
                <Badge variant="success">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Ativo
                </Badge>
                {!isLive && (
                  <Badge variant="outline" className="text-amber-600 border-amber-300">
                    Modo demo
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl mb-2">
                {event.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {event.venueCity}, {event.venueState}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formatDate(event.eventDate)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {event.eventTime}
                </span>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-[#6C3CE1]" />
                    Descricao
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
                    {event.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Event Details Grid */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[#6C3CE1]" />
                    Detalhes do Evento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Date */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6C3CE1]/10">
                        <Calendar className="h-5 w-5 text-[#6C3CE1]" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          Data do Evento
                        </p>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {formatDate(event.eventDate, { dateStyle: 'long' })}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          as {event.eventTime}
                        </p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6C3CE1]/10">
                        <MapPin className="h-5 w-5 text-[#6C3CE1]" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          Local
                        </p>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {event.venueCity}, {event.venueState}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {event.venueAddress}
                        </p>
                      </div>
                    </div>

                    {/* Venue */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6C3CE1]/10">
                        <Building2 className="h-5 w-5 text-[#6C3CE1]" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          Espaco / Fornecedor
                        </p>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {event.venueName}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {event.providerName}
                        </p>
                      </div>
                    </div>

                    {/* Category */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6C3CE1]/10">
                        <Tag className="h-5 w-5 text-[#6C3CE1]" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          Categoria
                        </p>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {categoryData.label}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {categoryData.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Transfer Conditions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#6C3CE1]" />
                    Condicoes de Transferencia
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {event.transferConditions}
                  </p>

                  {/* Contract Badge */}
                  {event.hasOriginalContract && (
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900">
                        <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                          Contrato Original Disponivel
                        </p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                          O vendedor possui o contrato original do fornecedor para verificacao
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            {/* Price Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-br from-[#6C3CE1] to-[#9B6DFF] p-6 text-white">
                  <p className="text-sm font-medium text-white/80 mb-1">
                    Preco da Reserva
                  </p>
                  <PriceTag
                    originalPrice={event.originalPrice}
                    askingPrice={event.askingPrice}
                    size="lg"
                    className="[&_span]:text-white [&_.text-\\[\\#6C3CE1\\]]:text-white [&_.dark\\:text-\\[\\#A78BFA\\]]:text-white [&_.text-zinc-400]:text-white/60 [&_.line-through]:text-white/60"
                  />
                  {hasDiscount && (
                    <div className="mt-3 flex items-center gap-2">
                      <Badge className="bg-white/20 text-white border-0 font-semibold">
                        Economia de {formatCurrency(event.originalPrice - event.askingPrice)}
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-6 space-y-3">
                  {isOwnListing ? (
                    <div className="text-center py-2">
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Este e o seu anuncio
                      </p>
                    </div>
                  ) : (
                    <Button
                      size="xl"
                      className="w-full"
                      onClick={handleBuyClick}
                    >
                      Comprar Reserva
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={handleSendMessage}
                    loading={isSendingMessage}
                    disabled={isSendingMessage}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {isSendingMessage ? 'Iniciando conversa...' : 'Enviar Mensagem'}
                  </Button>

                  {/* Security badges */}
                  <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
                    <TrustBadge variant="protected-transaction" size="sm" />
                    <TrustBadge variant="escrow-active" size="sm" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Seller Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Vendedor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      {event.seller.avatar && (
                        <AvatarImage
                          src={event.seller.avatar}
                          alt={event.seller.name}
                        />
                      )}
                      <AvatarFallback className="text-sm">
                        {getInitials(event.seller.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {event.seller.name}
                        </span>
                        {event.seller.isVerified && (
                          <BadgeCheck className="h-4 w-4 text-[#6C3CE1]" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <RatingStars
                          rating={event.seller.rating}
                          size="sm"
                          showValue
                        />
                        <span className="text-xs text-zinc-400">
                          ({event.seller.totalReviews} avaliacoes)
                        </span>
                      </div>
                    </div>
                    {/* Trust Score ring */}
                    <TrustScore
                      profile={{
                        rating_avg: event.seller.rating,
                        rating_count: event.seller.totalReviews,
                        is_verified: event.seller.isVerified,
                        transaction_count: event.seller.totalSales,
                        created_at: event.seller.memberSince,
                      }}
                      size="sm"
                    />
                  </div>

                  {/* Trust Badges row */}
                  <div className="flex flex-wrap gap-2">
                    {event.seller.isVerified && (
                      <TrustBadge variant="verified-seller" size="sm" />
                    )}
                    {event.seller.rating >= 4.5 && event.seller.totalSales >= 5 && (
                      <TrustBadge variant="top-seller" size="sm" />
                    )}
                    {event.seller.rating >= 4.5 && event.seller.totalSales >= 5 && (
                      <TrustBadge variant="fast-response" size="sm" />
                    )}
                    {event.seller.totalSales === 0 && !event.seller.isVerified && (
                      <TrustBadge variant="new-user" size="sm" />
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        Membro desde
                      </span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {event.seller.memberSince
                          ? formatDate(event.seller.memberSince, {
                              month: 'short',
                              year: 'numeric',
                            })
                          : '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5" />
                        Vendas realizadas
                      </span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {event.seller.totalSales}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Verificado
                      </span>
                      {event.seller.isVerified ? (
                        <Badge variant="success" className="text-[10px]">
                          Sim
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">
                          Nao
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Protection Level Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: protection?.color + '15' }}
                    >
                      <ShieldCheck
                        className="h-5 w-5"
                        style={{ color: protection?.color }}
                      />
                    </div>
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: protection?.color }}
                      >
                        {protection?.label || 'Protecao Padrao'}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                        {protection?.description ||
                          'Verificacao completa, escrow de pagamento e suporte na transferencia'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Published Date */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.35 }}
              className="text-center"
            >
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Anuncio publicado em {formatDate(event.createdAt)}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Purchase Dialog */}
      {user && (
        <PurchaseDialog
          open={purchaseDialogOpen}
          onOpenChange={setPurchaseDialogOpen}
          listing={{
            id: event.id,
            title: event.title,
            askingPrice: event.askingPrice,
            sellerId: event.sellerId,
            sellerName: event.seller.name,
          }}
          buyerId={user.id}
        />
      )}
    </div>
  );
}
