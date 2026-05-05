'use client'

import { TopBar } from "@/components/layout/TopBar";
import { Building2, Settings2, ShieldCheck, Box, Tag, Calendar, AlertTriangle } from 'lucide-react';
import { cn } from "@/lib/utils";

const technicalStats = [
  { label: "Equipos Registrados", value: "2,204", icon: Box, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Certificaciones OK", value: "100%", icon: ShieldCheck, color: "text-green-600", bg: "bg-green-50" },
  { label: "Pendientes Técnico", value: "14", icon: Settings2, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Fallas Reportadas", value: "3", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
];

export default function BdPlatcoPage() {
  return (
    <>
      <TopBar title="Data Center - BD PLATCO" />
      
      <section className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-primary rounded-2xl shadow-lg shadow-primary/20">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-primary">BD PLATCO</h1>
              <p className="text-on-surface-variant font-medium">Gestión técnica y de inventario exclusiva para Platco.</p>
            </div>
          </div>
        </div>

        {/* Technical Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {technicalStats.map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm">
              <div className="flex items-center gap-4 mb-3">
                <div className={cn("p-2 rounded-lg", stat.bg)}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{stat.label}</span>
              </div>
              <p className="text-3xl font-black text-on-surface">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-outline-variant overflow-hidden shadow-sm">
            <div className="px-8 py-6 border-b border-outline-variant bg-slate-50 flex justify-between items-center">
              <h3 className="font-black text-primary uppercase tracking-tight flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Configuración de Parámetros
              </h3>
              <button className="text-xs font-bold text-primary hover:underline">Editar Parámetros</button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2 block">Protocolo de Sync</label>
                  <p className="text-sm font-bold bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">HTTPS / REST API - Google Apps Script</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2 block">Última Auditoría</label>
                  <p className="text-sm font-bold bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">05 May 2026 - 10:22 AM</p>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2 block">Rutas de Sincronización</label>
                <div className="space-y-2 mt-3">
                  {['Inbound: Google Sheets -> Supabase (Auto)', 'Outbound: Supabase -> Google Sheets (Manual)'].map((route, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs font-medium text-on-surface p-3 bg-white border border-outline-variant rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      {route}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-primary text-white p-8 rounded-3xl shadow-xl shadow-primary/20 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-black uppercase mb-2">Sync Master</h3>
                <p className="text-white/80 text-sm mb-6">Fuerza la sincronización total de la base de datos Platco con el servidor central.</p>
                <button className="w-full py-3 bg-white text-primary rounded-xl font-black text-sm uppercase hover:bg-slate-100 transition-all">
                  Iniciar Sync Total
                </button>
              </div>
              <Building2 className="absolute -right-8 -bottom-8 w-40 h-40 text-white/10 rotate-12" />
            </div>

            <div className="bg-white p-8 rounded-3xl border border-outline-variant shadow-sm">
              <h3 className="font-black text-on-surface uppercase tracking-tight mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Historial Técnico
              </h3>
              <div className="space-y-4">
                {[
                  { event: "Actualización de Inventario", time: "2 horas" },
                  { event: "Limpieza de advice/reversos", time: "Ayer" },
                  { event: "Configuración APN Platco", time: "3 días" }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-outline-variant pb-2 last:border-0">
                    <span className="text-xs font-bold text-on-surface-variant">{item.event}</span>
                    <span className="text-[10px] font-medium text-outline italic">hace {item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
