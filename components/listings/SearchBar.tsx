'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useMarketplaceStore } from '@/lib/data/store';
import { COMMUNE_OPTIONS, triggerPageTransition } from '@/lib/utils';
import { CustomSelect } from '@/components/ui/CustomSelect';

interface SearchBarProps {
  className?: string;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ className = '', autoFocus = false }) => {
  const router = useRouter();
  const { searchQuery, setSearchQuery, selectedCommune, setSelectedCommune } = useMarketplaceStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerPageTransition();
    router.push('/explorer');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full max-w-3xl bg-surface/95 rounded-2xl p-2.5 flex flex-col md:flex-row items-center shadow-xl gap-2.5 backdrop-blur-md border border-white/40 ${className}`}
    >
      {/* Keyword input */}
      <div className="w-full md:flex-1 relative flex items-center pl-3">
        <span className="material-symbols-outlined text-on-surface-variant mr-2 text-[22px] shrink-0">
          search
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Que recherchez-vous ? (Téléphone, Chaussures, Sac, Meuble...)"
          autoFocus={autoFocus}
          className="w-full bg-transparent border-none outline-none font-body text-body-md text-on-surface placeholder:text-on-surface-variant py-2 pr-2"
        />
      </div>

      {/* Divider */}
      <div className="w-full h-px md:w-px md:h-8 bg-outline-variant/40 hidden md:block"></div>

      {/* Custom Commune Dropdown */}
      <div className="w-full md:w-64 shrink-0">
        <CustomSelect
          options={COMMUNE_OPTIONS}
          value={selectedCommune}
          onChange={setSelectedCommune}
          icon="location_on"
          placeholder="Choisir une commune"
          className="bg-transparent border-0"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full md:w-auto bg-secondary-container text-on-secondary-container px-8 py-3 rounded-xl font-label text-label-md font-bold hover:bg-secondary-fixed-dim transition-all shadow-md flex items-center justify-center gap-2 shrink-0 active:scale-95 cursor-pointer"
      >
        <span>Rechercher</span>
      </button>
    </form>
  );
};