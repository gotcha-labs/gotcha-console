import Sidebar from "@/components/sidebar/Sidebar";
import Topbar from "@/components/topbar/Topbar";
import { SidebarProvider } from "@/components/sidebar/SidebarContext";
import { isAdmin } from "@/lib/server/admin";
import { notFound } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) notFound();

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar isAdmin />
        <div className="flex-1 flex flex-col bg-background">
          <Topbar />
          <main className="flex-1 overflow-auto p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
