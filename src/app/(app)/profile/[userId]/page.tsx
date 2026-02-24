'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  MessageSquare,
  ShieldCheck,
  CalendarDays,
  MapPin,
  Heart,
  Eye,
  Loader2,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RatingStars } from '@/components/shared/rating-stars';
import { ReviewList, ReviewSummary } from '@/components/shared/review-list';
import type { ReviewListItem } from '@/components/shared/review-list';
import { getDemoReviews } from '@/components/shared/review-dialog';
import { formatCurrency } from '@/lib/utils';
import { EVENT_CATEGORIES_MAP } from '@/lib/constants';
import { staggerContainer, staggerChild, fadeUp } from '@/design-system/animations';
import { TrustBadge } from '@/components/shared/trust-badge';
import { TrustScore } from '@/components/shared/trust-score';
import { usersService } from '@/services/users.service';
import { listingsService } from '@/services/listings.service';
import { isDemoMode } from '@/lib/demo-auth';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params.userId as string;

  const [profileData, setProfileData] = useState<{
    id: string;
    name: string;
    display_name: string;
    bio: string;
    created_at: string;
    is_verified: boolean;
    address_city: string;
    address_state: string;
    rating_avg: number;
    rating_count: number;
    avatar_url: string | null;
  } | null>(null);
  const [listings, setListings] = useState<{
    id: number;
    title: string;
    category: string;
    asking_price: number;
    original_price: number;
    event_date: string;
    venue_city: string;
    venue_state: string;
    view_count: number;
    favorite_count: number;
    images: string[];
  }[]>([]);
  const [reviews, setReviews] = useState<ReviewListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchProfileData = async () => {
      try {
        const [publicProfile, userReviews] = await Promise.all([
          usersService.getPublicProfile(userId).catch(() => null),
          usersService.getReviews(userId).catch(() => null),
        ]);

        if (publicProfile) {
          setProfileData({
            id: publicProfile.id,
            name: publicProfile.name,
            display_name: publicProfile.display_name || publicProfile.name,
            bio: publicProfile.bio || '',
            created_at: publicProfile.created_at,
            is_verified: publicProfile.is_verified,
            address_city: publicProfile.address_city || '',
            address_state: publicProfile.address_state || '',
            rating_avg: publicProfile.rating_avg,
            rating_count: publicProfile.rating_count,
            avatar_url: publicProfile.avatar_url,
          });

          // Fetch active listings from this user
          try {
            const sellerListings = await listingsService.getMyListings(userId);
            const activeListings = sellerListings.filter((l) => l.status === 'ACTIVE');
            if (activeListings.length > 0) {
              setListings(
                activeListings.map((l) => ({
                  id: l.id,
                  title: l.title,
                  category: l.category.toLowerCase(),
                  asking_price: l.asking_price,
                  original_price: l.original_price,
                  event_date: l.event_date,
                  venue_city: l.venue_city,
                  venue_state: l.venue_state || '',
                  view_count: l.view_count,
                  favorite_count: l.favorite_count,
                  images: l.images || [],
                }))
              );
            }
          } catch {
            // Failed to fetch listings
          }
        }

        if (userReviews && userReviews.length > 0) {
          setReviews(
            userReviews.map((r: { id: number; author?: { name?: string; avatar_url?: string | null }; rating: number; comment?: string | null; created_at: string }) => ({
              id: r.id,
              author: {
                name: r.author?.name || 'Usuario',
                avatar_url: r.author?.avatar_url || null,
              },
              rating: r.rating,
              comment: r.comment || '',
              created_at: r.created_at,
            }))
          );
        } else if (isDemoMode()) {
          // Merge demo reviews from localStorage
          const demoReviews = getDemoReviews();
          const userDemoReviews = demoReviews
            .filter((r) => r.target_id === userId)
            .map((r) => ({
              id: r.id,
              author: { name: r.author_name, avatar_url: null },
              rating: r.rating,
              comment: r.comment,
              created_at: r.created_at,
            }));

          if (userDemoReviews.length > 0) {
            setReviews(userDemoReviews);
          }
        }
      } catch {
        // Failed to fetch profile data
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#6C3CE1]" />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Info className="h-10 w-10 text-neutral-300 mb-3" />
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Perfil nao encontrado
        </p>
        <p className="text-xs text-neutral-500 mt-1">
          Este usuario nao existe ou nao esta disponivel.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <Card className="hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar */}
              <Avatar className="h-24 w-24 shrink-0">
                <AvatarImage src={profileData.avatar_url || ''} alt={profileData.name} />
                <AvatarFallback className="text-2xl font-semibold bg-[#6C3CE1]/10 text-[#6C3CE1]">
                  {getInitials(profileData.display_name || profileData.name)}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h1 className="text-xl font-semibold text-neutral-950 dark:text-white">
                    {profileData.display_name || profileData.name}
                  </h1>
                  {profileData.is_verified && (
                    <Badge variant="success" className="gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      Verificado
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-500 mb-2 flex-wrap">
                  {(profileData.address_city || profileData.address_state) && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {profileData.address_city}{profileData.address_state ? `, ${profileData.address_state}` : ''}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Membro desde{' '}
                    {new Date(profileData.created_at).toLocaleDateString('pt-BR', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <RatingStars
                    rating={profileData.rating_avg}
                    size="sm"
                    showValue
                  />
                  <span className="text-xs text-neutral-400">
                    ({profileData.rating_count} avaliacoes)
                  </span>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap gap-2">
                  {profileData.is_verified && (
                    <TrustBadge variant="verified-seller" size="sm" />
                  )}
                  {profileData.rating_avg >= 4.5 && profileData.rating_count >= 5 && (
                    <TrustBadge variant="top-seller" size="sm" />
                  )}
                  {profileData.rating_avg >= 4.5 && profileData.rating_count >= 5 && (
                    <TrustBadge variant="fast-response" size="sm" />
                  )}
                  {profileData.rating_count === 0 && !profileData.is_verified && (
                    <TrustBadge variant="new-user" size="sm" />
                  )}
                </div>
              </div>

              {/* Right column: Trust Score + Actions */}
              <div className="flex flex-col items-center gap-4 shrink-0">
                <TrustScore
                  profile={{
                    rating_avg: profileData.rating_avg,
                    rating_count: profileData.rating_count,
                    is_verified: profileData.is_verified,
                    created_at: profileData.created_at,
                  }}
                  size="md"
                />
                <Button asChild className="gap-2">
                  <Link href={`/chat`}>
                    <MessageSquare className="h-4 w-4" />
                    Enviar Mensagem
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bio */}
      {profileData.bio && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <Card className="hover:shadow-md">
            <CardHeader>
              <CardTitle>Sobre</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {profileData.bio}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Active Listings */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <h2 className="text-lg font-semibold text-neutral-950 dark:text-white mb-4">
          Anuncios Ativos ({listings.length})
        </h2>
        {listings.length === 0 ? (
          <Card className="hover:shadow-md">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Info className="h-10 w-10 text-neutral-300 mb-3" />
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Nenhum anuncio ativo
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Este usuario ainda nao possui anuncios publicados.
              </p>
            </CardContent>
          </Card>
        ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {listings.map((listing) => {
            const category = EVENT_CATEGORIES_MAP[listing.category];
            const discount = listing.original_price > listing.asking_price
              ? Math.round(
                  ((listing.original_price - listing.asking_price) / listing.original_price) * 100
                )
              : 0;
            return (
              <motion.div key={listing.id} variants={staggerChild}>
                <Card className="hover:shadow-md overflow-hidden group cursor-pointer">
                  {/* Image Placeholder */}
                  <div className="h-40 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center relative">
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        background: category?.gradient || 'transparent',
                      }}
                    />
                    <span
                      className="text-4xl font-bold opacity-30"
                      style={{ color: category?.color || '#737373' }}
                    >
                      {category?.label?.charAt(0) || '?'}
                    </span>
                    {discount > 0 && (
                      <Badge className="absolute top-3 left-3 bg-emerald-500 text-white shadow-md">
                        -{discount}%
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <Badge
                      variant="outline"
                      className="text-[10px] mb-2"
                      style={{
                        borderColor: category?.color,
                        color: category?.color,
                      }}
                    >
                      {category?.label || listing.category}
                    </Badge>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1 truncate group-hover:text-[#6C3CE1] transition-colors">
                      {listing.title}
                    </h3>
                    <p className="text-xs text-neutral-500 mb-2 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {listing.venue_city}{listing.venue_state ? `, ${listing.venue_state}` : ''}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        {listing.original_price > listing.asking_price && (
                          <span className="text-xs text-neutral-400 line-through mr-1.5">
                            {formatCurrency(listing.original_price)}
                          </span>
                        )}
                        <span className="text-sm font-bold text-[#6C3CE1]">
                          {formatCurrency(listing.asking_price)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-400">
                        <span className="flex items-center gap-0.5 text-[10px]">
                          <Eye className="h-3 w-3" />
                          {listing.view_count}
                        </span>
                        <span className="flex items-center gap-0.5 text-[10px]">
                          <Heart className="h-3 w-3" />
                          {listing.favorite_count}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
        )}
      </motion.div>

      {/* Reviews */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <h2 className="text-lg font-semibold text-neutral-950 dark:text-white mb-4">
          Avaliacoes ({reviews.length})
        </h2>
        <ReviewSummary
          averageRating={profileData.rating_avg}
          totalCount={profileData.rating_count > 0 ? profileData.rating_count : reviews.length}
        />
        <ReviewList
          reviews={reviews}
          emptyMessage="Este usuario ainda nao recebeu avaliacoes."
        />
      </motion.div>
    </div>
  );
}
