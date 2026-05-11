import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { MedicineList } from "@/components/medicines/medicine-list";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function MedicinesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const medicines = await prisma.medicine.findMany({
    where: { userId: session.user.id, isActive: true },
    include: {
      schedules: { where: { isActive: true } },
      inventory: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Mis medicamentos</h2>
          <p className="text-sm text-slate-500">{medicines.length} registrado{medicines.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/medicines/new" className={cn(buttonVariants(), "bg-slate-900 hover:bg-slate-700")}>
          <Plus size={16} className="mr-1" />
          Agregar
        </Link>
      </div>

      <MedicineList medicines={medicines} />
    </div>
  );
}
