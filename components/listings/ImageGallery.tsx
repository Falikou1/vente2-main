'use client';

import React, { useState } from 'react';
import { useMarketplaceStore } from '@/lib/data/store';
import { getConditionBadge } from '@/lib/utils';
import { Listing } from '@/types';

interface ImageGalleryProps {
  listing: Listing;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ listing }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const { isFavorite, toggleFavorite } = useMarketplaceStore();
  const favorite = isFavorite(listing.id);
  const condition = getConditionBadge(listing.condition);

  const images = listing.images && listing.images.length > 0
    ? listing.images
    : ['https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80'];

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-md overflow-hidden relative flex flex-col border border-outline-variant/30">
      {/* Main Image Display */}
      <div className="aspect-[4/3] sm:aspect-[16/10] w-full bg-surface-container-low relative overflow-hidden group">
        <img
          src={images[selectedImageIndex]}
          alt={listing.title}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isZoomed ? 'scale-150 cursor-zoom-out' : 'group-hover:scale-105 cursor-zoom-in'
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
        />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {listing.seller?.is_verified && (
            <div className="bg-primary/90 text-on-primary px-3 py-1 rounded-full font-label text-label-sm font-semibold flex items-center gap-1.5 backdrop-blur-md shadow-sm">
              <span className="material-symbols-outlined text-[15px]">verified</span>
              <span>Vendeur Vérifié</span>
            </div>
          )}
          <div className={`px-3 py-1 rounded-full font-label text-label-sm font-semibold flex items-center gap-1.5 shadow-sm ${condition.bgClass}`}>
            <span className="material-symbols-outlined text-[15px]">new_releases</span>
            <span>{condition.label}</span>
          </div>
        </div>

        {/* Action buttons (Zoom & Favorite) */}
        <div className="absolute bottom-4 right-4 flex gap-2 z-10">
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            aria-label="Agrandir la photo"
            className="bg-surface/85 backdrop-blur-md hover:bg-surface text-on-surface p-2.5 rounded-full shadow-md transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isZoomed ? 'zoom_out' : 'zoom_in'}
            </span>
          </button>
          <button
            onClick={() => toggleFavorite(listing.id)}
            aria-label="Favori"
            className={`bg-surface/85 backdrop-blur-md hover:bg-surface p-2.5 rounded-full shadow-md transition-all active:scale-95 ${
              favorite ? 'text-error' : 'text-on-surface hover:text-error'
            }`}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={favorite ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              favorite
            </span>
          </button>
        </div>
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex gap-2.5 p-4 bg-surface-container-low overflow-x-auto border-t border-outline-variant/30">
          {images.map((imgUrl, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedImageIndex(index);
                setIsZoomed(false);
              }}
              className={`h-20 w-20 rounded-lg overflow-hidden shrink-0 transition-all shadow-sm ${
                selectedImageIndex === index
                  ? 'ring-2 ring-primary ring-offset-2 opacity-100 scale-105'
                  : 'opacity-70 hover:opacity-100 hover:ring-2 hover:ring-primary/30'
              }`}
            >
              <img
                src={imgUrl}
                alt={`${listing.title} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
