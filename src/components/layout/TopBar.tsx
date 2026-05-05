'use client'

import { Search, Bell, Settings } from 'lucide-react'

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
        {/* Global search removed */}
        <div className="flex items-center gap-2">
          <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors active:opacity-80">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors active:opacity-80">
            <Settings className="w-5 h-5" />
          </button>
          <div className="h-8 w-8 rounded-full bg-outline-variant overflow-hidden border border-outline">
            <img 
              alt="User Avatar" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtOtwoMmgYc344qVUlKKaEOqzwmWW02wwvcIrLF216tPBexe2RHPhHK_kvDP4dRIELaOrtzS8zZ9Gm3iKF_tmlFjd5fPqkulgv6_zx34SpSTBwzlHFtimA7_aG9t9_Xf74gGGlLK-I7mg6av2hjh8Gu_HziU73abX7eLjztfT7iIJWIpBBSK0DseaDtlZ95VszApQUwBVIqS5Rodu9IUuPtkyyeRXVueiLMB-m35nC8QwU0sJYJV4OPgreKmzQ9FKk15b3m_UtFhU"
            />
          </div>
        </div>
      </div>
    </header>
  )
}
