import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export type RegisterValues = z.infer<typeof registerSchema>;
export type LoginValues = z.infer<typeof loginSchema>;
