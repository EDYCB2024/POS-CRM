'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Store, Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simular proceso de autenticación
    setTimeout(() => {
      // Establecer cookie de sesión (mock)
      document.cookie = "auth_session=true; path=/; max-age=86400" // 24 horas
      
      setIsLoading(false)
      router.push('/')
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      
      <div className="w-full max-w-[440px] z-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex w-20 h-20 rounded-[28px] bg-primary items-center justify-center mb-6 shadow-2xl shadow-primary/30 transform hover:scale-110 transition-transform duration-500 group">
            <Store className="text-white w-10 h-10 group-hover:rotate-12 transition-transform" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-primary uppercase">Bienvenido</h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Gestión Inteligente de Puntos de Venta</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[40px] border border-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1" htmlFor="email">
                Correo Electrónico
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  id="email"
                  type="text"
                  placeholder="usuario@empresa.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-primary placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary/20 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]" htmlFor="password">
                  Contraseña
                </label>
                <button type="button" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline opacity-60 hover:opacity-100">
                  ¿Olvidaste tu clave?
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-primary placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary/20 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full bg-primary text-white py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 relative overflow-hidden group",
                isLoading && "opacity-80 cursor-not-allowed scale-[0.98]"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Accediendo...
                </>
              ) : (
                <>
                  Acceder al Sistema
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              ¿No tienes acceso?{" "}
              <button className="text-primary hover:underline">Contacta al Administrador</button>
            </p>
          </div>
        </div>

        <div className="mt-10 flex justify-center gap-8 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
          <button className="hover:text-primary transition-colors">Privacidad</button>
          <button className="hover:text-primary transition-colors">Términos</button>
          <button className="hover:text-primary transition-colors">Soporte</button>
        </div>
      </div>
    </div>
  )
}
