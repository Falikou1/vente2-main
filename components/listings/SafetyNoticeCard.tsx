import React from 'react';

export const SafetyNoticeCard: React.FC = () => {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row relative border border-outline-variant/30">
      <div className="absolute left-0 top-0 w-2 h-full bg-secondary-container"></div>
      
      <div className="p-6 flex flex-col justify-center bg-surface-container-low md:w-1/3">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-secondary-container text-4xl">security</span>
          <h3 className="font-headline text-headline-md font-bold text-on-surface">Sécurité</h3>
        </div>
        <p className="font-body text-body-md text-sm text-on-surface-variant">
          Conseils pour une transaction en toute sérénité à Abidjan.
        </p>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-4 justify-center bg-surface-container-lowest">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-primary text-[22px] shrink-0 mt-0.5">
            location_city
          </span>
          <div className="flex flex-col">
            <h4 className="font-label text-sm font-bold text-on-surface">Privilégiez les lieux publics</h4>
            <p className="font-body text-xs text-on-surface-variant">
              Donnez-vous rendez-vous dans un centre commercial ou un lieu éclairé et fréquenté (Abidjan Mall, Cap Sud, etc.).
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-primary text-[22px] shrink-0 mt-0.5">
            visibility
          </span>
          <div className="flex flex-col">
            <h4 className="font-label text-sm font-bold text-on-surface">Vérifiez l'article en main propre</h4>
            <p className="font-body text-xs text-on-surface-variant">
              Prenez le temps de tester l'objet et ses fonctionnalités avant tout règlement.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-primary text-[22px] shrink-0 mt-0.5">
            payments
          </span>
          <div className="flex flex-col">
            <h4 className="font-label text-sm font-bold text-on-surface">Pas d'acompte à distance</h4>
            <p className="font-body text-xs text-on-surface-variant">
              N'effectuez aucun transfert Mobile Money avant d'avoir vu et validé l'article.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
