import { createClient } from '@/lib/supabase/client'
import type { Listing, EventCategory, ListingStatus } from '@/types/database.types'

const supabase = createClient()

export interface SearchListingsParams {
  search?: string
  category?: EventCategory
  city?: string
  state?: string
  minPrice?: number
  maxPrice?: number
  dateFrom?: string
  dateTo?: string
  status?: ListingStatus
  page?: number
  limit?: number
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'date_asc' | 'date_desc'
}

export const listingsService = {
  async search(params: SearchListingsParams) {
    const { page = 1, limit = 12, sortBy = 'newest' } = params
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from('listings')
      .select('*, seller:profiles!seller_id(id, name, avatar_url, rating_avg, rating_count)', { count: 'exact' })
      .eq('status', 'ACTIVE')

    if (params.search) {
      query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%,venue_name.ilike.%${params.search}%`)
    }
    if (params.category) query = query.eq('category', params.category)
    if (params.city) query = query.ilike('venue_city', `%${params.city}%`)
    if (params.state) query = query.eq('venue_state', params.state)
    if (params.minPrice) query = query.gte('asking_price', params.minPrice)
    if (params.maxPrice) query = query.lte('asking_price', params.maxPrice)
    if (params.dateFrom) query = query.gte('event_date', params.dateFrom)
    if (params.dateTo) query = query.lte('event_date', params.dateTo)

    // Always show sponsored listings first
    query = query.order('is_sponsored', { ascending: false, nullsFirst: false })

    switch (sortBy) {
      case 'price_asc': query = query.order('asking_price', { ascending: true }); break
      case 'price_desc': query = query.order('asking_price', { ascending: false }); break
      case 'date_asc': query = query.order('event_date', { ascending: true }); break
      case 'date_desc': query = query.order('event_date', { ascending: false }); break
      default: query = query.order('created_at', { ascending: false })
    }

    const { data, count, error } = await query.range(from, to)
    if (error) throw error

    return {
      data: data as (Listing & { seller: { id: string; name: string; avatar_url: string | null; rating_avg: number; rating_count: number } })[],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    }
  },

  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from('listings')
      .select('*, seller:profiles!seller_id(*)')
      .eq('slug', slug)
      .single()

    if (error) throw error

    // Increment view count (fire and forget)
    void supabase
      .from('listings')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', data.id)
      .then(() => {}, () => {})

    return data as Listing & { seller: NonNullable<Listing['seller']> }
  },

  async getById(id: number) {
    const { data, error } = await supabase
      .from('listings')
      .select('*, seller:profiles!seller_id(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Listing & { seller: NonNullable<Listing['seller']> }
  },

  async getMyListings(userId: string) {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('seller_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Listing[]
  },

  async create(listing: Partial<Listing>) {
    const { data, error } = await supabase
      .from('listings')
      .insert(listing)
      .select()
      .single()

    if (error) throw error
    return data as Listing
  },

  async update(id: number, updates: Partial<Listing>) {
    const { data, error } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Listing
  },

  async publish(id: number) {
    return this.update(id, { status: 'PENDING_REVIEW', published_at: new Date().toISOString() })
  },

  async cancel(id: number) {
    return this.update(id, { status: 'CANCELLED' })
  },

  async toggleFavorite(listingId: number, userId: string) {
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('listing_id', listingId)
      .single()

    if (existing) {
      await supabase.from('favorites').delete().eq('id', existing.id)
      return false
    } else {
      await supabase.from('favorites').insert({ user_id: userId, listing_id: listingId })
      return true
    }
  },

  async getFavorites(userId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .select('listing:listings!listing_id(*, seller:profiles!seller_id(id, name, avatar_url, rating_avg))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getCategoryStats() {
    const { data, error } = await supabase
      .from('listings')
      .select('category')
      .eq('status', 'ACTIVE')

    if (error) throw error

    const counts: Record<string, number> = {}
    data.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1
    })
    return counts
  },
}
