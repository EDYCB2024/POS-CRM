'use client'

import { TopBar } from "@/components/layout/TopBar";
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { createPortal } from 'react-dom';
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
  ShieldX,
  ExternalLink,
  Database,
  Trash2,
  Pencil
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useState, useEffect } from 'react';
import { TerminalDetailsModal } from "@/components/modals/TerminalDetailsModal";


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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSerial, setSelectedSerial] = useState('');
  const [selectedSlug, setSelectedSlug] = useState('');
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [exportProgress, setExportProgress] = useState(0);

  const [openMenuTerminal, setOpenMenuTerminal] = useState<any | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number, left: number } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmTerminal, setDeleteConfirmTerminal] = useState<any | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; message: string } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleDelete = async (terminal: any) => {
    if (!terminal) return;

    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from(terminal.sourceTable)
        .delete()
        .eq('id', terminal.id);

      if (error) throw error;

      // Update UI state
      setRecentTerminals(prev => prev.filter(t => !(t.sourceTable === terminal.sourceTable && t.id === terminal.id)));
      setStatsData(prev => {
        const newTotal = Math.max(0, prev.total - 1);
        return {
          total: newTotal,
          active: Math.floor(newTotal * 0.96),
          alerts: Math.floor(newTotal * 0.04)
        };
      });

      setDeleteConfirmTerminal(null);
      setSuccessModal({
        isOpen: true,
        message: `El equipo con serial ${terminal.serial || terminal.serial_de_remplazo} ha sido eliminado permanentemente de la base de datos con éxito.`
      });
    } catch (err: any) {
      console.error('Error deleting terminal:', err);
      setToast({ message: 'Error al eliminar el terminal: ' + (err.message || err), type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

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

    // Check for creation action in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'create') {
      setIsModalOpen(true);
      // Remove param after opening
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleGlobalClick = () => {
      setOpenMenuTerminal(null);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
    };
  }, []);

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
    // 1. Get handle immediately to preserve user gesture
    let fileHandle: any = null;
    const defaultFileName = `CRM_Global_Export_${new Date().toISOString().split('T')[0]}.xlsx`;

    if ('showSaveFilePicker' in window) {
      try {
        fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: defaultFileName,
          types: [{
            description: 'Excel Workbook',
            accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
          }],
        });
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error('Picker error:', err);
      }
    }

    setExporting(true);
    setExportProgress(0);
    try {
      const { utils, write } = await import('xlsx');

      // Fetch dynamic allies from config
      const { data: alliesConfig } = await supabase
        .from('allies_config')
        .select('name, table_name')
        .eq('is_active', true);

      const tables = [
        ...(alliesConfig || []).map(a => ({ id: a.table_name, name: a.name })),
        { id: 'bd_clientes', name: 'BD Clientes' },
        { id: 'bd_platco', name: 'BD Platco' }
      ];

      const wb = utils.book_new();
      const totalTables = tables.length;

      for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        setExportProgress(Math.round((i / totalTables) * 100));

        let allData: any[] = [];
        let from = 0;
        const limit = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data, error } = await supabase
            .from(table.id)
            .select('*')
            .range(from, from + limit - 1);

          if (error) {
            console.error(`Error fetching ${table.id}:`, error);
            hasMore = false;
            continue;
          }

          if (data && data.length > 0) {
            allData = [...allData, ...data];
            from += limit;
            if (data.length < limit) hasMore = false;
          } else {
            hasMore = false;
          }
        }

        if (allData.length > 0) {
          const formattedData = allData.map(item => {
            const newItem: any = {};
            Object.keys(item).forEach(key => {
              if (!['id', 'created_at', 'modificado_crm'].includes(key)) {
                newItem[key.replace(/_/g, ' ').toUpperCase()] = item[key];
              }
            });
            return newItem;
          });

          const ws = utils.json_to_sheet(formattedData);
          utils.book_append_sheet(wb, ws, table.name.substring(0, 31));
        }
      }

      setExportProgress(100);
      const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // 3. Write to handle or fallback
      if (fileHandle) {
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = defaultFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

    } catch (err: any) {
      console.error('Error exporting global data:', err);
      setToast({ message: 'Error al exportar los datos. Por favor revise la consola.', type: 'error' });
    } finally {
      setExporting(false);
      setTimeout(() => setExportProgress(0), 1000);
    }
  };


  return (
    <>
      <TopBar title="Gestión de Terminales" />

      <section className="p-margin">
        <div className="mb-xl flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="mb-xs text-2xl md:text-3xl">Gestión de Terminales</h1>
            <p className="text-body-md text-on-surface-variant">Monitoreo y exportación global de terminales POS (Cantidad Total: {statsData.total.toLocaleString()}).</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <button
                onClick={handleExportGlobal}
                disabled={exporting}
                className="flex items-center gap-sm bg-primary text-on-primary px-lg py-md rounded-xl font-semibold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 w-full sm:min-w-[200px] justify-center"
              >
                {exporting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                {exporting ? `Exportando (${exportProgress}%)` : 'Exportar Global Excel'}
              </button>
              {exporting && (
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>



        <div className="bg-white rounded-xl border border-outline-variant overflow-hidden">
          <div className="px-lg py-md border-b border-outline-variant bg-surface-container-low flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-md items-center w-full md:w-auto">
              <div className="relative w-full sm:w-64">
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
                className="w-full sm:w-auto px-md py-sm bg-white border border-outline-variant rounded-lg text-label-md flex items-center gap-xs justify-center hover:bg-surface-container transition-colors font-bold uppercase tracking-wider text-[10px]"
              >
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                {searchQuery ? 'Buscar' : 'Actualizar'}
              </button>
            </div>
            <div className="flex items-center gap-sm w-full md:w-auto justify-center md:justify-end">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                {isSearching ? `Resultados: ${recentTerminals.length}` : 'Top 10 Recientes'}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse min-w-[800px]">
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
                  <tr
                    key={`${terminal.sourceTable}-${terminal.id}`}
                    onClick={() => {
                      setSelectedSerial(terminal.serial || terminal.serial_de_remplazo);
                      setSelectedSlug(terminal.sourceTable);
                      setSelectedRow(terminal);
                      setIsModalOpen(true);
                    }}
                    className="hover:bg-primary/5 transition-colors group cursor-pointer"
                  >
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
                    <td className="px-lg py-md text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/print/informe?serial=${terminal.serial || terminal.serial_de_remplazo}`}
                          target="_blank"
                          className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-all"
                          title="Ver Informe"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            setMenuPosition({
                              top: rect.bottom + window.scrollY,
                              left: rect.left + window.scrollX - 120
                            });
                            setOpenMenuTerminal(terminal);
                          }}
                          className="p-2 hover:bg-primary/10 rounded-lg text-on-surface-variant hover:text-primary active:scale-95 transition-all cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <TerminalDetailsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedRow(null)
        }}
        serial={selectedSerial}
        currentSlug={selectedSlug}
        isNew={!selectedSerial}
        onSuccess={() => fetchRealData(true)}
        initialData={selectedRow}
      />

      {openMenuTerminal && menuPosition && createPortal(
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute z-[9999] min-w-[190px] bg-white/95 backdrop-blur-md rounded-2xl border border-outline-variant shadow-2xl p-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          style={{ top: menuPosition.top + 4, left: menuPosition.left }}
        >
          <button
            onClick={() => {
              setSelectedSerial(openMenuTerminal.serial || openMenuTerminal.serial_de_remplazo);
              setSelectedSlug(openMenuTerminal.sourceTable);
              setSelectedRow(openMenuTerminal);
              setIsModalOpen(true);
              setOpenMenuTerminal(null);
            }}
            className="w-full text-left px-4 py-3 text-xs font-bold text-slate-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-all flex items-center gap-3 active:scale-98"
          >
            <Pencil className="w-4 h-4 text-slate-500" />
            Editar Equipo
          </button>
          <button
            onClick={() => {
              setDeleteConfirmTerminal(openMenuTerminal);
              setOpenMenuTerminal(null);
            }}
            className="w-full text-left px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50/80 rounded-xl transition-all flex items-center gap-3 active:scale-98"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
            Eliminar Equipo
          </button>
        </div>,
        document.body
      )}

      {deleteConfirmTerminal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={() => setDeleteConfirmTerminal(null)}
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm transition-opacity duration-300"
          />

          {/* Modal Container */}
          <div className="bg-surface rounded-[32px] border border-outline-variant shadow-2xl w-[440px] max-w-[95vw] overflow-hidden relative z-10 p-8 text-center flex flex-col items-center transition-all duration-300 scale-100">
            <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mb-6">
              <Trash2 className="w-8 h-8 text-red-600 animate-pulse" />
            </div>

            <h3 className="text-xl font-black text-on-surface mb-2 uppercase tracking-wide">
              ¿Confirmar Eliminación?
            </h3>

            <p className="text-sm font-bold text-on-surface-variant mb-6 leading-relaxed">
              ¿Estás seguro de que deseas eliminar el terminal con serial <strong className="text-primary font-extrabold">{deleteConfirmTerminal.serial || deleteConfirmTerminal.serial_de_remplazo}</strong>?
              <br />
              <span className="text-xs font-semibold text-outline">Esta acción no se puede deshacer y borrará permanentemente el registro de la tabla <strong className="uppercase">{deleteConfirmTerminal.sourceTable}</strong>.</span>
            </p>

            <div className="flex gap-4 w-full">
              <button
                onClick={() => setDeleteConfirmTerminal(null)}
                disabled={isDeleting}
                className="flex-1 py-3 border border-outline-variant rounded-2xl font-bold text-xs uppercase tracking-widest text-on-surface hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmTerminal)}
                disabled={isDeleting}
                className="flex-1 py-3 bg-red-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-red-600/20 cursor-pointer"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {toast && createPortal(
        <div className="fixed top-6 right-6 z-[99999] animate-in slide-in-from-right-10 fade-in duration-300">
          <div className={cn(
            "bg-white/95 backdrop-blur-md border shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl p-4 flex items-center gap-4 min-w-[320px] max-w-[400px]",
            toast.type === 'success' ? "border-green-100" : "border-red-100"
          )}>
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center border",
              toast.type === 'success' ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
            )}>
              {toast.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 animate-bounce" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 animate-bounce" />
              )}
            </div>
            <div className="flex-1">
              <h4 className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                toast.type === 'success' ? "text-green-600" : "text-red-600"
              )}>
                {toast.type === 'success' ? 'Operación Exitosa' : 'Error en Operación'}
              </h4>
              <p className="text-xs font-bold text-slate-700 mt-0.5">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>,
        document.body
      )}

      {successModal && successModal.isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={() => setSuccessModal(null)}
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm transition-opacity duration-300"
          />

          {/* Modal Container */}
          <div className="bg-surface rounded-[32px] border border-outline-variant shadow-2xl w-[440px] max-w-[95vw] overflow-hidden relative z-10 p-8 text-center flex flex-col items-center animate-in zoom-in duration-300 scale-100">
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-emerald-600 animate-bounce" />
            </div>

            <h3 className="text-xl font-black text-on-surface mb-2 uppercase tracking-wide">
              ¡Operación Exitosa!
            </h3>

            <p className="text-sm font-bold text-on-surface-variant mb-6 leading-relaxed">
              {successModal.message}
            </p>

            <button
              onClick={() => setSuccessModal(null)}
              className="w-full py-3 bg-primary text-on-primary rounded-2xl font-bold text-xs uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20 cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
