import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { Footer } from '@/components/layout/Footer';
import { PageTransitionSpinner } from '@/components/layout/PageTransitionSpinner';
import { AuthProvider } from '@/lib/supabase/auth-context';

export const metadata: Metadata = {
  title: 'Vente2éMain - Achetez et vendez d’occasion à Abidjan | Ivorian Horizon',
  description:
    'La plateforme de confiance pour acheter et vendre des articles d’occasion en Côte d’Ivoire. Électronique, mode, maison, véhicules à Cocody, Marcory, Yopougon, Plateau.',
  keywords: [
    'vente occasion abidjan',
    'petites annonces cote d ivoire',
    'vente2emain',
    'iphone occasion abidjan',
    'meubles abidjan',
    'marketplace ivoirienne',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
      </head>
      <body className="bg-background text-on-background min-h-screen flex flex-col antialiased">
        <AuthProvider>
          <Suspense fallback={null}>
            <PageTransitionSpinner />
          </Suspense>
          <Header />
          <main className="flex-1 pt-20 pb-16 md:pb-0">{children}</main>
          <Footer />
          <MobileNav />
        </AuthProvider>
      </body>
    </html>
  );
}