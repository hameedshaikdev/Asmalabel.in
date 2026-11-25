-- ============================================================
-- AS HUB — Payment Verification System — Database Migration
-- Run this entire script in Supabase SQL Editor
-- ============================================================

-- 1. Drop old constraint and add new one with all statuses
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN (
    'pending_payment',
    'payment_submitted',
    'payment_verified',
    'payment_rejected',
    'confirmed',
    'preparing',
    'shipped',
    'delivered',
    'cancelled'
  ));

-- 2. Add payment-related columns
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_status   TEXT    DEFAULT 'pending'
    CHECK (payment_status IN ('pending','submitted','verified','rejected')),
  ADD COLUMN IF NOT EXISTS utr              TEXT,
  ADD COLUMN IF NOT EXISTS screenshot_url  TEXT,
  ADD COLUMN IF NOT EXISTS verified_by     TEXT,
  ADD COLUMN IF NOT EXISTS verified_at     TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS upi_app         TEXT,
  ADD COLUMN IF NOT EXISTS submitted_at    TIMESTAMP WITH TIME ZONE;

-- 3. Indexes for admin panel queries
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_status         ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_submitted_at   ON orders(submitted_at DESC);

-- 4. Storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-screenshots', 'payment-screenshots', true)
ON CONFLICT DO NOTHING;

-- 5. Storage policy — authenticated users can upload screenshots
CREATE POLICY "Users can upload payment screenshots"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'payment-screenshots' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view payment screenshots"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'payment-screenshots');

-- 6. RLS: admin can update any order (for verification)
CREATE POLICY "Admin can update orders" ON orders
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Verify
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'orders' ORDER BY ordinal_position;
