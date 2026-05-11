'use client'

import { Bell, LogOut, Menu } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useSidebar } from '@/context/SidebarContext'

interface TopBarProps {
  title: string
}

export function TopBar({ title }: TopBarProps) {
  const { toggle } = useSidebar()
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = '/login'
    } catch (error) {
      console.error('Error signing out:', error)
      // Fallback redirect
      window.location.href = '/login'
    }
  }

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-outline-variant flex justify-between items-center w-full px-6 py-3">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggle}
          className="p-2 -ml-2 text-primary hover:bg-primary/5 rounded-lg lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-on-surface truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors active:opacity-80">
            <Bell className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 pl-4 border-l border-outline-variant ml-2">
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-black uppercase text-primary leading-none">Administrador</p>
              <p className="text-[9px] font-bold text-outline uppercase tracking-widest mt-1">Super User</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-black text-xs shadow-inner">
              AD
            </div>
            
            <button 
              onClick={handleLogout}
              className="ml-2 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-95 group"
              title="Cerrar Sesión"
            >
              <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
