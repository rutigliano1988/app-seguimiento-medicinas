import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InventoryTable } from "@/components/medicines/inventory-table";

export default async function InventoryPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const inventory = await prisma.inventory.findMany({
    where: { medicine: { userId: session.user.id, isActive: true } },
    include: { medicine: { select: { id: true, name: true, color: true, form: true } } },
    orderBy: { medicine: { name: "asc" } },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Inventario</h2>
        <p className="text-sm text-slate-500">Control de stock de tus medicamentos</p>
      </div>
      <InventoryTable inventory={inventory} />
    </div>
  );
}
