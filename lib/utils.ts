import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  if (!name || !name.trim()) return 'M';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function compressImage(file: File, maxWidth = 160, maxHeight = 160, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(img.src);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };

    reader.readAsDataURL(file);
  });
}

export function triggerPageTransition() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app:start-transition'));
  }
}

export function formatPriceFCFA(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(price) + ' FCFA';
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "À l'instant";
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)}j`;

  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
}

export const CONDITION_OPTIONS = [
  {
    value: 'new',
    label: 'Neuf (jamais utilisé / sous emballage)',
    shortLabel: 'Neuf',
  },
  {
    value: 'like-new',
    label: 'Comme neuf (impeccable)',
    shortLabel: 'Comme neuf',
  },
  {
    value: 'very-good',
    label: 'Très bon état (légères traces)',
    shortLabel: 'Très bon état',
  },
  {
    value: 'good',
    label: 'Bon état (fonctionnel avec légères traces d\'usage)',
    shortLabel: 'Bon état',
  },
  {
    value: 'fair',
    label: 'État correct (fonctionne bien)',
    shortLabel: 'État correct',
  },
];

export function getConditionBadge(condition: string): { label: string; shortLabel: string; bgClass: string; textClass: string } {
  switch (condition) {
    case 'new':
      return {
        label: 'Neuf (jamais utilisé / sous emballage)',
        shortLabel: 'Neuf',
        bgClass: 'bg-primary/90 text-on-primary backdrop-blur-sm',
        textClass: 'text-on-primary',
      };
    case 'like-new':
      return {
        label: 'Comme neuf (impeccable)',
        shortLabel: 'Comme neuf',
        bgClass: 'bg-primary/90 text-on-primary backdrop-blur-sm',
        textClass: 'text-on-primary',
      };
    case 'very-good':
      return {
        label: 'Très bon état (légères traces)',
        shortLabel: 'Très bon état',
        bgClass: 'bg-secondary-container text-on-secondary-container backdrop-blur-sm',
        textClass: 'text-on-secondary-container',
      };
    case 'good':
      return {
        label: 'Bon état (fonctionnel avec légères traces d\'usage)',
        shortLabel: 'Bon état',
        bgClass: 'bg-surface-variant/90 text-on-surface-variant backdrop-blur-sm',
        textClass: 'text-on-surface-variant',
      };
    case 'fair':
      return {
        label: 'État correct (fonctionne bien)',
        shortLabel: 'État correct',
        bgClass: 'bg-surface-container-high/90 text-on-surface-variant backdrop-blur-sm',
        textClass: 'text-on-surface-variant',
      };
    default:
      return {
        label: condition,
        shortLabel: condition,
        bgClass: 'bg-surface-variant text-on-surface-variant',
        textClass: 'text-on-surface-variant',
      };
  }
}

export const COMMUNE_OPTIONS = [
  "Tout Abidjan",
  "Cocody",
  "Plateau",
  "Marcory",
  "Yopougon",
  "Treichville",
  "Adjamé",
  "Koumassi",
  "Port-Bouët",
  "Attécoubé",
  "Abobo",
  "Bingerville",
  "Songon",
  "Grand-Bassam",
];