'use client'

import { TopBar } from "@/components/layout/TopBar";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Building2, Settings2, ShieldCheck, Box, Tag, Calendar, AlertTriangle, Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";

const technicalStats = [
  { label: "Equipos Registrados", value: "2,204", icon: Box, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Certificaciones OK", value: "100%", icon: ShieldCheck, color: "text-green-600", bg: "bg-green-50" },
  { label: "Pendientes Técnico", value: "14", icon: Settings2, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Fallas Reportadas", value: "3", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
];

import { ExcelUploadButton } from "@/components/ui/ExcelUploadButton";

export default function BdPlatcoPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;
  const fetchData = async () => {
    try {
      setLoading(true);
      const from = page * pageSize;
      const to = from + pageSize - 1;

      let query = supabase.from('bd_platco').select('*', { count: 'exact' });
      
      if (searchTerm) {
        query = query.or(`seriales.ilike.%${searchTerm}%,imei_1.ilike.%${searchTerm}%,imei_2.ilike.%${searchTerm}%`);
      }
      
      const { data: platcoData, error, count } = await query
        .order('seriales')
        .range(from, to);

      if (error) throw error;
      setData(platcoData || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error("Error fetching platco data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm, page]);

  return (
    <>
      <TopBar title="Data Center - BD PLATCO" />
      
      <section className="p-8">
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary rounded-2xl shadow-lg shadow-primary/20">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-primary">BD PLATCO</h1>
              <p className="text-on-surface-variant font-medium">Gestión de inventario maestro y equipos.</p>
            </div>
          </div>
          <ExcelUploadButton 
            tableName="bd_platco" 
            label="Actualizar BD Platco (Excel)"
            onUploadComplete={fetchData}
          />
        </div>

        {/* Inventory Table Section */}
        <div className="bg-white rounded-3xl border border-outline-variant overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-outline-variant flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-6">
              <h3 className="font-black text-on-surface uppercase tracking-tight flex items-center gap-2">
                <Box className="w-5 h-5 text-primary" />
                Inventario Maestro Platco
              </h3>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Buscar serial o IMEI..." 
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-outline-variant rounded-xl text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                Mostrando {page * pageSize + 1}-{Math.min((page + 1) * pageSize, totalCount)} de {totalCount}
              </p>
              <div className="flex border border-outline-variant rounded-md overflow-hidden bg-white">
                <button 
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-1.5 hover:bg-surface-container border-r border-outline-variant disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setPage(p => p + 1)}
                  disabled={(page + 1) * pageSize >= totalCount}
                  className="p-1.5 hover:bg-surface-container disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-xs font-bold text-outline uppercase tracking-widest">Consultando Inventario...</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-outline-variant">
                    <th className="px-8 py-4 text-[10px] text-on-surface-variant uppercase font-black tracking-widest">No.</th>
                    <th className="px-8 py-4 text-[10px] text-on-surface-variant uppercase font-black tracking-widest">SERIALES</th>
                    <th className="px-8 py-4 text-[10px] text-on-surface-variant uppercase font-black tracking-widest">FECHA DE ENTREGA</th>
                    <th className="px-8 py-4 text-[10px] text-on-surface-variant uppercase font-black tracking-widest">IMEI-1</th>
                    <th className="px-8 py-4 text-[10px] text-on-surface-variant uppercase font-black tracking-widest">IMEI-2</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {data.length > 0 ? data.map((item, index) => (
                    <tr key={item.id} className="hover:bg-primary/5 transition-colors group">
                      <td className="px-8 py-4 text-xs font-bold text-outline">{item.no || (index + 1).toString().padStart(3, '0')}</td>
                      <td className="px-8 py-4">
                        <p className="text-sm font-black text-primary font-mono">{item.seriales}</p>
                      </td>
                      <td className="px-8 py-4 text-xs font-bold text-on-surface uppercase">
                        {item.fecha_de_entrega || '-'}
                      </td>
                      <td className="px-8 py-4 text-xs font-medium text-on-surface-variant font-mono">
                        {item.imei_1 || '-'}
                      </td>
                      <td className="px-8 py-4 text-xs font-medium text-on-surface-variant font-mono">
                        {item.imei_2 || '-'}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="p-20 text-center">
                        <p className="text-sm font-bold text-outline uppercase tracking-widest">No hay equipos en el inventario</p>
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
