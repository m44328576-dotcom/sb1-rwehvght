/*
  # Add Database Helper Functions

  ## Overview
  This migration adds PostgreSQL functions to help update user statistics
  and manage transactions efficiently.

  ## New Functions
  
  ### 1. `increment_user_earnings`
  Updates the total_earned field for a user when they sell a pixel
  - Parameters: user_id (uuid), amount (numeric)
  
  ### 2. `increment_user_spending`
  Updates the total_spent field for a user when they buy a pixel
  - Parameters: user_id (uuid), amount (numeric)
  
  ## Purpose
  These functions ensure atomic updates to user financial statistics
  and prevent race conditions during concurrent transactions.
*/

CREATE OR REPLACE FUNCTION increment_user_earnings(user_id uuid, amount numeric)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET total_earned = total_earned + amount
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_user_spending(user_id uuid, amount numeric)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET total_spent = total_spent + amount
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
