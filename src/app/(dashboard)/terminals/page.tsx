'use client'

import { TopBar } from "@/components/layout/TopBar";
import { supabase } from '@/lib/supabase';
import { 
  Smartphone, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Filter, 
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  MapPin,
  RefreshCw,
  Zap,
  Store,
  Download,
  Loader2,
  Search,
  ShieldCheck,
  ShieldX
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useState, useEffect } from 'react';


const stats = [
  { label: "Total Terminals", value: "142", change: "+12%", color: "bg-secondary-container", icon: Smartphone, iconColor: "text-on-secondary-container" },
  { label: "Active Online", value: "138", change: "Stable", color: "bg-green-100", icon: CheckCircle, iconColor: "text-green-700" },
  { label: "Offline Alerts", value: "4", change: "Critical", color: "bg-red-100", icon: AlertCircle, iconColor: "text-red-700" },
];

const terminals = [
  { id: "TRM-9921", version: "V3.2.1 Stable", location: "Main Street Plaza - Store 4", status: "Online", lastSync: "2 mins ago", warranty: "si" },
  { id: "TRM-8440", version: "V3.2.1 Stable", location: "Grand Central Terminal - Kiosk B", status: "Online", lastSync: "Just now", warranty: "si" },
  { id: "TRM-7102", version: "V3.1.9 Legacy", location: "Airport West - Gate 12", status: "Offline", lastSync: "42 mins ago", warranty: "no" },
  { id: "TRM-2239", version: "V3.2.1 Stable", location: "Downtown Hub - Entrance", status: "Online", lastSync: "15 mins ago", warranty: "si" },
  { id: "TRM-5501", version: "V3.2.1 Stable", location: "Eastside Market - Aisle 3", status: "Maintenance", lastSync: "2 hours ago", warranty: "no" },
];

// Cache outside the component to persist terminals data between remounts
let cachedTerminalsData: {
  total: number;
  recent: any[];
} | null = null;

export default function TerminalsPage() {
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(!cachedTerminalsData);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [recentTerminals, setRecentTerminals] = useState<any[]>(cachedTerminalsData?.recent || []);
  const [statsData, setStatsData] = useState({
    total: cachedTerminalsData?.total || 0,
    active: Math.floor((cachedTerminalsData?.total || 0) * 0.96),
    alerts: Math.floor((cachedTerminalsData?.total || 0) * 0.04)
  });

  const fetchRealData = async (force: boolean = false) => {
    if (!force && cachedTerminalsData && !searchQuery) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      if (searchQuery) {
        setIsSearching(true);
        const { data, error } = await supabase.rpc('search_terminals', { 
          p_query: searchQuery,
          p_limit: 20 
        });
        if (error) throw error;
        
        const formatted = (data || []).map((t: any) => ({
          ...t,
          sourceTable: t.source_table
        }));
        setRecentTerminals(formatted);
      } else {
        setIsSearching(false);
        const { data, error } = await supabase.rpc('get_terminals_summary', { p_limit: 10 });
        if (error) throw error;

        if (data) {
          const { total_count, recent_terminals } = data;
          const formattedRecent = recent_terminals.map((t: any) => ({
            ...t,
            sourceTable: t.source_table
          }));

          setStatsData({
            total: total_count,
            active: Math.floor(total_count * 0.96),
            alerts: Math.floor(total_count * 0.04)
          });
          setRecentTerminals(formattedRecent);
          cachedTerminalsData = { total: total_count, recent: formattedRecent };
        }
      }
    } catch (err) {
      console.error('Error fetching terminals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only auto-fetch if not searching or if search is cleared
    if (!searchQuery) {
      fetchRealData();
    }
  }, [searchQuery]);

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      fetchRealData(true);
    }
  };

  const stats = [
    { label: "Total Terminales", value: statsData.total.toString(), change: "Sincronizado", color: "bg-secondary-container", icon: Smartphone, iconColor: "text-on-secondary-container" },
    { label: "Operativos", value: statsData.active.toString(), change: "96%", color: "bg-green-100", icon: CheckCircle, iconColor: "text-green-700" },
    { label: "Alertas / Offline", value: statsData.alerts.toString(), change: "Critico", color: "bg-red-100", icon: AlertCircle, iconColor: "text-red-700" },
  ];

  const handleExportGlobal = async () => {
    const fileName = window.prompt('Nombre del archivo:', `CRM_Global_Export_${new Date().toISOString().split('T')[0]}`);
    if (!fileName) return;

    setExporting(true);
    try {
      const { utils, write } = await import('xlsx');
      
      const tables = [
        { id: 'vatc', name: 'VATC' },
        { id: 'banplus', name: 'Banplus' },
        { id: 'ccr', name: 'CCR' },
        { id: 'instapago', name: 'Instapago' },
        { id: 'platco', name: 'Platco' },
        { id: 'platco_pos', name: 'Platco POS' },
        { id: 'exterior', name: 'Exterior' },
        { id: 'bancaribe', name: 'Bancaribe' },
        { id: 'tokenp', name: 'Token Pagos' },
        { id: 'bactivo', name: 'Banco Activo' },
        { id: 'poscom', name: 'POS Comercial' },
        { id: 'paytech', name: 'Paytech' },
        { id: 'bestpay', name: 'Bestpay' },
        { id: 'bancrecer', name: 'Bancrecer' },
        { id: 'delsur', name: 'Del Sur' },
        { id: 'otros', name: 'Otros' },
        { id: 'bd_platco', name: 'DB Platco' }
      ];

      const wb = utils.book_new();

      for (const table of tables) {
        const { data, error } = await supabase
          .from(table.id)
          .select('*');
        
        if (error) {
          console.error(`Error fetching ${table.id}:`, error);
          continue;
        }

        if (data && data.length > 0) {
          const ws = utils.json_to_sheet(data);
          utils.book_append_sheet(wb, ws, table.name.substring(0, 31)); 
        }
      }

      const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Native Save As dialog (File System Access API)
      if ('showSaveFilePicker' in window) {
        try {
          const handle = await (window as any).showSaveFilePicker({
            suggestedName: `${fileName.replace('.xlsx', '')}.xlsx`,
            types: [{
              description: 'Excel Workbook',
              accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
            }],
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
        } catch (err: any) {
          if (err.name !== 'AbortError') throw err;
        }
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName.replace('.xlsx', '')}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error exporting global data:', err);
      alert('Error al exportar los datos globales');
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <TopBar title="Gestión de Terminales" />
      
      <section className="p-margin">
        <div className="mb-xl flex justify-between items-end">
          <div>
            <h1 className="mb-xs">Gestión de Terminales</h1>
            <p className="text-body-md text-on-surface-variant">Monitoreo y exportación global de terminales POS.</p>
          </div>
          <button 
            onClick={handleExportGlobal}
            disabled={exporting}
            className="flex items-center gap-sm bg-primary text-on-primary px-lg py-md rounded-xl font-semibold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            {exporting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            {exporting ? 'Exportando...' : 'Exportar Global Excel'}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-lg rounded-xl border border-outline-variant">
              <div className="flex justify-between items-start mb-md">
                <div className={cn("p-2 rounded-lg", stat.color)}>
                  <stat.icon className={cn("w-5 h-5", stat.iconColor)} />
                </div>
                <span className="text-label-sm font-bold uppercase tracking-wider text-primary">{stat.change}</span>
              </div>
              <p className="text-label-md text-on-surface-variant mb-xs">{stat.label}</p>
              <h3 className="text-h1">{stat.value}</h3>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-outline-variant overflow-hidden">
          <div className="px-lg py-md border-b border-outline-variant bg-surface-container-low flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap gap-md items-center w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                <input 
                  type="text"
                  placeholder="Buscar serial o comercio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyPress}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-outline-variant rounded-xl text-xs font-bold text-primary placeholder:text-outline/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <button 
                onClick={() => fetchRealData(true)}
                className="px-md py-sm bg-white border border-outline-variant rounded-lg text-label-md flex items-center gap-xs hover:bg-surface-container transition-colors font-bold uppercase tracking-wider text-[10px]"
              >
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                {searchQuery ? 'Buscar' : 'Actualizar'}
              </button>
            </div>
            <div className="flex items-center gap-sm">
              <p className="text-label-sm text-on-surface-variant">
                {isSearching ? `Resultados de búsqueda: ${recentTerminals.length}` : 'Mostrando los 10 más recientes'}
              </p>
            </div>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="px-lg py-md text-label-md text-on-surface-variant">Terminal ID / Serial</th>
                <th className="px-lg py-md text-label-md text-on-surface-variant">Razón Social</th>
                <th className="px-lg py-md text-label-md text-on-surface-variant">Estatus</th>
                <th className="px-lg py-md text-label-md text-on-surface-variant">Garantía</th>
                <th className="px-lg py-md text-label-md text-on-surface-variant">Aliado / Origen</th>
                <th className="px-lg py-md text-label-md text-on-surface-variant text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-lg py-12 text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                    <p className="text-xs font-bold text-outline uppercase tracking-widest">Cargando datos recientes...</p>
                  </td>
                </tr>
              ) : recentTerminals.map((terminal) => (
                <tr key={`${terminal.sourceTable}-${terminal.id}`} className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="px-lg py-md">
                    <p className="font-semibold text-primary">{terminal.serial || terminal.serial_de_remplazo}</p>
                    <p className="text-xs text-on-surface-variant">{terminal.modelo || 'N/A'}</p>
                  </td>
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-sm">
                      <Store className="text-outline w-4 h-4" />
                      <span className="text-body-md truncate max-w-[200px]">{terminal.razon_social || terminal.razn_social || '-'}</span>
                    </div>
                  </td>
                  <td className="px-lg py-md">
                    <div className={cn(
                      "inline-flex items-center px-sm py-xs rounded-full text-label-sm font-bold border",
                      terminal.estatus?.toLowerCase().includes('entregado') || terminal.estatus?.toLowerCase().includes('operativo') 
                        ? "bg-green-50 text-green-700 border-green-200" 
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    )}>
                      {terminal.estatus || 'EN REVISION'}
                    </div>
                  </td>
                  <td className="px-lg py-md">
                    {terminal.garantia?.toLowerCase() === 'si' ? (
                      <span className="flex items-center gap-1 text-[10px] font-black text-green-600 uppercase tracking-tight">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Vigente
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-black text-red-500 uppercase tracking-tight opacity-60">
                        <ShieldX className="w-3.5 h-3.5" />
                        Vencida
                      </span>
                    )}
                  </td>
                  <td className="px-lg py-md">
                    <span className="text-[10px] font-black uppercase text-outline bg-slate-100 px-2 py-1 rounded">
                      {terminal.sourceTable.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-lg py-md text-right">
                    <button className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
