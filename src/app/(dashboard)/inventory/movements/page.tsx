'use client'

import { ListChecks, ArrowUpRight, ArrowDownLeft, Clock, Search, Filter } from 'lucide-react'
import { cn } from "@/lib/utils"

const movements = [
  { id: 1, type: 'entry', model: 'N950', quantity: 50, date: '2026-05-08 10:30', user: 'Admin', status: 'completed' },
  { id: 2, type: 'exit', model: 'ME60', quantity: 15, date: '2026-05-08 09:15', user: 'Soporte', status: 'completed' },
  { id: 3, type: 'entry', model: 'SP600', quantity: 100, date: '2026-05-07 16:45', user: 'Logística', status: 'pending' },
  { id: 4, type: 'exit', model: 'N750', quantity: 5, date: '2026-05-07 14:20', user: 'Admin', status: 'completed' },
]

export default function MovementsPage() {
  return (
    <div className="p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight text-primary uppercase">Movimientos</h1>
        <p className="text-secondary font-medium">Historial de entradas y salidas de equipos del inventario.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-outline-variant/30 shadow-sm">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40" />
          <input 
            type="text" 
            placeholder="Buscar por modelo, usuario o ID..." 
            className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-6 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl text-sm font-bold text-primary hover:bg-primary hover:text-white transition-all">
            <Filter className="w-4 h-4" />
            Filtros
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
            <ArrowDownLeft className="w-4 h-4" />
            Registrar Entrada
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-2xl text-sm font-bold shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
            <ArrowUpRight className="w-4 h-4" />
            Registrar Salida
          </button>
        </div>
      </div>

      {/* Movements Table Placeholder */}
      <div className="bg-white rounded-3xl border border-outline-variant/30 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-outline-variant/30">
                <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-[0.2em]">Tipo</th>
                <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-[0.2em]">Modelo</th>
                <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-[0.2em]">Cantidad</th>
                <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-[0.2em]">Fecha/Hora</th>
                <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-[0.2em]">Usuario</th>
                <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-[0.2em]">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {movements.map((m) => (
                <tr key={m.id} className="hover:bg-primary/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className={cn(
                      "flex items-center gap-2 w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                      m.type === 'entry' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {m.type === 'entry' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                      {m.type === 'entry' ? 'Entrada' : 'Salida'}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-primary">{m.model}</td>
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-on-surface-variant">{m.quantity} unds</span>
                  </td>
                  <td className="px-6 py-4 text-secondary text-sm flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 opacity-40" />
                    {m.date}
                  </td>
                  <td className="px-6 py-4 font-medium text-on-surface-variant">{m.user}</td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      m.status === 'completed' ? "bg-green-500" : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse"
                    )} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
