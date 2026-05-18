"use client";

import React, { useState, useEffect, useRef } from "react"
import {
  X,
  History,
  FileText,
  Edit2,
  Save,
  Printer,
  CheckCircle2,
  AlertCircle,
  Hash,
  User,
  Calendar,
  Building2,
  Settings,
  ShieldCheck,
  Package,
  Wrench,
  Loader2,
  ExternalLink,
  PlusCircle
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { useNotification } from "@/context/NotificationContext"

interface TerminalDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  serial: string
  currentSlug: string
  isNew?: boolean
  onSuccess?: () => void
  initialData?: any
}

const TABLE_SCHEMAS: Record<string, string[]> = {
  vatc: ["serial", "n", "rif", "fecha", "nivel", "aliado", "modelo", "estatus", "factura", "informe", "ingreso", "garantia", "informes", "categoria", "cotizacin", "fecha_final", "procesadora", "razon_social", "razn_social", "observaciones", "estatus_del_caso", "falla_notificada", "serial_de_remplazo", "repuesto__servicio_1", "repuesto__servicio_2", "repuesto__servicio_3"],
  banplus: ["serial", "n", "rif", "fecha", "nivel", "aliado", "modelo", "estatus", "informe", "ingreso", "categora", "garantia", "informe2", "cotizacin", "fecha_final", "razn_social", "razon_social", "observaciones", "estatus_del_caso", "falla_notificada", "repuesto__servicio", "serial_de_remplazo", "repuesto__servicio_2", "repuesto__servicio_3"],
  ccr: ["serial", "n", "ne", "rif", "fecha", "nivel", "aliado", "modelo", "estatus", "informe", "ingreso", "categora", "garantia", "informe2", "cotizacin", "fecha_final", "razn_social", "observaciones", "estatus_del_caso", "falla_notificada", "serial_de_remplazo", "repuesto__servicio_1", "repuesto__servicio_2", "repuesto__servicio_3"],
  instapago: ["serial", "n", "rif", "fecha", "nivel", "aliado", "modelo", "estatus", "informe", "ingreso", "categora", "garantia", "informe2", "cotizacin", "repuesto_1", "repuesto_2", "repuesto_3", "fecha_final", "razn_social", "razon_social", "observaciones", "estatus_del_caso", "falla_notificada", "serial_de_remplazo"],
  poscom: ["n", "rif", "fecha", "nivel", "aliado", "modelo", "serial", "estatus", "informe", "ingreso", "categora", "garantia", "informe2", "cotizacin", "fecha_final", "razn_social", "razon_social", "observaciones", "estatus_del_caso", "falla_notificada", "repuesto__servicio", "serial_de_remplazo", "repuesto__servicio_2", "repuesto__servicio_3"],
  exterior: ["serial", "n", "rif", "fecha", "nivel", "aliado", "modelo", "estatus", "informe", "ingreso", "categora", "garantia", "informe2", "cotizacin", "repuesto_1", "repuesto_2", "repuesto_3", "fecha_final", "razn_social", "razon_social", "observaciones", "estatus_del_caso", "falla_notificada", "serial_de_remplazo"],
  bancaribe: ["serial", "n", "rif", "fecha", "nivel", "aliado", "modelo", "estatus", "informe", "ingreso", "categora", "garantia", "informe2", "cotizacin", "fecha_final", "razn_social", "razon_social", "observaciones", "estatus_del_caso", "falla_notificada", "repuesto__servicio", "serial_de_remplazo", "repuesto__servicio_2", "repuesto__servicio_3"],
  tokenp: ["n", "rif", "fecha", "nivel", "aliado", "modelo", "serial", "estatus", "informe", "ingreso", "categora", "garantia", "informe2", "cotizacin", "repuesto_1", "repuesto_2", "repuesto_3", "fecha_final", "razn_social", "razon_social", "observaciones", "estatus_del_caso", "falla_notificada", "serial_de_remplazo"],
  bactivo: ["n", "rif", "fecha", "nivel", "aliado", "modelo", "serial", "estatus", "informe", "ingreso", "categora", "garantia", "informe2", "cotizacin", "repuesto_1", "repuesto_2", "repuesto_3", "fecha_final", "razn_social", "razon_social", "observaciones", "estatus_del_caso", "falla_notificada", "serial_de_remplazo"],
  bancrecer: ["serial", "n", "rif", "fecha", "nivel", "aliado", "modelo", "estatus", "informe", "ingreso", "categora", "garantia", "informe2", "cotizacin", "repuesto_1", "repuesto_2", "repuesto_3", "fecha_final", "razn_social", "razon_social", "observaciones", "estatus_del_caso", "falla_notificada", "serial_de_remplazo"],
  bestpay: ["serial", "n", "rif", "fecha", "nivel", "aliado", "modelo", "estatus", "informe", "ingreso", "categora", "garantia", "informe2", "cotizacin", "repuesto_1", "repuesto_2", "repuesto_3", "fecha_final", "razn_social", "razon_social", "observaciones", "estatus_del_caso", "falla_notificada", "serial_de_remplazo"],
  delsur: ["serial", "n", "rif", "fecha", "nivel", "aliado", "modelo", "estatus", "informe", "ingreso", "categora", "garantia", "informe2", "cotizacin", "repuesto_1", "repuesto_2", "repuesto_3", "fecha_final", "razn_social", "razon_social", "observaciones", "estatus_del_caso", "falla_notificada", "serial_de_remplazo"],
  paytech: ["serial", "n", "ne", "rif", "fecha", "nivel", "aliado", "modelo", "estatus", "informe", "ingreso", "categora", "garantia", "informe2", "cotizacin", "repuesto_1", "repuesto_2", "repuesto_3", "fecha_final", "razn_social", "razon_social", "observaciones", "estatus_del_caso", "falla_notificada", "serial_de_remplazo"],
  platco: ["serial", "nro", "rif", "lote", "fecha", "nivel", "aliado", "modelo", "estatus", "ingreso", "categora", "garantia", "column_26", "columna_7", "cotizacin", "columna_10", "fecha_final", "fecha_venta", "razn_social", "razon_social", "observacion_2", "observaciones", "estatus_del_caso", "repuesto__servicio", "serial_de_remplazo", "repuesto__servicio_2", "repuesto__servicio_3", "imei_1", "imei_2", "fecha_entrega"],
  platco_pos: ["serial", "nro", "rif", "lote", "fecha", "nivel", "aliado", "modelo", "estatus", "ingreso", "categora", "garantia", "cotizacin", "fecha_final", "fecha_venta", "razn_social", "razon_social", "observaciones", "estatus_del_caso", "repuesto__servicio", "serial_de_remplazo", "repuesto__servicio_2", "repuesto__servicio_3"],
  otros: ["n", "ne", "rif", "fecha", "nivel", "aliado", "modelo", "serial", "estatus", "informe", "ingreso", "categora", "garantia", "informes", "cotizacin", "repuesto_1", "repuesto_2", "repuesto_3", "fecha_final", "razn_social", "razon_social", "observaciones", "estatus_del_caso", "falla_notificada", "serial_de_remplazo"]
};

export function TerminalDetailsModal({
  isOpen,
  onClose,
  serial,
  currentSlug,
  isNew = false,
  onSuccess,
  initialData
}: TerminalDetailsModalProps) {
  const { showToast, showAlert, showConfirm } = useNotification()
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'edit' | 'report'>('info')
  const [formData, setFormData] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [selectedTable, setSelectedTable] = useState('')
  const [alliesList, setAlliesList] = useState<{ name: string, table_name: string }[]>([])
  const [defaultAliados, setDefaultAliados] = useState<any[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [selectedTecnico, setSelectedTecnico] = useState('Servicio Técnico')

  useEffect(() => {
    async function fetchUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('nombre, apellido, full_name')
            .eq('id', user.id)
            .single()
          
          if (data) {
            if (data.nombre && data.apellido) {
              setSelectedTecnico(`${data.nombre} ${data.apellido}`)
            } else if (data.full_name) {
              setSelectedTecnico(data.full_name)
            } else {
              setSelectedTecnico(user.email?.split('@')[0] || 'Servicio Técnico')
            }
          }
        }
      } catch (err) {
        console.error('Error fetching user profile for technician:', err)
      }
    }
    fetchUser()
  }, [])
  const [accessories, setAccessories] = useState<Record<string, boolean>>({
    caja: false,
    cargador: false,
    bateria: false,
    sim_card: false,
    etiqueta_garantia: false,
    tapa: false,
    forro: false,
    declaracion_contribuyente: false,
    rollo_termico: false
  })
  const [section4, setSection4] = useState<Record<string, boolean>>({
    garantia: false,
    cotizacion: false,
    irreparable: false,
    nivel_0: false,
    nivel_1: false,
    nivel_2: false,
    carga_llaves_si: false,
    carga_llaves_no: false
  })
  const [statuses, setStatuses] = useState<string[]>([])
  const [availableModels, setAvailableModels] = useState<{ linux: string[], android: string[] }>({ linux: [], android: [] })

  const reportRef = useRef<HTMLDivElement>(null)

  const tableMapping: Record<string, string> = {
    'banco-activo': 'bactivo',
    'credicard': 'ccr'
  }
  const targetTableName = tableMapping[currentSlug] || currentSlug.replace(/-/g, '_')

  const tecnicos = [
    'Eduardo Castillo',
    'Andelis Nuñez',
    'Jenfil Gonzalez',
    'Eduardo mendieta'
  ]

  // Fetch allies and defaults
  useEffect(() => {
    async function fetchData() {
      // 1. Fetch basic allies config
      const { data: alliesData } = await supabase
        .from('allies_config')
        .select('name, table_name')
        .eq('is_active', true)

      if (alliesData) {
        // 2. For each ally, fetch its max NID to determine sort order
        const alliesWithNid = await Promise.all(
          alliesData.map(async (ally) => {
            const nidCol = ['platco', 'platco_pos'].includes(ally.table_name) ? 'nro' : 'n';
            const { data } = await supabase
              .from(ally.table_name)
              .select(nidCol)
              .order(nidCol, { ascending: false })
              .limit(1)
              .maybeSingle();

            return {
              ...ally,
              maxNid: data ? (parseInt(data[nidCol]) || 0) : 0
            };
          })
        );

        // 3. Sort by maxNid DESC
        alliesWithNid.sort((a, b) => b.maxNid - a.maxNid);
        setAlliesList(alliesWithNid);
      }

      const { data: defaultsData } = await supabase
        .from('default_aliados')
        .select('*')

      if (defaultsData) setDefaultAliados(defaultsData)

      // Fetch models from central table - Explicit schema
      const { data: modData, error: modError } = await supabase
        .from('modelos')
        .select('linux, android')
        .order('id');

      if (modError) {
        console.error('Error fetching modelos:', modError);
      }

      if (modData) {
        const linux = Array.from(new Set(modData.map((m: any) => m.linux).filter(Boolean))) as string[];
        const android = Array.from(new Set(modData.map((m: any) => m.android).filter(Boolean))) as string[];
        console.log('Models loaded:', { linux, android });
        setAvailableModels({ linux, android });
      }

      // Fetch statuses
      const { data: statusData, error: statusError } = await supabase
        .from('estatus')
        .select('estatus')
        .order('estatus');

      if (statusError) {
        console.error('Error fetching estatus:', statusError);
      }

      if (statusData) {
        const list = statusData.map(s => s.estatus).filter(Boolean);
        console.log('Statuses loaded:', list);
        setStatuses(list);
      }
    }

    if (isOpen) {
      fetchData()
      if (isNew) {
        setSelectedTable('')
        setFormData(null)
        setIsEditing(true)
      }
    } else {
      // Reset when closing
      setSelectedTable('')
      setFormData(null)
    }
  }, [isOpen, !!isNew])

  // DYNAMIC SCHEMA GENERATION
  useEffect(() => {
    if (isNew && selectedTable) {
      async function prefillData() {
        const selectedAllyConfig = alliesList.find(a => a.name === selectedTable);
        if (!selectedAllyConfig) return;

        const actualTableName = selectedAllyConfig.table_name;
        const columns = TABLE_SCHEMAS[actualTableName] || ["serial", "razon_social", "rif", "modelo", "estatus", "garantia", "fecha", "observaciones"];
        const newFormData: any = {};

        columns.forEach(col => {
          newFormData[col] = '';
        });

        // Pre-fill known data
        if (newFormData.hasOwnProperty('serial')) newFormData.serial = serial || '';
        if (newFormData.hasOwnProperty('fecha')) newFormData.fecha = new Date().toISOString().split('T')[0];
        if (newFormData.hasOwnProperty('estatus')) newFormData.estatus = 'POR DEFINIR';
        if (newFormData.hasOwnProperty('garantia')) newFormData.garantia = 'POR DEFINIR';
        if (newFormData.hasOwnProperty('estatus_del_caso')) newFormData.estatus_del_caso = 'CASO ABIERTO';

        // Fetch Next NID
        const nidCol = columns.find(c => ['n', 'nro', 'ne'].includes(c));
        if (nidCol) {
          const { data } = await supabase
            .from(actualTableName)
            .select(nidCol)
            .not(nidCol, 'is', null)
            .order(nidCol, { ascending: false })
            .limit(1)
            .maybeSingle();

          const lastId = data ? parseInt((data as any)[nidCol]) : 0;
          newFormData[nidCol] = isNaN(lastId) ? 1 : lastId + 1;
        }

        // Ally specific defaults from default_aliados
        const defaultData = defaultAliados.find(d =>
          d.aliado.toLowerCase() === selectedTable.toLowerCase()
        );

        if (defaultData) {
          if (newFormData.hasOwnProperty('rif')) newFormData.rif = defaultData.rif === 'PENDIENTE' ? '' : defaultData.rif;
          if (newFormData.hasOwnProperty('razon_social')) newFormData.razon_social = defaultData.razon_social === 'PENDIENTE' ? '' : defaultData.razon_social;
          if (newFormData.hasOwnProperty('razn_social')) newFormData.razn_social = defaultData.razon_social === 'PENDIENTE' ? '' : defaultData.razon_social;
          if (newFormData.hasOwnProperty('aliado')) newFormData.aliado = selectedAllyConfig.name;
        }

        setFormData(newFormData);
        setIsEditing(true);
        setActiveTab('edit');
      }

      prefillData();
    } else if (isNew && !selectedTable) {
      setFormData(null);
    }
  }, [selectedTable, isNew, alliesList, defaultAliados, serial]);

  const handleExternalLookup = async (type: 'serial' | 'rif' | 'razon' = 'serial') => {
    let searchValue = '';
    if (type === 'serial') searchValue = formData?.serial || '';
    else if (type === 'rif') searchValue = formData?.rif || '';
    else if (type === 'razon') searchValue = formData?.razon_social || formData?.razn_social || '';

    if (!searchValue) {
      showToast(`Por favor ingrese un ${type} para buscar`, 'warning');
      return;
    }

    setLoading(true);
    try {
      const selectedAllyConfig = alliesList.find(a => a.name === selectedTable);
      const actualTableName = selectedAllyConfig?.table_name || selectedTable;

      if (actualTableName === 'vatc' || actualTableName === 'banplus' || actualTableName === 'ccr') {
        let query = supabase.from('bd_clientes').select('razon, cliente, procesadora, serial');

        if (type === 'serial') query = query.eq('serial', searchValue);
        else if (type === 'rif') query = query.ilike('cliente', `%${searchValue}%`);
        else if (type === 'razon') query = query.ilike('razon', `%${searchValue}%`);

        const { data, error } = await query.limit(20);

        if (error) throw error;

        if (data && data.length > 0) {
          if (data.length > 1) {
            // If multiple results, show a simple selection (MVP: use first one but alert)
            const selection = data[0];
            const confirmFill = await showConfirm('Múltiples Coincidencias', `Se encontraron ${data.length} coincidencias. ¿Desea cargar los datos de "${selection.razon}"?`, 'primary');
            if (!confirmFill) return;

            setFormData((prev: any) => ({
              ...prev,
              razon_social: selection.razon || prev.razon_social,
              razn_social: selection.razon || prev.razn_social,
              rif: selection.cliente || prev.rif,
              procesadora: selection.procesadora || prev.procesadora,
              serial: selection.serial || prev.serial
            }));
          } else {
            const latestRecord = data[0];
            setFormData((prev: any) => ({
              ...prev,
              razon_social: latestRecord.razon || prev.razon_social,
              razn_social: latestRecord.razon || prev.razn_social,
              rif: latestRecord.cliente || prev.rif,
              procesadora: latestRecord.procesadora || prev.procesadora,
              serial: latestRecord.serial || prev.serial
            }));
            showToast('Datos cargados correctamente.', 'success');
          }
        } else {
          showAlert('Sin Resultados', 'No se encontraron registros en la base de datos de clientes.', 'info');
        }
      } else if (actualTableName === 'platco' || actualTableName === 'platco_pos') {
        const { data } = await supabase
          .from('bd_platco')
          .select('fecha_de_entrega, razon_social, rif')
          .eq('seriales', searchValue);

        if (data && data.length > 0) {
          const latestRecord = data[data.length - 1];
          setFormData((prev: any) => ({
            ...prev,
            fecha_venta: latestRecord.fecha_de_entrega || prev.fecha_venta,
            razon_social: latestRecord.razon_social || prev.razon_social,
            rif: latestRecord.rif || prev.rif
          }));
          showToast('Datos de Platco cargados.', 'success');
        } else {
          showToast('Serial no encontrado en Platco.', 'warning');
        }
      }
    } catch (err) {
      console.error('Error in external lookup:', err);
      showToast('Error al consultar la base de datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  // AUTO-CALCULATE INGRESO NUMBER BASED ON SERIAL COUNT IN CURRENT ALLY'S TABLE
  useEffect(() => {
    if (isNew && selectedTable && formData?.serial && formData.serial.length >= 4) {
      const fetchIngresoCount = async () => {
        try {
          const { count, error } = await supabase
            .from(selectedTable)
            .select('*', { count: 'exact', head: true })
            .eq('serial', formData.serial);

          if (!error && count !== null) {
            setFormData((prev: any) => ({
              ...prev,
              ingreso: (count + 1).toString()
            }));
          }
        } catch (err) {
          console.error('Error calculating ingreso count:', err);
        }
      };

      const timer = setTimeout(fetchIngresoCount, 500); // Small debounce
      return () => clearTimeout(timer);
    }
  }, [formData?.serial, selectedTable, isNew]);

  // Fetch Main Record first
  useEffect(() => {
    if (!isOpen || isNew || !serial) return

    async function fetchMainRecord() {
      setLoading(true)
      try {
        let query = supabase.from(targetTableName).select('*');
        if (initialData?.id) {
          query = query.eq('id', initialData.id);
        } else {
          query = query.or(`serial.eq.${serial},serial_de_remplazo.eq.${serial}`);
        }

        const { data, error } = await query.maybeSingle();

        if (data) {
          setFormData({ ...data, sourceTable: targetTableName })
          setHistory([{ ...data, sourceTable: targetTableName }])
        }
      } catch (err) {
        console.error('Error fetching main record:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMainRecord()
  }, [isOpen, serial, isNew, currentSlug, initialData?.id])

  // Fetch Full History ONLY when switching to history tab (Lazy Load)
  useEffect(() => {
    if (!isOpen || isNew || activeTab !== 'history' || !serial) return
    if (history.length > 1) return // Already fetched full history

    async function fetchFullHistory() {
      setLoading(true)
      try {
        const tables = Object.keys(TABLE_SCHEMAS);
        const results = await Promise.all(
          tables.map(table =>
            supabase
              .from(table)
              .select('*')
              .or(`serial.eq.${serial},serial_de_remplazo.eq.${serial}`)
          )
        )

        const allRecords = results
          .flatMap((res, index) => (res.data || []).map(item => ({
            ...item,
            sourceTable: tables[index]
          })))
          .sort((a, b) => {
            const dateA = new Date(a.fecha || a.created_at).getTime()
            const dateB = new Date(b.fecha || b.created_at).getTime()
            return dateB - dateA
          })

        // Remove duplicates (same record from same table)
        const uniqueRecords = Array.from(new Map(allRecords.map(item => [`${item.sourceTable}-${item.id}`, item])).values())
        setHistory(uniqueRecords)
      } catch (err) {
        console.error('Error fetching full terminal history:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFullHistory()
  }, [isOpen, serial, isNew, activeTab])

  // Set form data from current record
  useEffect(() => {
    if (!isOpen || isNew) return

    const mainRecord = history.find(r => r.sourceTable === targetTableName) || history[0]

    if (mainRecord && !formData) {
      setFormData(mainRecord)
      setIsEditing(false)
      setActiveTab('info')
    }
  }, [isOpen, history, isNew, currentSlug, formData])

  if (!isOpen) return null

  const handleSave = async () => {
    const confirmSave = await showConfirm('Guardar Cambios', '¿Está seguro de que desea guardar los cambios en este expediente?', 'primary')
    if (!confirmSave) return false

    if (isNew && !selectedTable) {
      showToast('Por favor seleccione un aliado de destino', 'warning')
      return false
    }

    setSaving(true)
    try {
      const { id, sourceTable, created_at, ...updateData } = formData

      let query;
      if (isNew) {
        const selectedAllyConfig = alliesList.find(a => a.name === selectedTable);
        const actualTableName = selectedAllyConfig?.table_name || selectedTable;

        query = supabase.from(actualTableName).insert([{
          ...updateData,
          modificado_crm: true
        }])
      } else {
        query = supabase
          .from(targetTableName)
          .update({
            ...updateData,
            modificado_crm: true
          })
          .eq('id', id)
      }

      const { error } = await query
      if (error) throw error

      showToast(isNew ? 'Registro creado exitosamente' : 'Cambios guardados correctamente', 'success')
      if (onSuccess) onSuccess()
      if (isNew) onClose()
      return true
    } catch (err) {
      console.error('Error saving changes:', err)
      showAlert('Error al Guardar', 'No se pudieron guardar los cambios en la base de datos. Por favor intente de nuevo.', 'error')
      return false
    } finally {
      setSaving(false)
    }
  }

  const handlePrint = () => {
    // Persist current state to localStorage for the print view
    localStorage.setItem('print_report_data', JSON.stringify({
      formData,
      accessories,
      section4,
      selectedTecnico,
      serial: formData.serial || formData.serial_de_remplazo
    }))
    window.open(`/print/informe?serial=${formData.serial || formData.serial_de_remplazo}`, '_blank')
  }

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
        "bg-surface w-full max-w-3xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden relative flex flex-col transition-all duration-500",
        isOpen ? "translate-y-0 scale-100" : "translate-y-12 scale-95"
      )}>
        {/* Header */}
        <div className="px-8 py-6 bg-white border-b border-outline-variant flex items-center justify-between no-print">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              {isNew ? (
                <PlusCircle className="w-6 h-6 text-primary" />
              ) : (
                <History className="w-6 h-6 text-primary" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-black text-on-surface tracking-tight">{isNew ? 'Crear Expediente' : 'Expediente del Equipo'}</h3>
              <p className="text-[10px] font-black uppercase text-outline tracking-widest">{isNew ? 'Registro de nuevo ingreso' : 'Historial y Gestión Técnica'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-xl transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {isNew && (
          <div className="bg-slate-100 px-8 py-3 flex items-center gap-4 border-b border-outline-variant">
            <span className="text-[10px] font-black uppercase text-outline tracking-widest">Seleccionar Aliado / Destino:</span>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="bg-white border border-outline-variant rounded-lg px-3 py-1.5 text-xs font-bold text-primary outline-none"
            >
              <option value="" disabled>Seleccione un aliado...</option>
              {alliesList.map(ally => (
                <option key={`${ally.table_name}-${ally.name}`} value={ally.name}>
                  {ally.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex border-b border-outline-variant bg-white px-8 no-print">
          <button
            onClick={() => setActiveTab('info')}
            className={cn(
              "px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative",
              activeTab === 'info' ? "text-primary" : "text-outline hover:text-on-surface"
            )}
          >
            INFORMACION DEL POS
            {activeTab === 'info' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
          </button>
          {!isNew && (
            <button
              onClick={() => setActiveTab('history')}
              className={cn(
                "px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative",
                activeTab === 'history' ? "text-primary" : "text-outline hover:text-on-surface"
              )}
            >
              Trazabilidad
              {activeTab === 'history' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
            </button>
          )}
          {!isNew && (
            <button
              onClick={() => setActiveTab('report')}
              className={cn(
                "px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative",
                activeTab === 'report' ? "text-primary" : "text-outline hover:text-on-surface"
              )}
            >
              Informe Técnico
              {activeTab === 'report' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/50 custom-scrollbar">
          {activeTab === 'info' || activeTab === 'edit' ? (
            <div className="p-8">
              {!formData ? (
                <div className="text-center py-20 bg-white rounded-[40px] border border-outline-variant border-dashed">
                  <Package className="w-16 h-16 text-outline/20 mx-auto mb-6" />
                  <h4 className="text-lg font-black text-on-surface mb-2">Esperando selección de aliado</h4>
                  <p className="text-[10px] font-black text-outline uppercase tracking-widest max-w-[280px] mx-auto leading-relaxed">
                    Por favor seleccione un destino para cargar los campos correspondientes a su base de datos.
                  </p>
                </div>
              ) : (
                <div className="p-0 flex justify-center">
                  {/* Main Data Container - Seamless Integration */}
                  <div className="w-full space-y-0">
                    <div className="overflow-hidden">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-primary border-b border-primary/20">
                            <th className="px-8 py-4 text-[10px] font-black text-white uppercase tracking-widest">Campo</th>
                            <th className="px-8 py-4 text-[10px] font-black text-white uppercase tracking-widest">Valor Registrado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10">
                          {Object.keys(formData)
                            .filter(key => !['id', 'created_at', 'sourceTable', 'modificado_crm'].includes(key))
                            .sort((a, b) => {
                              const order = [
                                'n', 'nro', 'ne',
                                'factura',
                                'procesadora',
                                'fecha',
                                'aliado',
                                'modelo',
                                'razon_social', 'razn_social',
                                'serial',
                                'informes',
                                'rif',
                                'ingreso',
                                'serial_de_remplazo',
                                'falla_notificada',
                                'categoria', 'categora',
                                'fecha_final',
                                'estatus_del_caso',
                                'estatus',
                                'nivel',
                                'garantia',
                                'informe', 'informe2',
                                'cotizacin', 'cotizacion',
                                'observaciones', 'observacion_2',
                                'repuesto__servicio_1', 'repuesto__servicio',
                                'repuesto__servicio_2',
                                'repuesto__servicio_3'
                              ];

                              const indexA = order.findIndex(o => a.toLowerCase() === o.toLowerCase());
                              const indexB = order.findIndex(o => b.toLowerCase() === o.toLowerCase());

                              if (indexA === -1 && indexB === -1) return a.localeCompare(b);
                              if (indexA === -1) return 1;
                              if (indexB === -1) return -1;
                              return indexA - indexB;
                            })
                            .map((key) => {
                              const isObservaciones = key.includes('observaciones') || key.includes('detalle');
                              const isNeverEditable = ['created_at'].includes(key);
                              const isDate = key.includes('fecha');
                              const isNid = key.toLowerCase() === 'id' ||
                                key.toLowerCase() === 'nro' ||
                                key.toLowerCase() === 'n' ||
                                key.toLowerCase() === 'ne';
                              const isBlockedField = key.toLowerCase() === 'ingreso' ||
                                key.toLowerCase() === 'informes' ||
                                key.toLowerCase() === 'informe' ||
                                key.toLowerCase() === 'informe2';
                              let label = key.replace(/_/g, ' ').toUpperCase();
                              if (label === 'N' || label === 'NRO' || label === 'NE') label = 'NID';
                              const displayValue = isDate ? (formData[key]?.split('T')[0] || '---') : (formData[key] || '---');

                              const isGarantia = key.toLowerCase() === 'garantia';
                              const isModelo = key.toLowerCase() === 'modelo';
                              const isProcesadora = key.toLowerCase() === 'procesadora';
                              const isEstatus = key.toLowerCase() === 'estatus';
                              const isEstatusCaso = key.toLowerCase() === 'estatus_del_caso';

                              return (
                                <tr key={key} className="group even:bg-slate-50/50 transition-colors hover:bg-primary/5">
                                  <td className="px-6 py-3 text-[9px] font-black text-on-surface-variant/70 bg-slate-100/50 uppercase tracking-[0.15em] border-r border-outline-variant/30 w-[160px]">
                                    {label}
                                  </td>
                                  <td className="px-8 py-3">
                                    {(!isEditing || isNeverEditable) ? (
                                      <span className={cn(
                                        "text-xs font-bold block truncate",
                                        isNeverEditable ? "text-on-surface-variant/40 italic" : "text-on-surface-variant"
                                      )}>
                                        {displayValue}
                                      </span>
                                    ) : isObservaciones ? (
                                      <textarea
                                        value={formData[key] || ''}
                                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                                        className="w-full bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 text-xs font-bold text-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none h-16 transition-all"
                                      />
                                    ) : isModelo ? (
                                      <select
                                        value={formData[key] || ''}
                                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                                        className="w-full bg-primary/5 border border-primary/20 rounded-lg px-3 py-1.5 text-xs font-bold text-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                      >
                                        <option value="">Seleccione modelo...</option>
                                        <optgroup label="-- LINUX --">
                                          {availableModels.linux.map(m => (
                                            <option key={`linux-${m}`} value={m}>{m}</option>
                                          ))}
                                        </optgroup>
                                        <optgroup label="-- ANDROID --">
                                          {availableModels.android.map(m => (
                                            <option key={`android-${m}`} value={m}>{m}</option>
                                          ))}
                                        </optgroup>
                                      </select>
                                    ) : isProcesadora ? (
                                      <select
                                        value={formData[key] || ''}
                                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                                        className="w-full bg-primary/5 border border-primary/20 rounded-lg px-3 py-1.5 text-xs font-bold text-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                      >
                                        <option value="">Seleccione procesadora...</option>
                                        <option value="CREDICARD">CREDICARD</option>
                                        <option value="PLATCO">PLATCO</option>
                                      </select>
                                    ) : isEstatusCaso ? (
                                      <select
                                        value={formData[key] || ''}
                                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                                        className="w-full bg-primary/5 border border-primary/20 rounded-lg px-3 py-1.5 text-xs font-bold text-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                      >
                                        <option value="CASO ABIERTO">CASO ABIERTO</option>
                                        <option value="CASO CERRADO">CASO CERRADO</option>
                                      </select>
                                    ) : isEstatus ? (
                                      <select
                                        value={formData[key] || ''}
                                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                                        className="w-full bg-primary/5 border border-primary/20 rounded-lg px-3 py-1.5 text-xs font-bold text-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                      >
                                        <option value="POR DEFINIR">POR DEFINIR</option>
                                        {statuses.filter(s => s.toUpperCase() !== 'POR DEFINIR').map(s => (
                                          <option key={s} value={s}>{s}</option>
                                        ))}
                                      </select>
                                    ) : isGarantia ? (
                                      <select
                                        value={(formData[key] || '').toUpperCase()}
                                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                                        className="w-full bg-primary/5 border border-primary/20 rounded-lg px-3 py-1.5 text-xs font-bold text-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                      >
                                        <option value="POR DEFINIR">POR DEFINIR</option>
                                        <option value="SI">SI</option>
                                        <option value="NO">NO</option>
                                      </select>
                                    ) : (
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          value={isDate ? (formData[key]?.split('T')[0] || '') : (formData[key] || '')}
                                          onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                                          disabled={isNid || isBlockedField}
                                          className={cn(
                                            "flex-1 bg-primary/5 border border-primary/20 rounded-lg px-3 py-1.5 text-xs font-bold text-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all",
                                            (isNid || isBlockedField) && "opacity-50 cursor-not-allowed bg-slate-100"
                                          )}
                                        />
                                        {isNew && (key.toLowerCase() === 'serial' || key.toLowerCase() === 'rif' || key.toLowerCase() === 'razon_social' || key.toLowerCase() === 'razn_social') && (
                                          <button
                                            onClick={() => handleExternalLookup(
                                              key.toLowerCase() === 'serial' ? 'serial' :
                                                key.toLowerCase() === 'rif' ? 'rif' : 'razon'
                                            )}
                                            disabled={loading}
                                            className="bg-primary text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tight hover:opacity-90 transition-all flex items-center gap-2 whitespace-nowrap shadow-sm"
                                            title="Buscar en base de datos"
                                          >
                                            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Settings className="w-3 h-3" />}
                                            Consultar
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )
              }
            </div>
          ) : activeTab === 'history' ? (
            <div className="p-8">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <p className="text-xs font-black text-outline uppercase tracking-widest">Rastreando terminal...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-outline-variant border-dashed">
                  <History className="w-12 h-12 text-outline/20 mx-auto mb-4" />
                  <p className="text-xs font-bold text-outline uppercase tracking-widest">No se encontraron otros ingresos</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((record, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-3xl border border-outline-variant shadow-sm hover:border-primary/30 transition-all group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            <Calendar className="w-5 h-5 text-outline group-hover:text-primary transition-colors" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-on-surface">{record.fecha || record.created_at?.split('T')[0] || 'FECHA N/A'}</p>
                            <p className="text-[10px] font-black text-outline uppercase tracking-widest">{record.sourceTable}</p>
                          </div>
                        </div>
                        <div className={cn(
                          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                          record.estatus?.includes('REPARADO') ? "bg-green-100 text-green-700" :
                            record.estatus?.includes('REVISION') ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                        )}>
                          {record.estatus || 'SIN ESTADO'}
                        </div>
                      </div>
                      <p className="text-xs text-on-surface-variant font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl italic border border-slate-100">
                        "{record.observaciones || 'Sin observaciones registradas'}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'report' ? (
            <div className="p-8">
              {!formData ? (
                <div className="text-center py-20 bg-white rounded-[40px] border border-outline-variant border-dashed">
                  <FileText className="w-16 h-16 text-outline/20 mx-auto mb-6" />
                  <h4 className="text-lg font-black text-on-surface mb-2">Informe no disponible</h4>
                  <p className="text-[10px] font-black text-outline uppercase tracking-widest max-w-[280px] mx-auto leading-relaxed">
                    Seleccione un aliado para habilitar la generación de informes técnicos.
                  </p>
                </div>
              ) : (
                <div
                  ref={reportRef}
                  className="bg-white p-12 rounded-[40px] shadow-sm border border-outline-variant max-w-4xl mx-auto print:shadow-none print:border-none print:p-0"
                >
                  {/* Report Header */}
                  <div className="flex justify-between items-start border-b-2 border-primary/20 pb-8 mb-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-black text-on-surface uppercase tracking-tight">Informe de Soporte Técnico</h2>
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-xs font-bold text-outline uppercase tracking-widest">Nro de Expediente: <span className="text-primary">{formData.n || formData.nro || formData.id?.slice(0, 8)}</span></p>
                        <p className="text-xs font-bold text-outline uppercase tracking-widest">Fecha: <span className="text-primary">{new Date().toLocaleDateString()}</span></p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-primary">VATC GLOBAL</p>
                      <p className="text-[10px] font-bold text-outline uppercase">Servicio Técnico Especializado</p>
                    </div>
                  </div>

                  {/* Report Content */}
                  <div className="grid grid-cols-2 gap-8 mb-12">
                    <div className="space-y-6">
                      <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] border-b border-primary/10 pb-2">Información del Equipo</h3>
                      <div className="grid grid-cols-1 gap-4">
                        <InfoItem icon={Hash} label="Serial" value={formData.serial} />
                        <InfoItem icon={Package} label="Modelo" value={formData.modelo} />
                        <InfoItem icon={Building2} label="Aliado" value={formData.aliado || (selectedTable || targetTableName).toUpperCase()} />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] border-b border-primary/10 pb-2">Información del Cliente</h3>
                      <div className="grid grid-cols-1 gap-4">
                        <InfoItem icon={User} label="Razón Social" value={formData.razon_social || formData.razn_social} />
                        <InfoItem icon={FileText} label="RIF" value={formData.rif} />
                        <InfoItem icon={ShieldCheck} label="Garantía" value={formData.garantia} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] border-b border-primary/10 pb-2">Diagnóstico y Solución</h3>
                      <div className="bg-slate-50 p-6 rounded-[32px] border border-outline-variant">
                        <div className="mb-6">
                          <label className="text-[9px] font-black text-outline uppercase tracking-widest mb-2 block">Falla Notificada:</label>
                          <p className="text-sm font-medium text-on-surface leading-relaxed">{formData.falla_notificada || 'Reporte estándar de revisión'}</p>
                        </div>
                        <div className="no-print mb-4">
                          <label className="text-[9px] font-black text-outline uppercase tracking-widest mb-2 block">Observaciones Técnicas:</label>
                          <textarea
                            value={formData.observaciones || ''}
                            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                            className="w-full bg-white border border-outline-variant rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none h-32 resize-none"
                            placeholder="Ingrese las observaciones del diagnóstico..."
                          />
                        </div>
                        <div className="hidden print:block">
                          <label className="text-[9px] font-black text-outline uppercase tracking-widest mb-2 block">Diagnóstico Final:</label>
                          <p className="text-sm font-medium text-on-surface leading-relaxed whitespace-pre-wrap">{formData.observaciones || 'Sin observaciones adicionales'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 pt-8 border-t-2 border-slate-100">
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Accesorios Recibidos</h3>
                        <div className="grid grid-cols-2 gap-3 no-print">
                          {Object.keys(accessories).map(item => {
                            const labels: Record<string, string> = {
                              caja: "Caja",
                              cargador: "Cargador",
                              bateria: "Batería",
                              sim_card: "Sim Card",
                              etiqueta_garantia: "Etiqueta de garantía",
                              tapa: "Tapa de Batería",
                              forro: "Forro",
                              declaracion_contribuyente: "Declaración de Cont.",
                              rollo_termico: "Rollo Térmico"
                            };
                            const label = labels[item] || item.toUpperCase();
                            return (
                              <label key={item} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                  type="checkbox"
                                  checked={accessories[item]}
                                  onChange={(e) => setAccessories({ ...accessories, [item]: e.target.checked })}
                                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                                />
                                <span className="text-[10px] font-bold text-outline uppercase group-hover:text-on-surface">{label}</span>
                              </label>
                            );
                          })}
                        </div>
                        <div className="hidden print:flex flex-wrap gap-x-6 gap-y-2">
                          {Object.entries(accessories).filter(([_, v]) => v).map(([k]) => {
                            const labels: Record<string, string> = {
                              caja: "Caja",
                              cargador: "Cargador",
                              bateria: "Batería",
                              sim_card: "Sim Card",
                              etiqueta_garantia: "Etiqueta de garantía",
                              tapa: "Tapa de Batería",
                              forro: "Forro",
                              declaracion_contribuyente: "Declaración de Cont.",
                              rollo_termico: "Rollo Térmico"
                            };
                            const label = labels[k] || k.toUpperCase();
                            return (
                              <div key={k} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                <span className="text-[10px] font-bold text-on-surface uppercase">{label}</span>
                              </div>
                            );
                          })}
                          {Object.values(accessories).every(v => !v) && <span className="text-[10px] italic text-outline">Ninguno</span>}
                        </div>

                        {/* Evaluación Adicional (Sección 4) */}
                        <div className="pt-6 border-t border-slate-100/80 space-y-4">
                          <div>
                            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3">Condición del Equipo (Sec. 4)</h3>
                            <div className="grid grid-cols-2 gap-3 no-print">
                              {Object.keys(section4).filter(k => ['garantia', 'cotizacion', 'irreparable'].includes(k)).map(item => {
                                const labels: Record<string, string> = {
                                  garantia: "Garantía",
                                  cotizacion: "Cotización",
                                  irreparable: "Irreparable"
                                };
                                const label = labels[item] || item.toUpperCase();
                                return (
                                  <label key={item} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                      type="checkbox"
                                      checked={section4[item]}
                                      onChange={(e) => setSection4({ ...section4, [item]: e.target.checked })}
                                      className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                                    />
                                    <span className="text-[10px] font-bold text-outline uppercase group-hover:text-on-surface">{label}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3">Nivel de Falla</h3>
                            <div className="grid grid-cols-2 gap-3 no-print">
                              {Object.keys(section4).filter(k => ['nivel_0', 'nivel_1', 'nivel_2'].includes(k)).map(item => {
                                const labels: Record<string, string> = {
                                  nivel_0: "Nivel 0",
                                  nivel_1: "Nivel 1",
                                  nivel_2: "Nivel 2"
                                };
                                const label = labels[item] || item.toUpperCase();
                                return (
                                  <label key={item} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                      type="checkbox"
                                      checked={section4[item]}
                                      onChange={(e) => setSection4({ ...section4, [item]: e.target.checked })}
                                      className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                                    />
                                    <span className="text-[10px] font-bold text-outline uppercase group-hover:text-on-surface">{label}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3">Requiere carga de llaves</h3>
                            <div className="grid grid-cols-2 gap-3 no-print">
                              {Object.keys(section4).filter(k => ['carga_llaves_si', 'carga_llaves_no'].includes(k)).map(item => {
                                const labels: Record<string, string> = {
                                  carga_llaves_si: "Sí",
                                  carga_llaves_no: "No"
                                };
                                const label = labels[item] || item.toUpperCase();
                                return (
                                  <label key={item} className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                      type="checkbox"
                                      checked={section4[item]}
                                      onChange={(e) => setSection4({ ...section4, [item]: e.target.checked })}
                                      className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                                    />
                                    <span className="text-[10px] font-bold text-outline uppercase group-hover:text-on-surface">{label}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Firma y Sello Técnico</h3>
                        <div className="no-print">
                          <select
                            value={selectedTecnico}
                            onChange={(e) => setSelectedTecnico(e.target.value)}
                            className="w-full bg-slate-50 border border-outline-variant rounded-xl px-4 py-2 text-xs font-bold text-on-surface outline-none"
                          >
                            {Array.from(new Set([...tecnicos, selectedTecnico].filter(Boolean))).map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        <div className="mt-8 border-t border-outline-variant pt-4 text-center">
                          <div className="w-32 h-12 mx-auto mb-2 bg-slate-50 rounded italic flex items-center justify-center text-[10px] text-outline/30">Firma Digital</div>
                          <p className="text-[10px] font-black text-on-surface uppercase tracking-widest">{selectedTecnico}</p>
                          <p className="text-[8px] font-bold text-outline uppercase">Especialista Certificado</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4 no-print mt-12">
                    <button
                      onClick={handlePrint}
                      className="bg-primary text-white px-12 py-3 rounded-xl text-sm font-bold shadow-xl hover:opacity-90 transition-all flex items-center gap-3"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Ver Informe Completo
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-50 border-t border-outline-variant flex justify-end gap-3 no-print">
          {(activeTab === 'info' || activeTab === 'edit') && formData && (
            <>
              {isEditing ? (
                <button
                  onClick={async () => {
                    const success = await handleSave();
                    if (success) setIsEditing(false);
                  }}
                  disabled={saving}
                  className="bg-primary text-white px-10 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  Guardar
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-primary/10 text-primary px-10 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center gap-2"
                >
                  <Edit2 className="w-3 h-3" />
                  Editar
                </button>
              )}
            </>
          )}
          {isEditing && (
            <button
              onClick={() => {
                if (isNew) {
                  onClose();
                } else {
                  const original = history.find(r => r.sourceTable === targetTableName) || history[0];
                  setFormData(original);
                  setIsEditing(false);
                }
              }}
              className="bg-slate-200 text-on-surface-variant px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-300 transition-all"
            >
              Cancelar
            </button>
          )}
          {!isEditing && (
            <button
              onClick={onClose}
              className="bg-on-surface text-surface px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoItem({ icon: Icon, label, value }: { icon: any, label: string, value: any }) {
  return (
    <div className="bg-slate-50 p-3 rounded-xl border border-outline-variant">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3 h-3 text-outline" />
        <span className="text-[9px] font-black uppercase text-outline tracking-widest">{label}</span>
      </div>
      <p className="text-xs font-bold text-on-surface truncate">{value || 'N/A'}</p>
    </div>
  )
}
