import { createClient } from "@/lib/supabase/client";
import type { Transaction, TransactionStatus } from "@/types/database.types";

const supabase = createClient();

export const transactionsService = {
  async initiate(listingId: number, buyerId: string, agreedPrice: number) {
    const platformFeeRate = 0.05; // 5% buyer fee
    const platformFee = agreedPrice * platformFeeRate;
    const sellerNetAmount = agreedPrice - platformFee;

    const code = `TXN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const { data: listing } = await supabase
      .from("listings")
      .select("seller_id")
      .eq("id", listingId)
      .single();

    if (!listing) throw new Error("Listing not found");

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        code,
        buyer_id: buyerId,
        seller_id: listing.seller_id,
        listing_id: listingId,
        agreed_price: agreedPrice,
        platform_fee: platformFee,
        platform_fee_rate: platformFeeRate,
        seller_net_amount: sellerNetAmount,
        status: "INITIATED" as TransactionStatus,
        payment_deadline: new Date(
          Date.now() + 48 * 60 * 60 * 1000
        ).toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as Transaction;
  },

  async getById(id: number) {
    const { data, error } = await supabase
      .from("transactions")
      .select(
        "*, listing:listings!listing_id(*, seller:profiles!seller_id(id, name, avatar_url)), buyer:profiles!buyer_id(id, name, avatar_url, rating_avg), seller:profiles!seller_id(id, name, avatar_url, rating_avg)"
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async getMyPurchases(userId: string) {
    const { data, error } = await supabase
      .from("transactions")
      .select(
        "*, listing:listings!listing_id(title, slug, category, event_date, images, venue_name), seller:profiles!seller_id(id, name, avatar_url)"
      )
      .eq("buyer_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getMySales(userId: string) {
    const { data, error } = await supabase
      .from("transactions")
      .select(
        "*, listing:listings!listing_id(title, slug, category, event_date, images, venue_name), buyer:profiles!buyer_id(id, name, avatar_url)"
      )
      .eq("seller_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateStatus(id: number, status: TransactionStatus) {
    const updates: Record<string, unknown> = { status };

    if (status === "COMPLETED") {
      updates.completed_at = new Date().toISOString();
    }
    if (status === "CANCELLED") {
      updates.cancelled_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("transactions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Transaction;
  },

  async cancel(id: number, reason: string) {
    const { data, error } = await supabase
      .from("transactions")
      .update({
        status: "CANCELLED" as TransactionStatus,
        cancelled_at: new Date().toISOString(),
        cancel_reason: reason,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Transaction;
  },
};
