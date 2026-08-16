'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMarketplaceStore } from '@/lib/data/store';
import { formatPriceFCFA } from '@/lib/utils';
import { CATEGORIES } from '@/lib/data/mock-data';
import { CustomSelect } from '@/components/ui/CustomSelect';

export default function AdminListingsPage() {
  const { listings, deleteListing, clearAllListings } = useMarketplaceStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'sold'>('all');

  const categoryOptions = [
    { value: 'all', label: 'Toutes les catégories', icon: 'category' },
    ...CATEGORIES.map((cat) => ({
      value: cat.id,
      label: cat.name,
      icon: cat.icon,
    })),
  ];

  const filteredListings = listings.filter((item) => {
    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.commune.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.seller?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || item.category_id === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesCat && matchesStatus;
  });

  const activeCount = listings.filter((l) => l.status === 'active').length;
  const soldCount = listings.filter((l) => l.status === 'sold').length;

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Annonces & Objets</h1>
          <p className="text-sm text-gray-500 mt-1">
            Modérez et gérez toutes les annonces publiées sur la plateforme.
          </p>
        </div>

        {listings.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Voulez-vous réinitialiser et supprimer toutes les annonces ?')) {
                clearAllListings();
              }
            }}
            className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer w-fit shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
            <span>Tout réinitialiser</span>
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: listings.length, color: 'text-gray-700 bg-gray-50' },
          { label: 'En ligne', value: activeCount, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Vendues', value: soldCount, color: 'text-amber-600 bg-amber-50' },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl p-4 text-center ${s.color}`}>
            <p className="font-display text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-semibold mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters Card with Custom Dropdown */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 relative">
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par titre, commune ou vendeur..."
              className="w-full bg-gray-50 hover:bg-white focus:bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 min-h-[44px] transition-all"
            />
          </div>

          {/* Custom Category Dropdown */}
          <div className="w-full md:w-72 shrink-0">
            <CustomSelect
              options={categoryOptions}
              value={categoryFilter}
              onChange={setCategoryFilter}
              icon="category"
              menuClassName="sm:min-w-[300px] right-0 left-auto"
            />
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-1.5 shrink-0">
            {(['all', 'active', 'sold'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
                  statusFilter === status
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'Toutes' : status === 'active' ? 'En ligne' : 'Vendues'}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Table */}
        {filteredListings.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-gray-300 text-5xl mb-2">inventory_2</span>
            <p className="text-sm text-gray-500 font-medium">Aucune annonce trouvée</p>
            <p className="text-xs text-gray-400 mt-1">
              {listings.length === 0
                ? 'La base d\'annonces est vide.'
                : 'Essayez de modifier vos filtres de recherche.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredListings.map((item) => (
              <div key={item.id} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <img
                    src={item.images[0] || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=200'}
                    alt={item.title}
                    className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{item.title}</p>
                    <p className="text-xs text-gray-400">
                      {formatPriceFCFA(item.price)} • {item.commune} • {item.category_name || 'Divers'}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Vendeur : <strong>{item.seller?.full_name || 'Membre'}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    item.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : item.status === 'sold'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-500'
                  }`}>
                    {item.status === 'active' ? 'En ligne' : item.status === 'sold' ? 'Vendu' : item.status}
                  </span>

                  <Link
                    href={`/annonces/${item.id}`}
                    target="_blank"
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    <span>Voir</span>
                  </Link>

                  <button
                    onClick={() => {
                      if (confirm(`Supprimer l'annonce "${item.title}" ?`)) {
                        deleteListing(item.id);
                      }
                    }}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
