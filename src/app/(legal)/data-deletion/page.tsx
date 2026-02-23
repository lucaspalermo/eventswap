'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, User, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function DataDeletionPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error('Por favor, preencha todos os campos obrigatorios.');
      return;
    }

    setLoading(true);

    // In demo/development mode, simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setLoading(false);
    setSubmitted(true);
    toast.success('Solicitacao enviada com sucesso! Voce recebera uma confirmacao por e-mail.');
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
          Solicitacao Recebida
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-md mx-auto mb-4">
          Recebemos sua solicitacao de exclusao de dados. Nossa equipe analisara seu pedido
          e enviara uma confirmacao para <strong className="text-neutral-700 dark:text-neutral-300">{email}</strong> em
          ate 15 dias uteis, conforme previsto pela LGPD.
        </p>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-8">
          Protocolo: {`DEL-${Date.now().toString(36).toUpperCase()}`}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/">
            <Button variant="outline" size="sm">
              Voltar ao inicio
            </Button>
          </Link>
          <Link href="/privacy">
            <Button variant="ghost" size="sm">
              Politica de Privacidade
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white mb-2">
        Solicitacao de Exclusao de Dados
      </h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-8">
        Em conformidade com a Lei Geral de Protecao de Dados (LGPD), voce tem o direito de solicitar
        a exclusao dos seus dados pessoais. Preencha o formulario abaixo para enviar sua solicitacao.
      </p>

      {/* Warning Box */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 p-4 mb-8">
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
              Antes de solicitar a exclusao
            </h3>
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              A exclusao dos seus dados e irreversivel. Ao prosseguir, esteja ciente de que:
            </p>
            <ul className="mt-2 space-y-1 text-xs text-amber-700 dark:text-amber-400">
              <li>- Sua conta sera permanentemente desativada</li>
              <li>- Todos os seus anuncios ativos serao removidos</li>
              <li>- O historico de transacoes sera anonimizado</li>
              <li>- Voce perdera acesso ao saldo da carteira (saque antes de solicitar)</li>
              <li>- Dados exigidos por lei podem ser retidos por ate 5 anos (obrigacoes fiscais)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          type="text"
          label="Nome completo *"
          placeholder="Seu nome como cadastrado na plataforma"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
          iconLeft={<User className="h-4 w-4" />}
        />

        <Input
          type="email"
          label="E-mail da conta *"
          placeholder="email@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          iconLeft={<Mail className="h-4 w-4" />}
          hint="Utilize o mesmo e-mail cadastrado na sua conta EventSwap"
        />

        <Textarea
          label="Motivo da solicitacao (opcional)"
          placeholder="Descreva brevemente o motivo da sua solicitacao de exclusao de dados..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={loading}
          rows={4}
        />

        <div className="pt-2">
          <Button type="submit" size="lg" loading={loading} className="w-full sm:w-auto">
            Enviar solicitacao
          </Button>
        </div>
      </form>

      {/* Info Section */}
      <div className="mt-10 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
          Como funciona o processo
        </h3>
        <ol className="space-y-3 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
          <li className="flex gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#6C3CE1]/10 text-[10px] font-semibold text-[#6C3CE1]">
              1
            </span>
            <span>Voce envia a solicitacao preenchendo este formulario</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#6C3CE1]/10 text-[10px] font-semibold text-[#6C3CE1]">
              2
            </span>
            <span>Nossa equipe verifica sua identidade por e-mail de confirmacao</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#6C3CE1]/10 text-[10px] font-semibold text-[#6C3CE1]">
              3
            </span>
            <span>Verificamos se existem transacoes pendentes ou obrigacoes legais</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#6C3CE1]/10 text-[10px] font-semibold text-[#6C3CE1]">
              4
            </span>
            <span>Seus dados sao excluidos ou anonimizados em ate 15 dias uteis</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#6C3CE1]/10 text-[10px] font-semibold text-[#6C3CE1]">
              5
            </span>
            <span>Voce recebe uma confirmacao final por e-mail</span>
          </li>
        </ol>
      </div>

      {/* Related Links */}
      <div className="mt-8 flex flex-wrap gap-4 text-sm">
        <Link href="/privacy" className="text-[#6C3CE1] hover:underline">
          Politica de Privacidade
        </Link>
        <Link href="/terms" className="text-[#6C3CE1] hover:underline">
          Termos de Uso
        </Link>
      </div>
    </div>
  );
}
