import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  username: string;
  wallet_address: string | null;
  total_spent: number;
  total_earned: number;
  created_at: string;
}

export interface Pixel {
  id: number;
  x: number;
  y: number;
  owner_id: string | null;
  current_price: number;
  purchase_price: number;
  content_type: 'empty' | 'ad' | 'nft';
  content_url: string | null;
  nft_token_id: string | null;
  is_for_sale: boolean;
  times_sold: number;
  last_sale_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  pixel_id: number;
  seller_id: string | null;
  buyer_id: string;
  sale_price: number;
  commission_rate: number;
  commission_amount: number;
  net_amount: number;
  payment_method: string;
  blockchain_hash: string | null;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  wallet_address: string;
  balance: number;
  encrypted_key: string | null;
  currency: string;
  created_at: string;
}
