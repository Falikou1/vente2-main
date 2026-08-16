'use client';

import React from 'react';
import Link from 'next/link';
import { SearchBar } from '@/components/listings/SearchBar';
import { CategoryChips } from '@/components/listings/CategoryChips';
import { ListingGrid } from '@/components/listings/ListingGrid';
import { useMarketplaceStore } from '@/lib/data/store';

export default function HomePage() {
  const { listings } = useMarketplaceStore();
  const recentListings = listings.slice(0, 8);

  return (
    <div className="flex flex-col w-full bg-background pb-stack-lg">
      {/* Hero Section */}
      <section className="relative z-30 w-full min-h-[420px] lg:min-h-[460px] flex items-center justify-center -mt-20 bg-primary">
        {/* Background Image Container with overflow-hidden */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-60"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1600&auto=format&fit=crop&q=80')`,
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-primary/60 to-primary/30"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-container-margin pt-28 pb-16 flex flex-col items-start text-on-primary">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-display-lg font-bold max-w-2xl mb-stack-sm leading-tight drop-shadow-md flex flex-col gap-1">
            <span>Tu ne l'utilises plus ?</span>
            <span className="text-secondary-container">Vends-le.</span>
          </h1>

          <p className="font-body text-body-md sm:text-body-lg max-w-xl mb-stack-md text-on-primary/90 drop-shadow-sm leading-relaxed mt-1">
            Vêtements, chaussures, téléphones, électronique, meubles, jeux... Donnez une seconde vie à vos objets et gagnez de l'argent facilement.
          </p>

          {/* Search Bar Widget */}
          <SearchBar className="w-full mt-2" />
        </div>
      </section>

      {/* Categories Section */}
      <section className="w-full max-w-7xl mx-auto px-container-margin pt-8 pb-4 relative z-20 mb-stack-md">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2.5 h-6 bg-primary rounded-full"></span>
          <h2 className="font-headline text-lg sm:text-xl font-bold text-on-background">
            Parcourir par catégorie
          </h2>
        </div>
        <CategoryChips />
      </section>

      {/* Recent Objects Section */}
      <section className="w-full max-w-7xl mx-auto px-container-margin py-stack-md flex flex-col gap-stack-md relative z-0">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-6 bg-secondary-container rounded-full"></span>
              <h2 className="font-headline text-2xl sm:text-headline-lg font-bold text-on-background">
                Objets récemment mis en vente
              </h2>
            </div>
            <p className="font-body text-body-md text-on-surface-variant mt-1">
              Découvrez les bonnes affaires publiées par vos voisins à Abidjan.
            </p>
          </div>

          <Link
            href="/explorer"
            className="flex items-center gap-1 font-label text-label-md font-bold text-primary hover:text-primary-container transition-colors group"
          >
            <span>Voir tous les objets</span>
            <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </Link>
        </div>

        {/* Listings Grid */}
        <ListingGrid
          listings={recentListings}
          emptyTitle="Aucun objet pour le moment"
          emptySubtitle="Soyez le premier à déposer une annonce pour vendre vos objets inutilisés !"
        />
      </section>

      {/* Community Selling Banner */}
      <section className="w-full max-w-7xl mx-auto px-container-margin mt-8">
        <div className="bg-gradient-to-r from-primary-container to-surface-tint rounded-2xl p-6 sm:p-10 text-on-primary-container shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border border-primary-fixed/20">
          <div className="relative z-10 max-w-xl">
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
              Transformez vos objets inutilisés en argent
            </h3>
            <p className="font-body text-sm sm:text-base text-white/90 leading-relaxed">
              Une paire de chaussures jamais portée ? Un téléphone dans un tiroir ? Prenez quelques photos et trouvez un acheteur près de chez vous en quelques minutes.
            </p>
          </div>

          <Link
            href="/publier"
            className="relative z-10 shrink-0 px-8 py-3.5 bg-secondary-container text-on-secondary-container rounded-xl font-label text-sm font-bold hover:bg-secondary hover:text-on-secondary transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Mettre un objet en vente</span>
          </Link>

          <div className="absolute right-0 bottom-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        </div>
      </section>
    </div>
  );
}