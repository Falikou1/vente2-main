'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMarketplaceStore } from '@/lib/data/store';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const { conversations, favorites } = useMarketplaceStore();

  const unreadMessagesCount = conversations.reduce(
    (acc, curr) => acc + (curr.unread_count || 0),
    0
  );

  // Hide MobileNav entirely on admin routes
  if (pathname.startsWith('/admin')) return null;

  const navItems = [
    {
      label: 'Accueil',
      href: '/',
      icon: 'home',
    },
    {
      label: 'Explorer',
      href: '/explorer',
      icon: 'search',
    },
    {
      label: 'Publier',
      href: '/publier',
      icon: 'add_box',
      isSpecial: true,
    },
    {
      label: 'Messages',
      href: '/messages',
      icon: 'chat_bubble',
      badge: unreadMessagesCount,
    },
    {
      label: 'Profil',
      href: '/profil',
      icon: 'person',
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface/95 backdrop-blur-xl border-t border-outline-variant/30 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <nav className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          if (item.isSpecial) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-6 group"
              >
                <div className="w-13 h-13 p-3.5 rounded-full bg-primary text-on-primary shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform flex items-center justify-center">
                  <span className="material-symbols-outlined text-[26px]">add</span>
                </div>
                <span className="font-label text-[11px] font-semibold text-primary mt-1">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-colors ${
                isActive ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <div className="relative">
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 bg-secondary-container text-on-secondary-container text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="font-label text-[10px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
