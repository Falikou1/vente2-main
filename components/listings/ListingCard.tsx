'use client';

import React from 'react';
import Link from 'next/link';
import { Listing } from '@/types';
import { formatPriceFCFA, formatRelativeDate, getConditionBadge } from '@/lib/utils';
import { useMarketplaceStore } from '@/lib/data/store';

interface ListingCardProps {
  listing: Listing;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const { isFavorite, toggleFavorite } = useMarketplaceStore();
  const favorite = isFavorite(listing.id);
  const condition = getConditionBadge(listing.condition);
  const seller = listing.seller;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(listing.id);
  };

  const sellerName = seller?.full_name || 'Membre';
  const sellerInitials = sellerName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'M';

  const hasReviews = seller?.reviews_count && seller.reviews_count > 0 && seller.rating && seller.rating > 0;

  return (
    <div className="bg-surface rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 flex flex-col group relative border border-outline-variant/30">
      {/* Heart Favorite Button */}
      <button
        onClick={handleFavoriteClick}
        aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        className={`absolute top-3 right-3 p-2 bg-surface/90 backdrop-blur-md rounded-full shadow-sm z-10 transition-all ${
          favorite
            ? 'text-error scale-110'
            : 'text-on-surface-variant hover:text-error hover:scale-105'
        }`}
      >
        <span
          className="material-symbols-outlined text-[20px]"
          style={favorite ? { fontVariationSettings: "'FILL' 1" } : {}}
        >
          favorite
        </span>
      </button>

      {/* Clickable Card Link */}
      <Link href={`/annonces/${listing.id}`} className="flex flex-col flex-1">
        {/* Product Image Cover */}
        <div className="relative h-48 w-full overflow-hidden bg-surface-container-low">
          <img
            src={listing.images[0] || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80'}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Condition Tag */}
          <div className={`absolute bottom-2 left-2 px-2.5 py-1 rounded font-label text-label-sm font-semibold ${condition.bgClass}`}>
            {condition.label}
          </div>

          {/* Boosted / Verified Seller indicator */}
          {listing.is_boosted && (
            <div className="absolute top-2 left-2 bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-[11px] font-bold shadow-sm">
              En vedette
            </div>
          )}

          {listing.status === 'sold' && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-error text-on-error px-4 py-1.5 rounded-full font-headline font-bold text-sm uppercase tracking-wider">
                Vendu
              </span>
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="p-4 flex flex-col gap-2.5 flex-1 justify-between">
          <div>
            <div className="flex justify-between items-start gap-2">
              <h3 className="font-headline text-[16px] sm:text-[17px] font-semibold text-on-surface line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                {listing.title}
              </h3>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="font-headline text-[19px] font-bold text-primary whitespace-nowrap">
                {formatPriceFCFA(listing.price)}
              </span>
              {listing.is_negotiable && (
                <span className="text-[11px] text-secondary font-semibold bg-secondary-fixed/50 px-1.5 py-0.5 rounded">
                  Négociable
                </span>
              )}
            </div>
          </div>

          {/* Location & Time ago */}
          <div className="flex items-center gap-1 text-on-surface-variant pt-2 border-t border-surface-variant">
            <span className="material-symbols-outlined text-outline text-[16px]">
              location_on
            </span>
            <span className="font-label text-label-sm truncate">
              {listing.commune}{listing.neighborhood ? `, ${listing.neighborhood}` : ''}
            </span>
            <span className="w-1 h-1 rounded-full bg-outline-variant mx-1 shrink-0"></span>
            <span className="font-label text-label-sm whitespace-nowrap">
              {formatRelativeDate(listing.created_at)}
            </span>
          </div>

          {/* Trust Footer: Seller Avatar & Rating */}
          <div className="flex items-center gap-2 pt-1">
            {seller?.avatar_url ? (
              <img
                src={seller.avatar_url}
                alt={sellerName}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-outline-variant/30"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[10px] font-bold">
                {sellerInitials}
              </div>
            )}
            <span className="font-label text-label-sm text-on-surface font-medium truncate max-w-[130px]">
              {sellerName}
            </span>

            {seller?.is_verified && (
              <span className="material-symbols-outlined text-[14px] text-primary" title="Profil Vérifié">
                verified
              </span>
            )}

            {hasReviews && (
              <div className="flex items-center gap-0.5 ml-auto text-secondary-container font-semibold">
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                <span className="font-label text-label-sm">{seller?.rating?.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};