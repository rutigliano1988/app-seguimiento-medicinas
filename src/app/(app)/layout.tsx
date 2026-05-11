import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Header } from "@/components/layout/header";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col pb-16 lg:pb-0">
        <Header title="Seguimiento de Medicinas" userEmail={session.user?.email ?? undefined} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
