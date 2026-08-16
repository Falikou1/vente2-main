'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMarketplaceStore } from '@/lib/data/store';
import { ImageGallery } from '@/components/listings/ImageGallery';
import { SellerProfileCard } from '@/components/listings/SellerProfileCard';
import { SafetyNoticeCard } from '@/components/listings/SafetyNoticeCard';
import { ListingCard } from '@/components/listings/ListingCard';
import { formatPriceFCFA, formatRelativeDate } from '@/lib/utils';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { listings, toggleFavorite, isFavorite } = useMarketplaceStore();

  const listingId = params?.id as string;
  const listing = listings.find((l) => l.id === listingId) || listings[0];

  if (!listing) {
    return (
      <div className="max-w-4xl mx-auto px-container-margin py-20 text-center">
        <h2 className="font-headline text-2xl font-bold">Annonce introuvable</h2>
        <p className="text-on-surface-variant mt-2">Cette annonce n'est plus disponible ou a été supprimée.</p>
        <Link href="/explorer" className="mt-4 inline-block bg-primary text-on-primary px-6 py-2 rounded-lg">
          Retour aux annonces
        </Link>
      </div>
    );
  }

  const favorite = isFavorite(listing.id);
  const similarListings = listings
    .filter((l) => l.id !== listing.id && (l.category_id === listing.category_id || l.commune === listing.commune))
    .slice(0, 4);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `Découvrez cette annonce sur Vente2éMain : ${listing.title} à ${formatPriceFCFA(listing.price)}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Lien de l’annonce copié dans le presse-papier !');
    }
  };

  return (
    <div className="w-full bg-background min-h-screen pb-stack-lg">
      {/* Top Breadcrumb & Back Bar */}
      <div className="bg-surface border-b border-outline-variant/30 py-3">
        <div className="max-w-7xl mx-auto px-container-margin flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="text-on-surface-variant hover:text-primary font-label text-sm font-semibold flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Retour</span>
            </button>

            <span className="text-outline-variant">•</span>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-on-surface-variant">
              <Link href="/" className="hover:text-primary">Accueil</Link>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <Link href="/explorer" className="hover:text-primary">
                {listing.category_name || 'Annonces'}
              </Link>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-on-surface font-medium truncate max-w-[200px]">{listing.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-full transition-colors"
              title="Partager l'annonce"
            >
              <span className="material-symbols-outlined text-[20px]">share</span>
            </button>
            <button
              onClick={() => toggleFavorite(listing.id)}
              className={`p-2 rounded-full transition-colors ${
                favorite ? 'text-error bg-error/10' : 'text-on-surface-variant hover:text-error hover:bg-surface-container-high'
              }`}
              title="Favoris"
            >
              <span className="material-symbols-outlined text-[20px]" style={favorite ? { fontVariationSettings: "'FILL' 1" } : {}}>
                favorite
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-container-margin py-stack-md grid grid-cols-1 lg:grid-cols-12 gap-stack-lg items-start">
        {/* Left Column (8 cols): Gallery + Details + Safety */}
        <div className="lg:col-span-8 flex flex-col gap-stack-md">
          {/* Gallery */}
          <ImageGallery listing={listing} />

          {/* Product Header & Pricing */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h1 className="font-headline text-2xl sm:text-3xl font-bold text-on-surface leading-tight">
                  {listing.title}
                </h1>
                <div className="flex items-center gap-2 mt-2 text-sm text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px] text-outline">location_on</span>
                  <span className="font-semibold text-on-surface">{listing.commune}</span>
                  {listing.neighborhood && <span>({listing.neighborhood})</span>}
                  <span>•</span>
                  <span>Publié {formatRelativeDate(listing.created_at)}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    {listing.views_count || 140} vues
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:items-end">
                <span className="font-display text-2xl sm:text-3xl font-bold text-primary whitespace-nowrap">
                  {formatPriceFCFA(listing.price)}
                </span>
                {listing.is_negotiable && (
                  <span className="text-xs font-bold text-secondary-container bg-secondary-fixed/50 px-2 py-0.5 rounded-full mt-1">
                    Prix négociable
                  </span>
                )}
              </div>
            </div>

            {/* Specifications Table (if available) */}
            {listing.specifications && listing.specifications.length > 0 && (
              <div className="pt-4 border-t border-outline-variant/20">
                <h3 className="font-headline text-base font-bold text-on-surface mb-3">
                  Spécifications de l'article
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {listing.specifications.map((spec, i) => (
                    <div key={i} className="bg-surface-container-low p-3 rounded-lg flex flex-col">
                      <span className="text-xs text-on-surface-variant">{spec.label}</span>
                      <span className="font-label text-sm font-bold text-on-surface mt-0.5">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description Body */}
            <div className="pt-4 border-t border-outline-variant/20">
              <h3 className="font-headline text-base font-bold text-on-surface mb-2">
                Description de l'annonce
              </h3>
              <div className="font-body text-base text-on-surface leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {listing.description}
              </div>
            </div>

            {/* Hand-to-hand meeting location banner */}
            <div className="bg-primary-fixed/20 p-4 rounded-xl flex items-start gap-3 border border-primary-fixed/40">
              <span className="material-symbols-outlined text-primary text-[24px] shrink-0 mt-0.5">
                handshake
              </span>
              <div>
                <h4 className="font-label text-sm font-bold text-on-primary-fixed">Lieu de remise de l'article</h4>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {listing.location_detail || `Remise en main propre recommandée à ${listing.commune} dans un lieu public sécurisé.`}
                </p>
              </div>
            </div>
          </div>

          {/* Safety Notice Component */}
          <SafetyNoticeCard />
        </div>

        {/* Right Column (4 cols): Sticky Seller Card */}
        <div className="lg:col-span-4 flex flex-col gap-stack-md lg:sticky lg:top-24">
          <SellerProfileCard listing={listing} />
        </div>
      </div>

      {/* Similar Listings Section */}
      {similarListings.length > 0 && (
        <section className="max-w-7xl mx-auto px-container-margin pt-12 border-t border-outline-variant/30">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline text-xl sm:text-2xl font-bold text-on-surface">
              Annonces similaires dans votre secteur
            </h2>
            <Link href="/explorer" className="text-primary font-bold text-sm hover:underline">
              Voir plus
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-gutter">
            {similarListings.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
