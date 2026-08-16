'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMarketplaceStore } from '@/lib/data/store';
import { ListingGrid } from '@/components/listings/ListingGrid';
import { COMMUNE_OPTIONS, CONDITION_OPTIONS } from '@/lib/utils';
import { CATEGORIES } from '@/lib/data/mock-data';
import { CustomSelect } from '@/components/ui/CustomSelect';

function ExplorerContent() {
  const searchParams = useSearchParams();
  const showFavoritesOnly = searchParams.get('favoris') === '1';

  const {
    listings,
    favorites,
    searchQuery,
    setSearchQuery,
    selectedCommune,
    setSelectedCommune,
    selectedCategory,
    setSelectedCategory,
  } = useMarketplaceStore();

  const [sortBy, setSortBy] = useState<'recent' | 'price-asc' | 'price-desc'>('recent');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [onlyNegotiable, setOnlyNegotiable] = useState(false);

  const conditionOptions = [
    { value: 'all', label: 'Tous états' },
    ...CONDITION_OPTIONS.map((c) => ({ value: c.value, label: c.label })),
  ];

  const sortOptions = [
    { value: 'recent', label: 'Plus récentes', icon: 'schedule' },
    { value: 'price-asc', label: 'Prix croissant', icon: 'arrow_upward' },
    { value: 'price-desc', label: 'Prix décroissant', icon: 'arrow_downward' },
  ];

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      // Favorites filter
      if (showFavoritesOnly && !favorites.includes(item.id)) {
        return false;
      }

      // Keyword search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesCat = item.category_name?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCat) return false;
      }

      // Commune filter
      if (selectedCommune !== 'Tout Abidjan' && item.commune !== selectedCommune) {
        return false;
      }

      // Category filter
      if (selectedCategory && item.category_id !== selectedCategory) {
        return false;
      }

      // Condition filter
      if (selectedCondition !== 'all' && item.condition !== selectedCondition) {
        return false;
      }

      // Negotiable filter
      if (onlyNegotiable && !item.is_negotiable) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [
    listings,
    favorites,
    showFavoritesOnly,
    searchQuery,
    selectedCommune,
    selectedCategory,
    selectedCondition,
    onlyNegotiable,
    sortBy,
  ]);

  return (
    <div className="max-w-7xl mx-auto px-container-margin py-stack-md flex flex-col gap-6">
      {/* Explorer Header */}
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-on-surface">
          {showFavoritesOnly ? 'Mes Favoris' : 'Objets d’occasion entre particuliers'}
        </h1>
        <p className="font-body text-sm sm:text-base text-on-surface-variant">
          {filteredListings.length} objet{filteredListings.length > 1 ? 's' : ''} disponible{filteredListings.length > 1 ? 's' : ''} près de chez vous
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-surface rounded-2xl p-4 sm:p-5 shadow-sm border border-outline-variant/30 flex flex-col gap-4">
        {/* Main Search Input & Custom Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-start">
          {/* Keyword Search */}
          <div className="lg:col-span-4 relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Que recherchez-vous ?"
              className="w-full bg-surface-container-low/90 border border-outline-variant/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[44px]"
            />
          </div>

          {/* Commune Custom Dropdown */}
          <div className="lg:col-span-3">
            <CustomSelect
              options={COMMUNE_OPTIONS}
              value={selectedCommune}
              onChange={setSelectedCommune}
              icon="location_on"
            />
          </div>

          {/* Condition Custom Dropdown (Full Labels, No ...) */}
          <div className="lg:col-span-3">
            <CustomSelect
              options={conditionOptions}
              value={selectedCondition}
              onChange={setSelectedCondition}
              icon="verified"
              menuClassName="sm:min-w-[380px]"
            />
          </div>

          {/* Sort Custom Dropdown */}
          <div className="lg:col-span-2">
            <CustomSelect
              options={sortOptions}
              value={sortBy}
              onChange={(val: string) => setSortBy(val as any)}
              icon="swap_vert"
              menuClassName="sm:min-w-[240px] right-0 left-auto"
            />
          </div>
        </div>

        {/* Category Pills & Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-outline-variant/20">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3.5 py-1.5 rounded-full font-label text-xs font-semibold transition-all ${
              selectedCategory === null
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            Toutes les catégories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`px-3.5 py-1.5 rounded-full font-label text-xs font-semibold transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}

          {/* Price Negotiable Toggle */}
          <label className="ml-auto flex items-center gap-2 text-xs font-medium text-on-surface-variant cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyNegotiable}
              onChange={(e) => setOnlyNegotiable(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
            />
            <span>Prix négociable</span>
          </label>
        </div>
      </div>

      {/* Listings Grid Results */}
      <ListingGrid
        listings={filteredListings}
        emptyTitle={showFavoritesOnly ? "Aucun favori enregistré" : "Aucun objet ne correspond à vos filtres"}
        emptySubtitle={showFavoritesOnly ? "Cliquez sur le coeur sur n'importe quel objet pour le retrouver ici facilement." : "Essayez de sélectionner 'Tout Abidjan' ou d'élargir vos termes de recherche."}
      />
    </div>
  );
}

export default function ExplorerPage() {
  return (
    <Suspense fallback={null}>
      <ExplorerContent />
    </Suspense>
  );
}