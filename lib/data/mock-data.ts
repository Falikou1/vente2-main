import { Profile, Category, Listing, Conversation, Message } from '@/types';

export const CURRENT_USER: Profile = {
  id: 'admin-primary-singleton',
  email: 'admin@vente2emain.ci',
  full_name: 'Administrateur Principal',
  avatar_url: 'https://api.dicebear.com/8.x/initials/svg?seed=Admin+Vente2eMain',
  phone: '+225 07 08 00 00 00',
  whatsapp_enabled: true,
  commune: 'Abidjan (Plateau)',
  role: 'admin',
  is_verified: true,
  rating: 5,
  reviews_count: 0,
  active_listings_count: 0,
  sold_listings_count: 0,
  member_since: 'Super Admin',
  response_rate: '100%',
  created_at: new Date().toISOString(),
};

export const PROFILES_MAP: Record<string, Profile> = {
  'user-default': CURRENT_USER,
};

export const CATEGORIES: Category[] = [
  {
    id: 'cat-fashion',
    name: 'Mode & Vêtements',
    slug: 'mode-vetements',
    icon: 'checkroom',
    color_bg: 'bg-rose-50',
    color_text: 'text-rose-600',
  },
  {
    id: 'cat-shoes',
    name: 'Chaussures',
    slug: 'chaussures',
    icon: 'shopping_bag',
    color_bg: 'bg-amber-50',
    color_text: 'text-amber-600',
  },
  {
    id: 'cat-phones',
    name: 'Téléphones & Acc.',
    slug: 'telephones-accessoires',
    icon: 'smartphone',
    color_bg: 'bg-blue-50',
    color_text: 'text-blue-600',
  },
  {
    id: 'cat-computers',
    name: 'Informatique',
    slug: 'informatique',
    icon: 'laptop_chromebook',
    color_bg: 'bg-indigo-50',
    color_text: 'text-indigo-600',
  },
  {
    id: 'cat-electronics',
    name: 'Électronique & Son',
    slug: 'electronique-son',
    icon: 'headphones',
    color_bg: 'bg-cyan-50',
    color_text: 'text-cyan-600',
  },
  {
    id: 'cat-home',
    name: 'Maison & Déco',
    slug: 'maison-deco',
    icon: 'chair',
    color_bg: 'bg-emerald-50',
    color_text: 'text-emerald-600',
  },
  {
    id: 'cat-appliances',
    name: 'Électroménager',
    slug: 'electromenager',
    icon: 'blender',
    color_bg: 'bg-teal-50',
    color_text: 'text-teal-600',
  },
  {
    id: 'cat-books',
    name: 'Livres & Culture',
    slug: 'livres-culture',
    icon: 'menu_book',
    color_bg: 'bg-orange-50',
    color_text: 'text-orange-600',
  },
  {
    id: 'cat-games',
    name: 'Jeux & Loisirs',
    slug: 'jeux-loisirs',
    icon: 'sports_esports',
    color_bg: 'bg-purple-50',
    color_text: 'text-purple-600',
  },
  {
    id: 'cat-sport',
    name: 'Sport & Fitness',
    slug: 'sport-fitness',
    icon: 'fitness_center',
    color_bg: 'bg-green-50',
    color_text: 'text-green-600',
  },
  {
    id: 'cat-kids',
    name: 'Enfants & Bébés',
    slug: 'enfants-bebes',
    icon: 'child_care',
    color_bg: 'bg-pink-50',
    color_text: 'text-pink-600',
  },
  {
    id: 'cat-beauty',
    name: 'Beauté & Soins',
    slug: 'beaute-soins',
    icon: 'spa',
    color_bg: 'bg-fuchsia-50',
    color_text: 'text-fuchsia-600',
  },
  {
    id: 'cat-accessories',
    name: 'Accessoires & Montres',
    slug: 'accessoires-montres',
    icon: 'watch',
    color_bg: 'bg-yellow-50',
    color_text: 'text-yellow-700',
  },
  {
    id: 'cat-others',
    name: 'Autres objets',
    slug: 'autres-objets',
    icon: 'category',
    color_bg: 'bg-slate-100',
    color_text: 'text-slate-700',
  },
];

export const INITIAL_LISTINGS: Listing[] = [];
export const INITIAL_CONVERSATIONS: Conversation[] = [];
export const INITIAL_MESSAGES: Record<string, Message[]> = {};