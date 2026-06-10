-- 1. Create vpl_teams table
CREATE TABLE IF NOT EXISTS public.vpl_teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    owner_name TEXT,
    logo_url TEXT,
    starting_purse NUMERIC DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for vpl_teams
ALTER TABLE public.vpl_teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.vpl_teams FOR SELECT USING (true);
CREATE POLICY "Enable all access for authenticated service role" ON public.vpl_teams FOR ALL USING (auth.role() = 'service_role');

-- 2. Create vpl_auction_transactions table
CREATE TABLE IF NOT EXISTS public.vpl_auction_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID REFERENCES public.vpl_players(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.vpl_teams(id) ON DELETE CASCADE,
    bid_amount NUMERIC NOT NULL,
    is_captain_draft BOOLEAN DEFAULT false,
    sold_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(player_id) -- A player can only be sold once
);

-- Enable RLS for vpl_auction_transactions
ALTER TABLE public.vpl_auction_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.vpl_auction_transactions FOR SELECT USING (true);
CREATE POLICY "Enable all access for authenticated service role" ON public.vpl_auction_transactions FOR ALL USING (auth.role() = 'service_role');

-- 3. Create vpl_auction_state table
CREATE TABLE IF NOT EXISTS public.vpl_auction_state (
    id INTEGER PRIMARY KEY DEFAULT 1,
    auction_type TEXT DEFAULT 'players',
    stage TEXT DEFAULT 'idle',
    active_player_id UUID REFERENCES public.vpl_players(id) ON DELETE SET NULL,
    current_bid NUMERIC DEFAULT 0,
    sold_to TEXT,
    sold_price NUMERIC DEFAULT 0,
    is_public_visible BOOLEAN DEFAULT false,
    display_title TEXT DEFAULT 'VPL Captains Auction',
    nomination_order JSONB DEFAULT '[]'::jsonb,
    last_event_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT single_row CHECK (id = 1)
);

-- Enable RLS for vpl_auction_state
ALTER TABLE public.vpl_auction_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.vpl_auction_state FOR SELECT USING (true);
CREATE POLICY "Enable all access for authenticated service role" ON public.vpl_auction_state FOR ALL USING (auth.role() = 'service_role');

-- 4. Data Migration
-- Automatically migrate existing team names from vpl_players to vpl_teams
INSERT INTO public.vpl_teams (name)
SELECT DISTINCT sold_to FROM public.vpl_players WHERE sold_to IS NOT NULL AND sold_to != ''
ON CONFLICT (name) DO NOTHING;

-- Automatically migrate existing sold players to vpl_auction_transactions
INSERT INTO public.vpl_auction_transactions (player_id, team_id, bid_amount, is_captain_draft, sold_at)
SELECT 
    p.id as player_id,
    t.id as team_id,
    p.bid_amount,
    p.is_captain as is_captain_draft,
    now() as sold_at -- We don't have sold_at on the old table, fallback to current time
FROM public.vpl_players p
JOIN public.vpl_teams t ON p.sold_to = t.name
WHERE p.auction_status = 'sold'
ON CONFLICT (player_id) DO NOTHING;

-- Initialize default auction state
INSERT INTO public.vpl_auction_state (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- 5. Cleanup vpl_players
-- Uncomment these if you are 100% sure the migration succeeded and you want to clean up:
-- ALTER TABLE public.vpl_players DROP COLUMN IF EXISTS auction_status;
-- ALTER TABLE public.vpl_players DROP COLUMN IF EXISTS sold_to;
-- ALTER TABLE public.vpl_players DROP COLUMN IF EXISTS bid_amount;
