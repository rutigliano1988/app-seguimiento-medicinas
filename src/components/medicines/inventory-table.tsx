"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Package, Check } from "lucide-react";
import type { Inventory, Medicine } from "@/generated/prisma/client";

type InventoryWithMedicine = Inventory & {
  medicine: Pick<Medicine, "id" | "name" | "color" | "form">;
};

export function InventoryTable({ inventory }: { inventory: InventoryWithMedicine[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [stockValue, setStockValue] = useState<number>(0);

  async function saveStock(item: InventoryWithMedicine) {
    const res = await fetch("/api/inventory", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        medicineId: item.medicine.id,
        currentStock: stockValue,
        unit: item.unit,
        lowStockThreshold: item.lowStockThreshold,
        expiryDate: item.expiryDate?.toISOString(),
      }),
    });

    if (!res.ok) {
      toast.error("Error al actualizar el stock");
      return;
    }

    toast.success("Stock actualizado");
    setEditing(null);
    router.refresh();
  }

  if (inventory.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <Package size={40} className="mx-auto mb-3 opacity-30" />
        <p>No hay medicamentos con inventario configurado.</p>
        <p className="text-sm mt-1">Activa el control de inventario al agregar un medicamento.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {inventory.map((item) => {
        const isLow = item.currentStock <= item.lowStockThreshold;
        const isEditing = editing === item.id;

        return (
          <Card key={item.id} className={isLow ? "border-amber-200" : ""}>
            <CardContent className="flex items-center gap-4 py-4">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: item.medicine.color ?? "#94a3b8" }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900">{item.medicine.name}</p>
                {item.expiryDate && (
                  <p className="text-xs text-slate-400">
                    Vence: {new Date(item.expiryDate).toLocaleDateString("es-AR")}
                  </p>
                )}
              </div>

              {isLow && (
                <Badge className="bg-amber-100 text-amber-700 border-amber-200 shrink-0">
                  <AlertTriangle size={11} className="mr-1" /> Stock bajo
                </Badge>
              )}

              <div className="flex items-center gap-2 shrink-0">
                {isEditing ? (
                  <>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={stockValue}
                      onChange={(e) => setStockValue(parseFloat(e.target.value))}
                      className="w-20 h-8 text-sm"
                      autoFocus
                    />
                    <span className="text-sm text-slate-500">{item.unit}</span>
                    <Button size="sm" onClick={() => saveStock(item)} className="h-8">
                      <Check size={14} />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditing(null)} className="h-8">
                      ✕
                    </Button>
                  </>
                ) : (
                  <button
                    onClick={() => { setEditing(item.id); setStockValue(item.currentStock); }}
                    className={`text-sm font-medium px-2 py-1 rounded hover:bg-slate-100 transition-colors
                      ${isLow ? "text-amber-600" : "text-slate-700"}`}
                  >
                    {item.currentStock} {item.unit}
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
