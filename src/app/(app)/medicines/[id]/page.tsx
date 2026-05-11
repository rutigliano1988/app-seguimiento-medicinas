"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Package, Calendar, Clock, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

interface Medicine {
  id: string;
  name: string;
  genericName?: string;
  dosage: string;
  form: string;
  instructions?: string;
  color?: string;
  isActive: boolean;
  inventory?: {
    currentStock: number;
    unit: string;
    lowStockThreshold: number;
    expiryDate?: string;
  } | null;
  schedules: Array<{
    id: string;
    frequency: string;
    times: string[];
    isActive: boolean;
  }>;
  doseLogs: Array<{
    id: string;
    status: string;
    takenAt: string;
    scheduledAt?: string;
  }>;
}

const FORM_LABELS: Record<string, string> = {
  TABLET: "Pastilla", CAPSULE: "Cápsula", LIQUID: "Líquido",
  INJECTION: "Inyección", CREAM: "Crema", DROPS: "Gotas",
  INHALER: "Inhalador", PATCH: "Parche", OTHER: "Otro",
};

const FREQ_LABELS: Record<string, string> = {
  DAILY: "Todos los días", SPECIFIC_DAYS: "Días específicos",
  EVERY_N_HOURS: "Cada N horas", AS_NEEDED: "Según necesidad",
};

export default function MedicinePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingInventory, setSavingInventory] = useState(false);
  const [stock, setStock] = useState("");
  const [unit, setUnit] = useState("");
  const [threshold, setThreshold] = useState("");

  useEffect(() => {
    fetch(`/api/medicines/${id}`)
      .then((r) => r.json())
      .then((data: Medicine) => {
        setMedicine(data);
        if (data.inventory) {
          setStock(String(data.inventory.currentStock));
          setUnit(data.inventory.unit);
          setThreshold(String(data.inventory.lowStockThreshold));
        }
        setLoading(false);
      })
      .catch(() => { toast.error("Error al cargar"); setLoading(false); });
  }, [id]);

  async function saveInventory() {
    setSavingInventory(true);
    const res = await fetch(`/api/inventory`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        medicineId: id,
        currentStock: Number(stock),
        unit,
        lowStockThreshold: Number(threshold),
      }),
    });
    if (res.ok) {
      toast.success("Inventario guardado");
      const updated = await fetch(`/api/medicines/${id}`).then((r) => r.json());
      setMedicine(updated);
    } else {
      toast.error("Error al guardar inventario");
    }
    setSavingInventory(false);
  }

  async function toggleActive() {
    const res = await fetch(`/api/medicines/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...medicine, isActive: !medicine?.isActive }),
    });
    if (res.ok) {
      const updated = await res.json();
      setMedicine((m) => m ? { ...m, isActive: updated.isActive } : m);
      toast.success(updated.isActive ? "Medicamento activado" : "Medicamento desactivado");
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <Loader2 className="animate-spin text-slate-400" size={32} />
    </div>
  );

  if (!medicine) return (
    <div className="text-center py-12 text-slate-500">Medicamento no encontrado</div>
  );

  const recentLogs = medicine.doseLogs.slice(0, 10);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/medicines">
          <Button variant="outline" size="sm"><ArrowLeft size={16} /></Button>
        </Link>
        <div className="flex items-center gap-2">
          {medicine.color && (
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: medicine.color }} />
          )}
          <h1 className="text-xl font-bold text-slate-900">{medicine.name}</h1>
        </div>
        <Badge variant={medicine.isActive ? "default" : "secondary"} className="ml-auto">
          {medicine.isActive ? "Activo" : "Inactivo"}
        </Badge>
      </div>

      {/* Details */}
      <Card>
        <CardHeader><CardTitle className="text-base">Detalles</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Dosis</span><span className="font-medium">{medicine.dosage}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Forma</span><span className="font-medium">{FORM_LABELS[medicine.form] ?? medicine.form}</span></div>
          {medicine.genericName && <div className="flex justify-between"><span className="text-slate-500">Nombre genérico</span><span className="font-medium">{medicine.genericName}</span></div>}
          {medicine.instructions && <div className="flex justify-between"><span className="text-slate-500">Instrucciones</span><span className="font-medium">{medicine.instructions}</span></div>}
          <div className="pt-2 flex gap-2">
            <Button variant="outline" size="sm" onClick={toggleActive} className="flex-1">
              {medicine.isActive ? "Desactivar" : "Activar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Schedules */}
      {medicine.schedules.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Calendar size={16} />Horarios</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {medicine.schedules.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{FREQ_LABELS[s.frequency] ?? s.frequency}</span>
                <div className="flex items-center gap-1">
                  {s.times.map((t) => (
                    <Badge key={t} variant="outline" className="text-xs">
                      <Clock size={10} className="mr-1" />{t}
                    </Badge>
                  ))}
                  <Badge variant={s.isActive ? "default" : "secondary"} className="text-xs">
                    {s.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Inventory */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Package size={16} />Inventario</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {medicine.inventory && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 text-sm">
              <span className="text-slate-500">Stock actual</span>
              <span className="font-semibold text-lg">
                {medicine.inventory.currentStock} <span className="text-sm font-normal text-slate-500">{medicine.inventory.unit}</span>
              </span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Stock</Label>
              <Input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Unidad</Label>
              <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="pastillas" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Alerta cuando queden menos de</Label>
            <Input type="number" min="0" value={threshold} onChange={(e) => setThreshold(e.target.value)} placeholder="7" />
          </div>
          <Button onClick={saveInventory} disabled={savingInventory} className="w-full bg-slate-900 hover:bg-slate-700">
            {savingInventory && <Loader2 size={14} className="mr-2 animate-spin" />}
            {medicine.inventory ? "Actualizar inventario" : "Agregar inventario"}
          </Button>
        </CardContent>
      </Card>

      {/* Recent logs */}
      {recentLogs.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Últimas tomas</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {log.status === "TAKEN"
                    ? <CheckCircle2 size={14} className="text-emerald-500" />
                    : <XCircle size={14} className="text-rose-400" />}
                  <span className="capitalize text-slate-600">
                    {log.status === "TAKEN" ? "Tomada" : log.status === "SKIPPED" ? "Omitida" : "Tardía"}
                  </span>
                </div>
                <span className="text-slate-400 text-xs">
                  {new Date(log.takenAt).toLocaleDateString("es", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
