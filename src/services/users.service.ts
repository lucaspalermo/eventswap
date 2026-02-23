import { createClient } from "@/lib/supabase/client";
import type { Profile, Review } from "@/types/database.types";

const supabase = createClient();

export const usersService = {
  async getById(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data as Profile;
  },

  async getPublicProfile(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, name, display_name, avatar_url, bio, address_city, address_state, rating_avg, rating_count, is_verified, created_at"
      )
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  },

  async getReviews(userId: string) {
    const { data, error } = await supabase
      .from("reviews")
      .select(
        "*, author:profiles!author_id(id, name, avatar_url), transaction:transactions!transaction_id(listing:listings!listing_id(title, category))"
      )
      .eq("target_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async createReview(
    transactionId: number,
    authorId: string,
    targetId: string,
    rating: number,
    comment?: string
  ) {
    const { data, error } = await supabase
      .from("reviews")
      .insert({
        transaction_id: transactionId,
        author_id: authorId,
        target_id: targetId,
        rating,
        comment,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Review;
  },

  async getActiveListingsCount(userId: string) {
    const { count, error } = await supabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("seller_id", userId)
      .eq("status", "ACTIVE");

    if (error) throw error;
    return count || 0;
  },
};
