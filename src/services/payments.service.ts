import { createClient } from "@/lib/supabase/client";
import type { Payment } from "@/types/database.types";

const supabase = createClient();

export const paymentsService = {
  async getByTransactionId(transactionId: number) {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("transaction_id", transactionId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data as Payment | null;
  },

  async getPaymentHistory(userId: string) {
    const { data, error } = await supabase
      .from("payments")
      .select(
        "*, transaction:transactions!transaction_id(code, listing:listings!listing_id(title, category))"
      )
      .or(`payer_id.eq.${userId},payee_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getWalletBalance(userId: string) {
    // Get completed sales where user is seller
    const { data: completedSales, error: salesError } = await supabase
      .from("payments")
      .select("net_amount")
      .eq("payee_id", userId)
      .eq("status", "SUCCEEDED");

    if (salesError) throw salesError;

    const totalEarnings = (completedSales || []).reduce(
      (sum, p) => sum + (p.net_amount || 0),
      0
    );

    // Get pending payouts
    const { data: pendingPayouts, error: pendingError } = await supabase
      .from("payments")
      .select("net_amount")
      .eq("payee_id", userId)
      .eq("status", "PROCESSING");

    if (pendingError) throw pendingError;

    const pendingAmount = (pendingPayouts || []).reduce(
      (sum, p) => sum + (p.net_amount || 0),
      0
    );

    return {
      totalEarnings,
      pendingAmount,
      availableBalance: totalEarnings - pendingAmount,
    };
  },
};
