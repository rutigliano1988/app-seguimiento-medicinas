"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { registerSchema, type RegisterValues } from "@/lib/validations/auth";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data: RegisterValues) {
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok) {
      const msg = json.error?.email?.[0] ?? json.error?.password?.[0] ?? "Error al crear la cuenta";
      toast.error(msg);
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      toast.error("Cuenta creada. Por favor inicia sesión.");
      router.push("/login");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear cuenta</CardTitle>
        <CardDescription>Registra tu cuenta para empezar</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" placeholder="Tu nombre" {...register("name")} />
            {errors.name && <p className="text-sm text-rose-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="tu@email.com" {...register("email")} />
            {errors.email && <p className="text-sm text-rose-500">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" placeholder="Mínimo 8 caracteres" {...register("password")} />
            {errors.password && <p className="text-sm text-rose-500">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear cuenta
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center text-sm text-slate-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="ml-1 text-slate-900 font-medium hover:underline">
          Iniciar sesión
        </Link>
      </CardFooter>
    </Card>
  );
}
