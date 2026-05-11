import type { Medicine, Schedule, Inventory, DoseLog, MedicineForm, Frequency, DoseStatus } from "@/generated/prisma/client";

export type MedicineWithRelations = Medicine & {
  schedules: Schedule[];
  inventory: Inventory | null;
  user: { id: string; name: string | null };
};

export type DoseLogWithMedicine = DoseLog & {
  medicine: { name: string; color: string | null };
};

export type TodayDose = {
  scheduleId: string;
  medicineId: string;
  medicineName: string;
  medicineColor: string | null;
  medicineForm: MedicineForm;
  dosage: string;
  scheduledTime: string;
  scheduledAt: Date;
  status: DoseStatus | "PENDING";
  logId?: string;
};

export { MedicineForm, Frequency, DoseStatus };
