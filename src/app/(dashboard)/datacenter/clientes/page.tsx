'use client'

import { TopBar } from "@/components/layout/TopBar";
import { Users, Search, Filter, Plus, MoreVertical, Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { ShieldCheck, ShieldX } from 'lucide-react';


import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ExcelUploadButton } from '@/components/ui/ExcelUploadButton';

export default function ClientsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [warrantyFilter, setWarrantyFilter] = useState<string>('');

  const fetchData = async () => {
    try {
      setLoading(true);
      let query = supabase.from('bd_clientes').select('*');
      
      if (searchTerm) {
        query = query.or(`cliente.ilike.%${searchTerm}%,serial.ilike.%${searchTerm}%,razon.ilike.%${searchTerm}%`);
      }
      
      const { data: clientsData, error } = await query.order('cliente');
      if (error) throw error;
      setData(clientsData || []);
    } catch (err) {
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm]);

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
            <p className="text-on-surface-variant text-sm font-medium mt-1">Gestión de clientes nuevos y activos.</p>
          </div>
          <div className="flex gap-3">
            <ExcelUploadButton 
              tableName="bd_clientes" 
              onUploadComplete={fetchData} 
              label="Cargar Excel Clientes"
            />
            <button className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/10">
              <Plus className="w-5 h-5" />
              Nuevo Registro
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-outline-variant overflow-hidden shadow-sm">
          {/* Toolbar */}
          <div className="px-6 py-4 border-b border-outline-variant bg-slate-50/50 flex justify-between items-center">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
              <input 
                type="text" 
                placeholder="Buscar por cliente, serial o razón..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm font-bold text-outline uppercase tracking-widest">Consultando Clientes...</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-blue-50/50 border-b border-outline-variant">
                    <th className="px-6 py-4 text-[10px] text-on-surface-variant uppercase font-black tracking-widest">Serial</th>
                    <th className="px-6 py-4 text-[10px] text-on-surface-variant uppercase font-black tracking-widest">Cliente</th>
                    <th className="px-6 py-4 text-[10px] text-on-surface-variant uppercase font-black tracking-widest">RAZON</th>
                    <th className="px-6 py-4 text-[10px] text-on-surface-variant uppercase font-black tracking-widest">Banco</th>
                    <th className="px-6 py-4 text-[10px] text-on-surface-variant uppercase font-black tracking-widest">Procesadora</th>
                    <th className="px-6 py-4 text-[10px] text-on-surface-variant uppercase font-black tracking-widest">Fecha</th>
                    <th className="px-6 py-4 text-[10px] text-on-surface-variant uppercase font-black tracking-widest">Plan</th>
                    <th className="px-6 py-4 text-[10px] text-on-surface-variant uppercase font-black tracking-widest">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {data.length > 0 ? data.map((item) => (
                    <tr key={item.id} className="hover:bg-primary/5 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="text-xs font-black text-primary font-mono">{item.serial || '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-on-surface uppercase truncate max-w-[150px]">{item.cliente || '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-medium text-on-surface-variant uppercase truncate max-w-[200px]">{item.razon || '-'}</p>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-on-surface uppercase">{item.banco || '-'}</td>
                      <td className="px-6 py-4 text-xs font-bold text-on-surface uppercase">{item.procesadora || '-'}</td>
                      <td className="px-6 py-4 text-xs font-medium text-on-surface-variant">{item.fecha || '-'}</td>
                      <td className="px-6 py-4 text-xs font-black text-primary uppercase">{item.plan || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                          item.estatus?.toLowerCase() === 'activo' || item.status?.toLowerCase() === 'active'
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : "bg-red-50 text-red-700 border-red-200"
                        )}>
                          {item.estatus || item.status || 'Activo'}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={8} className="p-20 text-center">
                        <p className="text-sm font-bold text-outline uppercase tracking-widest">No hay datos disponibles</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
