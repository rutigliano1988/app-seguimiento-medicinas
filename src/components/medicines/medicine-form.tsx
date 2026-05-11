"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { medicineFormSchema, type MedicineFormValues } from "@/lib/validations/medicine";
import { Plus, Trash2, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";

const STEPS = ["Medicamento", "Horario", "Inventario"];
const MEDICINE_FORMS = [
  { value: "TABLET", label: "Pastilla" },
  { value: "CAPSULE", label: "Cápsula" },
  { value: "LIQUID", label: "Líquido" },
  { value: "INJECTION", label: "Inyección" },
  { value: "CREAM", label: "Crema" },
  { value: "DROPS", label: "Gotas" },
  { value: "INHALER", label: "Inhalador" },
  { value: "PATCH", label: "Parche" },
  { value: "OTHER", label: "Otro" },
];
const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"];

export function MedicineForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [times, setTimes] = useState<string[]>(["08:00"]);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [hasSchedule, setHasSchedule] = useState(true);
  const [hasInventory, setHasInventory] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<MedicineFormValues>({
    resolver: zodResolver(medicineFormSchema),
    defaultValues: {
      form: "TABLET",
      schedule: {
        frequency: "DAILY",
        times: ["08:00"],
        daysOfWeek: [],
        startDate: new Date().toISOString().split("T")[0],
      },
      inventory: {
        currentStock: 0,
        unit: "pastillas",
        lowStockThreshold: 7,
      },
    },
  });

  const frequency = watch("schedule.frequency");
  const selectedColor = watch("color");

  function addTime() {
    const newTimes = [...times, "12:00"];
    setTimes(newTimes);
    setValue("schedule.times", newTimes);
  }

  function removeTime(i: number) {
    const newTimes = times.filter((_, idx) => idx !== i);
    setTimes(newTimes);
    setValue("schedule.times", newTimes);
  }

  function updateTime(i: number, val: string) {
    const newTimes = [...times];
    newTimes[i] = val;
    setTimes(newTimes);
    setValue("schedule.times", newTimes);
  }

  function toggleDay(day: number) {
    const newDays = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];
    setSelectedDays(newDays);
    setValue("schedule.daysOfWeek", newDays);
  }

  async function goNext() {
    const valid = await trigger(step === 0 ? ["name", "dosage", "form"] : []);
    if (valid) setStep((s) => Math.min(s + 1, 2));
  }

  async function onSubmit(data: MedicineFormValues) {
    setLoading(true);
    const payload = {
      ...data,
      schedule: hasSchedule ? data.schedule : undefined,
      inventory: hasInventory ? data.inventory : undefined,
    };

    const res = await fetch("/api/medicines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      toast.error("Error al guardar el medicamento");
      setLoading(false);
      return;
    }

    toast.success("Medicamento guardado");
    router.push("/medicines");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors
              ${i === step ? "bg-slate-900 text-white" : i < step ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}>
              {i < step ? "✓" : i + 1}
            </div>
            <span className={`text-sm ${i === step ? "font-medium text-slate-900" : "text-slate-400"}`}>{s}</span>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-slate-200 mx-1" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 0: Medicine details */}
        {step === 0 && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-1.5">
                <Label>Nombre *</Label>
                <Input placeholder="ej. Ibuprofeno" {...register("name")} />
                {errors.name && <p className="text-sm text-rose-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Nombre genérico</Label>
                <Input placeholder="ej. Ibuprofenum" {...register("genericName")} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Dosis *</Label>
                  <Input placeholder="ej. 500mg" {...register("dosage")} />
                  {errors.dosage && <p className="text-sm text-rose-500">{errors.dosage.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Forma</Label>
                  <Select defaultValue="TABLET" onValueChange={(v) => setValue("form", v as MedicineFormValues["form"])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MEDICINE_FORMS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Instrucciones</Label>
                <Input placeholder="ej. Tomar con alimentos" {...register("instructions")} />
              </div>
              <div className="space-y-2">
                <Label>Color (para identificación)</Label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setValue("color", c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110
                        ${selectedColor === c ? "border-slate-900 scale-110" : "border-transparent"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 1: Schedule */}
        {step === 1 && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Agregar horario</Label>
                <button
                  type="button"
                  onClick={() => setHasSchedule(!hasSchedule)}
                  className="text-sm text-slate-500 hover:text-slate-900"
                >
                  {hasSchedule ? "Omitir" : "Agregar"}
                </button>
              </div>

              {hasSchedule && (
                <>
                  <div className="space-y-1.5">
                    <Label>Frecuencia</Label>
                    <Select
                      defaultValue="DAILY"
                      onValueChange={(v) => setValue("schedule.frequency", v as "DAILY" | "SPECIFIC_DAYS" | "EVERY_N_HOURS" | "AS_NEEDED")}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DAILY">Todos los días</SelectItem>
                        <SelectItem value="SPECIFIC_DAYS">Días específicos</SelectItem>
                        <SelectItem value="EVERY_N_HOURS">Cada N horas</SelectItem>
                        <SelectItem value="AS_NEEDED">Según necesidad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {frequency === "SPECIFIC_DAYS" && (
                    <div className="space-y-1.5">
                      <Label>Días de la semana</Label>
                      <div className="flex gap-2">
                        {DAYS.map((day, i) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(i)}
                            className={`w-9 h-9 rounded-full text-xs font-medium transition-colors
                              ${selectedDays.includes(i) ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {frequency !== "AS_NEEDED" && (
                    <div className="space-y-2">
                      <Label>Horarios</Label>
                      {times.map((t, i) => (
                        <div key={i} className="flex gap-2">
                          <Input
                            type="time"
                            value={t}
                            onChange={(e) => updateTime(i, e.target.value)}
                            className="flex-1"
                          />
                          {times.length > 1 && (
                            <Button type="button" variant="outline" size="sm" onClick={() => removeTime(i)}>
                              <Trash2 size={14} />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={addTime} className="w-full">
                        <Plus size={14} className="mr-1" /> Agregar horario
                      </Button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Fecha inicio</Label>
                      <Input
                        type="date"
                        defaultValue={new Date().toISOString().split("T")[0]}
                        {...register("schedule.startDate")}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Fecha fin (opcional)</Label>
                      <Input type="date" {...register("schedule.endDate")} />
                    </div>
                  </div>
                </>
              )}

              {!hasSchedule && (
                <p className="text-sm text-slate-400 py-4 text-center">
                  Sin horario asignado. Podrás agregarlo después.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Inventory */}
        {step === 2 && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Control de inventario</Label>
                <button
                  type="button"
                  onClick={() => setHasInventory(!hasInventory)}
                  className="text-sm text-slate-500 hover:text-slate-900"
                >
                  {hasInventory ? "Omitir" : "Agregar"}
                </button>
              </div>

              {hasInventory && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Stock actual</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        {...register("inventory.currentStock", { valueAsNumber: true })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Unidad</Label>
                      <Input placeholder="pastillas / ml / dosis" {...register("inventory.unit")} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Alerta de stock bajo (avisar cuando queden menos de)</Label>
                    <Input
                      type="number"
                      min="0"
                      {...register("inventory.lowStockThreshold", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Fecha de vencimiento (opcional)</Label>
                    <Input type="date" {...register("inventory.expiryDate")} />
                  </div>
                </>
              )}

              {!hasInventory && (
                <p className="text-sm text-slate-400 py-4 text-center">
                  Sin seguimiento de inventario. Podrás activarlo después.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)} className="flex-1">
              <ChevronLeft size={16} className="mr-1" /> Anterior
            </Button>
          )}
          {step < 2 ? (
            <Button type="button" onClick={goNext} className="flex-1 bg-slate-900 hover:bg-slate-700">
              Siguiente <ChevronRight size={16} className="ml-1" />
            </Button>
          ) : (
            <Button type="submit" disabled={loading} className="flex-1 bg-emerald-500 hover:bg-emerald-600">
              {loading && <Loader2 size={16} className="mr-2 animate-spin" />}
              Guardar medicamento
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
