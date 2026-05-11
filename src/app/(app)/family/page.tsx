import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FamilyCreateForm } from "@/components/family/family-create-form";
import { Users, UserPlus, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function FamilyPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      familyGroup: {
        include: {
          members: { select: { id: true, name: true, email: true } },
          invites: { where: { status: "PENDING" }, select: { id: true, email: true, expiresAt: true } },
        },
      },
      adminOf: { select: { id: true } },
    },
  });

  const group = user?.familyGroup;
  const isAdmin = !!user?.adminOf?.id;

  if (!group) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Grupo familiar</h2>
          <p className="text-sm text-slate-500">Comparte el seguimiento con tu familia</p>
        </div>
        <div className="text-center py-8 text-slate-400">
          <Users size={48} className="mx-auto mb-4 opacity-30" />
          <p className="mb-6">No perteneces a ningún grupo familiar todavía.</p>
        </div>
        <FamilyCreateForm />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{group.name}</h2>
          <p className="text-sm text-slate-500">{group.members.length} miembro{group.members.length !== 1 ? "s" : ""}</p>
        </div>
        {isAdmin && (
          <Link href="/family/invite" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            <UserPlus size={14} className="mr-1.5" /> Invitar
          </Link>
        )}
      </div>

      <div className="space-y-2">
        {group.members.map((member) => (
          <Card key={member.id}>
            <CardContent className="flex items-center gap-3 py-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600">
                {(member.name ?? member.email)[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 text-sm">{member.name ?? "Sin nombre"}</p>
                <p className="text-xs text-slate-400">{member.email}</p>
              </div>
              {member.id === session.user?.id && (
                <Badge variant="outline" className="text-xs">Tú</Badge>
              )}
              {isAdmin && member.id === session.user?.id && (
                <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-xs">Admin</Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {isAdmin && group.invites.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Invitaciones pendientes</p>
          {group.invites.map((invite) => (
            <Card key={invite.id}>
              <CardContent className="flex items-center gap-3 py-3">
                <Clock size={16} className="text-amber-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-slate-700">{invite.email}</p>
                  <p className="text-xs text-slate-400">
                    Expira: {new Date(invite.expiresAt).toLocaleDateString("es-AR")}
                  </p>
                </div>
                <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">Pendiente</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
