import React from 'react';
import { Listing } from '@/types';
import { ListingCard } from './ListingCard';
import Link from 'next/link';

interface ListingGridProps {
  listings: Listing[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptySubtitle?: string;
}

export const ListingGrid: React.FC<ListingGridProps> = ({
  listings,
  isLoading = false,
  emptyTitle = 'Aucune annonce pour le moment',
  emptySubtitle = 'Soyez le premier à déposer une annonce et touchez des milliers d\'acheteurs à Abidjan !',
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-gutter">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="bg-surface rounded-xl overflow-hidden shadow-sm border border-outline-variant/30 animate-pulse flex flex-col"
          >
            <div className="h-48 bg-surface-container-high w-full"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-surface-container-high rounded w-3/4"></div>
              <div className="h-6 bg-surface-container-high rounded w-1/3"></div>
              <div className="h-3 bg-surface-container-high rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto shadow-sm my-8">
        <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-primary mb-4">
          <span className="material-symbols-outlined text-[32px]">post_add</span>
        </div>
        <h3 className="font-headline text-lg font-bold text-on-surface mb-2">{emptyTitle}</h3>
        <p className="font-body text-body-md text-on-surface-variant text-sm mb-6 max-w-sm">{emptySubtitle}</p>
        <Link
          href="/publier"
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-label text-sm font-bold hover:bg-primary-container transition-all shadow-md active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Publier la première annonce</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-gutter">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
};