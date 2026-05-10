import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/context/SidebarContext";
import { DashboardLayoutClient } from "./DashboardLayoutClient";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-surface-container-lowest">
        <Sidebar />
        <DashboardLayoutClient>
          {children}
        </DashboardLayoutClient>
      </div>
    </SidebarProvider>
  );
}
