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
  ExternalLink
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

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
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'edit' | 'report'>('info')
  const [formData, setFormData] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [selectedTable, setSelectedTable] = useState('')
  const [alliesList, setAlliesList] = useState<{ name: string, table_name: string }[]>([])
  const [defaultAliados, setDefaultAliados] = useState<any[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [selectedTecnico, setSelectedTecnico] = useState('TECNICO 1')
  const [accessories, setAccessories] = useState<Record<string, boolean>>({
    caja: false,
    cargador: false,
    bateria: false,
    tapa: false,
    rollos: false,
    base: false
  })

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
      const { data: alliesData } = await supabase
        .from('allies_config')
        .select('name, table_name')
        .eq('is_active', true)
        .order('name')

      if (alliesData) setAlliesList(alliesData)

      const { data: defaultsData } = await supabase
        .from('default_aliados')
        .select('*')

      if (defaultsData) setDefaultAliados(defaultsData)
    }

    if (isOpen) {
      fetchData()
      if (isNew) {
        setSelectedTable('')
        setFormData(null)
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
      const columns = TABLE_SCHEMAS[selectedTable] || ["serial", "razon_social", "rif", "modelo", "estatus", "garantia", "fecha", "observaciones"];
      const newFormData: any = {};

      columns.forEach(col => {
        newFormData[col] = '';
      });

      // Pre-fill known data
      if (newFormData.hasOwnProperty('serial')) newFormData.serial = serial || '';
      if (newFormData.hasOwnProperty('fecha')) newFormData.fecha = new Date().toISOString().split('T')[0];
      if (newFormData.hasOwnProperty('estatus')) newFormData.estatus = 'EN REVISION';
      if (newFormData.hasOwnProperty('garantia')) newFormData.garantia = 'SI';
      if (newFormData.hasOwnProperty('estatus_del_caso')) newFormData.estatus_del_caso = 'CASO ABIERTO';

      // Ally specific defaults from default_aliados
      const selectedAllyConfig = alliesList.find(a => a.table_name === selectedTable);
      if (selectedAllyConfig) {
        const defaultData = defaultAliados.find(d =>
          d.aliado.toLowerCase() === selectedAllyConfig.name.toLowerCase()
        );

        if (defaultData) {
          if (newFormData.hasOwnProperty('rif')) newFormData.rif = defaultData.rif === 'PENDIENTE' ? '' : defaultData.rif;
          if (newFormData.hasOwnProperty('razon_social')) newFormData.razon_social = defaultData.razon_social === 'PENDIENTE' ? '' : defaultData.razon_social;
          if (newFormData.hasOwnProperty('razn_social')) newFormData.razn_social = defaultData.razon_social === 'PENDIENTE' ? '' : defaultData.razon_social;
          if (newFormData.hasOwnProperty('aliado')) newFormData.aliado = selectedAllyConfig.name;
        }
      }

      setFormData(newFormData);
      setIsEditing(true);
      setActiveTab('edit');
    } else if (isNew && !selectedTable) {
      setFormData(null);
    }
  }, [selectedTable, isNew, alliesList, defaultAliados, serial]);

  // Fetch Main Record first
  useEffect(() => {
    if (!isOpen || isNew || !serial) return

    // If we already have the data, just set it and skip the fetch
    if (initialData) {
      setFormData({ ...initialData, sourceTable: targetTableName })
      setHistory([{ ...initialData, sourceTable: targetTableName }])
      setLoading(false)
      return
    }

    async function fetchMainRecord() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from(targetTableName)
          .select('*')
          .or(`serial.eq.${serial},serial_de_remplazo.eq.${serial}`)
          .maybeSingle()

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
  }, [isOpen, serial, isNew, currentSlug])

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
    const confirmSave = window.confirm('¿Está seguro de que desea guardar los cambios en este expediente?')
    if (!confirmSave) return

    if (isNew && !selectedTable) {
      alert('Por favor seleccione un aliado de destino')
      return
    }

    setSaving(true)
    try {
      const { id, sourceTable, created_at, ...updateData } = formData

      let query;
      if (isNew) {
        query = supabase.from(selectedTable).insert([{
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

      alert(isNew ? 'Registro creado exitosamente' : 'Cambios guardados correctamente')
      if (onSuccess) onSuccess()
      if (isNew) onClose()
    } catch (err) {
      console.error('Error saving changes:', err)
      alert('Error al guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  const handlePrint = () => {
    // Persist current state to localStorage for the print view
    localStorage.setItem('print_report_data', JSON.stringify({
      formData,
      accessories,
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
        "bg-surface w-full max-w-5xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden relative flex flex-col transition-all duration-500",
        isOpen ? "translate-y-0 scale-100" : "translate-y-12 scale-95"
      )}>
        {/* Header */}
        <div className="px-8 py-6 bg-white border-b border-outline-variant flex items-center justify-between no-print">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <History className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-black text-on-surface tracking-tight">Expediente del Equipo</h3>
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
                <option key={ally.table_name} value={ally.table_name}>
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
            Información
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Main Data Column */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-outline-variant overflow-hidden shadow-sm">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-slate-50 border-b border-outline-variant">
                            <th className="px-8 py-4 text-[10px] font-black text-outline uppercase tracking-widest">Campo</th>
                            <th className="px-8 py-4 text-[10px] font-black text-outline uppercase tracking-widest">Valor Registrado</th>
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
                                key.toLowerCase() === 'n';
                              let label = key.replace(/_/g, ' ').toUpperCase();
                              if (label === 'N' || label === 'NRO') label = 'NID';
                              const displayValue = isDate ? (formData[key]?.split('T')[0] || '---') : (formData[key] || '---');

                              const isGarantia = key.toLowerCase() === 'garantia';
                              const isModelo = key.toLowerCase() === 'modelo';
                              const isProcesadora = key.toLowerCase() === 'procesadora';
                              const isEstatusCaso = key.toLowerCase() === 'estatus_del_caso';

                              return (
                                <tr key={key} className="group hover:bg-primary/5 transition-colors">
                                  <td className="px-8 py-4 text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest group-hover:text-primary transition-colors">
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
                                          <option value="ME51">ME51</option>
                                          <option value="SP600">SP600</option>
                                          <option value="ME60">ME60</option>
                                        </optgroup>
                                        <optgroup label="-- ANDROID --">
                                          <option value="N910">N910</option>
                                          <option value="N910-A7">N910-A7</option>
                                          <option value="N910-A10">N910-A10</option>
                                          <option value="N750">N750</option>
                                          <option value="N950S">N950S</option>
                                          <option value="N950K">N950K</option>
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
                                    ) : isGarantia ? (
                                      <select
                                        value={(formData[key] || '').toUpperCase()}
                                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                                        className="w-full bg-primary/5 border border-primary/20 rounded-lg px-3 py-1.5 text-xs font-bold text-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                      >
                                        <option value="SI">SI</option>
                                        <option value="NO">NO</option>
                                      </select>
                                    ) : (
                                      <input
                                        type="text"
                                        value={isDate ? (formData[key]?.split('T')[0] || '') : (formData[key] || '')}
                                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                                        className="w-full bg-primary/5 border border-primary/20 rounded-lg px-3 py-1.5 text-xs font-bold text-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                      />
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Sidebar Column */}
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-outline-variant shadow-sm">
                      <h4 className="text-[10px] font-black text-outline uppercase tracking-widest mb-4">Estatus Técnico</h4>
                      <div className="space-y-3">
                        {['EN REVISION', 'REPARADO', 'SIN SOLUCION', 'ENTREGADO'].map(status => (
                          <button
                            key={status}
                            disabled={!isEditing}
                            onClick={() => setFormData({ ...formData, estatus: status })}
                            className={cn(
                              "w-full px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-left flex items-center justify-between",
                              formData.estatus === status
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "bg-slate-50 text-outline hover:bg-slate-100 disabled:opacity-50"
                            )}
                          >
                            {status}
                            {formData.estatus === status && <CheckCircle2 className="w-4 h-4" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10">
                      <div className="flex items-center gap-3 mb-4">
                        <AlertCircle className="w-4 h-4 text-primary" />
                        <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">Información de Sistema</h4>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-outline uppercase">Origen:</span>
                          <span className="text-[10px] font-black text-primary uppercase">{isNew ? selectedTable : targetTableName}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-outline uppercase">Modificado CRM:</span>
                          <span className={cn(
                            "text-[10px] font-black px-2 py-0.5 rounded-full uppercase",
                            formData.modificado_crm ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-500"
                          )}>
                            {formData.modificado_crm ? 'SÍ' : 'NO'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
                          {Object.keys(accessories).map(item => (
                            <label key={item} className="flex items-center gap-3 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={accessories[item]}
                                onChange={(e) => setAccessories({ ...accessories, [item]: e.target.checked })}
                                className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                              />
                              <span className="text-[10px] font-bold text-outline uppercase group-hover:text-on-surface">{item}</span>
                            </label>
                          ))}
                        </div>
                        <div className="hidden print:flex flex-wrap gap-x-6 gap-y-2">
                          {Object.entries(accessories).filter(([_, v]) => v).map(([k]) => (
                            <div key={k} className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <span className="text-[10px] font-bold text-on-surface uppercase">{k}</span>
                            </div>
                          ))}
                          {Object.values(accessories).every(v => !v) && <span className="text-[10px] italic text-outline">Ninguno</span>}
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
                            {tecnicos.map(t => (
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
                    await handleSave();
                    setIsEditing(false);
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
