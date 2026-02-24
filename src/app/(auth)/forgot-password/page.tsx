'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { fadeUp } from '@/design-system/animations';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo: `${window.location.origin}/callback?type=recovery` }
      );

      if (resetError) throw resetError;
      setSent(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="space-y-6 text-center"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-neutral-950 dark:text-white">
            Email enviado!
          </h1>
          <p className="text-sm text-neutral-500 max-w-sm mx-auto">
            Enviamos um link de recuperacao para{' '}
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              {email}
            </span>
            . Verifique sua caixa de entrada e spam.
          </p>
        </div>
        <div className="space-y-3 pt-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setSent(false);
              setEmail('');
            }}
          >
            Enviar novamente
          </Button>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#2563EB] hover:text-[#5A2ECF] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para login
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Mobile Logo */}
      <div className="lg:hidden flex justify-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight">
            <span className="text-[#2563EB]">Event</span>
            <span className="text-gray-900 dark:text-white">Swap</span>
          </span>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-neutral-950 dark:text-white">
          Recuperar senha
        </h1>
        <p className="text-sm text-neutral-500">
          Informe seu email e enviaremos um link para redefinir sua senha
        </p>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
          role="alert"
        >
          {error}
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          label="Email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          autoFocus
          disabled={loading}
          iconLeft={<Mail className="h-4 w-4" />}
        />
        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={loading}
        >
          Enviar link de recuperacao
        </Button>
      </form>

      {/* Back */}
      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#2563EB] hover:text-[#5A2ECF] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para login
        </Link>
      </div>
    </motion.div>
  );
}
