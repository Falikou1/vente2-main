'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useMarketplaceStore } from '@/lib/data/store';
import { useAuth } from '@/lib/supabase/auth-context';
import { formatPriceFCFA, formatRelativeDate, COMMUNE_OPTIONS, getInitials, compressImage } from '@/lib/utils';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { useTheme } from '@/components/theme/ThemeProvider';
import type { Listing } from '@/types';

const CONDITION_LABELS: Record<string, string> = {
  'new': 'Neuf (jamais utilisé)',
  'like-new': 'Comme neuf',
  'very-good': 'Très bon état',
  'good': 'Bon état',
  'fair': 'État correct',
};

export default function ProfilPage() {
  const { user, profile, updateUserProfile } = useAuth();
  const {
    currentUser,
    updateProfile,
    listings,
    deleteListing,
    markAsSold,
    updateListing,
  } = useMarketplaceStore();
  const { theme, setTheme } = useTheme();

  // Edit listing modal state
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCommune, setEditCommune] = useState('');
  const [editCondition, setEditCondition] = useState('');
  const [editNegotiable, setEditNegotiable] = useState(false);
  const [isSavingListing, setIsSavingListing] = useState(false);
  const [listingSaveSuccess, setListingSaveSuccess] = useState(false);

  // Delete confirmation modal state
  const [deletingListing, setDeletingListing] = useState<Listing | null>(null);

  const openEditListing = (item: Listing) => {
    setEditingListing(item);
    setEditTitle(item.title);
    setEditPrice(String(item.price));
    setEditDescription(item.description || '');
    setEditCommune(item.commune || '');
    setEditCondition(item.condition || 'good');
    setEditNegotiable(item.is_negotiable || false);
    setListingSaveSuccess(false);
  };

  const closeEditListing = () => {
    setEditingListing(null);
    setListingSaveSuccess(false);
  };

  const handleSaveEditListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListing) return;
    setIsSavingListing(true);
    updateListing(editingListing.id, {
      title: editTitle.trim(),
      price: parseFloat(editPrice) || editingListing.price,
      description: editDescription.trim(),
      commune: editCommune,
      condition: editCondition as Listing['condition'],
      is_negotiable: editNegotiable,
    });
    setIsSavingListing(false);
    setListingSaveSuccess(true);
    setTimeout(() => {
      closeEditListing();
    }, 1200);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'listings' | 'settings'>('listings');
  const [listingFilter, setListingFilter] = useState<'all' | 'active' | 'sold'>('all');

  const displayName = profile?.full_name || currentUser.full_name || user?.user_metadata?.full_name || 'Membre';
  const email = profile?.email || currentUser.email || user?.email || '';
  const phone = profile?.phone || currentUser.phone || '';
  const commune = profile?.commune || currentUser.commune || 'Abidjan (Plateau)';
  const avatarUrl = profile?.avatar_url || currentUser.avatar_url || '';

  // Edit profile form state
  const [formFullName, setFormFullName] = useState(displayName);
  const [formPhone, setFormPhone] = useState(phone);
  const [formCommune, setFormCommune] = useState(commune);
  const [formAvatarUrl, setFormAvatarUrl] = useState(avatarUrl);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormFullName(displayName);
    setFormPhone(phone);
    setFormCommune(commune);
    setFormAvatarUrl(avatarUrl);
  }, [displayName, phone, commune, avatarUrl]);

  // Real-time listings for this user
  const currentUserId = user?.id || currentUser.id;
  const myListings = listings.filter((l) => l.seller_id === currentUserId || l.seller?.id === currentUserId || !l.seller_id);

  const activeCount = myListings.filter((l) => l.status === 'active').length;
  const soldCount = myListings.filter((l) => l.status === 'sold').length;

  const filteredMyListings = myListings.filter((l) => {
    if (listingFilter === 'active') return l.status === 'active';
    if (listingFilter === 'sold') return l.status === 'sold';
    return true;
  });

  const initials = getInitials(displayName);
  const formInitials = getInitials(formFullName);
  const isCustomAvatar = Boolean(avatarUrl && (avatarUrl.startsWith('data:image/') || (avatarUrl.startsWith('http') && !avatarUrl.includes('dicebear'))));
  const isFormCustomAvatar = Boolean(formAvatarUrl && (formAvatarUrl.startsWith('data:image/') || (formAvatarUrl.startsWith('http') && !formAvatarUrl.includes('dicebear'))));

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).');
      return;
    }

    try {
      const compressedDataUrl = await compressImage(file, 160, 160, 0.75);
      setFormAvatarUrl(compressedDataUrl);
    } catch {
      alert("Erreur lors de la lecture de l'image.");
    }
  };

  const handleRemovePhoto = () => {
    setFormAvatarUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updatedData = {
      full_name: formFullName.trim() || displayName,
      phone: formPhone.trim() || phone,
      commune: formCommune || commune,
      avatar_url: formAvatarUrl,
    };

    // 1. Instant update in Zustand store (persists in localStorage)
    updateProfile(updatedData);

    // 2. Instant update in AuthContext + Supabase sync
    await updateUserProfile(updatedData);

    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  return (
    <div className="max-w-7xl mx-auto px-container-margin py-stack-md flex flex-col gap-stack-md pb-24">
      {/* Profile Header Banner */}
      <div className="bg-surface rounded-3xl p-6 sm:p-8 shadow-sm border border-outline-variant/30 relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 text-on-surface">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with Live Preview or Initials */}
          <div className="relative shrink-0 group">
            {isCustomAvatar ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover shadow-md ring-4 ring-primary/20 bg-surface transition-all"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-primary text-on-primary flex items-center justify-center font-display font-extrabold text-3xl sm:text-4xl shadow-md ring-4 ring-primary/20 select-none">
                {initials}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setActiveTab('settings');
                setTimeout(() => fileInputRef.current?.click(), 100);
              }}
              className="absolute -bottom-1 -right-1 bg-primary text-on-primary w-8 h-8 rounded-xl flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer"
              title="Changer la photo de profil"
            >
              <span className="material-symbols-outlined text-[18px]">photo_camera</span>
            </button>
          </div>

          {/* User Details */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-1">
            <div className="flex items-center gap-2">
              <h1 className="font-headline text-2xl sm:text-headline-lg font-bold text-on-surface">
                {displayName}
              </h1>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Compte actif"></span>
            </div>

            {email && (
              <p className="font-body text-xs text-on-surface-variant font-mono">
                {email}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-xs text-on-surface-variant">
              {commune && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                  <span className="font-semibold text-on-surface">{commune}</span>
                </span>
              )}
              {phone && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-primary">phone</span>
                  <span className="font-semibold text-on-surface">{phone}</span>
                </span>
              )}
              <span className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                <span className="material-symbols-outlined text-[14px]">sell</span>
                <span>{activeCount} en vente • {soldCount} vendus</span>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="shrink-0 flex sm:flex-col items-center gap-2">
          <Link
            href="/publier"
            className="px-5 py-3 bg-primary hover:bg-primary-container text-on-primary rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-2 active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Déposer une annonce</span>
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('listings')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-label text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'listings'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'bg-surface hover:bg-surface-container text-on-surface-variant hover:text-on-surface border border-outline-variant/30'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">inventory_2</span>
          <span>Mes annonces ({myListings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-label text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'bg-surface hover:bg-surface-container text-on-surface-variant hover:text-on-surface border border-outline-variant/30'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
          <span>Modifier mon profil</span>
        </button>
      </div>

      {/* TAB 1: LISTINGS */}
      {activeTab === 'listings' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(['all', 'active', 'sold'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setListingFilter(filter)}
                  className={`px-4 py-1.5 rounded-xl font-label text-xs font-bold transition-all capitalize cursor-pointer ${
                    listingFilter === filter
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {filter === 'all' ? `Toutes (${myListings.length})` : filter === 'active' ? `En ligne (${activeCount})` : `Vendues (${soldCount})`}
                </button>
              ))}
            </div>

            <Link
              href="/publier"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>Nouvelle annonce</span>
            </Link>
          </div>

          {filteredMyListings.length === 0 ? (
            <div className="bg-surface rounded-3xl p-12 text-center border border-dashed border-outline-variant/40 flex flex-col items-center justify-center gap-3">
              <span className="material-symbols-outlined text-5xl text-outline">inventory_2</span>
              <p className="font-headline text-base font-bold text-on-surface">Aucune annonce trouvée</p>
              <p className="font-body text-xs text-on-surface-variant">Vous n'avez pas encore publié d'objet dans cette section.</p>
              <Link
                href="/publier"
                className="mt-2 px-6 py-2.5 bg-primary text-on-primary rounded-xl font-label text-xs font-bold hover:bg-primary-container transition-all"
              >
                Mettre un objet en vente
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMyListings.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface rounded-3xl overflow-hidden shadow-sm border border-outline-variant/30 flex flex-col justify-between group hover:shadow-md transition-all"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-container">
                    <img
                      src={item.images[0] || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-surface/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-on-surface shadow-sm">
                      {item.commune}
                    </div>

                    <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md shadow-sm ${
                      item.status === 'active'
                        ? 'bg-emerald-500/90 text-white'
                        : 'bg-amber-500/90 text-white'
                    }`}>
                      {item.status === 'active' ? 'En ligne' : 'Vendu'}
                    </span>
                  </div>

                  <div className="p-5 flex flex-col gap-3">
                    <div>
                      <h3 className="font-headline text-base font-bold text-on-surface line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="font-display text-lg font-bold text-primary mt-1">
                        {formatPriceFCFA(item.price)}
                      </p>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">
                        Mis en vente {formatRelativeDate(item.created_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/20">
                      <Link
                        href={`/annonces/${item.id}`}
                        className="flex-1 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface text-center rounded-xl text-xs font-bold transition-colors"
                      >
                        Voir
                      </Link>
                      {/* Edit button */}
                      <button
                        onClick={() => openEditListing(item)}
                        className="p-2 hover:bg-primary/10 text-on-surface-variant hover:text-primary rounded-xl transition-colors cursor-pointer"
                        title="Modifier l'annonce"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      {item.status === 'active' && (
                        <button
                          onClick={() => markAsSold(item.id)}
                          className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors flex items-center justify-center cursor-pointer"
                          title="Marquer comme vendu"
                        >
                          <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        </button>
                      )}
                      <button
                        onClick={() => setDeletingListing(item)}
                        className="p-2 hover:bg-error/10 text-on-surface-variant hover:text-error rounded-xl transition-colors cursor-pointer"
                        title="Supprimer l'annonce"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SETTINGS FORM (INSTANTLY SYNCED) */}
      {activeTab === 'settings' && (
        <div className="bg-surface rounded-3xl p-6 sm:p-8 shadow-sm border border-outline-variant/30 max-w-2xl animate-fadeIn">
          <div className="flex items-center justify-between gap-4 mb-1">
            <h2 className="font-headline text-xl font-bold text-on-surface">Modifier les informations de profil</h2>
          </div>
          <p className="font-body text-xs text-on-surface-variant mb-6">
            Mettez à jour vos coordonnées ou votre photo de profil.
          </p>

          {saveSuccess && (
            <div className="p-4 mb-6 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold text-center border border-emerald-200 flex items-center justify-center gap-2 animate-fadeIn shadow-sm">
              <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
              <span>Modifications synchronisées avec votre compte avec succès !</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
            {/* Real Photo Upload / Initials Default */}
            <div className="flex flex-col gap-2">
              <label className="font-label text-xs font-bold uppercase text-on-surface">
                Photo de profil
              </label>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />

              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30">
                {/* Photo or Initials Preview */}
                <div className="relative shrink-0">
                  {isFormCustomAvatar ? (
                    <img
                      src={formAvatarUrl}
                      alt="Aperçu"
                      className="w-18 h-18 rounded-2xl object-cover ring-2 ring-primary shadow-sm bg-white"
                    />
                  ) : (
                    <div className="w-18 h-18 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-display font-extrabold text-2xl shadow-sm ring-2 ring-primary select-none">
                      {formInitials}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 flex-1 text-center sm:text-left">
                  <div>
                    <p className="text-sm font-bold text-on-surface">
                      {isFormCustomAvatar ? 'Photo personnalisée active' : `Initiales par défaut (${formInitials})`}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {isFormCustomAvatar
                        ? 'Votre photo s’affichera sur votre profil et vos annonces.'
                        : 'Par défaut, la 1ère lettre de votre nom et de votre prénom s’affiche.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary-container transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">upload</span>
                      <span>{isFormCustomAvatar ? 'Changer de photo' : 'Importer une photo'}</span>
                    </button>

                    {isFormCustomAvatar && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="px-3 py-2 bg-surface hover:bg-error/10 text-error border border-outline-variant/40 hover:border-error/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        <span>Utiliser les initiales</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label text-xs font-bold uppercase text-on-surface">
                Nom et Prénom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formFullName}
                onChange={(e) => setFormFullName(e.target.value)}
                placeholder="Ex: Fofana Falikou"
                required
                className="bg-surface-container-low px-4 py-3 rounded-xl text-sm border border-outline-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-semibold"
              />
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label text-xs font-bold uppercase text-on-surface">
                Numéro de téléphone
              </label>
              <input
                type="tel"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="+225 07 00 00 00 00"
                className="bg-surface-container-low px-4 py-3 rounded-xl text-sm border border-outline-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-semibold"
              />
            </div>

            {/* Commune Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label text-xs font-bold uppercase text-on-surface">
                Commune principale
              </label>
              <CustomSelect
                options={COMMUNE_OPTIONS.filter((c) => c !== 'Tout Abidjan')}
                value={formCommune}
                onChange={(val) => setFormCommune(val)}
                icon="location_on"
                placeholder="Sélectionner votre commune"
              />
            </div>

            {/* Theme Preference Option */}
            <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/20">
              <label className="font-label text-xs font-bold uppercase text-on-surface">
                Thème d'affichage
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2.5 text-xs font-bold transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20 shadow-xs'
                      : 'border-outline-variant/30 text-on-surface-variant hover:border-primary/40'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] text-amber-500">light_mode</span>
                  <span>Mode Clair (Éclairé)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2.5 text-xs font-bold transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20 shadow-xs'
                      : 'border-outline-variant/30 text-on-surface-variant hover:border-primary/40'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] text-primary">dark_mode</span>
                  <span>Mode Sombre</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSaving}
              className="mt-2 bg-primary text-on-primary py-3.5 rounded-xl font-label text-xs font-bold hover:bg-primary-container transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  <span>Synchronisation avec votre compte...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span>Enregistrer et synchroniser immédiatement</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ===== EDIT LISTING MODAL ===== */}
      {editingListing && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn"
          onClick={(e) => { if (e.target === e.currentTarget) closeEditListing(); }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeEditListing} />

          {/* Modal Panel */}
          <div className="relative bg-surface rounded-t-3xl sm:rounded-3xl shadow-2xl border border-outline-variant/20 w-full sm:max-w-xl max-h-[90vh] overflow-y-auto animate-fadeIn">
            {/* Header */}
            <div className="sticky top-0 bg-surface/95 backdrop-blur-md border-b border-outline-variant/20 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </div>
                <div>
                  <h2 className="font-headline text-base font-bold text-on-surface leading-tight">Modifier l'annonce</h2>
                  <p className="text-[11px] text-on-surface-variant">{editingListing.title}</p>
                </div>
              </div>
              <button
                onClick={closeEditListing}
                className="p-2 hover:bg-surface-container rounded-xl transition-colors cursor-pointer text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveEditListing} className="p-6 flex flex-col gap-5">

              {listingSaveSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold text-center border border-emerald-200 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
                  <span>Annonce mise à jour avec succès !</span>
                </div>
              )}

              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label text-xs font-bold uppercase text-on-surface tracking-wider">
                  Titre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="bg-surface-container-low px-4 py-3 rounded-xl text-sm border border-outline-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-semibold"
                />
              </div>

              {/* Price + Negotiable */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label text-xs font-bold uppercase text-on-surface tracking-wider">
                    Prix (FCFA) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    required
                    className="bg-surface-container-low px-4 py-3 rounded-xl text-sm border border-outline-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1.5 justify-end">
                  <label className="font-label text-xs font-bold uppercase text-on-surface tracking-wider invisible">
                    Neg
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer px-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant/40 hover:border-primary/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={editNegotiable}
                      onChange={(e) => setEditNegotiable(e.target.checked)}
                      className="rounded border-outline-variant/50 text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-on-surface">Prix négociable</span>
                  </label>
                </div>
              </div>

              {/* Commune */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label text-xs font-bold uppercase text-on-surface tracking-wider">
                  Commune
                </label>
                <CustomSelect
                  options={COMMUNE_OPTIONS.filter((c) => c !== 'Tout Abidjan')}
                  value={editCommune}
                  onChange={(val) => setEditCommune(val)}
                  icon="location_on"
                />
              </div>

              {/* Condition */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label text-xs font-bold uppercase text-on-surface tracking-wider">
                  État de l'objet
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(CONDITION_LABELS).map(([key, label]) => (
                    <label
                      key={key}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                        editCondition === key
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-outline-variant/30 hover:border-primary/30 text-on-surface-variant'
                      }`}
                    >
                      <input
                        type="radio"
                        name="edit-condition"
                        value={key}
                        checked={editCondition === key}
                        onChange={() => setEditCondition(key)}
                        className="sr-only"
                      />
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        editCondition === key ? 'border-primary bg-primary' : 'border-outline-variant'
                      }`}>
                        {editCondition === key && <span className="w-2 h-2 rounded-full bg-on-primary block" />}
                      </span>
                      <span className="text-sm font-semibold">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label text-xs font-bold uppercase text-on-surface tracking-wider">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                  className="bg-surface-container-low px-4 py-3 rounded-xl text-sm border border-outline-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface resize-none"
                  placeholder="Décrivez l'article : marque, taille, défauts éventuels..."
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditListing}
                  className="flex-1 py-3 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-xl text-sm font-bold transition-all cursor-pointer border border-outline-variant/30"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSavingListing}
                  className="flex-1 py-3 bg-primary text-on-primary rounded-xl text-sm font-bold hover:bg-primary-container transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSavingListing
                    ? <><span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span><span>Sauvegarde...</span></>
                    : <><span className="material-symbols-outlined text-[16px]">save</span><span>Enregistrer</span></>
                  }
                </button>
              </div>

              {/* Delete from inside edit modal */}
              <div className="pt-2 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => {
                    closeEditListing();
                    setTimeout(() => setDeletingListing(editingListing), 100);
                  }}
                  className="w-full py-3 text-error hover:bg-error/10 border border-error/30 hover:border-error/60 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                  <span>Supprimer cette annonce</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== DELETE CONFIRMATION MODAL ===== */}
      {deletingListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeletingListing(null)} />

          {/* Dialog */}
          <div className="relative bg-surface rounded-3xl shadow-2xl border border-outline-variant/20 w-full max-w-sm p-6 flex flex-col gap-5 animate-fadeIn">
            {/* Icon */}
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-error/10 text-error flex items-center justify-center">
                <span className="material-symbols-outlined text-[34px]">delete_forever</span>
              </div>
              <div>
                <h2 className="font-headline text-lg font-bold text-on-surface">Supprimer l'annonce ?</h2>
                <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                  Vous êtes sur le point de supprimer l'annonce{' '}
                  <span className="font-bold text-on-surface">"{deletingListing.title}"</span>.
                  <br />
                  <span className="text-error font-semibold">Cette action est irréversible.</span>
                </p>
              </div>
            </div>

            {/* Info box */}
            <div className="bg-surface-container-low rounded-2xl p-4 flex items-center gap-3 border border-outline-variant/20">
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-surface-container">
                <img
                  src={deletingListing.images[0] || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=200'}
                  alt={deletingListing.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-on-surface truncate">{deletingListing.title}</p>
                <p className="text-xs text-on-surface-variant">{deletingListing.commune}</p>
                <p className="text-xs font-bold text-primary mt-0.5">
                  {new Intl.NumberFormat('fr-FR').format(deletingListing.price)} FCFA
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeletingListing(null)}
                className="flex-1 py-3 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-xl text-sm font-bold transition-all cursor-pointer border border-outline-variant/30"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  deleteListing(deletingListing.id);
                  setDeletingListing(null);
                }}
                className="flex-1 py-3 bg-error text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                <span>Oui, supprimer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}