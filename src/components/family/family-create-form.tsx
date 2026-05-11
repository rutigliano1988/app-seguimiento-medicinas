"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createGroupSchema, type CreateGroupValues } from "@/lib/validations/family";
import { Loader2 } from "lucide-react";

export function FamilyCreateForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CreateGroupValues>({
    resolver: zodResolver(createGroupSchema),
  });

  async function onSubmit(data: CreateGroupValues) {
    setLoading(true);
    const res = await fetch("/api/family", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const json = await res.json();
      toast.error(json.error ?? "Error al crear el grupo");
      setLoading(false);
      return;
    }

    toast.success("Grupo familiar creado");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Crear grupo familiar</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nombre del grupo</Label>
            <Input placeholder="ej. Familia García" {...register("name")} />
            {errors.name && <p className="text-sm text-rose-500">{errors.name.message}</p>}
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-700">
            {loading && <Loader2 size={16} className="mr-2 animate-spin" />}
            Crear grupo
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
