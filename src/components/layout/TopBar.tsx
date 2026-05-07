'use client'

import { Bell } from 'lucide-react'

interface TopBarProps {
  title: string
}

export function TopBar({ title }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-outline-variant flex justify-between items-center w-full px-6 py-3">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-on-surface">{title}</h1>
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
          </div>
        </div>
      </div>
    </header>
  )
}
