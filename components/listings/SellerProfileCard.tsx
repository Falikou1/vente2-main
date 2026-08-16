'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Listing } from '@/types';
import { useMarketplaceStore } from '@/lib/data/store';

interface SellerProfileCardProps {
  listing: Listing;
}

export const SellerProfileCard: React.FC<SellerProfileCardProps> = ({ listing }) => {
  const router = useRouter();
  const { startConversation } = useMarketplaceStore();
  const [showPhone, setShowPhone] = useState(false);
  const seller = listing.seller;
  const sellerName = seller?.full_name || 'Vendeur';
  const avatarUrl = seller?.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(sellerName)}`;

  const handleContactClick = () => {
    const defaultMsg = `Bonjour ${sellerName}, votre annonce "${listing.title}" est-elle toujours disponible ?`;
    startConversation(listing.id, defaultMsg);
    router.push('/messages');
  };

  const handleWhatsAppClick = () => {
    const phone = seller?.phone?.replace(/\s+/g, '') || '';
    if (!phone) return;
    const text = encodeURIComponent(`Bonjour ${sellerName}, je vous contacte depuis Vente2éMain concernant votre annonce : ${listing.title}`);
    window.open(`https://wa.me/${phone.replace('+', '')}?text=${text}`, '_blank');
  };

  const hasReviews = seller?.reviews_count && seller.reviews_count > 0;

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 p-6 flex flex-col gap-5">
      {/* Seller Header */}
      <div className="flex items-center gap-3.5">
        <div className="relative">
          <img
            src={avatarUrl}
            alt={sellerName}
            className="w-16 h-16 rounded-full object-cover shadow-sm ring-2 ring-surface bg-surface"
          />
          {seller?.is_verified && (
            <div className="absolute bottom-0 right-0 bg-primary text-on-primary w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[13px]">verified</span>
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-headline text-lg font-bold text-on-surface truncate">
              {sellerName}
            </h3>
          </div>
          <span className="font-label text-xs text-on-surface-variant">
            {seller?.member_since || 'Membre Vente2éMain'}
          </span>
          <div className="flex items-center gap-1 mt-1 text-secondary-container">
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              star
            </span>
            <span className="font-label text-sm font-bold text-on-surface">
              {hasReviews ? seller?.rating?.toFixed(1) : 'Nouveau'}
            </span>
            <span className="font-label text-xs text-on-surface-variant">
              ({hasReviews ? `${seller?.reviews_count} avis` : '0 avis'})
            </span>
          </div>
        </div>
      </div>

      {/* Seller Stats */}
      <div className="grid grid-cols-2 gap-2 py-3 px-3 bg-surface-container-low rounded-lg text-center">
        <div className="flex flex-col">
          <span className="font-headline text-sm font-bold text-primary">
            {seller?.active_listings_count || 0}
          </span>
          <span className="font-label text-[11px] text-on-surface-variant">Annonces actives</span>
        </div>
        <div className="flex flex-col border-l border-outline-variant/30">
          <span className="font-headline text-sm font-bold text-primary">
            {seller?.sold_listings_count || 0}
          </span>
          <span className="font-label text-[11px] text-on-surface-variant">Articles vendus</span>
        </div>
      </div>

      {/* Response rate pill */}
      <div className="flex items-center gap-2 text-xs text-on-surface-variant bg-surface-container-high/40 p-2.5 rounded-lg">
        <span className="material-symbols-outlined text-[16px] text-primary">schedule</span>
        <span>{seller?.response_rate || 'Répond généralement rapidement'}</span>
      </div>

      {/* CTA Action Buttons */}
      <div className="flex flex-col gap-2.5">
        {/* Contact seller button */}
        <button
          onClick={handleContactClick}
          className="w-full bg-primary text-on-primary py-3.5 rounded-lg font-label text-label-md font-bold hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center justify-center gap-2 shadow-sm active:scale-98"
        >
          <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
          <span>Contacter le vendeur</span>
        </button>

        {/* WhatsApp & Call */}
        {seller?.whatsapp_enabled && seller?.phone && (
          <button
            onClick={handleWhatsAppClick}
            className="w-full bg-[#25D366]/15 text-[#128C7E] hover:bg-[#25D366]/25 py-3 rounded-lg font-label text-sm font-bold transition-all flex items-center justify-center gap-2 border border-[#25D366]/30"
          >
            <span className="material-symbols-outlined text-[20px]">chat</span>
            <span>Discuter sur WhatsApp</span>
          </button>
        )}

        {/* Show phone button */}
        {seller?.phone && (
          <button
            onClick={() => setShowPhone(!showPhone)}
            className="w-full bg-surface-container-low hover:bg-surface-container-high text-on-surface py-3 rounded-lg font-label text-sm font-semibold transition-colors flex items-center justify-center gap-2 border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-[18px]">call</span>
            <span>{showPhone ? seller.phone : 'Afficher le numéro'}</span>
          </button>
        )}
      </div>
    </div>
  );
};