-- ==============================================================================
-- VENTE2éMAIN (Ivorian Horizon) - Database Schema for Supabase PostgreSQL
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT DEFAULT 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFOY944gxoa428HHKDZ53l6WC7Ephadic9yehhgbouyDEfQTHk_qYwym29MOjKt3lzjGN6Gg0RyGqxBm2rdeFroOWz4TpRO0YiSEZaFKSytXrd8d5nm202yvam2r2fyQeAR1y6hst2kLCNJ5Y5kmaV7qkzeAbb3RmAv-qDnTN6jYOVvIywWqT7hIFa7H5FbdFs4LbGZFnmYWCLQRisWUUx9k1DMP921BkSG29FC7OSHhjjuqMB9oyaqw',
    commune TEXT DEFAULT 'Cocody',
    is_verified BOOLEAN DEFAULT false,
    rating NUMERIC(3, 2) DEFAULT 5.00,
    reviews_count INTEGER DEFAULT 0,
    active_listings_count INTEGER DEFAULT 0,
    sold_listings_count INTEGER DEFAULT 0,
    whatsapp_enabled BOOLEAN DEFAULT true,
    response_rate TEXT DEFAULT '98%',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT NOT NULL,
    color_bg TEXT DEFAULT 'bg-primary-fixed/20',
    color_text TEXT DEFAULT 'text-primary-container',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Listings Table
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(12, 0) NOT NULL,
    is_negotiable BOOLEAN DEFAULT false,
    condition TEXT CHECK (condition IN ('new', 'like-new', 'good', 'fair')) NOT NULL,
    commune TEXT NOT NULL,
    neighborhood TEXT,
    location_detail TEXT,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    status TEXT CHECK (status IN ('active', 'pending', 'sold', 'archived')) DEFAULT 'active' NOT NULL,
    is_boosted BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    favorites_count INTEGER DEFAULT 0,
    specifications JSONB DEFAULT '[]'::jsonb,
    safety_advice TEXT[] DEFAULT ARRAY[
        'Rencontrez toujours le vendeur dans un lieu public et fréquenté (ex: Abidjan Mall, Cap Sud).',
        'Ne payez jamais d''avance avant d''avoir inspecté l''article en personne.',
        'Méfiez-vous des offres irréalistes ou des demandes de virement urgent.'
    ]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Favorites Table
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, listing_id)
);

-- 5. Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_message TEXT,
    last_message_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(listing_id, buyer_id, seller_id)
);

-- 6. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    attachment_url TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Subscriptions Table (Vendeur Pro)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_type TEXT CHECK (plan_type IN ('free', 'monthly', 'annual')) DEFAULT 'free' NOT NULL,
    status TEXT CHECK (status IN ('active', 'trial', 'expired')) DEFAULT 'trial' NOT NULL,
    payment_method TEXT,
    phone_number TEXT,
    amount NUMERIC(10, 0) DEFAULT 0,
    trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days'),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, user can update own profile
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Categories: Public read
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);

-- Listings: Public read for active listings, Sellers can CRUD their own
CREATE POLICY "Active listings are viewable by everyone" ON public.listings FOR SELECT USING (status = 'active' OR auth.uid() = seller_id);
CREATE POLICY "Authenticated users can create listings" ON public.listings FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can update own listings" ON public.listings FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Users can delete own listings" ON public.listings FOR DELETE USING (auth.uid() = seller_id);

-- Favorites: Users can manage their own favorites
CREATE POLICY "Users can view own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- Conversations: Only participants can view and manage
CREATE POLICY "Participants can view conversations" ON public.conversations FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Participants can create conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Participants can update conversations" ON public.conversations FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Messages: Only conversation participants can view and send messages
CREATE POLICY "Participants can view messages" ON public.messages FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id = messages.conversation_id AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
);
CREATE POLICY "Participants can insert messages" ON public.messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id = messages.conversation_id AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
);

-- Subscriptions: User can view and manage own subscription
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create/update own subscription" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
