-- Add is_live column to vpl_auction_state to support the Start Live / Stop Live feature
ALTER TABLE public.vpl_auction_state 
ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT false;
