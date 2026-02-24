-- ============================================================================
-- Migration 008: Add plan columns to listings table
-- Supports per-listing plan selection (Gratuito/Pro/Business)
-- ============================================================================

-- Add plan_type column (defaults to 'gratuito' for free plan)
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'gratuito';

-- Add seller_fee_percent column (defaults to 12% for free plan)
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS seller_fee_percent DECIMAL(5,2) DEFAULT 12.00;

-- Add plan_paid column (tracks if paid plan was confirmed via Asaas)
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS plan_paid BOOLEAN DEFAULT false;

-- Update seller_plans CHECK constraint to accept our plan names
-- (The existing CHECK uses 'free','premium','business' but we use 'gratuito','pro','business')
ALTER TABLE public.seller_plans
  DROP CONSTRAINT IF EXISTS seller_plans_plan_type_check;

-- Add permissive check that accepts both old and new plan names
ALTER TABLE public.seller_plans
  ADD CONSTRAINT seller_plans_plan_type_check
  CHECK (plan_type IN ('free', 'premium', 'business', 'gratuito', 'pro'));
