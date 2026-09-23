import { z } from 'zod';

export const signInSchema = z.object({
  email: z
    .string({ required_error: 'E-mail é obrigatório' })
    .trim()
    .toLowerCase()
    .email('Formato de e-mail inválido'),
  password: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(1, 'Senha é obrigatória'),
});

export type SignInInput = z.infer<typeof signInSchema>;

export const registerSchema = z.object({
  username: z
    .string({ required_error: 'Nome de usuário é obrigatório' })
    .trim()
    .min(3, 'Nome de usuário deve ter no mínimo 3 caracteres')
    .max(50, 'Nome de usuário muito longo'),
  email: z
    .string({ required_error: 'E-mail é obrigatório' })
    .trim()
    .toLowerCase()
    .email('Formato de e-mail inválido'),
  password: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
    .max(128, 'A senha deve ter no máximo 128 caracteres'),
  avatar: z
    .union([z.string().trim().url('URL do avatar inválida'), z.literal('')])
    .nullish()
    .transform((val) => (val === '' ? null : val)),
  latitude: z
    .number()
    .min(-90, 'Latitude inválida')
    .max(90, 'Latitude inválida')
    .nullish(),
  longitude: z
    .number()
    .min(-180, 'Longitude inválida')
    .max(180, 'Longitude inválida')
    .nullish(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
