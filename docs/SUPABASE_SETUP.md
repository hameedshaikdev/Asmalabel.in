# Supabase Database Setup Guide

## Step 1: Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in project details:
   - **Name**: ShopHub
   - **Database Password**: (create a strong password)
   - **Region**: Choose closest to your location
4. Click "Create new project"

## Step 2: Set Up Database Tables

Go to the SQL Editor in your Supabase dashboard and run these SQL commands:

### 1. Create Products Table

```sql
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
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active products
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (active = true);

-- Only authenticated users can insert/update/delete (admin check in app)
CREATE POLICY "Authenticated users can manage products" ON products
  FOR ALL USING (auth.role() = 'authenticated');

-- Create index for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(active);
```

### 2. Create Orders Table

```sql
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
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users can only view their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own orders
CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

### 3. Create Storage Bucket for Product Images

Go to **Storage** in Supabase dashboard:

1. Click "Create a new bucket"
2. **Name**: `product-images`
3. **Public bucket**: Yes (check the box)
4. Click "Create bucket"

### 4. Set Up Storage Policies

```sql
-- Allow anyone to read product images
CREATE POLICY "Anyone can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to update images
CREATE POLICY "Authenticated users can update images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
```

## Step 3: Insert Sample Data (Optional)

```sql
-- Sample Tailoring Products
INSERT INTO products (name, description, price, original_price, category, sub_category, unit, stock, image_url) VALUES
('Professional Sewing Machine', 'Heavy-duty sewing machine for professional tailors', 15999.00, 18999.00, 'tailoring', 'machines', '1 piece', 10, 'https://via.placeholder.com/300'),
('Fabric Scissors 10 inch', 'Sharp stainless steel scissors for cutting fabric', 299.00, 399.00, 'tailoring', 'scissors', '1 piece', 50, 'https://via.placeholder.com/300'),
('Polyester Thread Set', 'Set of 24 colorful polyester threads', 599.00, 799.00, 'tailoring', 'threads', '24 pieces', 100, 'https://via.placeholder.com/300'),
('Needle Set', 'Assorted sewing needles for all fabric types', 149.00, 199.00, 'tailoring', 'needles', '50 pieces', 200, 'https://via.placeholder.com/300'),
('Measuring Tape 5m', 'Flexible measuring tape with both cm and inches', 99.00, NULL, 'tailoring', 'measuring', '1 piece', 150, 'https://via.placeholder.com/300');

-- Sample Fashion Products
INSERT INTO products (name, description, price, original_price, category, sub_category, unit, stock, image_url) VALUES
('Floral Summer Dress', 'Beautiful floral print summer dress', 1299.00, 1799.00, 'fashion', 'dresses', '1 piece', 30, 'https://via.placeholder.com/300'),
('Casual Cotton Top', 'Comfortable cotton top for everyday wear', 599.00, 899.00, 'fashion', 'tops', '1 piece', 50, 'https://via.placeholder.com/300'),
('Denim Jeans', 'Stylish blue denim jeans with perfect fit', 1499.00, 1999.00, 'fashion', 'bottoms', '1 piece', 40, 'https://via.placeholder.com/300'),
('Ethnic Kurti', 'Traditional ethnic kurti with embroidery', 899.00, 1299.00, 'fashion', 'ethnic', '1 piece', 35, 'https://via.placeholder.com/300'),
('Leather Handbag', 'Premium quality leather handbag', 1999.00, 2999.00, 'fashion', 'accessories', '1 piece', 20, 'https://via.placeholder.com/300');
```

## Step 4: Get Your API Keys

1. Go to **Project Settings** → **API**
2. Copy your:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key

## Step 5: Configure Your App

1. Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id_here
```

2. Replace the placeholder values with your actual keys

## Step 6: Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates if needed

## Admin Account Setup

To create an admin account:

1. Sign up through the app with email: `admin@shop.com`
2. Or manually create a user in Supabase Authentication dashboard
3. The app checks for this specific email for admin access

## Testing the Setup

1. Start your development server
2. Try signing up with a new account
3. Browse products
4. Add items to cart
5. Test the checkout flow (with Razorpay test keys)
6. Access admin panel with admin account

## Production Checklist

- [ ] Update Row Level Security policies for production
- [ ] Configure proper admin role system
- [ ] Set up email templates
- [ ] Configure storage limits
- [ ] Set up database backups
- [ ] Add proper error handling
- [ ] Implement rate limiting
- [ ] Add monitoring and logging
