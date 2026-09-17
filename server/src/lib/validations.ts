import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, "Nome deve ter pelo menos 3 caracteres")
      .max(100, "Nome deve ter no máximo 100 caracteres"),
    email: z
      .string()
      .email("Email inválido")
      .max(255, "Email deve ter no máximo 255 caracteres"),
    password: z
      .string()
      .min(8, "Senha deve ter pelo menos 8 caracteres")
      .max(128, "Senha deve ter no máximo 128 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número"
      ),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Email inválido"),
    password: z
      .string()
      .min(1, "Senha é obrigatória"),
    remember: z.boolean().optional(),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Email inválido"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    code: z
      .string()
      .length(6, "Código deve ter 6 dígitos"),
    password: z
      .string()
      .min(8, "Senha deve ter pelo menos 8 caracteres")
      .max(128, "Senha deve ter no máximo 128 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número"
      ),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  }),
});