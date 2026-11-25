-- Create products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  category TEXT NOT NULL CHECK (category IN ('tailoring', 'fashion')),
  sub_category TEXT,
  unit TEXT,
  stock INTEGER,
  image_url TEXT,
  features TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_id TEXT,
  shipping_address JSONB NOT NULL,
  items JSONB NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (active = true);

CREATE POLICY "Authenticated users can manage products" ON products
  FOR ALL USING (auth.role() = 'authenticated');

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_sub_category ON products(sub_category);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Insert sample data for Tailoring Tools
INSERT INTO products (name, description, price, original_price, category, sub_category, unit, stock, active) VALUES
('Professional Sewing Machine', 'Heavy-duty computerized sewing machine perfect for professional tailors and serious hobbyists', 25999.00, 29999.00, 'tailoring', 'machines', '1 piece', 5, true),
('Brother Overlock Machine', '4-thread overlock machine for professional finishing', 18999.00, 22999.00, 'tailoring', 'machines', '1 piece', 8, true),
('Fabric Cutting Scissors 12"', 'Premium stainless steel scissors with comfortable grip for precise fabric cutting', 899.00, 1299.00, 'tailoring', 'scissors', '1 piece', 25, true),
('Pinking Shears 9 inch', 'Zigzag cutting scissors to prevent fabric fraying', 699.00, 999.00, 'tailoring', 'scissors', '1 piece', 15, true),
('Polyester Thread Set - 50 Spools', 'Assorted colors polyester thread set for all sewing needs', 1299.00, 1799.00, 'tailoring', 'threads', '50 spools', 50, true),
('Cotton Thread Variety Pack', 'High-quality cotton threads in 30 popular colors', 899.00, NULL, 'tailoring', 'threads', '30 spools', 30, true),
('Universal Needle Set', 'Assorted sewing machine needles for all fabric types', 299.00, 399.00, 'tailoring', 'needles', '25 pieces', 100, true),
('Leather Needles Pack', 'Heavy-duty needles designed for leather and thick materials', 199.00, 249.00, 'tailoring', 'needles', '10 pieces', 80, true),
('Flexible Measuring Tape 3m', 'Double-sided measuring tape with cm and inches', 149.00, 199.00, 'tailoring', 'measuring', '1 piece', 200, true),
('Quilting Ruler Set', 'Transparent acrylic rulers for precise measurements', 599.00, 799.00, 'tailoring', 'measuring', '5 pieces', 40, true);

-- Insert sample data for Women's Fashion
INSERT INTO products (name, description, price, original_price, category, sub_category, unit, stock, active) VALUES
('Floral Maxi Dress', 'Elegant floral print maxi dress perfect for summer occasions', 1899.00, 2499.00, 'fashion', 'dresses', '1 piece', 15, true),
('Little Black Dress', 'Classic LBD suitable for office and evening wear', 2299.00, 2999.00, 'fashion', 'dresses', '1 piece', 20, true),
('Casual A-Line Dress', 'Comfortable cotton A-line dress for everyday wear', 1299.00, 1799.00, 'fashion', 'dresses', '1 piece', 25, true),
('Silk Blouse', 'Luxurious silk blouse with button-down collar', 1599.00, 2199.00, 'fashion', 'tops', '1 piece', 18, true),
('Cotton Crop Top', 'Trendy crop top perfect for summer styling', 699.00, 899.00, 'fashion', 'tops', '1 piece', 35, true),
('Formal Blazer', 'Professional blazer for office and business meetings', 2499.00, 3299.00, 'fashion', 'tops', '1 piece', 12, true),
('High-Waist Jeans', 'Comfortable high-waist denim jeans with perfect fit', 1899.00, 2299.00, 'fashion', 'bottoms', '1 piece', 30, true),
('Palazzo Pants', 'Flowy palazzo pants perfect for comfort and style', 1199.00, 1599.00, 'fashion', 'bottoms', '1 piece', 22, true),
('Embroidered Kurti', 'Beautiful hand-embroidered kurti with traditional patterns', 1299.00, 1899.00, 'fashion', 'ethnic', '1 piece', 28, true),
('Anarkali Suit Set', 'Complete Anarkali suit with dupatta for festive occasions', 2999.00, 3999.00, 'fashion', 'ethnic', '1 set', 10, true),
('Leather Handbag', 'Premium genuine leather handbag with multiple compartments', 2499.00, 3499.00, 'fashion', 'accessories', '1 piece', 15, true),
('Pearl Jewelry Set', 'Elegant pearl necklace and earrings set', 1599.00, 2299.00, 'fashion', 'accessories', '1 set', 8, true);