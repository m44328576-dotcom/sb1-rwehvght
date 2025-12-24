/*
  # Pixel Marketplace Database Schema

  ## Overview
  This migration creates the complete database structure for a pixel trading marketplace
  with 1 million pixels, dynamic pricing, crypto payments, and blockchain verification.

  ## New Tables
  
  ### 1. `profiles`
  User profile information extending Supabase auth.users
  - `id` (uuid, primary key) - Links to auth.users
  - `username` (text, unique) - Display name
  - `wallet_address` (text) - Crypto wallet address
  - `total_spent` (numeric) - Total amount spent
  - `total_earned` (numeric) - Total amount earned
  - `created_at` (timestamptz) - Account creation time
  
  ### 2. `pixels`
  Individual pixel data (1 million pixels total)
  - `id` (integer, primary key) - Pixel ID (1 to 1,000,000)
  - `x` (integer) - X coordinate (0-999)
  - `y` (integer) - Y coordinate (0-999)
  - `owner_id` (uuid) - Current owner
  - `current_price` (numeric) - Current market price
  - `purchase_price` (numeric) - Last purchase price
  - `content_type` (text) - 'ad' or 'nft'
  - `content_url` (text) - URL to image/content
  - `nft_token_id` (text) - NFT identifier if applicable
  - `is_for_sale` (boolean) - Available for purchase
  - `times_sold` (integer) - Number of times traded
  - `last_sale_at` (timestamptz) - Last sale timestamp
  - `created_at` (timestamptz) - Pixel creation time
  - `updated_at` (timestamptz) - Last update time
  
  ### 3. `transactions`
  All buy/sell transactions with blockchain verification
  - `id` (uuid, primary key) - Transaction ID
  - `pixel_id` (integer) - Pixel being traded
  - `seller_id` (uuid) - Seller user ID
  - `buyer_id` (uuid) - Buyer user ID
  - `sale_price` (numeric) - Transaction amount
  - `commission_rate` (numeric) - Commission percentage (default 5%)
  - `commission_amount` (numeric) - Calculated commission
  - `net_amount` (numeric) - Amount after commission
  - `payment_method` (text) - Crypto currency used
  - `blockchain_hash` (text) - Blockchain transaction hash
  - `status` (text) - 'pending', 'completed', 'failed'
  - `created_at` (timestamptz) - Transaction time
  
  ### 4. `price_history`
  Historical pricing data for analytics and algorithms
  - `id` (uuid, primary key) - Record ID
  - `pixel_id` (integer) - Pixel reference
  - `price` (numeric) - Price at this point
  - `volume` (integer) - Trading volume
  - `liquidity_score` (numeric) - Calculated liquidity
  - `demand_score` (numeric) - Calculated demand
  - `recorded_at` (timestamptz) - Timestamp
  
  ### 5. `wallets`
  User crypto wallets and balances
  - `id` (uuid, primary key) - Wallet ID
  - `user_id` (uuid) - Owner user ID
  - `wallet_address` (text, unique) - Blockchain address
  - `balance` (numeric) - Available balance
  - `encrypted_key` (text) - Encrypted private key
  - `currency` (text) - Crypto currency type
  - `created_at` (timestamptz) - Creation time
  
  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Users can only modify their own data
  - Public read access for pixel grid
  - Secure transaction processing
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  wallet_address text,
  total_spent numeric DEFAULT 0,
  total_earned numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create pixels table
CREATE TABLE IF NOT EXISTS pixels (
  id integer PRIMARY KEY,
  x integer NOT NULL,
  y integer NOT NULL,
  owner_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  current_price numeric NOT NULL DEFAULT 1.00,
  purchase_price numeric DEFAULT 1.00,
  content_type text DEFAULT 'empty' CHECK (content_type IN ('empty', 'ad', 'nft')),
  content_url text,
  nft_token_id text,
  is_for_sale boolean DEFAULT false,
  times_sold integer DEFAULT 0,
  last_sale_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_coordinates CHECK (x >= 0 AND x < 1000 AND y >= 0 AND y < 1000)
);

ALTER TABLE pixels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pixels"
  ON pixels FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Owners can update their pixels"
  ON pixels FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pixel_id integer NOT NULL REFERENCES pixels(id),
  seller_id uuid REFERENCES profiles(id),
  buyer_id uuid NOT NULL REFERENCES profiles(id),
  sale_price numeric NOT NULL,
  commission_rate numeric DEFAULT 5.00,
  commission_amount numeric NOT NULL,
  net_amount numeric NOT NULL,
  payment_method text DEFAULT 'ETH',
  blockchain_hash text UNIQUE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (seller_id = auth.uid() OR buyer_id = auth.uid());

CREATE POLICY "Users can create transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (buyer_id = auth.uid());

-- Create price_history table
CREATE TABLE IF NOT EXISTS price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pixel_id integer NOT NULL REFERENCES pixels(id),
  price numeric NOT NULL,
  volume integer DEFAULT 0,
  liquidity_score numeric DEFAULT 0,
  demand_score numeric DEFAULT 0,
  recorded_at timestamptz DEFAULT now()
);

ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view price history"
  ON price_history FOR SELECT
  TO authenticated
  USING (true);

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  wallet_address text UNIQUE NOT NULL,
  balance numeric DEFAULT 0,
  encrypted_key text,
  currency text DEFAULT 'ETH',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet"
  ON wallets FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own wallet"
  ON wallets FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own wallet"
  ON wallets FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pixels_coordinates ON pixels(x, y);
CREATE INDEX IF NOT EXISTS idx_pixels_owner ON pixels(owner_id);
CREATE INDEX IF NOT EXISTS idx_pixels_for_sale ON pixels(is_for_sale) WHERE is_for_sale = true;
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_price_history_pixel ON price_history(pixel_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id);

-- Function to update pixel updated_at timestamp
CREATE OR REPLACE FUNCTION update_pixel_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pixel_updated_at
  BEFORE UPDATE ON pixels
  FOR EACH ROW
  EXECUTE FUNCTION update_pixel_timestamp();