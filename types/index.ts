export type UserRole = 'user' | 'buyer' | 'seller' | 'admin';

export interface Profile {
  id: string;
  email?: string;
  full_name: string;
  avatar_url: string;
  phone: string;
  whatsapp_enabled: boolean;
  commune: string;
  role?: UserRole;
  is_verified: boolean;
  rating: number;
  reviews_count: number;
  active_listings_count: number;
  sold_listings_count: number;
  member_since: string;
  response_rate: string;
  created_at: string;
}

export type ListingCondition = 'new' | 'like-new' | 'very-good' | 'good' | 'fair';

export type ListingStatus = 'active' | 'pending' | 'sold' | 'archived';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color_bg: string;
  color_text: string;
}

export interface ListingSpecification {
  label: string;
  value: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  is_negotiable: boolean;
  condition: ListingCondition;
  category_id: string;
  category_name?: string;
  commune: string;
  neighborhood?: string;
  location_detail?: string;
  images: string[];
  seller_id: string;
  seller?: Profile;
  status: ListingStatus;
  is_boosted?: boolean;
  views_count?: number;
  favorites_count?: number;
  whatsapp_enabled?: boolean;
  contact_phone?: string;
  specifications?: ListingSpecification[];
  safety_advice?: string[];
  created_at: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  attachment_url?: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  listing_id: string;
  listing?: Listing;
  buyer_id: string;
  buyer?: Profile;
  seller_id: string;
  seller?: Profile;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
  is_online?: boolean;
  updated_at: string;
}

export type SubscriptionPlan = 'free' | 'monthly' | 'annual';

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: SubscriptionPlan;
  status: 'active' | 'trial' | 'expired';
  trial_ends_at?: string;
  expires_at: string;
  payment_method?: string;
  created_at: string;
}

export type MobileMoneyOperator = 'orange' | 'mtn' | 'moov' | 'wave';

export interface PaymentTransaction {
  id: string;
  user_id: string;
  amount: number;
  operator: MobileMoneyOperator;
  phone: string;
  status: 'pending' | 'success' | 'failed';
  reference: string;
  created_at: string;
}