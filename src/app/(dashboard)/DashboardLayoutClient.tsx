'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { supabase } from "@/lib/supabase";

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();
  const router = useRouter();

  useEffect(() => {
    const checkPendingStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Fetch their profile to see if they are still 'pending'
          const { data: profile } = await supabase
            .from('profiles')
            .select('status')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profile && profile.status === 'pending') {
            console.log('[Layout] Pending user detected, redirecting to setup-password');
            router.push('/auth/setup-password');
          }
        }
      } catch (err) {
        console.error('Error checking user status in layout:', err);
      }
    };
    checkPendingStatus();
  }, [router]);
  
  return (
    <main className={`flex-1 min-w-0 flex flex-col min-h-screen relative transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'lg:ml-80' : 'ml-0'}`}>
      {children}
    </main>
  );
}
