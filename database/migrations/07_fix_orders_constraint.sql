-- Fix the orders status constraint to include 'pending_payment'
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending_payment', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'));
