'use client';

import React from 'react';
import { CATEGORIES } from '@/lib/data/mock-data';
import { useMarketplaceStore } from '@/lib/data/store';
import { triggerPageTransition } from '@/lib/utils';
import { useRouter } from 'next/navigation';

// Vibrant, guaranteed color palette mapping for every category
const CATEGORY_COLORS: Record<string, { bg: string; text: string; bgStyle: string; textStyle: string }> = {
  'cat-fashion': { bg: 'bg-rose-100', text: 'text-rose-600', bgStyle: '#ffe4e6', textStyle: '#e11d48' },
  'cat-shoes': { bg: 'bg-amber-100', text: 'text-amber-600', bgStyle: '#fef3c7', textStyle: '#d97706' },
  'cat-phones': { bg: 'bg-blue-100', text: 'text-blue-600', bgStyle: '#dbeafe', textStyle: '#2563eb' },
  'cat-computers': { bg: 'bg-indigo-100', text: 'text-indigo-600', bgStyle: '#e0e7ff', textStyle: '#4f46e5' },
  'cat-electronics': { bg: 'bg-cyan-100', text: 'text-cyan-600', bgStyle: '#cffafe', textStyle: '#0891b2' },
  'cat-home': { bg: 'bg-emerald-100', text: 'text-emerald-600', bgStyle: '#d1fae5', textStyle: '#059669' },
  'cat-appliances': { bg: 'bg-teal-100', text: 'text-teal-600', bgStyle: '#ccfbf1', textStyle: '#0d9488' },
  'cat-books': { bg: 'bg-orange-100', text: 'text-orange-600', bgStyle: '#ffedd5', textStyle: '#ea580c' },
  'cat-games': { bg: 'bg-purple-100', text: 'text-purple-600', bgStyle: '#f3e8ff', textStyle: '#9333ea' },
  'cat-sport': { bg: 'bg-lime-100', text: 'text-lime-700', bgStyle: '#ecfccb', textStyle: '#65a30d' },
  'cat-kids': { bg: 'bg-pink-100', text: 'text-pink-600', bgStyle: '#fce7f3', textStyle: '#db2777' },
  'cat-beauty': { bg: 'bg-fuchsia-100', text: 'text-fuchsia-600', bgStyle: '#fae8ff', textStyle: '#c026d3' },
  'cat-accessories': { bg: 'bg-yellow-100', text: 'text-yellow-800', bgStyle: '#fef9c3', textStyle: '#ca8a04' },
  'cat-others': { bg: 'bg-slate-200', text: 'text-slate-700', bgStyle: '#e2e8f0', textStyle: '#334155' },
};

export const CategoryChips: React.FC = () => {
  const { selectedCategory, setSelectedCategory } = useMarketplaceStore();
  const router = useRouter();

  const handleCategoryClick = (catId: string) => {
    if (selectedCategory === catId) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(catId);
    }
    triggerPageTransition();
    router.push('/explorer');
  };

  return (
    <div className="w-full">
      {/* Category grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2.5 sm:gap-3.5">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const color = CATEGORY_COLORS[cat.id] || {
            bg: 'bg-primary/10',
            text: 'text-primary',
            bgStyle: '#e6f4ea',
            textStyle: '#1e7b49',
          };

          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`bg-surface rounded-2xl p-3 sm:p-3.5 flex flex-col items-center justify-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group border ${
                isSelected
                  ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                  : 'border-outline-variant/30 hover:border-primary/40'
              }`}
            >
              <div
                style={
                  isSelected
                    ? undefined
                    : { backgroundColor: color.bgStyle, color: color.textStyle }
                }
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-xs ${
                  isSelected
                    ? 'bg-primary text-on-primary scale-105 shadow-md'
                    : `${color.bg} ${color.text}`
                }`}
              >
                <span className="material-symbols-outlined text-[22px] sm:text-[24px]">
                  {cat.icon}
                </span>
              </div>
              <span
                className={`font-label text-[11px] sm:text-xs text-center line-clamp-1 leading-tight transition-colors ${
                  isSelected ? 'font-bold text-primary' : 'text-on-surface font-semibold group-hover:text-primary'
                }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};