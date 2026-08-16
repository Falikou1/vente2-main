'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMarketplaceStore } from '@/lib/data/store';
import { formatPriceFCFA } from '@/lib/utils';

export const ChatLayout: React.FC = () => {
  const {
    currentUser,
    conversations,
    messages,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
  } = useMarketplaceStore();

  const [filter, setFilter] = useState<'all' | 'unread' | 'sales'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [inputText, setInputText] = useState('');

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || (conversations.length > 0 ? conversations[0] : null);
  const activeMessages = activeConversation ? messages[activeConversation.id] || [] : [];

  const interlocutor = activeConversation
    ? activeConversation.buyer_id === currentUser.id
      ? activeConversation.seller
      : activeConversation.buyer
    : null;

  const linkedListing = activeConversation?.listing;

  const filteredConversations = conversations.filter((c) => {
    const inter = c.buyer_id === currentUser.id ? c.seller : c.buyer;
    const matchesSearch =
      inter?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.listing?.title?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === 'unread') return (c.unread_count || 0) > 0;
    if (filter === 'sales') return c.seller_id === currentUser.id;
    return true;
  });

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConversation) return;

    sendMessage(activeConversation.id, inputText);
    setInputText('');
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-[calc(100vh-80px)] bg-surface overflow-hidden border-t border-outline-variant/30">
      {/* Left Sidebar: Conversations list */}
      <aside className={`w-full md:w-80 lg:w-96 h-full bg-surface-container flex flex-col shrink-0 border-r border-outline-variant/30 ${
        activeConversationId && 'hidden md:flex'
      }`}>
        {/* Sidebar Header & Search */}
        <div className="p-4 bg-surface-container-low border-b border-outline-variant/30 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h1 className="font-headline text-xl font-bold text-on-surface">Messagerie</h1>
            <span className="text-xs font-semibold text-primary bg-primary-fixed/30 px-2 py-0.5 rounded-full">
              {conversations.length} discussions
            </span>
          </div>

          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une discussion..."
              className="w-full bg-surface-container-high text-on-surface font-body text-sm py-2 pl-9 pr-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 border border-outline-variant/30 transition-all"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full font-label text-xs font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-full font-label text-xs font-semibold transition-colors ${
                filter === 'unread'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              Non lus (0)
            </button>
            <button
              onClick={() => setFilter('sales')}
              className={`px-3 py-1 rounded-full font-label text-xs font-semibold transition-colors ${
                filter === 'sales'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              Mes Ventes
            </button>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center h-48 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-2 text-outline-variant">chat_bubble_outline</span>
              <p className="text-xs font-medium">Aucune discussion en cours.</p>
              <p className="text-[11px] text-on-surface-variant/70 mt-1">Contactez un vendeur pour démarrer une conversation.</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = activeConversation?.id === conv.id;
              const other = conv.buyer_id === currentUser.id ? conv.seller : conv.buyer;

              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all relative flex gap-3 ${
                    isSelected
                      ? 'bg-surface shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-primary/20'
                      : 'bg-surface-container hover:bg-surface-container-high'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute left-0 top-2 bottom-2 w-1.5 bg-primary rounded-r-full"></div>
                  )}

                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <img
                      src={other?.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(other?.full_name || 'U')}`}
                      alt={other?.full_name || 'Contact'}
                      className="w-12 h-12 rounded-full object-cover shadow-sm ring-1 ring-surface bg-surface"
                    />
                    {conv.is_online && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#4ADE80] rounded-full ring-2 ring-surface"></div>
                    )}
                    {conv.unread_count && conv.unread_count > 0 ? (
                      <div className="absolute -top-1 -right-1 bg-secondary-container text-on-secondary-container w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">
                        {conv.unread_count}
                      </div>
                    ) : null}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="font-label text-sm font-bold text-on-surface truncate">
                        {other?.full_name || 'Utilisateur'}
                      </h3>
                      <span className="font-label text-[11px] text-primary shrink-0 ml-1">
                        {conv.last_message_time || ''}
                      </span>
                    </div>

                    {conv.listing && (
                      <p className="font-label text-xs text-secondary truncate font-medium mb-0.5">
                        {conv.listing.title}
                      </p>
                    )}

                    <p className="font-body text-xs text-on-surface-variant truncate">
                      {conv.last_message || 'Pas de message'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Right Pane: Active Chat Window or Empty State */}
      {activeConversation ? (
        <section className={`flex-1 h-full flex flex-col bg-surface ${
          !activeConversationId && 'hidden md:flex'
        }`}>
          {/* Chat Header */}
          <div className="h-16 px-4 bg-surface border-b border-outline-variant/30 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveConversationId(null)}
                className="md:hidden p-1 text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[24px]">arrow_back</span>
              </button>

              <div className="relative">
                <img
                  src={interlocutor?.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(interlocutor?.full_name || 'U')}`}
                  alt={interlocutor?.full_name || 'Contact'}
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-surface bg-surface"
                />
                {activeConversation.is_online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#4ADE80] rounded-full ring-2 ring-surface"></div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="font-headline text-base font-bold text-on-surface">
                    {interlocutor?.full_name || 'Utilisateur'}
                  </h2>
                  {interlocutor?.is_verified && (
                    <span className="material-symbols-outlined text-[15px] text-primary" title="Vérifié">
                      verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                  <span>{activeConversation.is_online ? 'En ligne' : 'Vu récemment'}</span>
                  <span>•</span>
                  <span>{interlocutor?.commune || 'Abidjan'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {interlocutor?.phone && (
                <a
                  href={`tel:${interlocutor.phone.replace(/\s+/g, '')}`}
                  className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-full transition-colors"
                  title="Appeler"
                >
                  <span className="material-symbols-outlined text-[20px]">call</span>
                </a>
              )}
              {linkedListing && (
                <Link
                  href={`/annonces/${linkedListing.id}`}
                  className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-full transition-colors"
                  title="Voir l'annonce"
                >
                  <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                </Link>
              )}
            </div>
          </div>

          {/* Linked Product Banner */}
          {linkedListing && (
            <div className="px-4 py-2.5 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={linkedListing.images[0] || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=100&auto=format&fit=crop&q=80'}
                  alt={linkedListing.title}
                  className="w-12 h-12 rounded-lg object-cover border border-outline-variant/40 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-label text-xs font-bold text-on-surface truncate">
                    {linkedListing.title}
                  </h4>
                  <span className="font-headline text-sm font-bold text-primary">
                    {formatPriceFCFA(linkedListing.price)}
                  </span>
                </div>
              </div>
              <Link
                href={`/annonces/${linkedListing.id}`}
                className="px-3 py-1.5 bg-surface border border-outline-variant/40 text-on-surface rounded-lg font-label text-xs font-semibold hover:border-primary transition-colors shrink-0"
              >
                Voir détails
              </Link>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeMessages.map((msg) => {
              const isMine = msg.sender_id === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] sm:max-w-md p-3.5 rounded-2xl ${
                      isMine
                        ? 'bg-primary text-on-primary rounded-br-none shadow-sm'
                        : 'bg-surface-container-high text-on-surface rounded-bl-none'
                    }`}
                  >
                    <p className="font-body text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                    <span
                      className={`text-[10px] block text-right mt-1 ${
                        isMine ? 'text-on-primary/70' : 'text-on-surface-variant'
                      }`}
                    >
                      {msg.created_at}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-surface border-t border-outline-variant/30 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Écrivez votre message..."
              className="flex-1 bg-surface-container-low px-4 py-2.5 rounded-xl text-sm border border-outline-variant/40 focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-primary text-on-primary p-2.5 rounded-xl hover:bg-primary-container disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          </form>
        </section>
      ) : (
        <section className="hidden md:flex flex-1 items-center justify-center flex-col gap-3 p-8 text-center text-on-surface-variant">
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-3xl">chat_bubble_outline</span>
          </div>
          <h3 className="font-headline text-lg font-bold text-on-surface">Vos messages</h3>
          <p className="text-xs text-on-surface-variant max-w-xs">
            Sélectionnez une discussion à gauche ou contactez un vendeur depuis une annonce pour échanger en direct.
          </p>
        </section>
      )}
    </div>
  );
};