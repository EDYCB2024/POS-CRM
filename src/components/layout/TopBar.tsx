'use client'

import { useState, useEffect } from 'react'
import { Bell, LogOut, Menu } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useSidebar } from '@/context/SidebarContext'

interface TopBarProps {
  title: string
}

export function TopBar({ title }: TopBarProps) {
  const { toggle } = useSidebar()
  const [profile, setProfile] = useState<{ full_name: string | null; role: string | null; email: string | null } | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, role, email, nombre, apellido, alias, status')
          .eq('id', user.id)
          .single()

        const isSuperUser = user.email === 'edcastilloblanco@gmail.com' || user.email === 'edycb2025@gmail.com'

        if (data) {
          // Si el usuario tiene estatus "pendiente", se activa automáticamente al abrir la app
          if (data.status === 'pending') {
            await supabase
              .from('profiles')
              .update({ status: 'active' })
              .eq('id', user.id)
          }

          const name = data.alias || data.nombre || data.full_name || user.email?.split('@')[0] || 'Usuario'
          setProfile({
            full_name: name,
            role: isSuperUser ? 'admin' : (data.role || 'editor'),
            email: user.email || ''
          })
        } else {
          setProfile({
            full_name: user.email?.split('@')[0] || 'Usuario',
            role: isSuperUser ? 'admin' : 'editor',
            email: user.email || ''
          })
        }
      } catch (err) {
        console.error('Error fetching profile in TopBar:', err)
      }
    }
    fetchProfile()
  }, [])

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

  const getRoleLabel = (role: string | null) => {
    switch (role) {
      case 'admin': return 'Administrador'
      case 'editor': return 'Editor'
      case 'viewer': return 'Lector'
      case 'staff': return 'Soporte Técnico'
      default: return 'Usuario'
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
    }
    return parts[0].substring(0, 2).toUpperCase()
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
            {!profile ? (
              <div className="flex items-center gap-3 animate-pulse">
                <div className="text-right hidden md:block space-y-1">
                  <div className="h-3 w-16 bg-slate-100 rounded" />
                  <div className="h-2 w-10 bg-slate-100 rounded" />
                </div>
                <div className="h-9 w-9 rounded-full bg-slate-100" />
              </div>
            ) : (
              <>
                <div className="text-right hidden md:block">
                  <p className="text-[10px] font-black uppercase text-primary leading-none">{profile.full_name}</p>
                  <p className="text-[9px] font-bold text-outline uppercase tracking-widest mt-1">{getRoleLabel(profile.role)}</p>
                </div>
                <div className="h-9 w-9 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-black text-xs shadow-inner uppercase">
                  {getInitials(profile.full_name)}
                </div>
              </>
            )}
            
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
