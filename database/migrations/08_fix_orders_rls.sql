-- ============================================================
-- FIX: Correct RLS policies using auth.jwt() instead of querying auth.users
-- Run this in Supabase SQL Editor
-- ============================================================

-- Drop all existing order policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Admin can update orders" ON orders;

-- SELECT: users see own, admin sees all
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (
    auth.uid() = user_id
    OR
    auth.jwt() ->> 'email' = 'as.businezzz@gmail.com'
  );

-- INSERT: any authenticated user can create orders
CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE: owner or admin can update
CREATE POLICY "Admin can update orders" ON orders
  FOR UPDATE USING (
    auth.uid() = user_id
    OR
    auth.jwt() ->> 'email' = 'as.businezzz@gmail.com'
  );

-- Verify
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'orders';
