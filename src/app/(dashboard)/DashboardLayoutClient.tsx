'use client'

import { useSidebar } from "@/context/SidebarContext";

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();
  
  return (
    <main className={`flex-1 min-w-0 flex flex-col min-h-screen relative transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'ml-80' : 'ml-0'}`}>
      {children}
    </main>
  );
}
