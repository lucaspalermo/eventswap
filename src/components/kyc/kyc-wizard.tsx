'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  User,
  FileText,
  Camera,
  Upload,
  Check,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Select components available if needed
import { cn } from '@/lib/utils';
import { staggerContainer, staggerChild } from '@/design-system/animations';
import { useAuth } from '@/hooks/use-auth';
import { FileUpload } from '@/components/shared/file-upload';

interface KycWizardProps {
  onComplete?: () => void;
  existingData?: {
    full_name?: string;
    cpf?: string;
    birth_date?: string;
  };
}

interface FormData {
  fullName: string;
  cpf: string;
  birthDate: string;
  documentType: string;
  documentFrontUrl: string[];
  documentBackUrl: string[];
  selfieUrl: string[];
}

interface FormErrors {
  [key: string]: string;
}

const steps = [
  { id: 1, title: 'Dados Pessoais', icon: User },
  { id: 2, title: 'Tipo de Documento', icon: FileText },
  { id: 3, title: 'Foto do Documento', icon: Upload },
  { id: 4, title: 'Selfie', icon: Camera },
  { id: 5, title: 'Confirmacao', icon: Shield },
];

const documentTypes = [
  { value: 'RG', label: 'RG (Registro Geral)', needsBack: true },
  { value: 'CNH', label: 'CNH (Carteira de Habilitacao)', needsBack: true },
  { value: 'PASSPORT', label: 'Passaporte', needsBack: false },
];

function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function KycWizard({ onComplete, existingData }: KycWizardProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>({
    fullName: existingData?.full_name || '',
    cpf: existingData?.cpf || '',
    birthDate: existingData?.birth_date || '',
    documentType: '',
    documentFrontUrl: [],
    documentBackUrl: [],
    selfieUrl: [],
  });

  const updateField = (field: keyof FormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const selectedDocType = documentTypes.find((d) => d.value === formData.documentType);

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Informe seu nome completo';
    if (formData.fullName.trim().split(' ').length < 2) newErrors.fullName = 'Informe nome e sobrenome';
    const cpfDigits = formData.cpf.replace(/\D/g, '');
    if (!cpfDigits || cpfDigits.length !== 11) newErrors.cpf = 'CPF invalido. Informe 11 digitos';
    if (!formData.birthDate) newErrors.birthDate = 'Informe sua data de nascimento';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.documentType) newErrors.documentType = 'Selecione o tipo de documento';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: FormErrors = {};
    if (formData.documentFrontUrl.length === 0) newErrors.documentFrontUrl = 'Envie a foto da frente do documento';
    if (selectedDocType?.needsBack && formData.documentBackUrl.length === 0) {
      newErrors.documentBackUrl = 'Envie a foto do verso do documento';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = (): boolean => {
    const newErrors: FormErrors = {};
    if (formData.selfieUrl.length === 0) newErrors.selfieUrl = 'Envie a foto da selfie com o documento';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    if (currentStep === 4 && !validateStep4()) return;
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = useCallback(async () => {
    if (!user) {
      toast.error('Voce precisa estar logado para enviar documentos.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_type: formData.documentType,
          document_front_url: formData.documentFrontUrl[0],
          document_back_url: selectedDocType?.needsBack ? formData.documentBackUrl[0] : null,
          selfie_url: formData.selfieUrl[0],
          cpf: formData.cpf.replace(/\D/g, ''),
          full_name: formData.fullName,
          birth_date: formData.birthDate,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao enviar documentos');
      }

      toast.success('Documentos enviados com sucesso!', {
        description: 'Sua verificacao sera analisada em ate 24 horas.',
      });
      onComplete?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar documentos. Tente novamente.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [user, formData, selectedDocType, onComplete]);

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-0">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => {
                if (step.id < currentStep) setCurrentStep(step.id);
              }}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-300 text-xs sm:text-sm',
                currentStep === step.id
                  ? 'bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/25'
                  : step.id < currentStep
                    ? 'bg-emerald-50 text-emerald-700 cursor-pointer hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400'
                    : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500'
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold',
                  currentStep === step.id
                    ? 'bg-white/20 text-white'
                    : step.id < currentStep
                      ? 'bg-emerald-500 text-white'
                      : 'bg-neutral-200 text-neutral-500 dark:bg-neutral-700'
                )}
              >
                {step.id < currentStep ? (
                  <Check className="h-3 w-3" />
                ) : (
                  step.id
                )}
              </span>
              <span className="font-medium hidden md:inline">{step.title}</span>
            </button>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-4 md:w-8 h-0.5 mx-0.5',
                  step.id < currentStep
                    ? 'bg-emerald-400'
                    : 'bg-neutral-200 dark:bg-neutral-700'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5">
        <div
          className="bg-[#2563EB] h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
        />
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {/* Step 1: Personal Info */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card className="hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-[#2563EB]" />
                  Dados Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <motion.div variants={staggerChild}>
                  <Input
                    label="Nome Completo (como no documento)"
                    placeholder="Ex: Maria da Silva Santos"
                    value={formData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    error={errors.fullName}
                  />
                </motion.div>

                <motion.div variants={staggerChild}>
                  <Input
                    label="CPF"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={(e) => updateField('cpf', formatCpf(e.target.value))}
                    error={errors.cpf}
                  />
                </motion.div>

                <motion.div variants={staggerChild}>
                  <Input
                    label="Data de Nascimento"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => updateField('birthDate', e.target.value)}
                    error={errors.birthDate}
                  />
                </motion.div>

                <motion.div variants={staggerChild}>
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 text-sm text-blue-700 dark:text-blue-400 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>
                      Os dados informados devem ser identicos aos do documento que sera enviado.
                      Divergencias podem causar a rejeicao da verificacao.
                    </span>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Document Type Selection */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card className="hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#2563EB]" />
                  Tipo de Documento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <motion.div variants={staggerChild}>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                    Selecione o tipo de documento que voce ira utilizar para a verificacao de identidade.
                  </p>
                  <div className="space-y-3">
                    {documentTypes.map((docType) => (
                      <button
                        key={docType.value}
                        onClick={() => updateField('documentType', docType.value)}
                        className={cn(
                          'w-full flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-200',
                          formData.documentType === docType.value
                            ? 'border-[#2563EB] bg-[#2563EB]/5 shadow-sm'
                            : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600'
                        )}
                      >
                        <div
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-lg',
                            formData.documentType === docType.value
                              ? 'bg-[#2563EB]/10 text-[#2563EB]'
                              : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'
                          )}
                        >
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">
                            {docType.label}
                          </p>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {docType.needsBack
                              ? 'Necessario frente e verso'
                              : 'Apenas a pagina com foto'}
                          </p>
                        </div>
                        {formData.documentType === docType.value && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2563EB] text-white">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  {errors.documentType && (
                    <p className="text-xs font-medium text-red-500 mt-2">
                      {errors.documentType}
                    </p>
                  )}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Document Photo Upload */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <Card className="hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-[#2563EB]" />
                  Foto do Documento - Frente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <motion.div variants={staggerChild}>
                  <FileUpload
                    bucket="contracts"
                    path={`kyc/${user?.id || 'draft'}/front`}
                    accept="image/*"
                    multiple={false}
                    maxFiles={1}
                    maxSizeMB={10}
                    onUpload={(urls) => updateField('documentFrontUrl', urls)}
                    existingFiles={formData.documentFrontUrl}
                    label="Enviar foto da frente do documento"
                    description="Tire uma foto legivel de toda a frente do documento. Max 10MB."
                  />
                  {errors.documentFrontUrl && (
                    <p className="text-xs font-medium text-red-500 mt-2">
                      {errors.documentFrontUrl}
                    </p>
                  )}
                </motion.div>
              </CardContent>
            </Card>

            {selectedDocType?.needsBack && (
              <Card className="hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-[#2563EB]" />
                    Foto do Documento - Verso
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <motion.div variants={staggerChild}>
                    <FileUpload
                      bucket="contracts"
                      path={`kyc/${user?.id || 'draft'}/back`}
                      accept="image/*"
                      multiple={false}
                      maxFiles={1}
                      maxSizeMB={10}
                      onUpload={(urls) => updateField('documentBackUrl', urls)}
                      existingFiles={formData.documentBackUrl}
                      label="Enviar foto do verso do documento"
                      description="Tire uma foto legivel de todo o verso do documento. Max 10MB."
                    />
                    {errors.documentBackUrl && (
                      <p className="text-xs font-medium text-red-500 mt-2">
                        {errors.documentBackUrl}
                      </p>
                    )}
                  </motion.div>
                </CardContent>
              </Card>
            )}

            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Dicas para uma boa foto:</p>
                <ul className="mt-1 space-y-0.5 text-xs">
                  <li>- Coloque o documento sobre uma superficie plana e clara</li>
                  <li>- Certifique-se de que todos os dados estao legiveis</li>
                  <li>- Evite reflexos e sombras na foto</li>
                  <li>- A foto deve mostrar o documento inteiro</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Selfie Upload */}
        {currentStep === 4 && (
          <motion.div
            key="step4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card className="hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-[#2563EB]" />
                  Selfie com Documento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <motion.div variants={staggerChild}>
                  <div className="rounded-lg bg-[#2563EB]/5 border border-[#2563EB]/20 p-4 text-sm text-[#2563EB] dark:text-[#60A5FA] mb-4">
                    <p className="font-medium mb-2">Instrucoes para a selfie:</p>
                    <p>Segure o documento ao lado do rosto, de forma que ambos fiquem visiveis na foto. Certifique-se de que:</p>
                    <ul className="mt-2 space-y-1 text-xs">
                      <li>- Seu rosto esta bem iluminado e visivel</li>
                      <li>- O documento esta legivel na foto</li>
                      <li>- Nao use oculos escuros ou bones</li>
                      <li>- O fundo esta limpo e sem distrações</li>
                    </ul>
                  </div>
                </motion.div>

                <motion.div variants={staggerChild}>
                  <FileUpload
                    bucket="contracts"
                    path={`kyc/${user?.id || 'draft'}/selfie`}
                    accept="image/*"
                    multiple={false}
                    maxFiles={1}
                    maxSizeMB={10}
                    onUpload={(urls) => updateField('selfieUrl', urls)}
                    existingFiles={formData.selfieUrl}
                    label="Enviar selfie com documento"
                    description="Tire uma selfie segurando o documento ao lado do rosto. Max 10MB."
                  />
                  {errors.selfieUrl && (
                    <p className="text-xs font-medium text-red-500 mt-2">
                      {errors.selfieUrl}
                    </p>
                  )}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 5: Confirmation */}
        {currentStep === 5 && (
          <motion.div
            key="step5"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card className="hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#2563EB]" />
                  Confirmar e Enviar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <motion.div variants={staggerChild} className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-sm text-neutral-500">Nome Completo</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">
                      {formData.fullName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-sm text-neutral-500">CPF</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">
                      {formData.cpf}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-sm text-neutral-500">Data de Nascimento</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">
                      {formData.birthDate
                        ? new Date(formData.birthDate + 'T12:00:00').toLocaleDateString('pt-BR')
                        : '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-sm text-neutral-500">Tipo de Documento</span>
                    <span className="text-sm font-medium text-neutral-900 dark:text-white">
                      {selectedDocType?.label || '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="text-sm text-neutral-500">Foto Frente</span>
                    <span className="text-sm font-medium text-emerald-600">
                      {formData.documentFrontUrl.length > 0 ? 'Enviada' : 'Pendente'}
                    </span>
                  </div>
                  {selectedDocType?.needsBack && (
                    <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                      <span className="text-sm text-neutral-500">Foto Verso</span>
                      <span className="text-sm font-medium text-emerald-600">
                        {formData.documentBackUrl.length > 0 ? 'Enviada' : 'Pendente'}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-neutral-500">Selfie</span>
                    <span className="text-sm font-medium text-emerald-600">
                      {formData.selfieUrl.length > 0 ? 'Enviada' : 'Pendente'}
                    </span>
                  </div>
                </motion.div>

                <motion.div variants={staggerChild}>
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 text-sm text-blue-700 dark:text-blue-400 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>
                      Ao enviar, seus documentos serao analisados pela equipe do EventSwap.
                      O processo leva ate 24 horas uteis. Voce sera notificado sobre o resultado.
                    </span>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>

        {currentStep < 5 ? (
          <Button onClick={handleNext} className="gap-2">
            Proximo
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="lg"
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                Enviar para Verificacao
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
