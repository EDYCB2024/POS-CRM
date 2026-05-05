'use client'

import { TopBar } from "@/components/layout/TopBar";
import { Database, Server, Shield, Activity, HardDrive, Cpu } from 'lucide-react';

const systems = [
  { name: "Main Database", status: "Operational", uptime: "99.9%", load: "12%", icon: Database },
  { name: "POS Sync Service", status: "Active", uptime: "100%", load: "5%", icon: Activity },
  { name: "Backup Server", status: "Standby", uptime: "98.5%", load: "0%", icon: HardDrive },
  { name: "Security Gate", status: "Operational", uptime: "100%", load: "2%", icon: Shield },
];

export default function DataCenterPage() {
  return (
    <>
      <TopBar title="Data Center" />
      
      <section className="p-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tight text-primary flex items-center gap-3">
            <Server className="w-8 h-8" />
            Data Center
          </h1>
          <p className="text-on-surface-variant mt-2 font-medium">Infraestructura centralizada de gestión de datos y sincronización.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {systems.map((system) => (
            <div key={system.name} className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-primary/5 rounded-xl">
                  <system.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-full border border-green-200 uppercase">
                  {system.status}
                </span>
              </div>
              <h3 className="font-bold text-on-surface">{system.name}</h3>
              <div className="mt-4 flex justify-between text-xs text-on-surface-variant font-medium">
                <span>Uptime: {system.uptime}</span>
                <span>Load: {system.load}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-surface-container-low rounded-3xl p-12 border border-outline-variant flex flex-col items-center text-center gap-6">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
            <Cpu className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-primary">Technical Infrastructure</h2>
            <p className="text-on-surface-variant max-w-md mt-2">
              Esta sección servirá para monitorear el estado de las sincronizaciones con Google Sheets y la salud de la base de datos Supabase.
            </p>
          </div>
          <button className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20">
            View System Logs
          </button>
        </div>
      </section>
    </>
  );
}
