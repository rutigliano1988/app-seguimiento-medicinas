import { z } from "zod";

export const medicineFormSchema = z.object({
  // Step 1: Medicine details
  name: z.string().min(1, "El nombre es requerido").max(100),
  genericName: z.string().max(100).optional(),
  dosage: z.string().min(1, "La dosis es requerida").max(50),
  form: z.enum(["TABLET", "CAPSULE", "LIQUID", "INJECTION", "CREAM", "DROPS", "INHALER", "PATCH", "OTHER"]),
  instructions: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),

  // Step 2: Schedule (optional)
  schedule: z.object({
    frequency: z.enum(["DAILY", "SPECIFIC_DAYS", "EVERY_N_HOURS", "AS_NEEDED"]),
    times: z.array(z.string().regex(/^\d{2}:\d{2}$/)).min(1, "Agrega al menos un horario"),
    daysOfWeek: z.array(z.number().min(0).max(6)),
    startDate: z.string().min(1, "La fecha de inicio es requerida"),
    endDate: z.string().optional(),
  }).optional(),

  // Step 3: Inventory (optional)
  inventory: z.object({
    currentStock: z.number().min(0, "El stock no puede ser negativo"),
    unit: z.string().min(1, "La unidad es requerida"),
    lowStockThreshold: z.number().min(0),
    expiryDate: z.string().optional(),
  }).optional(),
});

export type MedicineFormValues = z.infer<typeof medicineFormSchema>;
