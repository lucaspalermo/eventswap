'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Settings,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  ShoppingBag,
  Tag,
  ShoppingCart,
  AlertCircle,
  Loader2,
  Camera,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RatingStars } from '@/components/shared/rating-stars';
import { staggerContainer, staggerChild, fadeUp } from '@/design-system/animations';
import { useAuth } from '@/hooks/use-auth';
import { listingsService } from '@/services/listings.service';
import { transactionsService } from '@/services/transactions.service';
import { uploadAvatar } from '@/lib/storage';
import { createClient } from '@/lib/supabase/client';


function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function ProfilePage() {
  const { user: authUser, profile, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({ listings: 0, sales: 0, purchases: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Sync avatar URL from profile
  useEffect(() => {
    if (profile?.avatar_url) {
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile?.avatar_url]);

  const handleAvatarClick = useCallback(() => {
    avatarInputRef.current?.click();
  }, []);

  const handleAvatarChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !authUser) return;

      // Reset input
      e.target.value = '';

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Formato invalido. Use JPG, PNG ou WebP.');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Imagem muito grande. Maximo 5MB.');
        return;
      }

      setUploadingAvatar(true);

      try {
        const url = await uploadAvatar(file, authUser.id);
        setAvatarUrl(url);

        // Update profile in Supabase
        const supabase = createClient();
        const { error } = await supabase
          .from('profiles')
          .update({ avatar_url: url })
          .eq('id', authUser.id);

        if (error) throw error;

        toast.success('Foto de perfil atualizada!');
      } catch (err) {
        console.error('Erro ao enviar avatar:', err);
        toast.error('Erro ao atualizar foto de perfil. Tente novamente.');
      } finally {
        setUploadingAvatar(false);
      }
    },
    [authUser]
  );

  // Derive user data from profile or fallback to mock
  const userData = profile
    ? {
        name: profile.display_name || profile.name,
        displayName: profile.display_name || profile.name,
        email: profile.email,
        phone: profile.phone || 'Nao informado',
        cpf: profile.cpf ? `***.***.${profile.cpf.slice(-6)}` : 'Nao informado',
        city: profile.address_city || 'Nao informado',
        state: profile.address_state || '',
        role: profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN' ? 'admin' : 'seller',
        rating: profile.rating_avg || 0,
        reviewCount: profile.rating_count || 0,
        bio: profile.bio || '',
        memberSince: profile.created_at,
        isVerified: profile.is_verified,
        avatarUrl: profile.avatar_url,
      }
    : {
        name: authUser?.user_metadata?.name || 'Usuario',
        displayName: authUser?.user_metadata?.name || 'Usuario',
        email: authUser?.email || '',
        phone: 'Nao informado',
        cpf: 'Nao informado',
        city: 'Nao informado',
        state: '',
        role: 'seller',
        rating: 0,
        reviewCount: 0,
        bio: '',
        memberSince: new Date().toISOString(),
        isVerified: false,
        avatarUrl: null as string | null,
      };

  useEffect(() => {
    if (authLoading || !authUser) return;

    const fetchStats = async () => {
      try {
        const [listings, sales, purchases] = await Promise.all([
          listingsService.getMyListings(authUser.id).catch(() => []),
          transactionsService.getMySales(authUser.id).catch(() => []),
          transactionsService.getMyPurchases(authUser.id).catch(() => []),
        ]);

        setStats({
          listings: listings.length,
          sales: sales.filter((s) => s.status === 'COMPLETED').length,
          purchases: purchases.length,
        });
      } catch {
        setStats({ listings: 0, sales: 0, purchases: 0 });
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [authUser, authLoading]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#2563EB]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <Card className="hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar - Clickable for upload */}
              <div className="relative group shrink-0">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                  aria-hidden="true"
                />
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                  className="relative rounded-full focus:outline-none focus:ring-2 focus:ring-[#2563EB]/50 focus:ring-offset-2 disabled:cursor-wait"
                  aria-label="Alterar foto de perfil"
                >
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarUrl || userData.avatarUrl || ''} alt={userData.name} />
                    <AvatarFallback className="text-2xl font-semibold bg-[#2563EB]/10 text-[#2563EB]">
                      {getInitials(userData.name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Overlay on hover */}
                  {!uploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 group-hover:bg-black/40 transition-colors">
                      <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}

                  {/* Loading overlay */}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                  )}
                </button>
                <p className="text-[10px] text-neutral-400 text-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Clique para alterar
                </p>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h1 className="text-xl font-semibold text-neutral-950 dark:text-white">
                    {userData.name}
                  </h1>
                  {userData.isVerified && (
                    <Badge variant="success" className="gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      Verificado
                    </Badge>
                  )}
                  <Badge variant="secondary">
                    {userData.role === 'admin' ? 'Admin' : 'Vendedor'}
                  </Badge>
                </div>
                <p className="text-sm text-neutral-500 mb-2">{userData.email}</p>
                <div className="flex items-center gap-2">
                  <RatingStars rating={userData.rating} size="sm" showValue />
                  <span className="text-xs text-neutral-400">
                    ({userData.reviewCount} avaliacoes)
                  </span>
                </div>
              </div>

              {/* Actions */}
              <Button variant="outline" asChild className="gap-2 shrink-0">
                <Link href="/settings">
                  <Settings className="h-4 w-4" />
                  Editar Perfil
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        <motion.div variants={staggerChild}>
          <Card className="hover:shadow-md">
            <CardContent className="p-4 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB]/10 mx-auto mb-2">
                <Tag className="h-5 w-5 text-[#2563EB]" />
              </div>
              <p className="text-2xl font-bold text-neutral-950 dark:text-white">
                {loadingStats ? '-' : stats.listings}
              </p>
              <p className="text-xs text-neutral-500">Anuncios</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={staggerChild}>
          <Card className="hover:shadow-md">
            <CardContent className="p-4 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 mx-auto mb-2">
                <ShoppingBag className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-neutral-950 dark:text-white">
                {loadingStats ? '-' : stats.sales}
              </p>
              <p className="text-xs text-neutral-500">Vendas</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={staggerChild}>
          <Card className="hover:shadow-md">
            <CardContent className="p-4 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 mx-auto mb-2">
                <ShoppingCart className="h-5 w-5 text-sky-500" />
              </div>
              <p className="text-2xl font-bold text-neutral-950 dark:text-white">
                {loadingStats ? '-' : stats.purchases}
              </p>
              <p className="text-xs text-neutral-500">Compras</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={staggerChild}>
          <Card className="hover:shadow-md">
            <CardContent className="p-4 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 mx-auto mb-2">
                <RatingStars rating={userData.rating} size="sm" />
              </div>
              <p className="text-2xl font-bold text-neutral-950 dark:text-white">
                {userData.rating.toFixed(1)}
              </p>
              <p className="text-xs text-neutral-500">Nota Media</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Bio */}
      {userData.bio && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <Card className="hover:shadow-md">
            <CardHeader>
              <CardTitle>Sobre</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {userData.bio}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <Card className="hover:shadow-md h-full">
            <CardHeader>
              <CardTitle>Informacoes Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                  <Mail className="h-4 w-4 text-neutral-500" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Email</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {userData.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                  <Phone className="h-4 w-4 text-neutral-500" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Telefone</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {userData.phone}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                  <ShieldCheck className="h-4 w-4 text-neutral-500" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">CPF</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {userData.cpf}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                  <MapPin className="h-4 w-4 text-neutral-500" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Localizacao</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {userData.city}{userData.state ? `, ${userData.state}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                  <CalendarDays className="h-4 w-4 text-neutral-500" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Membro desde</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {new Date(userData.memberSince).toLocaleDateString('pt-BR', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Verification */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <Card className="hover:shadow-md h-full">
            <CardHeader>
              <CardTitle>Verificacao</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userData.isVerified ? (
                <div className="flex flex-col items-center text-center py-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 mb-4">
                    <ShieldCheck className="h-8 w-8 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                    Identidade Verificada
                  </h3>
                  <p className="text-sm text-neutral-500 max-w-xs">
                    Sua identidade foi verificada com sucesso. Isto aumenta a
                    confianca dos compradores em seus anuncios.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <Badge variant="success" className="gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      Documento verificado
                    </Badge>
                    <Badge variant="success" className="gap-1">
                      <Mail className="h-3 w-3" />
                      Email verificado
                    </Badge>
                    <Badge variant="success" className="gap-1">
                      <Phone className="h-3 w-3" />
                      Telefone verificado
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center py-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/30 mb-4">
                    <AlertCircle className="h-8 w-8 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                    Identidade Nao Verificada
                  </h3>
                  <p className="text-sm text-neutral-500 max-w-xs mb-4">
                    Verifique sua identidade para aumentar a confianca dos
                    compradores e desbloquear limites maiores.
                  </p>
                  <Button className="gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    Verificar Identidade
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
