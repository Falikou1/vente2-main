'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Footer: React.FC = () => {
  const pathname = usePathname();

  // Hide Footer entirely on admin routes
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="w-full bg-surface-container border-t border-outline-variant/30 pt-12 pb-24 md:pb-12 text-on-surface">
      <div className="max-w-7xl mx-auto px-container-margin grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: Brand */}
        <div className="flex flex-col gap-3 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-[20px]">storefront</span>
            </div>
            <span className="font-display text-lg font-bold text-primary">
              VENTE2<span className="text-secondary-container">é</span>MAIN
            </span>
          </div>
          <p className="font-body text-body-md text-on-surface-variant text-sm leading-relaxed">
            La plateforme simple pour vendre et acheter vos objets d'occasion du quotidien entre particuliers en Côte d'Ivoire.
          </p>
          <div className="flex items-center gap-2 mt-2 text-on-surface-variant text-xs">
            <span className="w-2 h-2 rounded-full bg-[#4ADE80]"></span>
            <span>Abidjan, Côte d'Ivoire</span>
          </div>
        </div>

        {/* Col 2: Communes */}
        <div className="flex flex-col gap-3">
          <h4 className="font-headline text-sm font-bold text-on-surface uppercase tracking-wider">
            Communes d'Abidjan
          </h4>
          <ul className="space-y-2 text-sm text-on-surface-variant">
            <li><Link href="/explorer?commune=Cocody" className="hover:text-primary transition-colors">Cocody</Link></li>
            <li><Link href="/explorer?commune=Marcory" className="hover:text-primary transition-colors">Marcory</Link></li>
            <li><Link href="/explorer?commune=Plateau" className="hover:text-primary transition-colors">Le Plateau</Link></li>
            <li><Link href="/explorer?commune=Yopougon" className="hover:text-primary transition-colors">Yopougon</Link></li>
            <li><Link href="/explorer?commune=Bingerville" className="hover:text-primary transition-colors">Bingerville</Link></li>
          </ul>
        </div>

        {/* Col 3: Catégories */}
        <div className="flex flex-col gap-3">
          <h4 className="font-headline text-sm font-bold text-on-surface uppercase tracking-wider">
            Objets du quotidien
          </h4>
          <ul className="space-y-2 text-sm text-on-surface-variant">
            <li><Link href="/explorer?cat=cat-fashion" className="hover:text-primary transition-colors">Mode & Vêtements</Link></li>
            <li><Link href="/explorer?cat=cat-shoes" className="hover:text-primary transition-colors">Chaussures & Baskets</Link></li>
            <li><Link href="/explorer?cat=cat-phones" className="hover:text-primary transition-colors">Téléphones & Accessoires</Link></li>
            <li><Link href="/explorer?cat=cat-computers" className="hover:text-primary transition-colors">Informatique & Électronique</Link></li>
            <li><Link href="/explorer?cat=cat-home" className="hover:text-primary transition-colors">Maison & Décoration</Link></li>
          </ul>
        </div>

        {/* Col 4: Vente entre particuliers */}
        <div className="flex flex-col gap-3">
          <h4 className="font-headline text-sm font-bold text-on-surface uppercase tracking-wider">
            Vente entre particuliers
          </h4>
          <ul className="space-y-2 text-sm text-on-surface-variant">
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-primary">handshake</span>
              <span>Remise en main propre facile</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-primary">chat</span>
              <span>Contact direct messagerie / WhatsApp</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
              <span>Transactions de proximité entre voisins</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-container-margin mt-10 pt-6 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
        <p>© {new Date().getFullYear()} Vente2éMain - Ivorian Horizon. Tous droits réservés.</p>
        <div className="flex items-center gap-4">
          <Link href="#" className="hover:text-primary">Conseils pour bien vendre</Link>
          <Link href="#" className="hover:text-primary">Sécurité & Conseils</Link>
          <Link href="/publier" className="hover:text-primary font-bold">Vendre un objet</Link>
        </div>
      </div>
    </footer>
  );
};