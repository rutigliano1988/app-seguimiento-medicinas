import { FamilyInviteForm } from "@/components/family/family-invite-form";

export default function InvitePage() {
  return (
    <div className="max-w-md mx-auto space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Invitar miembro</h2>
        <p className="text-sm text-slate-500">Envía una invitación por email para unirse a tu grupo</p>
      </div>
      <FamilyInviteForm />
    </div>
  );
}
