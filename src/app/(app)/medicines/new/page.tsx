import { MedicineForm } from "@/components/medicines/medicine-form";

export default function NewMedicinePage() {
  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Agregar medicamento</h2>
        <p className="text-sm text-slate-500">Completa los pasos para registrar tu medicamento</p>
      </div>
      <MedicineForm />
    </div>
  );
}
