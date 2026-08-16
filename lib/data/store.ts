import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Listing, Profile, Conversation, Message, SubscriptionPlan } from '@/types';
import { INITIAL_LISTINGS, CURRENT_USER, INITIAL_CONVERSATIONS, INITIAL_MESSAGES } from './mock-data';

interface AddListingPayload extends Omit<Listing, 'id' | 'created_at' | 'views_count' | 'favorites_count' | 'seller_id' | 'seller'> {
  seller_id?: string;
  seller?: Profile;
}

interface MarketplaceStore {
  // User
  currentUser: Profile;
  updateProfile: (data: Partial<Profile>) => void;

  // Subscription
  subscriptionPlan: SubscriptionPlan;
  isTrialActive: boolean;
  trialDaysLeft: number;
  setSubscription: (plan: SubscriptionPlan) => void;
  activateTrial: () => void;

  // Listings
  listings: Listing[];
  favorites: string[];
  searchQuery: string;
  selectedCommune: string;
  selectedCategory: string | null;

  setSearchQuery: (query: string) => void;
  setSelectedCommune: (commune: string) => void;
  setSelectedCategory: (catId: string | null) => void;
  addListing: (listing: AddListingPayload) => string;
  updateListing: (id: string, data: Partial<Listing>) => void;
  deleteListing: (id: string) => void;
  clearAllListings: () => void;
  markAsSold: (id: string) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;

  // Conversations & Messages
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  sendMessage: (conversationId: string, content: string) => void;
  startConversation: (listingId: string, initialMessage?: string) => string;
  markConversationAsRead: (conversationId: string) => void;
}

export const useMarketplaceStore = create<MarketplaceStore>()(
  persist(
    (set, get) => ({
      currentUser: CURRENT_USER,
      updateProfile: (data) =>
        set((state) => ({
          currentUser: { ...state.currentUser, ...data },
          listings: state.listings.map((item) =>
            item.seller_id === state.currentUser.id || item.seller?.id === state.currentUser.id
              ? {
                  ...item,
                  seller: {
                    ...item.seller,
                    ...data,
                    id: item.seller?.id || state.currentUser.id,
                    full_name: data.full_name ?? item.seller?.full_name ?? state.currentUser.full_name,
                    phone: data.phone ?? item.seller?.phone ?? state.currentUser.phone,
                    commune: data.commune ?? item.seller?.commune ?? state.currentUser.commune,
                    avatar_url: data.avatar_url ?? item.seller?.avatar_url ?? state.currentUser.avatar_url,
                  } as any,
                }
              : item
          ),
        })),

      subscriptionPlan: 'free',
      isTrialActive: false,
      trialDaysLeft: 0,
      setSubscription: (plan) =>
        set(() => ({
          subscriptionPlan: plan,
          isTrialActive: false,
        })),
      activateTrial: () =>
        set(() => ({
          isTrialActive: true,
          trialDaysLeft: 7,
          subscriptionPlan: 'monthly',
        })),

      listings: INITIAL_LISTINGS,
      favorites: [],
      searchQuery: '',
      selectedCommune: 'Tout Abidjan',
      selectedCategory: null,

      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedCommune: (commune) => set({ selectedCommune: commune }),
      setSelectedCategory: (catId) => set({ selectedCategory: catId }),

      addListing: (newListingData) => {
        const newId = `listing-${Date.now()}`;
        const finalSeller = newListingData.seller || get().currentUser;
        const finalSellerId = newListingData.seller_id || finalSeller.id;

        const newListing: Listing = {
          ...newListingData,
          id: newId,
          seller_id: finalSellerId,
          seller: finalSeller,
          status: 'active',
          views_count: 0,
          favorites_count: 0,
          created_at: new Date().toISOString(),
        };

        set((state) => ({
          listings: [newListing, ...state.listings],
          currentUser: {
            ...state.currentUser,
            active_listings_count: (state.currentUser.active_listings_count || 0) + 1,
          },
        }));

        return newId;
      },

      updateListing: (id, data) =>
        set((state) => ({
          listings: state.listings.map((l) =>
            l.id === id ? { ...l, ...data, updated_at: new Date().toISOString() } : l
          ),
        })),

      deleteListing: (id) =>
        set((state) => ({
          listings: state.listings.filter((l) => l.id !== id),
          currentUser: {
            ...state.currentUser,
            active_listings_count: Math.max(0, (state.currentUser.active_listings_count || 0) - 1),
          },
        })),

      clearAllListings: () =>
        set(() => ({
          listings: [],
        })),

      markAsSold: (id) =>
        set((state) => ({
          listings: state.listings.map((l) =>
            l.id === id ? { ...l, status: 'sold' } : l
          ),
          currentUser: {
            ...state.currentUser,
            active_listings_count: Math.max(0, (state.currentUser.active_listings_count || 0) - 1),
            sold_listings_count: (state.currentUser.sold_listings_count || 0) + 1,
          },
        })),

      toggleFavorite: (id) =>
        set((state) => {
          const exists = state.favorites.includes(id);
          const newFavorites = exists
            ? state.favorites.filter((favId) => favId !== id)
            : [...state.favorites, id];

          const updatedListings = state.listings.map((item) => {
            if (item.id === id) {
              return {
                ...item,
                favorites_count: Math.max(
                  0,
                  (item.favorites_count || 0) + (exists ? -1 : 1)
                ),
              };
            }
            return item;
          });

          return {
            favorites: newFavorites,
            listings: updatedListings,
          };
        }),

      isFavorite: (id) => get().favorites.includes(id),

      conversations: INITIAL_CONVERSATIONS,
      messages: INITIAL_MESSAGES,
      activeConversationId: null,

      setActiveConversationId: (id) => {
        set({ activeConversationId: id });
        if (id) {
          get().markConversationAsRead(id);
        }
      },

      sendMessage: (conversationId, content) => {
        if (!content.trim()) return;

        const newMessage: Message = {
          id: `msg-${Date.now()}`,
          conversation_id: conversationId,
          sender_id: get().currentUser.id,
          content: content.trim(),
          is_read: true,
          created_at: new Date().toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };

        set((state) => {
          const convMessages = state.messages[conversationId] || [];
          const updatedConversations = state.conversations.map((c) => {
            if (c.id === conversationId) {
              return {
                ...c,
                last_message: content.trim(),
                last_message_time: 'À l’instant',
                updated_at: new Date().toISOString(),
              };
            }
            return c;
          });

          return {
            messages: {
              ...state.messages,
              [conversationId]: [...convMessages, newMessage],
            },
            conversations: updatedConversations,
          };
        });
      },

      startConversation: (listingId, initialMessage) => {
        const listing = get().listings.find((l) => l.id === listingId);
        const seller = listing?.seller;

        const existing = get().conversations.find((c) => c.listing_id === listingId);
        if (existing) {
          get().setActiveConversationId(existing.id);
          return existing.id;
        }

        const newConvId = `conv-${Date.now()}`;
        const newConversation: Conversation = {
          id: newConvId,
          listing_id: listingId,
          listing: listing,
          buyer_id: get().currentUser.id,
          buyer: get().currentUser,
          seller_id: seller?.id || 'seller-id',
          seller: seller,
          last_message: initialMessage || 'Conversation démarrée',
          last_message_time: 'À l’instant',
          unread_count: 0,
          updated_at: new Date().toISOString(),
        };

        const initialMsgList: Message[] = initialMessage
          ? [
              {
                id: `msg-${Date.now()}`,
                conversation_id: newConvId,
                sender_id: get().currentUser.id,
                content: initialMessage,
                is_read: true,
                created_at: new Date().toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
              },
            ]
          : [];

        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          messages: {
            ...state.messages,
            [newConvId]: initialMsgList,
          },
          activeConversationId: newConvId,
        }));

        return newConvId;
      },

      markConversationAsRead: (conversationId) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId ? { ...c, unread_count: 0 } : c
          ),
          messages: {
            ...state.messages,
            [conversationId]: (state.messages[conversationId] || []).map((m) => ({
              ...m,
              is_read: true,
            })),
          },
        })),
    }),
    {
      name: 'vente2emain-storage-v7-synced',
      partialize: (state) => ({
        currentUser: state.currentUser,
        listings: state.listings,
        favorites: state.favorites,
        subscriptionPlan: state.subscriptionPlan,
        isTrialActive: state.isTrialActive,
      }),
    }
  )
);