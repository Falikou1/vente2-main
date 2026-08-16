import { z } from 'zod';

export const listingSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Le titre doit comporter au moins 3 caractères." })
    .max(100, { message: "Le titre ne peut pas dépasser 100 caractères." }),
  category_id: z
    .string()
    .min(1, { message: "Veuillez sélectionner une catégorie." }),
  condition: z.enum(['new', 'like-new', 'very-good', 'good', 'fair'], {
    errorMap: () => ({ message: "Veuillez sélectionner l'état de l'objet." }),
  }),
  price: z
    .number({ invalid_type_error: "Veuillez entrer un prix valide en FCFA." })
    .positive({ message: "Le prix doit être supérieur à 0 FCFA." }),
  is_negotiable: z.boolean().default(false),
  description: z
    .string()
    .min(5, { message: "La description doit comporter au moins 5 caractères." })
    .max(3000, { message: "La description est trop longue (max 3000 caractères)." }),
  commune: z
    .string()
    .min(1, { message: "Veuillez choisir votre commune ou ville." }),
  phone: z
    .string()
    .min(8, { message: "Veuillez renseigner un numéro de téléphone valide." }),
  whatsapp_enabled: z.boolean().default(true),
});

export type ListingFormValues = z.infer<typeof listingSchema>;