'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Tag, CheckCircle2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { isDemoMode } from '@/lib/demo-auth';
import { cn } from '@/lib/utils';
import { fadeUp } from '@/design-system/animations';
import { referralService } from '@/services/referral.service';

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

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';
  const { signUpWithEmail, signInWithGoogle } = useAuth();
  const demo = isDemoMode();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referralCodeValid, setReferralCodeValid] = useState<boolean | null>(null);

  const { strength, checks } = useMemo(
    () => getPasswordStrength(password),
    [password]
  );

  const isPasswordValid = checks.minLength && checks.hasUppercase && checks.hasNumber;
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleEmailRegister = async (e: React.FormEvent) => {
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

    if (!acceptedTerms) {
      setError('Voce precisa aceitar os Termos de Uso e Politica de Privacidade.');
      return;
    }

    setLoading(true);

    try {
      // Store referral code to apply after user is created
      if (referralCode.trim()) {
        referralService.storePendingReferralCode(referralCode.trim());
      }
      await signUpWithEmail(email, password, name);
      router.push(redirectTo);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro ao criar sua conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      // Store redirectTo so the OAuth callback can read it
      if (redirectTo && redirectTo !== '/dashboard') {
        document.cookie = `redirectTo=${encodeURIComponent(redirectTo)}; path=/; max-age=600; SameSite=Lax`;
      }
      await signInWithGoogle();
      if (demo) {
        router.push(redirectTo);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro ao conectar com Google. Tente novamente.');
      }
      setGoogleLoading(false);
    }
  };

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Demo Mode Banner */}
      {demo && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300">
          <p className="font-medium">Modo Demo</p>
          <p className="text-xs mt-1">
            Preencha qualquer nome e email. A senha pode ser qualquer coisa. Voce sera cadastrado como comprador.
          </p>
        </div>
      )}

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
        <h1 className="text-heading-lg text-neutral-950 dark:text-white">
          Crie sua conta
        </h1>
        <p className="text-body-sm text-neutral-500">
          Comece a transferir reservas com seguranca
        </p>
      </div>

      {/* Error Message */}
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

      {/* Google Sign-up */}
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={handleGoogleRegister}
        loading={googleLoading}
        disabled={loading}
      >
        {!googleLoading && (
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        )}
        Continuar com Google
      </Button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200 dark:border-neutral-700" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-4 text-neutral-400 dark:bg-neutral-950 dark:text-neutral-500">
            ou continue com email
          </span>
        </div>
      </div>

      {/* Register Form */}
      <form onSubmit={handleEmailRegister} className="space-y-4">
        {/* Name */}
        <Input
          type="text"
          label="Nome completo"
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
          disabled={loading || googleLoading}
          iconLeft={<User className="h-4 w-4" />}
        />

        {/* Email */}
        <Input
          type="email"
          label="Email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          disabled={loading || googleLoading}
          iconLeft={<Mail className="h-4 w-4" />}
        />

        {/* Password */}
        <div className="space-y-2">
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              label="Senha"
              placeholder="Crie uma senha forte"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              disabled={loading || googleLoading}
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
            label="Confirmar senha"
            placeholder="Repita a senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            disabled={loading || googleLoading}
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

        {/* Referral Code (collapsible) */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowReferralInput(!showReferralInput)}
            className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-[#2563EB] dark:hover:text-[#3B82F6] transition-colors"
          >
            <Tag className="h-3.5 w-3.5" />
            <span>Tem um código de indicação?</span>
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 transition-transform duration-200',
                showReferralInput ? 'rotate-180' : ''
              )}
            />
          </button>

          {showReferralInput && (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="space-y-1.5"
            >
              <div className="relative">
                <Input
                  type="text"
                  label="Código de indicação"
                  placeholder="EVNT-XXXX"
                  value={referralCode}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setReferralCode(val);
                    if (val.length === 0) {
                      setReferralCodeValid(null);
                    } else if (val.length >= 9) {
                      setReferralCodeValid(referralService.isCodeValid(val));
                    } else {
                      setReferralCodeValid(null);
                    }
                  }}
                  disabled={loading || googleLoading}
                  iconLeft={<Tag className="h-4 w-4" />}
                  maxLength={9}
                />
                {referralCodeValid === true && (
                  <div className="absolute right-3 top-[38px]">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>
                )}
              </div>
              {referralCodeValid === true && (
                <p className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Código válido! Você ganha R$ 25 de desconto na primeira transação.
                </p>
              )}
              {referralCodeValid === false && referralCode.length > 0 && (
                <p className="text-xs text-red-500 dark:text-red-400">
                  Código inválido. Verifique e tente novamente.
                </p>
              )}
            </motion.div>
          )}
        </div>

        {/* Terms Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex items-center justify-center pt-0.5">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className={cn(
                'h-4 w-4 rounded border-neutral-300 text-[#2563EB] transition-colors',
                'focus:ring-2 focus:ring-[#2563EB]/50 focus:ring-offset-2',
                'dark:border-neutral-600 dark:bg-neutral-800'
              )}
            />
          </div>
          <span className="text-xs text-neutral-500 leading-relaxed dark:text-neutral-400">
            Concordo com os{' '}
            <Link
              href="/terms"
              target="_blank"
              className="font-medium text-[#2563EB] hover:text-[#5A2ECF] underline underline-offset-2"
            >
              Termos de Uso
            </Link>{' '}
            e{' '}
            <Link
              href="/privacy"
              target="_blank"
              className="font-medium text-[#2563EB] hover:text-[#5A2ECF] underline underline-offset-2"
            >
              Politica de Privacidade
            </Link>
          </span>
        </label>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={loading}
          disabled={googleLoading || !acceptedTerms}
        >
          Criar Conta
        </Button>
      </form>

      {/* Login Link */}
      <p className="text-center text-sm text-neutral-500">
        Ja tem conta?{' '}
        <Link
          href={redirectTo !== '/dashboard' ? `/login?redirectTo=${encodeURIComponent(redirectTo)}` : '/login'}
          className="font-medium text-[#2563EB] hover:text-[#5A2ECF] transition-colors"
        >
          Entrar
        </Link>
      </p>
    </motion.div>
  );
}
