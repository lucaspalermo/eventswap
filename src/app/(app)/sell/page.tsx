'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Calendar,
  MapPin,
  DollarSign,
  FileText,
  Eye,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EVENT_CATEGORIES, BRAZILIAN_STATES } from '@/lib/constants';
import { cn, formatCurrency, generateSlug } from '@/lib/utils';
import { fadeUp, staggerContainer, staggerChild } from '@/design-system/animations';
import { listingsService } from '@/services/listings.service';
import { useAuth } from '@/hooks/use-auth';
import { FileUpload } from '@/components/shared/file-upload';
import { PricingAssistant } from '@/components/listings/pricing-assistant';
import type { EventCategory } from '@/types/database.types';

// ---------------------------------------------------------------------------
// UI category id -> Database EventCategory enum
// ---------------------------------------------------------------------------
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

interface FormData {
  // Step 1
  category: string;
  title: string;
  description: string;
  eventDate: string;
  venueName: string;
  venueCity: string;
  venueState: string;
  // Step 2
  originalPrice: string;
  askingPrice: string;
  isNegotiable: boolean;
  transferConditions: string;
  hasOriginalContract: boolean;
  providerName: string;
  providerPhone: string;
  providerEmail: string;
  // Step 3
  imageUrls: string[];
}

interface FormErrors {
  [key: string]: string;
}

const steps = [
  { id: 1, title: 'Informacoes do Evento', icon: FileText },
  { id: 2, title: 'Precos e Condicoes', icon: DollarSign },
  { id: 3, title: 'Fotos e Publicacao', icon: ImageIcon },
];

export default function SellPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [verificationLevel, setVerificationLevel] = useState<string | null>(null);

  // Check verification level
  useEffect(() => {
    async function checkVerification() {
      try {
        const response = await fetch('/api/kyc');
        if (response.ok) {
          const result = await response.json();
          setVerificationLevel(result.data?.profile?.verification_level || 'none');
        }
      } catch {
        // Default to allowing, will be caught server-side
        setVerificationLevel(null);
      }
    }
    if (user) checkVerification();
  }, [user]);
  const [formData, setFormData] = useState<FormData>({
    category: '',
    title: '',
    description: '',
    eventDate: '',
    venueName: '',
    venueCity: '',
    venueState: '',
    originalPrice: '',
    askingPrice: '',
    isNegotiable: true,
    transferConditions: '',
    hasOriginalContract: false,
    providerName: '',
    providerPhone: '',
    providerEmail: '',
    imageUrls: [],
  });

  const updateField = (field: keyof FormData, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.category) newErrors.category = 'Selecione uma categoria';
    if (!formData.title.trim()) newErrors.title = 'Informe o titulo do anuncio';
    if (formData.title.length > 120) newErrors.title = 'Titulo deve ter no maximo 120 caracteres';
    if (!formData.description.trim()) newErrors.description = 'Informe a descricao do anuncio';
    if (!formData.eventDate) newErrors.eventDate = 'Informe a data do evento';
    if (!formData.venueName.trim()) newErrors.venueName = 'Informe o nome do local';
    if (!formData.venueCity.trim()) newErrors.venueCity = 'Informe a cidade';
    if (!formData.venueState) newErrors.venueState = 'Selecione o estado';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.originalPrice) newErrors.originalPrice = 'Informe o preco original';
    if (!formData.askingPrice) newErrors.askingPrice = 'Informe o preco pedido';
    if (Number(formData.askingPrice) < 50)
      newErrors.askingPrice = 'O preco minimo e R$ 50,00';
    if (Number(formData.askingPrice) > 500000)
      newErrors.askingPrice = 'O preco maximo e R$ 500.000,00';
    if (!formData.transferConditions.trim())
      newErrors.transferConditions = 'Informe as condicoes de transferencia';
    if (!formData.providerName.trim()) newErrors.providerName = 'Informe o nome do fornecedor';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handlePublish = async () => {
    if (!user) {
      toast.warning('Voce precisa estar logado para publicar um anuncio.');
      return;
    }

    setIsPublishing(true);
    setPublishError(null);

    try {
      const slug = generateSlug(formData.title);
      const dbCategory = UI_TO_DB_CATEGORY[formData.category] || 'OTHER';

      const created = await listingsService.create({
        seller_id: user.id,
        title: formData.title,
        description: formData.description,
        category: dbCategory,
        event_date: formData.eventDate,
        venue_name: formData.venueName,
        venue_city: formData.venueCity,
        venue_state: formData.venueState,
        original_price: Number(formData.originalPrice),
        asking_price: Number(formData.askingPrice),
        is_negotiable: formData.isNegotiable,
        transfer_conditions: formData.transferConditions,
        has_original_contract: formData.hasOriginalContract,
        provider_name: formData.providerName,
        provider_phone: formData.providerPhone || null,
        provider_email: formData.providerEmail || null,
        slug,
        status: 'DRAFT',
        images: formData.imageUrls,
      });

      // Publish the listing (set status to PENDING_REVIEW)
      await listingsService.publish(created.id);

      toast.success('Anuncio publicado com sucesso!', { description: 'Ele sera revisado pela equipe antes de aparecer no marketplace.' });
      router.push('/my-listings');
    } catch (err) {
      console.error('Erro ao publicar anuncio:', err);
      setPublishError('Erro ao publicar anuncio. Tente novamente.');
      // Fallback: simulate success for demo mode
      toast.success('Anuncio publicado com sucesso! (modo demo)');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleImageUpload = (urls: string[]) => {
    updateField('imageUrls', urls);
  };

  const discount =
    formData.originalPrice && formData.askingPrice
      ? Math.round(
          ((Number(formData.originalPrice) - Number(formData.askingPrice)) /
            Number(formData.originalPrice)) *
            100
        )
      : 0;

  const selectedCategory = EVENT_CATEGORIES.find((c) => c.id === formData.category);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <h1 className="text-2xl font-semibold text-neutral-950 dark:text-white">
          Criar Anuncio
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Publique sua reserva de evento e encontre um comprador
        </p>
      </motion.div>

      {/* Verification Warning */}
      {verificationLevel === 'none' && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
                  <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    Verificacao de identidade necessaria
                  </p>
                  <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-1">
                    Para criar anuncios e vender reservas no EventSwap, voce precisa verificar sua identidade.
                    Isso garante a seguranca de todos os usuarios da plataforma.
                  </p>
                  <Link href="/settings/verification">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 gap-2 border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/30"
                    >
                      Verificar Identidade
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Step Indicator */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-center gap-0"
      >
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => {
                if (step.id < currentStep) setCurrentStep(step.id);
              }}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300',
                currentStep === step.id
                  ? 'bg-[#6C3CE1] text-white shadow-md shadow-[#6C3CE1]/25'
                  : step.id < currentStep
                    ? 'bg-emerald-50 text-emerald-700 cursor-pointer hover:bg-emerald-100'
                    : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500'
              )}
            >
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                  currentStep === step.id
                    ? 'bg-white/20 text-white'
                    : step.id < currentStep
                      ? 'bg-emerald-500 text-white'
                      : 'bg-neutral-200 text-neutral-500 dark:bg-neutral-700'
                )}
              >
                {step.id < currentStep ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  step.id
                )}
              </span>
              <span className="text-sm font-medium hidden sm:inline">
                {step.title}
              </span>
            </button>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-8 md:w-16 h-0.5 mx-1',
                  step.id < currentStep
                    ? 'bg-emerald-400'
                    : 'bg-neutral-200 dark:bg-neutral-700'
                )}
              />
            )}
          </div>
        ))}
      </motion.div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <Card className="hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#6C3CE1]" />
                  Informacoes do Evento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <motion.div variants={staggerChild}>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Categoria
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={(val) => updateField('category', val)}
                  >
                    <SelectTrigger
                      className={cn(errors.category && 'border-red-500')}
                    >
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-xs font-medium text-red-500 mt-1">
                      {errors.category}
                    </p>
                  )}
                </motion.div>

                <motion.div variants={staggerChild}>
                  <Input
                    label="Titulo do Anuncio"
                    placeholder="Ex: Buffet Premium Villa Bianca - Casamento 200 pessoas"
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    error={errors.title}
                    hint={`${formData.title.length}/120 caracteres`}
                  />
                </motion.div>

                <motion.div variants={staggerChild}>
                  <Textarea
                    label="Descricao"
                    placeholder="Descreva detalhes do servico, o que esta incluso, capacidade, etc."
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    error={errors.description}
                    rows={5}
                  />
                </motion.div>

                <motion.div variants={staggerChild}>
                  <Input
                    label="Data do Evento"
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => updateField('eventDate', e.target.value)}
                    error={errors.eventDate}
                    iconLeft={<Calendar className="h-4 w-4" />}
                  />
                </motion.div>

                <Separator />

                <motion.div variants={staggerChild}>
                  <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#6C3CE1]" />
                    Local do Evento
                  </h3>
                  <div className="space-y-4">
                    <Input
                      label="Nome do Local"
                      placeholder="Ex: Espaco Villa Bianca"
                      value={formData.venueName}
                      onChange={(e) => updateField('venueName', e.target.value)}
                      error={errors.venueName}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Cidade"
                        placeholder="Ex: Sao Paulo"
                        value={formData.venueCity}
                        onChange={(e) => updateField('venueCity', e.target.value)}
                        error={errors.venueCity}
                      />
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                          Estado
                        </label>
                        <Select
                          value={formData.venueState}
                          onValueChange={(val) => updateField('venueState', val)}
                        >
                          <SelectTrigger
                            className={cn(
                              errors.venueState && 'border-red-500'
                            )}
                          >
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
                        {errors.venueState && (
                          <p className="text-xs font-medium text-red-500 mt-1">
                            {errors.venueState}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <Card className="hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-[#6C3CE1]" />
                  Precos e Condicoes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <motion.div
                  variants={staggerChild}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <Input
                    label="Preco Original (R$)"
                    type="number"
                    placeholder="0,00"
                    value={formData.originalPrice}
                    onChange={(e) => updateField('originalPrice', e.target.value)}
                    error={errors.originalPrice}
                    iconLeft={<span className="text-sm font-medium">R$</span>}
                  />
                  <Input
                    label="Preco Pedido (R$)"
                    type="number"
                    placeholder="0,00"
                    value={formData.askingPrice}
                    onChange={(e) => updateField('askingPrice', e.target.value)}
                    error={errors.askingPrice}
                    iconLeft={<span className="text-sm font-medium">R$</span>}
                  />
                </motion.div>

                {discount > 0 && (
                  <motion.div
                    variants={staggerChild}
                    className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3 text-sm text-emerald-700 dark:text-emerald-400"
                  >
                    Desconto de <strong>{discount}%</strong> em relacao ao preco
                    original
                  </motion.div>
                )}

                {/* AI Pricing Assistant */}
                {formData.category && formData.venueCity && formData.eventDate && formData.originalPrice && (
                  <motion.div variants={staggerChild}>
                    <PricingAssistant
                      category={formData.category}
                      venueCity={formData.venueCity}
                      eventDate={formData.eventDate}
                      originalPrice={Number(formData.originalPrice)}
                      hasOriginalContract={formData.hasOriginalContract}
                      onUseSuggestedPrice={(price) => updateField('askingPrice', String(price))}
                    />
                  </motion.div>
                )}

                <motion.div
                  variants={staggerChild}
                  className="flex items-center justify-between rounded-lg border border-neutral-200 dark:border-neutral-700 p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Aceita negociacao?
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Permite que compradores enviem ofertas
                    </p>
                  </div>
                  <Switch
                    checked={formData.isNegotiable}
                    onCheckedChange={(checked) =>
                      updateField('isNegotiable', checked)
                    }
                  />
                </motion.div>

                <motion.div variants={staggerChild}>
                  <Textarea
                    label="Condicoes de Transferencia"
                    placeholder="Descreva as condicoes necessarias para a transferencia da reserva (ex: contato direto com o fornecedor, taxa de transferencia, etc.)"
                    value={formData.transferConditions}
                    onChange={(e) =>
                      updateField('transferConditions', e.target.value)
                    }
                    error={errors.transferConditions}
                    rows={4}
                  />
                </motion.div>

                <motion.div
                  variants={staggerChild}
                  className="flex items-center justify-between rounded-lg border border-neutral-200 dark:border-neutral-700 p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Possui contrato original?
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Indica se voce tem o contrato original com o fornecedor
                    </p>
                  </div>
                  <Switch
                    checked={formData.hasOriginalContract}
                    onCheckedChange={(checked) =>
                      updateField('hasOriginalContract', checked)
                    }
                  />
                </motion.div>

                <Separator />

                <motion.div variants={staggerChild}>
                  <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                    Dados do Fornecedor
                  </h3>
                  <div className="space-y-4">
                    <Input
                      label="Nome do Fornecedor"
                      placeholder="Ex: Villa Bianca Eventos"
                      value={formData.providerName}
                      onChange={(e) =>
                        updateField('providerName', e.target.value)
                      }
                      error={errors.providerName}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Telefone do Fornecedor"
                        placeholder="(11) 99999-9999"
                        value={formData.providerPhone}
                        onChange={(e) =>
                          updateField('providerPhone', e.target.value)
                        }
                        error={errors.providerPhone}
                      />
                      <Input
                        label="Email do Fornecedor"
                        type="email"
                        placeholder="contato@fornecedor.com"
                        value={formData.providerEmail}
                        onChange={(e) =>
                          updateField('providerEmail', e.target.value)
                        }
                        error={errors.providerEmail}
                      />
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            key="step3"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            {/* Image Upload */}
            <Card className="hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-[#6C3CE1]" />
                  Fotos do Anuncio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <motion.div variants={staggerChild}>
                  <FileUpload
                    bucket="listings"
                    path={user?.id || 'draft'}
                    accept="image/*"
                    multiple
                    maxFiles={10}
                    maxSizeMB={5}
                    onUpload={handleImageUpload}
                    existingFiles={formData.imageUrls}
                    label="Arraste suas fotos aqui"
                    description="ou clique para selecionar (max. 10 imagens, 5MB cada)"
                  />
                </motion.div>
              </CardContent>
            </Card>

            {/* Review Summary */}
            <Card className="hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-[#6C3CE1]" />
                  Resumo do Anuncio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <motion.div variants={staggerChild} className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-sm text-neutral-500">Categoria</span>
                    <Badge variant="secondary">
                      {selectedCategory?.label || '-'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-sm text-neutral-500">Titulo</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-white text-right max-w-[60%] truncate">
                      {formData.title || '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-sm text-neutral-500">
                      Data do Evento
                    </span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">
                      {formData.eventDate
                        ? new Date(formData.eventDate + 'T12:00:00').toLocaleDateString('pt-BR')
                        : '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-sm text-neutral-500">Local</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">
                      {formData.venueName
                        ? `${formData.venueName} - ${formData.venueCity}, ${formData.venueState}`
                        : '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-sm text-neutral-500">
                      Preco Original
                    </span>
                    <span className="text-sm text-neutral-500 line-through">
                      {formData.originalPrice
                        ? formatCurrency(Number(formData.originalPrice))
                        : '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-sm text-neutral-500">
                      Preco Pedido
                    </span>
                    <span className="text-sm font-bold text-[#6C3CE1]">
                      {formData.askingPrice
                        ? formatCurrency(Number(formData.askingPrice))
                        : '-'}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                      <span className="text-sm text-neutral-500">Desconto</span>
                      <Badge variant="success">{discount}% OFF</Badge>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-sm text-neutral-500">
                      Negociavel
                    </span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">
                      {formData.isNegotiable ? 'Sim' : 'Nao'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-sm text-neutral-500">
                      Contrato Original
                    </span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">
                      {formData.hasOriginalContract ? 'Sim' : 'Nao'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-sm text-neutral-500">Fornecedor</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">
                      {formData.providerName || '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-neutral-500">Fotos</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">
                      {formData.imageUrls.length} imagem(ns)
                    </span>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Publish Error */}
      {publishError && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">
          {publishError}
        </div>
      )}

      {/* Navigation */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-between pt-4"
      >
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>

        {currentStep < 3 ? (
          <Button onClick={handleNext} className="gap-2">
            Proximo
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handlePublish}
            loading={isPublishing}
            size="lg"
            className="gap-2"
          >
            Publicar Anuncio
          </Button>
        )}
      </motion.div>
    </div>
  );
}
