import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string().min(2, "El nombre del grupo debe tener al menos 2 caracteres").max(50),
});

export const inviteSchema = z.object({
  email: z.string().email("Email inválido"),
});

export type CreateGroupValues = z.infer<typeof createGroupSchema>;
export type InviteValues = z.infer<typeof inviteSchema>;
