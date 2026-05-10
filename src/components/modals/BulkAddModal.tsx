"use client";

import React, { useState, useEffect } from "react"
import {
  X,
  PlusCircle,
  Database,
  Users,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

interface BulkAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function BulkAddModal({ isOpen, onClose, onSuccess }: BulkAddModalProps) {
  const [loading, setLoading] = useState(false)
  const [fetchingAllies, setFetchingAllies] = useState(true)
  const [allies, setAllies] = useState<any[]>([])
  const [defaultAliados, setDefaultAliados] = useState<any[]>([])
  const [statuses, setStatuses] = useState<string[]>([])
  const [availableModels, setAvailableModels] = useState<{ linux: string[], android: string[] }>({ linux: [], android: [] })
  const [selectedAlly, setSelectedAlly] = useState('')
  const [serialsText, setSerialsText] = useState('')
  const [model, setModel] = useState('N910')
  const [status, setStatus] = useState('DISPONIBLE')
  const [warranty, setWarranty] = useState('POR DEFINIR')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const { data: alliesData } = await supabase
            .from('allies_config')
            .select('*')
            .eq('is_active', true)
            .order('name', { ascending: true });

          const { data: defaultsData } = await supabase
            .from('default_aliados')
            .select('*');

          const { data: statusData } = await supabase
            .from('estatus')
            .select('estatus')
            .order('estatus');

          setAllies(alliesData || []);
          setDefaultAliados(defaultsData || []);
          if (statusData) setStatuses(statusData.map(s => s.estatus).filter(Boolean));

          // Fetch models from central table
          const { data: modData } = await supabase
            .from('modelos')
            .select('linux, android')
            .order('id');
          
          if (modData) {
            const linux = Array.from(new Set(modData.map(m => m.linux).filter(Boolean)));
            const android = Array.from(new Set(modData.map(m => m.android).filter(Boolean)));
            setAvailableModels({ linux, android });
          }
        } catch (err) {
          console.error('Error fetching data:', err);
          setError('No se pudieron cargar los datos necesarios');
        } finally {
          setFetchingAllies(false);
        }
      };
      fetchData();
    } else {
      // Reset state when closing
      setSerialsText('');
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const serialList = serialsText
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (!selectedAlly) {
      setError('Debes seleccionar un aliado');
      return;
    }

    if (serialList.length === 0) {
      setError('Debes ingresar al menos un serial');
      return;
    }

    setLoading(true);
    try {
      const selectedAllyConfig = allies.find(a => a.name === selectedAlly);
      const actualTableName = selectedAllyConfig?.table_name || selectedAlly;
      
      // Procesar cada serial para calcular el ingreso y buscar datos externos
      const processedRows = await Promise.all(serialList.map(async (serial) => {
        // 1. Calcular número de ingreso en la tabla del aliado
        const { count } = await supabase
          .from(actualTableName)
          .select('*', { count: 'exact', head: true })
          .eq('serial', serial);
        
        const nextIngreso = (count || 0) + 1;

        // 2. Buscar datos externos si aplica
        let externalData: any = {};
        if (actualTableName === 'vatc') {
          const { data } = await supabase
            .from('bd_clientes')
            .select('razon, cliente, procesadora')
            .eq('serial', serial);
          
          if (data && data.length > 0) {
            const latest = data[data.length - 1];
            externalData = {
              razon_social: latest.razon,
              rif: latest.cliente,
              procesadora: latest.procesadora,
              factura: 'CARGA MASIVA'
            };
          }
        } else if (actualTableName === 'platco' || actualTableName === 'platco_pos') {
          const { data } = await supabase
            .from('bd_platco')
            .select('fecha_de_entrega')
            .eq('seriales', serial);
          
          if (data && data.length > 0) {
            externalData = {
              fecha_venta: data[data.length - 1].fecha_de_entrega
            };
          }
        }

        return {
          serial: serial,
          modelo: model,
          estatus: status,
          garantia: warranty.toUpperCase(),
          aliado: selectedAllyConfig?.name || selectedAlly,
          ingreso: nextIngreso.toString(),
          razon_social: externalData.razon_social || 'STOCK CRM',
          rif: externalData.rif || 'PENDIENTE',
          procesadora: externalData.procesadora || (actualTableName === 'vatc' ? 'PENDIENTE' : null),
          factura: externalData.factura || null,
          fecha_venta: externalData.fecha_venta || null,
          fecha: new Date().toISOString().split('T')[0],
          modificado_crm: true,
          estatus_del_caso: 'CASO ABIERTO'
        };
      }));

      const { error: insertError } = await supabase
        .from(actualTableName)
        .insert(processedRows);

      if (insertError) throw insertError;

      setSuccess(`Se han añadido ${serialList.length} equipos exitosamente a ${selectedAllyConfig?.name || selectedAlly}`);
      setSerialsText('');
      
      // Log activity
      await supabase.from('activity_logs').insert({
        type: 'update',
        message: `Carga masiva de ${serialList.length} equipos en ${selectedAllyConfig?.name || selectedAlly}`,
        details: { ally: selectedAlly, count: serialList.length }
      });

      if (onSuccess) onSuccess();
      
      // Close modal after a short delay on success
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err: any) {
      console.error('Error in bulk add:', err);
      setError(`Error: ${err.message || 'No se pudo completar la carga masiva'}`);
    } finally {
      setLoading(false);
    }
  };

  const parsedCount = serialsText.split('\n').filter(s => s.trim().length > 0).length;

  if (!isOpen) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300",
      isOpen ? "opacity-100 visible" : "opacity-0 invisible"
    )}>
      <div
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm no-print"
        onClick={onClose}
      />

      <div className={cn(
        "bg-surface w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden relative flex flex-col transition-all duration-500",
        isOpen ? "translate-y-0 scale-100" : "translate-y-12 scale-95"
      )}>
        {/* Header */}
        <div className="px-8 py-6 bg-white border-b border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <PlusCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-black text-on-surface tracking-tight">Carga Masiva de Equipos</h3>
              <p className="text-[10px] font-black uppercase text-outline tracking-widest">Añadir múltiples seriales simultáneamente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-xl transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-8 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <form onSubmit={handleProcess} className="bg-white p-8 rounded-[32px] border border-outline-variant shadow-sm space-y-6">
                
                {/* Ally Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">
                    Seleccionar Aliado Destino
                  </label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                    <select
                      value={selectedAlly}
                      onChange={(e) => setSelectedAlly(e.target.value)}
                      disabled={fetchingAllies}
                      className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border border-outline-variant rounded-2xl text-sm font-bold text-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none appearance-none"
                    >
                      <option value="">Selecciona un aliado...</option>
                      {allies.map(ally => (
                        <option key={ally.id} value={ally.name}>
                          {ally.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Serials Textarea */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">
                      Seriales (uno por línea)
                    </label>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {parsedCount} Detectados
                    </span>
                  </div>
                  <textarea
                    value={serialsText}
                    onChange={(e) => setSerialsText(e.target.value)}
                    placeholder="Ejemplo:&#10;SN123456789&#10;SN987654321"
                    rows={8}
                    className="w-full p-6 bg-surface-container-lowest border border-outline-variant rounded-[24px] text-sm font-mono text-primary placeholder:text-outline/30 focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none"
                  />
                </div>

                {/* Additional Options */}
                <div className="grid grid-cols-2 gap-md">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">
                      Modelo
                    </label>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm font-bold text-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    >
                      <option value="">Seleccione modelo...</option>
                      <optgroup label="-- LINUX --">
                        {availableModels.linux.map(m => (
                          <option key={`bulk-linux-${m}`} value={m}>{m}</option>
                        ))}
                      </optgroup>
                      <optgroup label="-- ANDROID --">
                        {availableModels.android.map(m => (
                          <option key={`bulk-android-${m}`} value={m}>{m}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">
                      Garantía
                    </label>
                    <select
                      value={warranty}
                      onChange={(e) => setWarranty(e.target.value)}
                      className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm font-bold text-primary focus:ring-4 focus:ring-primary/10 outline-none"
                    >
                      <option value="POR DEFINIR">Por Definir</option>
                      <option value="si">Vigente (Si)</option>
                      <option value="no">Vencida (No)</option>
                    </select>
                  </div>
                </div>

                {/* Status Section */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">
                    Estatus Inicial
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm font-bold text-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  >
                    <option value="">Seleccione estatus...</option>
                    {statuses.length > 0 ? (
                      statuses.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))
                    ) : (
                      // Fallback
                      ['DISPONIBLE', 'ENTREGADO', 'EN REVISION', 'DEVOLUCION'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))
                    )}
                  </select>
                </div>

                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-xs font-bold uppercase tracking-tight">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-700 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <p className="text-xs font-bold uppercase tracking-tight">{success}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-5 rounded-[24px] font-black uppercase text-sm tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-6 h-6" />
                      Ejecutar Carga Masiva
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="space-y-6">
              
              <div className="bg-white p-6 rounded-[32px] border border-outline-variant">
                <h4 className="text-[10px] font-black text-outline uppercase tracking-widest mb-4">Información Adicional</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-outline uppercase">Destino:</span>
                    <span className="text-[10px] font-black text-primary uppercase">{selectedAlly || '---'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-outline uppercase">OS:</span>
                    <span className="text-[10px] font-black text-primary uppercase">{model ? (['ME51', 'SP600', 'ME60'].includes(model) ? 'LINUX' : 'ANDROID') : '---'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 bg-slate-50 border-t border-outline-variant flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-3 text-xs font-black text-outline uppercase tracking-widest hover:text-primary transition-colors"
          >
            Cerrar Ventana
          </button>
        </div>
      </div>
    </div>
  )
}
