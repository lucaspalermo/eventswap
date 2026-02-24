'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { fadeUp } from '@/design-system/animations';

type PasswordStrength = 'weak' | 'medium' | 'strong';

interface PasswordCheck {
  minLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
}

function getPasswordStrength(password: string): {
  strength: PasswordStrength;
  checks: PasswordCheck;
} {
  const checks: PasswordCheck = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  const passed = Object.values(checks).filter(Boolean).length;

  if (passed <= 1) return { strength: 'weak', checks };
  if (passed === 2) return { strength: 'medium', checks };
  return { strength: 'strong', checks };
}

const strengthConfig: Record<
  PasswordStrength,
  { label: string; color: string; bgColor: string; width: string }
> = {
  weak: {
    label: 'Fraca',
    color: 'text-red-500',
    bgColor: 'bg-red-500',
    width: 'w-1/3',
  },
  medium: {
    label: 'Media',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500',
    width: 'w-2/3',
  },
  strong: {
    label: 'Forte',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500',
    width: 'w-full',
  },
};

type PageState = 'loading' | 'invalid' | 'form' | 'success';

export default function ResetPasswordPage() {
  const router = useRouter();

  const [pageState, setPageState] = useState<PageState>('loading');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { strength, checks } = useMemo(
    () => getPasswordStrength(password),
    [password]
  );

  const isPasswordValid = checks.minLength && checks.hasUppercase && checks.hasNumber;
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;

  useEffect(() => {
    const supabase = createClient();

    // Listen for the PASSWORD_RECOVERY event which Supabase fires
    // when the user follows the recovery link
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setPageState('form');
        } else if (event === 'SIGNED_IN' && session) {
          // User arrived via recovery link and session was established
          setPageState('form');
        }
      }
    );

    // Also check if there's already an active session (e.g. user refreshed the page)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setPageState('form');
      } else {
        // No session and no recovery event yet — wait briefly then mark invalid
        setTimeout(() => {
          setPageState((prev) => {
            if (prev === 'loading') return 'invalid';
            return prev;
          });
        }, 2500);
      }
    };

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isPasswordValid) {
      setError('A senha deve ter no minimo 8 caracteres, 1 letra maiuscula e 1 numero.');
      return;
    }

    if (!doPasswordsMatch) {
      setError('As senhas nao coincidem.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      setPageState('success');
      toast.success('Senha redefinida com sucesso!');

      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro ao redefinir a senha. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (pageState === 'loading') {
    return (
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="space-y-6 text-center"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-neutral-950 dark:text-white">
            Verificando link...
          </h1>
          <p className="text-sm text-neutral-500">
            Aguarde enquanto validamos seu link de recuperacao.
          </p>
        </div>
      </motion.div>
    );
  }

  // Invalid / expired link state
  if (pageState === 'invalid') {
    return (
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="space-y-6 text-center"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-neutral-950 dark:text-white">
            Link invalido ou expirado
          </h1>
          <p className="text-sm text-neutral-500 max-w-sm mx-auto">
            Este link de recuperacao de senha e invalido ou ja expirou. Solicite um novo link para continuar.
          </p>
        </div>
        <div className="space-y-3 pt-2">
          <Link href="/forgot-password">
            <Button size="lg" className="w-full">
              Solicitar novo link
            </Button>
          </Link>
          <Link
            href="/login"
            className="block text-sm font-medium text-[#2563EB] hover:text-[#5A2ECF] transition-colors"
          >
            Voltar para login
          </Link>
        </div>
      </motion.div>
    );
  }

  // Success state
  if (pageState === 'success') {
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
            Senha redefinida!
          </h1>
          <p className="text-sm text-neutral-500 max-w-sm mx-auto">
            Sua senha foi atualizada com sucesso. Voce sera redirecionado para o login em instantes.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/login">
            <Button size="lg" className="w-full">
              Ir para o login
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  // Form state
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
          Redefinir senha
        </h1>
        <p className="text-sm text-neutral-500">
          Crie uma nova senha segura para sua conta
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
        {/* New Password */}
        <div className="space-y-2">
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              label="Nova senha"
              placeholder="Crie uma senha forte"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              autoFocus
              disabled={loading}
              iconLeft={<Lock className="h-4 w-4" />}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={cn(
                'absolute right-3 top-[38px] text-neutral-400 transition-colors',
                'hover:text-neutral-600 dark:hover:text-neutral-300'
              )}
              tabIndex={-1}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {password.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-300',
                      strengthConfig[strength].bgColor,
                      strengthConfig[strength].width
                    )}
                  />
                </div>
                <span
                  className={cn(
                    'text-xs font-medium',
                    strengthConfig[strength].color
                  )}
                >
                  {strengthConfig[strength].label}
                </span>
              </div>
              <ul className="space-y-1">
                <li
                  className={cn(
                    'flex items-center gap-1.5 text-xs',
                    checks.minLength
                      ? 'text-emerald-500'
                      : 'text-neutral-400'
                  )}
                >
                  <span className="text-[10px]">
                    {checks.minLength ? '\u2713' : '\u2022'}
                  </span>
                  Minimo 8 caracteres
                </li>
                <li
                  className={cn(
                    'flex items-center gap-1.5 text-xs',
                    checks.hasUppercase
                      ? 'text-emerald-500'
                      : 'text-neutral-400'
                  )}
                >
                  <span className="text-[10px]">
                    {checks.hasUppercase ? '\u2713' : '\u2022'}
                  </span>
                  1 letra maiuscula
                </li>
                <li
                  className={cn(
                    'flex items-center gap-1.5 text-xs',
                    checks.hasNumber
                      ? 'text-emerald-500'
                      : 'text-neutral-400'
                  )}
                >
                  <span className="text-[10px]">
                    {checks.hasNumber ? '\u2713' : '\u2022'}
                  </span>
                  1 numero
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <Input
            type={showConfirmPassword ? 'text' : 'password'}
            label="Confirmar nova senha"
            placeholder="Repita a nova senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            disabled={loading}
            iconLeft={<Lock className="h-4 w-4" />}
            error={
              confirmPassword.length > 0 && !doPasswordsMatch
                ? 'As senhas nao coincidem'
                : undefined
            }
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className={cn(
              'absolute right-3 top-[38px] text-neutral-400 transition-colors',
              'hover:text-neutral-600 dark:hover:text-neutral-300'
            )}
            tabIndex={-1}
            aria-label={
              showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'
            }
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={loading}
          disabled={!isPasswordValid || !doPasswordsMatch}
        >
          Redefinir Senha
        </Button>
      </form>

      {/* Back to login */}
      <div className="text-center">
        <Link
          href="/login"
          className="text-sm font-medium text-[#2563EB] hover:text-[#5A2ECF] transition-colors"
        >
          Voltar para login
        </Link>
      </div>
    </motion.div>
  );
}
