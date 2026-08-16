'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export const PageTransitionSpinner: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const currentPathRef = useRef(pathname + (searchParams?.toString() || ''));

  // When pathname or searchParams change, we have arrived at the new page -> hide spinner immediately
  useEffect(() => {
    const newPath = pathname + (searchParams?.toString() || '');
    if (newPath !== currentPathRef.current) {
      currentPathRef.current = newPath;
      setIsNavigating(false);
    }
  }, [pathname, searchParams]);

  // Listen to custom navigation events and link clicks
  useEffect(() => {
    const handleStart = () => {
      setIsNavigating(true);
    };

    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Ignore external links, anchor links, same-page links, tel:, mailto:, or target="_blank"
      if (
        (href.startsWith('http') && !href.startsWith(window.location.origin)) ||
        href.startsWith('#') ||
        href.startsWith('tel:') ||
        href.startsWith('mailto:') ||
        href.startsWith('javascript:') ||
        target.getAttribute('target') === '_blank' ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // Check if target URL is identical to current URL
      const currentUrl = window.location.pathname + window.location.search;
      if (href === currentUrl || href === window.location.pathname) return;

      // Activate spinner once
      setIsNavigating(true);
    };

    window.addEventListener('app:start-transition', handleStart);
    document.addEventListener('click', handleClick, { capture: true });

    return () => {
      window.removeEventListener('app:start-transition', handleStart);
      document.removeEventListener('click', handleClick, { capture: true });
    };
  }, []);

  // Safety timeout in case navigation finishes fast
  useEffect(() => {
    if (isNavigating) {
      const timer = setTimeout(() => {
        setIsNavigating(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isNavigating]);

  if (!isNavigating) return null;

  return (
    <div
      id="page-loading-spinner"
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/20 backdrop-blur-[2px] transition-opacity duration-200 animate-fadeIn"
    >
      <div className="bg-surface/95 border border-outline-variant/40 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-3.5 scale-100 animate-scaleIn">
        {/* Animated Double Ring Spinner with Logo */}
        <div className="relative w-14 h-14 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-secondary-container animate-spin"></div>
          <span className="material-symbols-outlined text-[24px] text-primary">
            storefront
          </span>
        </div>

        {/* Text */}
        <div className="flex flex-col items-center">
          <span className="font-label text-sm font-bold text-on-surface">
            Chargement...
          </span>
          <span className="text-[11px] text-primary font-bold">
            Vente2<span className="text-secondary-container">é</span>Main
          </span>
        </div>
      </div>
    </div>
  );
};