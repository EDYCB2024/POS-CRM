'use client'

import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();
  
  return (
    <div className="flex min-h-screen bg-surface-container-lowest">
      <Sidebar />
      <main className={`flex-1 flex flex-col min-h-screen relative transition-all duration-300 ease-in-out ${isOpen ? 'ml-80' : 'ml-0'}`}>
        {children}
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}
