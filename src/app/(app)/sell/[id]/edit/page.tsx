'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Save,
  Eye,
  Trash2,
  MapPin,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  User,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn, formatCurrency } from '@/lib/utils';
import { fadeUp } from '@/design-system/animations';
import { EVENT_CATEGORIES, BRAZILIAN_STATES } from '@/lib/constants';
import { listingsService } from '@/services/listings.service';
import { useAuth } from '@/hooks/use-auth';
import { FileUpload } from '@/components/shared/file-upload';
import type { EventCategory } from '@/types/database.types';

// ---------------------------------------------------------------------------
// Category mapping
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

const UI_TO_DB_CATEGORY: Record<string, EventCategory> = {
  casamento: 'WEDDING_VENUE',
  buffet: 'BUFFET',
  espaco: 'PARTY_VENUE',
  fotografia: 'PHOTOGRAPHER',
  musica: 'DJ_BAND',
  decoracao: 'DECORATION',
  video: 'VIDEOGRAPHER',
  convite: 'OTHER',
  'vestido-noiva': 'WEDDING_DRESS',
  'festa-infantil': 'PARTY_VENUE',
  corporativo: 'OTHER',
  outro: 'OTHER',
};

// ---------------------------------------------------------------------------
// DB status -> display label/variant
// ---------------------------------------------------------------------------
function getStatusDisplay(status: string): { label: string; variant: 'success' | 'secondary' | 'warning' | 'destructive' | 'default' } {
  const map: Record<string, { label: string; variant: 'success' | 'secondary' | 'warning' | 'destructive' | 'default' }> = {
    ACTIVE: { label: 'Ativo', variant: 'success' },
    DRAFT: { label: 'Rascunho', variant: 'secondary' },
    PENDING_REVIEW: { label: 'Em Analise', variant: 'warning' },
    SOLD: { label: 'Vendido', variant: 'default' },
    EXPIRED: { label: 'Expirado', variant: 'secondary' },
    CANCELLED: { label: 'Cancelado', variant: 'destructive' },
    SUSPENDED: { label: 'Suspenso', variant: 'destructive' },
  };
  return map[status] || { label: status, variant: 'secondary' };
}

// ---------------------------------------------------------------------------
// Form state type & empty default
// ---------------------------------------------------------------------------
interface FormState {
  title: string;
  description: string;
  category: string;
  eventDate: string;
  venueName: string;
  venueCity: string;
  venueState: string;
  originalPrice: string;
  askingPrice: string;
  isNegotiable: boolean;
  transferConditions: string;
  hasOriginalContract: boolean;
  providerName: string;
  providerPhone: string;
  providerEmail: string;
  status: string;
  viewCount: number;
  favoriteCount: number;
  publishedAt: string;
  images: string[];
}

const emptyFormState: FormState = {
  title: '',
  description: '',
  category: 'outro',
  eventDate: '',
  venueName: '',
  venueCity: '',
  venueState: '',
  originalPrice: '',
  askingPrice: '',
  isNegotiable: false,
  transferConditions: '',
  hasOriginalContract: false,
  providerName: '',
  providerPhone: '',
  providerEmail: '',
  status: 'DRAFT',
  viewCount: 0,
  favoriteCount: 0,
  publishedAt: '',
  images: [],
};


export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const listingId = Number(params.id);

  const [form, setForm] = useState<FormState>(emptyFormState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fetch existing listing data
  useEffect(() => {
    if (!listingId || isNaN(listingId)) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    listingsService
      .getById(listingId)
      .then((data) => {
        setForm({
          title: data.title,
          description: data.description || '',
          category: DB_TO_UI_CATEGORY[data.category] || 'outro',
          eventDate: data.event_date ? data.event_date.split('T')[0] : '',
          venueName: data.venue_name,
          venueCity: data.venue_city,
          venueState: data.venue_state || '',
          originalPrice: String(data.original_price),
          askingPrice: String(data.asking_price),
          isNegotiable: data.is_negotiable,
          transferConditions: data.transfer_conditions || '',
          hasOriginalContract: data.has_original_contract,
          providerName: data.provider_name || '',
          providerPhone: data.provider_phone || '',
          providerEmail: data.provider_email || '',
          status: data.status,
          viewCount: data.view_count ?? 0,
          favoriteCount: data.favorite_count ?? 0,
          publishedAt: data.published_at || data.created_at,
          images: data.images ?? [],
        });
        setIsLive(true);
      })
      .catch(() => {
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [listingId]);

  const updateField = (field: string, value: string | boolean | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (urls: string[]) => {
    updateField('images', urls);
  };

  const handleSave = async () => {
    if (!user) {
      toast.warning('Voce precisa estar logado para editar um anuncio.');
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const dbCategory = UI_TO_DB_CATEGORY[form.category] || 'OTHER';
      await listingsService.update(listingId, {
        title: form.title,
        description: form.description,
        category: dbCategory,
        event_date: form.eventDate,
        venue_name: form.venueName,
        venue_city: form.venueCity,
        venue_state: form.venueState,
        original_price: Number(form.originalPrice),
        asking_price: Number(form.askingPrice),
        is_negotiable: form.isNegotiable,
        transfer_conditions: form.transferConditions,
        has_original_contract: form.hasOriginalContract,
        provider_name: form.providerName,
        provider_phone: form.providerPhone || null,
        provider_email: form.providerEmail || null,
        images: form.images,
      });

      toast.success('Anuncio atualizado com sucesso!');
      router.push('/my-listings');
    } catch (err) {
      console.error('Erro ao salvar:', err);
      setSaveError('Erro ao salvar alteracoes. Tente novamente.');
      // Demo mode fallback
      if (!isLive) {
        toast.success('Anuncio atualizado com sucesso! (modo demo)');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este anuncio? Esta acao nao pode ser desfeita.')) return;

    setDeleting(true);
    try {
      await listingsService.cancel(listingId);
      toast.success('Anuncio excluido com sucesso!');
      router.push('/my-listings');
    } catch {
      toast.error('Erro ao excluir anuncio.');
    } finally {
      setDeleting(false);
    }
  };

  const statusDisplay = getStatusDisplay(form.status);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-[#2563EB] animate-spin" />
          <p className="text-sm text-zinc-500">Carregando anuncio...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Anuncio nao encontrado
        </h1>
        <p className="text-zinc-500">
          O anuncio que voce procura nao existe ou foi removido.
        </p>
        <Button asChild>
          <Link href="/my-listings">Voltar aos Meus Anuncios</Link>
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Back */}
      <Link
        href="/my-listings"
        className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Meus Anuncios
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950 dark:text-white">
            Editar Anuncio
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Atualize as informacoes do seu anuncio
            {!isLive && (
              <span className="ml-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                Modo demo
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/marketplace/${listingId}`}>
              <Eye className="h-4 w-4 mr-2" />
              Visualizar
            </Link>
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            loading={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Alteracoes
          </Button>
        </div>
      </div>

      {/* Save Error */}
      {saveError && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">
          {saveError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informacoes Basicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Titulo do Anuncio"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Ex: Buffet Premium para 200 pessoas"
              />

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Categoria
                </label>
                <select
                  value={form.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  className={cn(
                    'flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900',
                    'focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 focus:border-[#2563EB]',
                    'dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700'
                  )}
                >
                  {EVENT_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <Textarea
                label="Descricao"
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Descreva detalhes da reserva, o que inclui, diferenciais..."
                rows={5}
              />
            </CardContent>
          </Card>

          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalhes do Evento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="date"
                label="Data do Evento"
                value={form.eventDate}
                onChange={(e) => updateField('eventDate', e.target.value)}
                iconLeft={<Calendar className="h-4 w-4" />}
              />
              <Input
                label="Nome do Local/Fornecedor"
                value={form.venueName}
                onChange={(e) => updateField('venueName', e.target.value)}
                iconLeft={<MapPin className="h-4 w-4" />}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Cidade"
                  value={form.venueCity}
                  onChange={(e) => updateField('venueCity', e.target.value)}
                />
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Estado
                  </label>
                  <select
                    value={form.venueState}
                    onChange={(e) => updateField('venueState', e.target.value)}
                    className={cn(
                      'flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900',
                      'focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 focus:border-[#2563EB]',
                      'dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700'
                    )}
                  >
                    {BRAZILIAN_STATES.map((state) => (
                      <option key={state.uf} value={state.uf}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preco e Condicoes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="Preco Original (R$)"
                  value={form.originalPrice}
                  onChange={(e) => updateField('originalPrice', e.target.value)}
                  iconLeft={<DollarSign className="h-4 w-4" />}
                />
                <Input
                  type="number"
                  label="Preco de Venda (R$)"
                  value={form.askingPrice}
                  onChange={(e) => updateField('askingPrice', e.target.value)}
                  iconLeft={<DollarSign className="h-4 w-4" />}
                />
              </div>

              {Number(form.originalPrice) > Number(form.askingPrice) && Number(form.askingPrice) > 0 && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800">
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">
                    Desconto de{' '}
                    <span className="font-bold">
                      {Math.round(
                        ((Number(form.originalPrice) - Number(form.askingPrice)) /
                          Number(form.originalPrice)) *
                          100
                      )}
                      %
                    </span>{' '}
                    ({formatCurrency(Number(form.originalPrice) - Number(form.askingPrice))})
                  </p>
                </div>
              )}

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isNegotiable}
                  onChange={(e) => updateField('isNegotiable', e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-[#2563EB] focus:ring-[#2563EB]/50"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  Aceito propostas de valor (negociavel)
                </span>
              </label>

              <Textarea
                label="Condicoes de Transferencia"
                value={form.transferConditions}
                onChange={(e) =>
                  updateField('transferConditions', e.target.value)
                }
                placeholder="Descreva as condicoes para transferencia da reserva..."
                rows={3}
              />

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.hasOriginalContract}
                  onChange={(e) =>
                    updateField('hasOriginalContract', e.target.checked)
                  }
                  className="h-4 w-4 rounded border-neutral-300 text-[#2563EB] focus:ring-[#2563EB]/50"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  Possuo o contrato original da reserva
                </span>
              </label>
            </CardContent>
          </Card>

          {/* Provider Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contato do Fornecedor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Nome do Fornecedor"
                value={form.providerName}
                onChange={(e) => updateField('providerName', e.target.value)}
                iconLeft={<User className="h-4 w-4" />}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Telefone"
                  value={form.providerPhone}
                  onChange={(e) =>
                    updateField('providerPhone', e.target.value)
                  }
                  iconLeft={<Phone className="h-4 w-4" />}
                />
                <Input
                  type="email"
                  label="Email"
                  value={form.providerEmail}
                  onChange={(e) =>
                    updateField('providerEmail', e.target.value)
                  }
                  iconLeft={<Mail className="h-4 w-4" />}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">Status atual</span>
                <Badge variant={statusDisplay.variant}>{statusDisplay.label}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">Visualizacoes</span>
                <span className="text-sm font-medium text-neutral-900 dark:text-white">
                  {form.viewCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">Favoritos</span>
                <span className="text-sm font-medium text-neutral-900 dark:text-white">
                  {form.favoriteCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">Publicado em</span>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {form.publishedAt
                    ? new Date(form.publishedAt).toLocaleDateString('pt-BR')
                    : '-'}
                </span>
              </div>
              <Separator />
              <Button
                variant="outline"
                size="sm"
                className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 border-red-200 dark:border-red-800"
                onClick={handleDelete}
                loading={deleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Anuncio
              </Button>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-[#2563EB]" />
                Fotos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                bucket="listings"
                path={user?.id || String(listingId)}
                accept="image/jpeg,image/png,image/webp"
                multiple
                maxFiles={10}
                maxSizeMB={5}
                onUpload={handleImageUpload}
                existingFiles={form.images}
                label="Arraste suas fotos aqui"
                description="JPG, PNG ou WebP. Max 10 imagens, 5MB cada."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
