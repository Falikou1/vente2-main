'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { listingSchema, ListingFormValues } from '@/lib/validations/listing';
import { useMarketplaceStore } from '@/lib/data/store';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';
import { COMMUNE_OPTIONS, CONDITION_OPTIONS } from '@/lib/utils';
import { CATEGORIES } from '@/lib/data/mock-data';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { Profile } from '@/types';

export default function PublierPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { addListing, currentUser } = useMarketplaceStore();
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  const categoryOptions = CATEGORIES.map((c) => ({
    value: c.id,
    label: c.name,
    icon: c.icon,
  }));

  const conditionSelectOptions = CONDITION_OPTIONS.map((c) => ({
    value: c.value,
    label: c.label,
  }));

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: '',
      category_id: '',
      condition: 'like-new',
      price: undefined,
      is_negotiable: false,
      description: '',
      commune: profile?.commune || 'Cocody',
      phone: profile?.phone || '',
      whatsapp_enabled: true,
    },
  });

  useEffect(() => {
    if (profile?.phone) {
      setValue('phone', profile.phone);
    }
    if (profile?.commune) {
      setValue('commune', profile.commune);
    }
  }, [profile, setValue]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImageUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      if (images.length + newImageUrls.length < 5) {
        newImageUrls.push(URL.createObjectURL(files[i]));
      }
    }
    setImages([...images, ...newImageUrls]);
  };

  const removeImage = (indexToRemove: number) => {
    setImages(images.filter((_, idx) => idx !== indexToRemove));
  };

  const onSubmit = async (data: ListingFormValues) => {
    setIsSubmitting(true);

    const finalImages = images.length > 0
      ? images
      : ['https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80'];

    const categoryObj = CATEGORIES.find((c) => c.id === data.category_id);
    const sellerName = profile?.full_name || user?.user_metadata?.full_name || currentUser.full_name || 'Membre';
    const sellerId = user?.id || currentUser.id || 'user-current';

    const finalSeller: Profile = {
      id: sellerId,
      full_name: sellerName,
      email: user?.email || profile?.email || '',
      phone: data.phone || profile?.phone || '',
      commune: data.commune || profile?.commune || 'Cocody',
      avatar_url: profile?.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(sellerName)}`,
      rating: profile?.rating || 0,
      reviews_count: profile?.reviews_count || 0,
      active_listings_count: 1,
      sold_listings_count: 0,
      member_since: profile?.member_since || 'Membre depuis ' + new Date().getFullYear(),
      response_rate: profile?.response_rate || 'Répond rapidement',
      is_verified: profile?.is_verified || false,
      whatsapp_enabled: data.whatsapp_enabled,
      created_at: new Date().toISOString(),
    };

    try {
      if (user) {
        try {
          const supabase = createClient();
          await supabase.from('listings').insert({
            title: data.title,
            description: data.description,
            price: Number(data.price),
            is_negotiable: data.is_negotiable,
            condition: data.condition,
            category_id: data.category_id,
            commune: data.commune,
            images: finalImages,
            seller_id: user.id,
            status: 'active',
            whatsapp_enabled: data.whatsapp_enabled,
            contact_phone: data.phone,
          });
        } catch (dbErr) {
          console.warn('Supabase insert notice:', dbErr);
        }
      }

      const createdId = addListing({
        title: data.title,
        description: data.description,
        price: Number(data.price),
        is_negotiable: data.is_negotiable,
        condition: data.condition,
        category_id: data.category_id,
        category_name: categoryObj?.name || 'Divers',
        commune: data.commune,
        images: finalImages,
        seller_id: sellerId,
        seller: finalSeller,
        status: 'active',
        whatsapp_enabled: data.whatsapp_enabled,
        contact_phone: data.phone,
      });

      setSuccessId(createdId);
      setIsSubmitting(false);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-container-margin py-stack-md flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="font-headline text-2xl sm:text-headline-md font-bold text-on-surface">
          Vendre un objet
        </h1>
        <p className="font-body text-body-md text-on-surface-variant mt-1">
          Tu ne l'utilises plus ? Vends-le facilement en quelques clics à des personnes proches de chez toi.
        </p>
      </div>

      {successId ? (
        <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant/30 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl">check_circle</span>
          </div>
          <h2 className="font-headline text-2xl font-bold text-on-surface">
            Objet mis en vente avec succès !
          </h2>
          <p className="text-on-surface-variant text-sm max-w-md">
            Votre objet est maintenant visible par les acheteurs intéressés près de chez vous.
          </p>
          <div className="flex items-center gap-3 mt-2">
            <Link
              href={`/annonces/${successId}`}
              className="bg-primary text-on-primary px-6 py-3 rounded-xl font-label text-sm font-bold hover:bg-primary-container transition-all"
            >
              Voir mon annonce
            </Link>
            <Link
              href="/profil"
              className="bg-surface-container-high text-on-surface px-6 py-3 rounded-xl font-label text-sm font-bold hover:bg-surface-container-highest transition-all"
            >
              Mon profil
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {/* Photo Upload Section */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-headline text-lg font-bold text-on-surface">Photos de l'objet</h2>
                <p className="font-body text-xs text-on-surface-variant">
                  Prenez quelques photos claires de votre objet sous différents angles.
                </p>
              </div>
              <span className="font-label text-xs font-semibold text-primary">{images.length}/5 photos</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {images.map((imgUrl, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-outline-variant/40 group">
                  <img src={imgUrl} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-error transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              ))}

              {images.length < 5 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-outline-variant/60 hover:border-primary flex flex-col items-center justify-center gap-1 cursor-pointer bg-surface-container-low/50 hover:bg-surface-container-low transition-all">
                  <span className="material-symbols-outlined text-2xl text-primary">add_a_photo</span>
                  <span className="font-label text-[11px] font-semibold text-on-surface-variant">Ajouter</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Listing Details Section */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col gap-5">
            <h2 className="font-headline text-lg font-bold text-on-surface">Détails de l'objet</h2>

            <div className="flex flex-col gap-1.5">
              <label className="font-label text-xs font-bold text-on-surface uppercase tracking-wider">
                Titre *
              </label>
              <input
                type="text"
                {...register('title')}
                placeholder="Ex: Baskets Nike Air Force 1 pointure 42, iPhone 12, Table basse..."
                className="w-full bg-surface-container-low/90 px-4 py-3 rounded-xl font-body text-sm text-on-surface border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              {errors.title && <p className="text-xs text-error font-medium">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category Custom Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label text-xs font-bold text-on-surface uppercase tracking-wider">
                  Catégorie *
                </label>
                <Controller
                  name="category_id"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      options={categoryOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Sélectionnez une catégorie"
                      menuClassName="sm:min-w-[340px]"
                    />
                  )}
                />
                {errors.category_id && <p className="text-xs text-error font-medium">{errors.category_id.message}</p>}
              </div>

              {/* Condition Custom Dropdown with Full Labels */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label text-xs font-bold text-on-surface uppercase tracking-wider">
                  État de l'objet *
                </label>
                <Controller
                  name="condition"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      options={conditionSelectOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Sélectionnez l'état"
                      icon="verified"
                      menuClassName="sm:min-w-[380px]"
                    />
                  )}
                />
                {errors.condition && <p className="text-xs text-error font-medium">{errors.condition.message}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-label text-xs font-bold text-on-surface uppercase tracking-wider">
                Prix demandé (FCFA) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="Ex: 25000"
                  className="w-full bg-surface-container-low/90 px-4 py-3 rounded-xl font-body text-sm text-on-surface border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-sm text-primary">
                  FCFA
                </span>
              </div>
              {errors.price && <p className="text-xs text-error font-medium">{errors.price.message}</p>}

              <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register('is_negotiable')}
                  className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
                />
                <span className="font-body text-xs font-medium text-on-surface-variant">
                  Prix négociable
                </span>
              </label>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-label text-xs font-bold text-on-surface uppercase tracking-wider">
                Description rapide *
              </label>
              <textarea
                rows={4}
                {...register('description')}
                placeholder="Décrivez rapidement l'objet : état, pointure/taille, accessoires fournis, raison de la vente..."
                className="w-full bg-surface-container-low/90 px-4 py-3 rounded-xl font-body text-sm text-on-surface border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              ></textarea>
              {errors.description && <p className="text-xs text-error font-medium">{errors.description.message}</p>}
            </div>
          </div>

          {/* Location & Contact Section */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col gap-5">
            <h2 className="font-headline text-lg font-bold text-on-surface">Localisation & Contact</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Commune Custom Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label text-xs font-bold text-on-surface uppercase tracking-wider">
                  Commune / Ville *
                </label>
                <Controller
                  name="commune"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      options={COMMUNE_OPTIONS.filter((c) => c !== 'Tout Abidjan')}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Choisir votre commune"
                      icon="location_on"
                      menuClassName="sm:min-w-[280px]"
                    />
                  )}
                />
                {errors.commune && <p className="text-xs text-error font-medium">{errors.commune.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label text-xs font-bold text-on-surface uppercase tracking-wider">
                  Numéro pour vous joindre *
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  placeholder="+225 07 08 12 34 56"
                  className="w-full bg-surface-container-low/90 px-4 py-3 rounded-xl font-body text-sm text-on-surface border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                {errors.phone && <p className="text-xs text-error font-medium">{errors.phone.message}</p>}
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                {...register('whatsapp_enabled')}
                className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
              />
              <span className="font-body text-xs font-medium text-on-surface-variant">
                Accepter les messages WhatsApp pour conclure rapidement la vente
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-on-primary py-4 rounded-xl font-label text-sm font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 mt-2 active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                  <span>Publication en cours...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">check</span>
                  <span>Mettre en vente gratuitement</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}