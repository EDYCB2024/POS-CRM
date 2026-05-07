'use client'

import { useEffect, useState } from 'react'
import { supabase, logActivity } from '@/lib/supabase'
import { 
  X, 
  Calendar, 
  Hash, 
  Tag, 
  Clock, 
  ShieldCheck, 
  ShieldX, 
  History, 
  User, 
  Info,
  Loader2,
  ChevronRight,
  Monitor,
  FileSpreadsheet,
  Save,
  Edit2,
  FileText,
  Printer,
  ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TerminalDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  serial: string
  currentSlug: string
}

function EditableReportField({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) {
  return (
    <div className="flex flex-col border-b border-slate-200 pb-1.5 min-h-[36px] justify-end">
      <span className="text-[9px] font-black uppercase text-outline tracking-wider leading-none mb-1">{label}</span>
      <div className="relative">
        <input 
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="..."
          className="text-[11px] font-bold text-on-surface bg-transparent border-none outline-none w-full p-0 h-5 no-print"
        />
        <span className="print-only text-[11px] font-bold text-on-surface truncate">
          {value || '---'}
        </span>
      </div>
    </div>
  )
}

function EditableReportArea({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) {
  return (
    <div className="flex flex-col min-h-[100px]">
      <span className="text-[9px] font-black uppercase text-outline tracking-wider mb-2">{label}</span>
      <div className="relative flex-1">
        <textarea 
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Escriba las observaciones aquí..."
          className="text-[11px] leading-relaxed text-on-surface-variant italic bg-transparent border-none outline-none w-full resize-none h-full p-0 no-print"
        />
        <div className="print-only text-[11px] leading-relaxed text-on-surface-variant italic whitespace-pre-wrap">
          {value || 'Sin observaciones adicionales.'}
        </div>
      </div>
    </div>
  )
}

function AccessoryToggle({ label, value, onChange }: { label: string, value: boolean, onChange: (val: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-slate-50">
      <span className="text-[10px] font-medium text-on-surface-variant">{label}</span>
      <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg no-print">
        <button 
          onClick={() => onChange(true)}
          className={cn(
            "px-2 py-0.5 text-[8px] font-black rounded-md transition-all",
            value ? "bg-primary text-white" : "text-outline hover:text-on-surface"
          )}
        >
          SI
        </button>
        <button 
          onClick={() => onChange(false)}
          className={cn(
            "px-2 py-0.5 text-[8px] font-black rounded-md transition-all",
            !value ? "bg-red-500 text-white" : "text-outline hover:text-on-surface"
          )}
        >
          NO
        </button>
      </div>
      <span className="text-[10px] font-bold text-on-surface hidden print:block print-visible-report">
        {value ? 'SI' : 'NO'}
      </span>
      <span className="text-[10px] font-bold text-on-surface hidden capture-visible">
        {value ? 'SI' : 'NO'}
      </span>
    </div>
  )
}

export function TerminalDetailsModal({ isOpen, onClose, serial, currentSlug }: TerminalDetailsModalProps) {
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'edit' | 'report'>('info')
  const [formData, setFormData] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [accessories, setAccessories] = useState<Record<string, boolean>>({
    'Caja original': false,
    'Cargador': false,
    'Batería': false,
    'SIM card': false,
    'Etiqueta de garantía': false,
    'Forro declaración de cont.': false,
    'Rollo térmico': false
  })
  const [selectedTecnico, setSelectedTecnico] = useState('Eduardo Castillo')

  const tecnicos = [
    'Eduardo Castillo',
    'Andelis Nuñez',
    'Jenfil Gonzalez',
    'Eduardo mendieta'
  ]

  useEffect(() => {
    if (!isOpen || !serial) return

    async function fetchHistory() {
      setLoading(true)
      try {
        const tables = [
          'vatc', 'banplus', 'ccr', 'instapago', 'platco', 'platco_pos',
          'exterior', 'bancaribe', 'tokenp', 'bactivo', 
          'poscom', 'paytech', 'bestpay', 'bancrecer', 'delsur', 'otros'
        ]

        // Search for the serial in all tables to build a complete history
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
            // Sort by date descending
            const dateA = new Date(a.fecha || a.created_at).getTime()
            const dateB = new Date(b.fecha || b.created_at).getTime()
            return dateB - dateA
          })

        setHistory(allRecords)
      } catch (err) {
        console.error('Error fetching terminal history:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [isOpen, serial])

  const tableMapping: Record<string, string> = {
    'del-sur': 'delsur',
    'pos-comercial': 'poscom',
    'token-pagos': 'tokenp',
    'banco-activo': 'bactivo'
  }
  const targetTableName = tableMapping[currentSlug] || currentSlug.replace(/-/g, '_')
  const mainRecord = history.find(r => r.sourceTable === targetTableName) || history[0]

  useEffect(() => {
    if (mainRecord && Object.keys(formData).length === 0) {
      setFormData(mainRecord)
    }
  }, [mainRecord, formData])

  if (!isOpen) return null

  const handleSave = async () => {
    if (!mainRecord) return
    setSaving(true)
    try {
      const { id, sourceTable, created_at, ...updateData } = formData
      const { error } = await supabase
        .from(sourceTable)
        .update(updateData)
        .eq('id', id)

      if (error) throw error
      
      await logActivity('UPDATE_TERMINAL', 'TERMINAL', { 
        serial: formData.serial, 
        table: sourceTable,
        changes: updateData 
      })
      
      // Refresh history
      const tables = [
        'vatc', 'banplus', 'ccr', 'instapago', 'platco', 'platco_pos',
        'exterior', 'bancaribe', 'tokenp', 'bactivo', 
        'poscom', 'paytech', 'bestpay', 'bancrecer', 'delsur', 'otros'
      ]
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
        .sort((a, b) => new Date(b.fecha || b.created_at).getTime() - new Date(a.fecha || a.created_at).getTime())
      
      setHistory(allRecords)
      setActiveTab('info')
    } catch (err) {
      console.error('Error updating record:', err)
      alert('Error al guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  const handlePrint = async () => {
    // Save current data to localStorage for the print tab
    const printData = {
      formData,
      accessories,
      selectedTecnico,
      serial
    }
    localStorage.setItem('print_report_data', JSON.stringify(printData))

    await logActivity('PRINT_REPORT', 'REPORT', { 
      serial, 
      technician: selectedTecnico 
    })

    // Open the dedicated print page in a new tab
    window.open('/print/informe', '_blank')
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm animate-in fade-in duration-200">

      <div 
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 bg-slate-50 border-b border-outline-variant flex justify-between items-center no-print">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <History className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-on-surface flex items-center gap-2">
                Expediente del Equipo
                <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-lg text-xs font-bold">
                  {serial}
                </span>
              </h2>
              <p className="text-sm text-on-surface-variant font-medium">
                Se han encontrado {history.length} ingresos registrados
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-on-surface-variant"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-outline-variant bg-white px-8 no-print">
          <button 
            onClick={() => setActiveTab('info')}
            className={cn(
              "px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2",
              activeTab === 'info' ? "border-primary text-primary" : "border-transparent text-outline hover:text-on-surface"
            )}
          >
            Información Actual
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={cn(
              "px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2",
              activeTab === 'history' ? "border-primary text-primary" : "border-transparent text-outline hover:text-on-surface"
            )}
          >
            Historial de Ingresos ({history.length})
          </button>
          <button 
            onClick={() => setActiveTab('edit')}
            className={cn(
              "px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 flex items-center gap-2",
              activeTab === 'edit' ? "border-primary text-primary" : "border-transparent text-outline hover:text-on-surface"
            )}
          >
            <Edit2 className="w-4 h-4" />
            Editar Expediente
          </button>
          <button 
            onClick={() => setActiveTab('report')}
            className={cn(
              "px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 flex items-center gap-2",
              activeTab === 'report' ? "border-primary text-primary" : "border-transparent text-outline hover:text-on-surface"
            )}
          >
            <FileText className="w-4 h-4" />
            Crear Informe
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm font-bold text-outline uppercase tracking-widest">Consultando base de datos...</p>
            </div>
          ) : activeTab === 'info' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              {/* Row 1: Detalles & Estado */}
              <section>
                <h3 className="text-xs font-black uppercase tracking-widest text-outline mb-4 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Detalles Técnicos
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <InfoItem icon={Hash} label="Serial" value={mainRecord?.serial || mainRecord?.serial_de_remplazo} />
                  <InfoItem icon={Monitor} label="Modelo" value={mainRecord?.modelo} />
                  <InfoItem icon={Calendar} label="Último Ingreso" value={mainRecord?.fecha?.split('T')[0]} />
                  <InfoItem icon={Tag} label="Categoría/Lote" value={mainRecord?.categoria || mainRecord?.lote} />
                </div>
              </section>

              <section>
                <h3 className="text-xs font-black uppercase tracking-widest text-outline mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Estado del Caso
                </h3>
                <div className="space-y-4">
                  <div className={cn(
                    "p-4 rounded-2xl border flex items-center justify-between",
                    mainRecord?.estatus?.toLowerCase().includes('cerrado') ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"
                  )}>
                    <div>
                      <p className="text-[10px] font-black uppercase text-on-surface-variant opacity-60">Estatus Actual</p>
                      <p className={cn(
                        "text-lg font-black uppercase italic",
                        mainRecord?.estatus?.toLowerCase().includes('cerrado') ? "text-green-700" : "text-amber-700"
                      )}>
                        {mainRecord?.estatus}
                      </p>
                    </div>
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      mainRecord?.estatus?.toLowerCase().includes('cerrado') ? "bg-green-500 text-white" : "bg-amber-500 text-white"
                    )}>
                      {mainRecord?.estatus?.toLowerCase().includes('cerrado') ? <ShieldCheck /> : <Clock />}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-outline-variant">
                      <p className="text-[9px] font-black uppercase text-outline mb-1">Garantía</p>
                      <div className="flex items-center gap-2">
                        {mainRecord?.garantia?.toLowerCase() === 'si' ? (
                          <><ShieldCheck className="w-4 h-4 text-green-600" /><span className="text-xs font-bold text-green-700">SI</span></>
                        ) : (
                          <><ShieldX className="w-4 h-4 text-red-500" /><span className="text-xs font-bold text-red-600">NO</span></>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-outline-variant">
                      <p className="text-[9px] font-black uppercase text-outline mb-1">Nivel</p>
                      <p className="text-xs font-bold text-on-surface">{mainRecord?.nivel || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Row 2: Cliente & Observaciones */}
              <section>
                <h3 className="text-xs font-black uppercase tracking-widest text-outline mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Cliente / Comercio
                </h3>
                <div className="bg-slate-50 p-6 rounded-2xl border border-outline-variant space-y-4 h-[120px] flex flex-col justify-center">
                  <p className="text-base font-bold text-on-surface leading-tight">{mainRecord?.razon_social || mainRecord?.razn_social || 'Desconocido'}</p>
                  <p className="text-xs font-medium text-on-surface-variant flex items-center gap-2">
                    <span className="bg-slate-200 px-1.5 py-0.5 rounded uppercase font-bold text-[10px]">RIF:</span>
                    {mainRecord?.rif || 'N/A'}
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-black uppercase tracking-widest text-outline mb-4 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Observaciones
                </h3>
                <div className="bg-slate-50 p-6 rounded-2xl border border-outline-variant h-[120px] overflow-y-auto custom-scrollbar">
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {mainRecord?.observaciones || 'No hay observaciones registradas para este ingreso.'}
                  </p>
                </div>
              </section>
            </div>
          ) : activeTab === 'edit' ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-tight">Modo Edición</p>
                  <p className="text-xs text-amber-700 font-medium">Estás editando el registro actual del aliado {currentSlug.toUpperCase()}. Todos los campos son editables.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.keys(mainRecord || {})
                  .filter(key => !['id', 'created_at', 'sourceTable', 'modificado_crm'].includes(key))
                  .map(key => (
                    <div key={key} className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase text-outline ml-1">{key.replace(/_/g, ' ')}</label>
                      <input 
                        type="text"
                        value={formData[key] || ''}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                        className="bg-slate-50 border border-outline-variant rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all hover:bg-white"
                      />
                    </div>
                  ))}
              </div>

              <div className="pt-6 border-t border-outline-variant flex justify-end gap-4">
                <button 
                  onClick={() => setActiveTab('info')}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-slate-100 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-primary text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          ) : activeTab === 'report' ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 max-w-3xl mx-auto">
              {/* Report Document */}
              <div className="bg-white border border-slate-200 p-10 rounded-[8px] shadow-sm relative overflow-hidden text-on-surface report-print-container">
                {/* Header Logo/Title */}
                <div className="flex justify-between items-start mb-12 border-b-2 border-primary pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary flex items-center justify-center text-white rounded-lg">
                      <Monitor className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black uppercase tracking-tight">Informe de Servicio Técnico</h4>
                      <p className="text-[9px] font-bold text-outline uppercase tracking-[0.2em]">Soporte Técnico y Control de Calidad</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase text-outline">N# Control</p>
                    <p className="text-sm font-bold">{mainRecord?.informe || '---'}</p>
                    <p className="text-[9px] font-black uppercase text-outline mt-1">Fecha</p>
                    <p className="text-xs font-bold">{new Date().toLocaleDateString('es-VE')}</p>
                  </div>
                </div>

                <div className="space-y-14">
                  {/* Section 1: Cliente y Equipo */}
                  <section>
                    <h5 className="text-[10px] font-black uppercase text-primary border-l-4 border-primary pl-3 mb-6 tracking-widest bg-slate-50 py-1.5">1. Información del Cliente y Equipo</h5>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                      <EditableReportField 
                        label="Razón Social" 
                        value={formData.razon_social || formData.razn_social} 
                        onChange={(val) => setFormData({ ...formData, razon_social: val, razn_social: val })}
                      />
                      <EditableReportField 
                        label="Serial" 
                        value={formData.serial} 
                        onChange={(val) => setFormData({ ...formData, serial: val })}
                      />
                      <EditableReportField 
                        label="RIF" 
                        value={formData.rif} 
                        onChange={(val) => setFormData({ ...formData, rif: val })}
                      />
                      <EditableReportField 
                        label="Falla Reportada" 
                        value={formData.falla_notificada || formData.falla_reportada} 
                        onChange={(val) => setFormData({ ...formData, falla_notificada: val })}
                      />
                      <EditableReportField 
                        label="Marca" 
                        value={formData.marca || 'NEWLAND'} 
                        onChange={(val) => setFormData({ ...formData, marca: val })}
                      />
                      <EditableReportField 
                        label="Modelo" 
                        value={formData.modelo} 
                        onChange={(val) => setFormData({ ...formData, modelo: val })}
                      />
                      <EditableReportField 
                        label="Procesadora" 
                        value={formData.procesadora || currentSlug.toUpperCase()} 
                        onChange={(val) => setFormData({ ...formData, procesadora: val })}
                      />
                    </div>
                  </section>

                  {/* Section 2: Recepción */}
                  <section>
                    <h5 className="text-[10px] font-black uppercase text-primary border-l-4 border-primary pl-3 mb-4 tracking-widest bg-slate-50 py-1.5">2. Recepción del Equipo (Accesorios)</h5>
                    <div className="grid grid-cols-2 gap-x-12">
                      <div className="space-y-1">
                        <AccessoryToggle 
                          label="Caja original" 
                          value={accessories['Caja original']} 
                          onChange={(val) => setAccessories({ ...accessories, 'Caja original': val })} 
                        />
                        <AccessoryToggle 
                          label="Cargador" 
                          value={accessories['Cargador']} 
                          onChange={(val) => setAccessories({ ...accessories, 'Cargador': val })} 
                        />
                        <AccessoryToggle 
                          label="Batería" 
                          value={accessories['Batería']} 
                          onChange={(val) => setAccessories({ ...accessories, 'Batería': val })} 
                        />
                        <AccessoryToggle 
                          label="SIM card" 
                          value={accessories['SIM card']} 
                          onChange={(val) => setAccessories({ ...accessories, 'SIM card': val })} 
                        />
                        <AccessoryToggle 
                          label="Etiqueta de garantía" 
                          value={accessories['Etiqueta de garantía']} 
                          onChange={(val) => setAccessories({ ...accessories, 'Etiqueta de garantía': val })} 
                        />
                      </div>
                      <div className="space-y-1">
                        <AccessoryToggle 
                          label="Forro declaración de cont." 
                          value={accessories['Forro declaración de cont.']} 
                          onChange={(val) => setAccessories({ ...accessories, 'Forro declaración de cont.': val })} 
                        />
                        <AccessoryToggle 
                          label="Rollo térmico" 
                          value={accessories['Rollo térmico']} 
                          onChange={(val) => setAccessories({ ...accessories, 'Rollo térmico': val })} 
                        />
                      </div>
                    </div>
                  </section>

                  {/* Section 3: Evaluación */}
                  <section>
                    <h5 className="text-[10px] font-black uppercase text-primary border-l-4 border-primary pl-3 mb-6 tracking-widest bg-slate-50 py-1.5">3. Evaluación Técnica</h5>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                      <EditableReportField 
                        label="Estatus del Equipo" 
                        value={formData.estatus} 
                        onChange={(val) => setFormData({ ...formData, estatus: val })}
                      />
                      <EditableReportField 
                        label="Garantía" 
                        value={formData.garantia} 
                        onChange={(val) => setFormData({ ...formData, garantia: val })}
                      />
                      <EditableReportField 
                        label="Nivel" 
                        value={formData.nivel} 
                        onChange={(val) => setFormData({ ...formData, nivel: val })}
                      />
                      <EditableReportField 
                        label="Estatus del Caso" 
                        value={formData.estatus_del_caso} 
                        onChange={(val) => setFormData({ ...formData, estatus_del_caso: val })}
                      />
                    </div>
                  </section>

                  {/* Section 4: Observaciones */}
                  <section>
                    <h5 className="text-[10px] font-black uppercase text-primary border-l-4 border-primary pl-3 mb-4 tracking-widest bg-slate-50 py-1.5">4. Observaciones Finales</h5>
                    <div className="p-4 border border-slate-100 rounded bg-slate-50/50 min-h-[120px]">
                      <EditableReportArea 
                        label="Detalle de la evaluación" 
                        value={formData.observaciones} 
                        onChange={(val) => setFormData({ ...formData, observaciones: val })}
                      />
                    </div>
                  </section>
                  
                  {/* Tecnico sin cabecera */}
                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-black uppercase text-outline tracking-wider mb-1">Técnico Encargado</span>
                      <select 
                        value={selectedTecnico}
                        onChange={(e) => setSelectedTecnico(e.target.value)}
                        className="text-[11px] font-bold text-primary bg-slate-50 border border-slate-200 rounded px-3 py-1.5 outline-none no-print"
                      >
                        {tecnicos.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <p className="text-[11px] font-bold text-primary hidden print:block uppercase">{selectedTecnico}</p>
                    </div>
                  </div>

                </div>
              </div>

                <div className="flex justify-center gap-4 no-print">
                  <button
                    onClick={handlePrint}
                    className="bg-primary text-white px-12 py-3 rounded-xl text-sm font-bold shadow-xl hover:opacity-90 transition-all flex items-center gap-3"
                  >
                    <Printer className="w-5 h-5" />
                    Imprimir Informe
                  </button>
                </div>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((record, index) => (
                <div 
                  key={index}
                  className="group bg-white border border-outline-variant rounded-2xl p-6 hover:border-primary/50 hover:bg-primary/[0.02] transition-all relative"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  {/* Header of history item */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-dashed border-outline-variant">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                        {history.length - index}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-outline tracking-widest leading-none mb-1">Base de Datos</p>
                        <p className="text-sm font-black text-on-surface uppercase tracking-tight">{record.sourceTable.replace(/_/g, ' ')}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border shadow-sm",
                      record.estatus?.toLowerCase().includes('cerrado') ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"
                    )}>
                      {record.estatus || 'SIN ESTATUS'}
                    </div>
                  </div>

                  {/* Grid of details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase text-outline flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Fecha Ingreso
                      </p>
                      <p className="text-xs font-bold text-on-surface">{record.fecha?.split('T')[0] || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase text-outline flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Fecha Final
                      </p>
                      <p className="text-xs font-bold text-on-surface">{record.fecha_final || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase text-outline flex items-center gap-1">
                        <Tag className="w-3 h-3" /> Categoría
                      </p>
                      <p className="text-xs font-bold text-on-surface truncate">{record.categoria || record.categora || record.lote || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase text-outline flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Garantía
                      </p>
                      <p className={cn(
                        "text-xs font-black uppercase",
                        record.garantia?.toLowerCase() === 'si' ? "text-green-600" : "text-red-500"
                      )}>
                        {record.garantia || 'NO'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase text-outline flex items-center gap-1">
                        <FileSpreadsheet className="w-3 h-3" /> Cotización
                      </p>
                      <p className="text-xs font-bold text-primary font-mono">{record.cotizacin || record.cotizacion || '-'}</p>
                    </div>
                    <div className="md:col-span-3 space-y-1">
                      <p className="text-[9px] font-black uppercase text-outline flex items-center gap-1">
                        <Info className="w-3 h-3" /> Observaciones
                      </p>
                      <p className="text-xs text-on-surface-variant italic leading-relaxed line-clamp-2">
                        {record.observaciones || 'Sin observaciones.'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-50 border-t border-outline-variant flex justify-end no-print">
          <button 
            onClick={onClose}
            className="bg-on-surface text-surface px-8 py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all"
          >
            Cerrar Expediente
          </button>
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
