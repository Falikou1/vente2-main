import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: "Adresse email invalide." }),
  password: z.string().min(6, { message: "Le mot de passe doit comporter au moins 6 caractères." }),
});

export const signupSchema = z
  .object({
    full_name: z.string().min(2, { message: "Le nom complet est obligatoire (min 2 caractères)." }),
    email: z.string().email({ message: "Adresse email invalide." }),
    phone: z.string().min(8, { message: "Numéro de téléphone requis (min 8 chiffres)." }),
    commune: z.string().min(2, { message: "Veuillez sélectionner une commune." }),
    password: z.string().min(6, { message: "Le mot de passe doit comporter au moins 6 caractères." }),
    confirm_password: z.string(),
    accept_terms: z.boolean().refine((v) => v === true, {
      message: "Vous devez accepter les conditions d'utilisation.",
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirm_password"],
  });

export const resetPasswordSchema = z.object({
  email: z.string().email({ message: "Adresse email invalide." }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;