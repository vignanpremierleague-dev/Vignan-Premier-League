-- VPL Auction: Allow decimal bid amounts (0.25 Cr steps)
-- Run this ONCE in your Supabase Dashboard → SQL Editor
-- This changes bid_amount from INTEGER to NUMERIC so decimal values like 5.75 Cr work.

ALTER TABLE vpl_players
  ALTER COLUMN bid_amount TYPE numeric(10, 2);

-- Verify:
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'vpl_players' AND column_name = 'bid_amount';
-- Should show: numeric
