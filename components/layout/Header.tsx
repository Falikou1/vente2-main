'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMarketplaceStore } from '@/lib/data/store';
import { useAuth } from '@/lib/supabase/auth-context';
import { getInitials } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { conversations, favorites, currentUser } = useMarketplaceStore();
  const { user, profile, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Hide Header entirely on admin routes
  if (pathname.startsWith('/admin')) return null;

  const unreadMessagesCount = conversations.reduce(
    (acc, curr) => acc + (curr.unread_count || 0),
    0
  );

  const navLinks = [
    { label: 'Accueil', href: '/' },
    { label: 'Explorer', href: '/explorer' },
    { label: 'Formules & Abonnements', href: '/tarifs' },
    { label: 'Mon Espace', href: '/profil' },
  ];

  const displayName = profile?.full_name || currentUser?.full_name || user?.user_metadata?.full_name || 'Membre';
  const userEmail = profile?.email || currentUser?.email || user?.email || '';
  const avatarUrl = profile?.avatar_url || currentUser?.avatar_url || '';

  const initials = getInitials(displayName);
  const isCustomAvatar = Boolean(avatarUrl && (avatarUrl.startsWith('data:image/') || (avatarUrl.startsWith('http') && !avatarUrl.includes('dicebear'))));

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-b border-surface-container-high/60 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-20 w-full max-w-7xl mx-auto px-container-margin flex items-center justify-between gap-gutter">
        {/* Brand */}
        <div className="flex items-center gap-stack-md">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[24px]">storefront</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold text-primary tracking-tight leading-none">
                VENTE2<span className="text-secondary-container">é</span>MAIN
              </span>
              <span className="font-label text-[11px] text-on-surface-variant tracking-wider font-semibold uppercase">
                Ivorian Horizon
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-stack-md">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-label text-label-md transition-all py-1 border-b-2 flex items-center gap-1 ${
                  isActive
                    ? 'text-primary font-bold border-primary'
                    : 'text-on-surface-variant hover:text-primary border-transparent'
                }`}
              >
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/messages"
              aria-label="Messagerie"
              className="relative p-2.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">chat_bubble</span>
              {unreadMessagesCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-secondary-container text-on-secondary-container text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-surface shadow-sm">
                  {unreadMessagesCount}
                </span>
              )}
            </Link>
            <Link
              href="/explorer?favoris=1"
              aria-label="Mes Favoris"
              className="relative p-2.5 text-on-surface-variant hover:text-error hover:bg-surface-container-high rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">favorite</span>
              {favorites.length > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-primary text-on-primary text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-surface shadow-sm">
                  {favorites.length}
                </span>
              )}
            </Link>
            <ThemeToggle />
          </div>

          <Link
            href="/publier"
            className="hidden sm:flex bg-primary text-on-primary px-5 py-2.5 rounded-lg font-label text-label-md font-semibold hover:bg-primary-container hover:text-on-primary-container transition-all items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Publier une annonce</span>
          </Link>

          {/* User avatar / login button */}
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                id="btn-user-menu"
                onClick={() => setShowUserMenu((v) => !v)}
                aria-label="Mon compte"
                className="ml-1 cursor-pointer border-2 border-primary/40 hover:border-primary rounded-full p-0.5 transition-all"
              >
                {isCustomAvatar ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-outline-variant/30 bg-surface"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs shadow-sm ring-1 ring-outline-variant/30 select-none">
                    {initials}
                  </div>
                )}
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-12 bg-surface rounded-2xl shadow-2xl border border-outline-variant/30 w-60 py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-2.5 border-b border-outline-variant/20 mb-1 flex items-center gap-2.5">
                    {isCustomAvatar ? (
                      <img src={avatarUrl} alt={displayName} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs shrink-0">
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-label text-sm font-bold text-on-surface truncate">{displayName}</p>
                      {userEmail && (
                        <p className="text-xs text-on-surface-variant truncate font-mono">{userEmail}</p>
                      )}
                    </div>
                  </div>
                  <Link href="/profil" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-high transition-colors">
                    <span className="material-symbols-outlined text-[18px]">person</span>Mon profil
                  </Link>
                  <Link href="/profil#annonces" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-high transition-colors">
                    <span className="material-symbols-outlined text-[18px]">sell</span>Mes annonces
                  </Link>
                  <Link href="/messages" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-high transition-colors">
                    <span className="material-symbols-outlined text-[18px]">chat_bubble</span>Messagerie
                  </Link>
                  <div className="border-t border-outline-variant/20 mt-1">
                    <button
                      onClick={async () => { setShowUserMenu(false); await signOut(); router.push('/'); }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-error hover:bg-error/5 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/connexion"
              className="px-4 py-2 text-xs font-bold text-primary hover:bg-primary/10 rounded-xl transition-all flex items-center gap-1.5 border border-primary/20"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              <span>Connexion</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};