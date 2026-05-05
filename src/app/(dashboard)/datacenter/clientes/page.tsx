'use client'

import { TopBar } from "@/components/layout/TopBar";
import { Users, Search, Filter, Plus, MoreVertical, Mail, Phone, MapPin } from 'lucide-react';
import { cn } from "@/lib/utils";

const clients = [
  { id: "CL-001", name: "Inversiones Laury", rif: "J080066227", email: "contacto@laury.com", phone: "0412-5556677", location: "Caracas, DC", status: "Active" },
  { id: "CL-002", name: "Javier Forsyth", rif: "V148944560", email: "j.forsyth@gmail.com", phone: "0424-1112233", location: "Maracay, AR", status: "Active" },
  { id: "CL-003", name: "Eastside Market", rif: "J407487345", email: "admin@eastside.com", phone: "0414-9998877", location: "Valencia, CA", status: "Pending" },
  { id: "CL-004", name: "Downtown Hub", rif: "J312245678", email: "hub@downtown.ve", phone: "0212-3334455", location: "Caracas, DC", status: "Inactive" },
];

export default function ClientsPage() {
  return (
    <>
      <TopBar title="BD Clientes" />
      
      <section className="p-6">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-primary flex items-center gap-3">
              <Users className="w-7 h-7" />
              Base de Datos de Clientes
            </h1>
            <p className="text-on-surface-variant text-sm font-medium mt-1">Gestión centralizada de todos los aliados y comercios.</p>
          </div>
          <button className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/10">
            <Plus className="w-5 h-5" />
            Nuevo Cliente
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-outline-variant overflow-hidden shadow-sm">
          {/* Toolbar */}
          <div className="px-6 py-4 border-b border-outline-variant bg-slate-50/50 flex justify-between items-center">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
              <input 
                type="text" 
                placeholder="Buscar por nombre, RIF o ID..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-xl text-xs font-bold hover:bg-white transition-all uppercase tracking-wider">
                <Filter className="w-3.5 h-3.5" />
                Filtros
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-50/50 border-b border-outline-variant">
                  <th className="px-6 py-4 text-[10px] text-on-surface-variant uppercase font-black tracking-widest">ID / RIF</th>
                  <th className="px-6 py-4 text-[10px] text-on-surface-variant uppercase font-black tracking-widest">Cliente</th>
                  <th className="px-6 py-4 text-[10px] text-on-surface-variant uppercase font-black tracking-widest">Contacto</th>
                  <th className="px-6 py-4 text-[10px] text-on-surface-variant uppercase font-black tracking-widest">Ubicación</th>
                  <th className="px-6 py-4 text-[10px] text-on-surface-variant uppercase font-black tracking-widest">Estatus</th>
                  <th className="px-6 py-4 text-[10px] text-on-surface-variant uppercase font-black tracking-widest text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-xs font-black text-primary">{client.id}</p>
                      <p className="text-[10px] text-on-surface-variant font-bold">{client.rif}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-on-surface">{client.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
                          <Mail className="w-3 h-3 text-primary/60" />
                          {client.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
                          <Phone className="w-3 h-3 text-primary/60" />
                          {client.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
                        <MapPin className="w-3.5 h-3.5 text-outline" />
                        {client.location}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                        client.status === 'Active' && "bg-green-50 text-green-700 border-green-200",
                        client.status === 'Pending' && "bg-amber-50 text-amber-700 border-amber-200",
                        client.status === 'Inactive' && "bg-red-50 text-red-700 border-red-200"
                      )}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-surface-container rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4 text-on-surface-variant" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
