'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'
import { Loader2, Check, AlertCircle, Trash2, Save, Hash, ArrowLeft, Activity } from 'lucide-react'

export default function SerialesGestionPage({ searchParams }: { searchParams: Promise<any> }) {
  const params = use(searchParams)
  const slug = params.slug || ''
  const initialIdsList = params.ids ? params.ids.split(',').filter(Boolean) : []

  const [ids, setIds] = useState<string[]>(initialIdsList)
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [successCount, setSuccessCount] = useState<number | null>(null)

  // Fields to update state
  const [updateFields, setUpdateFields] = useState({
    estatus: false,
    estatus_del_caso: false,
    garantia: false,
    nivel: false,
    observaciones: false
  })

  // Value states for update
  const [values, setValues] = useState({
    estatus: 'POR DEFINIR',
    estatus_del_caso: 'CASO ABIERTO',
    garantia: 'POR DEFINIR',
    nivel: 'POR DEFINIR',
    observaciones: ''
  })

  // Observation append mode: 'append' or 'overwrite'
  const [obsMode, setObsMode] = useState<'append' | 'overwrite'>('append')

  // Centralized statuses list
  const [statuses, setStatuses] = useState<string[]>([])

  const tableMapping: Record<string, string> = {
    'del-sur': 'delsur',
    'pos-comercial': 'poscom',
    'token-pagos': 'tokenp',
    'banco-activo': 'bactivo',
    'credicard': 'ccr'
  }
  const tableName = tableMapping[slug] || slug.replace(/-/g, '_')

  // Fetch initial records for display
  useEffect(() => {
    async function fetchData() {
      if (!slug || ids.length === 0) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const { data: records, error } = await supabase
          .from(tableName)
          .select('*')
          .in('id', ids)

        if (error) throw error
        setData(records || [])

        // Fetch central statuses
        const { data: statusData } = await supabase
          .from('estatus')
          .select('estatus')
          .order('estatus')

        if (statusData) {
          setStatuses(statusData.map(s => s.estatus).filter(Boolean))
        }
      } catch (err) {
        console.error('Error fetching selected records:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug, ids])

  const handleRemoveId = (idToRemove: string) => {
    setIds(prev => prev.filter(id => id !== idToRemove))
    setData(prev => prev.filter(row => row.id !== idToRemove))
  }

  const handleApplyChanges = async () => {
    if (ids.length === 0) return
    const activeFieldKeys = Object.entries(updateFields)
      .filter(([_, active]) => active)
      .map(([key]) => key)

    if (activeFieldKeys.length === 0) {
      alert('Por favor selecciona al menos un campo para actualizar.')
      return
    }

    const confirmUpdate = window.confirm(`¿Estás seguro de que deseas actualizar los ${ids.length} ingresos seleccionados?`)
    if (!confirmUpdate) return

    setUpdating(true)
    setSuccessCount(null)

    try {
      // Build basic payload for bulk fields (excluding observations if in append mode)
      const basePayload: any = {
        modificado_crm: true
      }
      
      if (updateFields.estatus) basePayload.estatus = values.estatus
      if (updateFields.estatus_del_caso) basePayload.estatus_del_caso = values.estatus_del_caso
      if (updateFields.garantia) basePayload.garantia = values.garantia
      if (updateFields.nivel) basePayload.nivel = values.nivel

      // If updating observations in append mode, we do row-by-row to preserve unique histories.
      // Otherwise, if not appending observations, we can do it in one single batch query!
      const needsRowByRow = updateFields.observaciones && obsMode === 'append'

      if (needsRowByRow) {
        let count = 0
        for (const row of data) {
          const currentObs = row.observaciones || ''
          const newObs = values.observaciones
          const updatedObs = currentObs 
            ? `${currentObs}\n[${new Date().toLocaleDateString()}]: ${newObs}`
            : `[${new Date().toLocaleDateString()}]: ${newObs}`

          const payload = {
            ...basePayload,
            observaciones: updatedObs
          }

          const { error } = await supabase
            .from(tableName)
            .update(payload)
            .eq('id', row.id)

          if (!error) count++
        }
        setSuccessCount(count)
      } else {
        // If observations is active in overwrite mode, add it directly to basePayload
        if (updateFields.observaciones && obsMode === 'overwrite') {
          basePayload.observaciones = values.observaciones
        }

        const { error } = await supabase
          .from(tableName)
          .update(basePayload)
          .in('id', ids)

        if (error) throw error
        setSuccessCount(ids.length)
      }

      // Re-fetch updated records
      const { data: updatedRecords } = await supabase
        .from(tableName)
        .select('*')
        .in('id', ids)
      
      if (updatedRecords) setData(updatedRecords)

      alert('¡Actualización masiva completada con éxito!')
    } catch (err) {
      console.error('Error applying bulk updates:', err)
      alert('Ocurrió un error al aplicar las actualizaciones.')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.close()}
              className="p-2 bg-white hover:bg-slate-100 rounded-full border border-outline-variant transition-all flex items-center justify-center animate-in fade-in"
              title="Cerrar pestaña"
            >
              <ArrowLeft className="w-5 h-5 text-on-surface-variant" />
            </button>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-primary flex items-center gap-2">
                <Activity className="w-6 h-6" />
                Gestión Masiva de Equipos: {slug.toUpperCase()}
              </h1>
              <p className="text-on-surface-variant text-sm font-medium">
                {ids.length} ingresos cargados en lote para edición simultánea
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl border border-outline-variant p-20 flex flex-col items-center justify-center gap-4 shadow-sm">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="font-bold text-on-surface-variant uppercase tracking-widest text-xs">Cargando detalles de los equipos...</p>
          </div>
        ) : ids.length === 0 ? (
          <div className="bg-white rounded-3xl border border-outline-variant p-20 text-center shadow-sm max-w-xl mx-auto">
            <AlertCircle className="w-16 h-16 text-primary/40 mx-auto mb-4 animate-bounce" />
            <h3 className="text-lg font-black text-on-surface mb-2">No hay ingresos seleccionados</h3>
            <p className="text-xs font-bold text-outline uppercase tracking-wider leading-relaxed">
              Por favor selecciona los ingresos que deseas gestionar en la pestaña de aliados y presiona "Gestionar en Lote".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Column */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-outline-variant shadow-sm p-6 space-y-6 animate-in slide-in-from-left duration-300">
              <div className="border-b border-outline-variant pb-4">
                <h2 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Panel de Actualización Masiva
                </h2>
                <p className="text-[10px] font-bold text-outline uppercase mt-1">Marca las casillas de los campos que deseas modificar</p>
              </div>

              <div className="space-y-4">
                {/* Estatus */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer font-black text-[10px] uppercase text-on-surface-variant tracking-wider">
                    <input
                      type="checkbox"
                      checked={updateFields.estatus}
                      onChange={(e) => setUpdateFields(prev => ({ ...prev, estatus: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-0 accent-primary cursor-pointer"
                    />
                    Actualizar Estatus
                  </label>
                  {updateFields.estatus && (
                    <select
                      value={values.estatus}
                      onChange={(e) => setValues(prev => ({ ...prev, estatus: e.target.value }))}
                      className="w-full bg-white border border-outline-variant rounded-xl px-3 py-2 text-xs font-bold text-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                      <option value="POR DEFINIR">POR DEFINIR</option>
                      {statuses.filter(s => s !== 'POR DEFINIR').map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Estatus del Caso */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer font-black text-[10px] uppercase text-on-surface-variant tracking-wider">
                    <input
                      type="checkbox"
                      checked={updateFields.estatus_del_caso}
                      onChange={(e) => setUpdateFields(prev => ({ ...prev, estatus_del_caso: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-0 accent-primary cursor-pointer"
                    />
                    Actualizar Estatus del Caso
                  </label>
                  {updateFields.estatus_del_caso && (
                    <select
                      value={values.estatus_del_caso}
                      onChange={(e) => setValues(prev => ({ ...prev, estatus_del_caso: e.target.value }))}
                      className="w-full bg-white border border-outline-variant rounded-xl px-3 py-2 text-xs font-bold text-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                      <option value="CASO ABIERTO">CASO ABIERTO</option>
                      <option value="CASO CERRADO">CASO CERRADO</option>
                    </select>
                  )}
                </div>

                {/* Garantia */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer font-black text-[10px] uppercase text-on-surface-variant tracking-wider">
                    <input
                      type="checkbox"
                      checked={updateFields.garantia}
                      onChange={(e) => setUpdateFields(prev => ({ ...prev, garantia: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-0 accent-primary cursor-pointer"
                    />
                    Actualizar Garantía
                  </label>
                  {updateFields.garantia && (
                    <select
                      value={values.garantia}
                      onChange={(e) => setValues(prev => ({ ...prev, garantia: e.target.value }))}
                      className="w-full bg-white border border-outline-variant rounded-xl px-3 py-2 text-xs font-bold text-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                      <option value="POR DEFINIR">POR DEFINIR</option>
                      <option value="SI">SI</option>
                      <option value="NO">NO</option>
                    </select>
                  )}
                </div>

                {/* Nivel */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer font-black text-[10px] uppercase text-on-surface-variant tracking-wider">
                    <input
                      type="checkbox"
                      checked={updateFields.nivel}
                      onChange={(e) => setUpdateFields(prev => ({ ...prev, nivel: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-0 accent-primary cursor-pointer"
                    />
                    Actualizar Nivel de Falla
                  </label>
                  {updateFields.nivel && (
                    <select
                      value={values.nivel}
                      onChange={(e) => setValues(prev => ({ ...prev, nivel: e.target.value }))}
                      className="w-full bg-white border border-outline-variant rounded-xl px-3 py-2 text-xs font-bold text-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                      <option value="POR DEFINIR">POR DEFINIR</option>
                      <option value="Nivel 0">Nivel 0</option>
                      <option value="Nivel 1">Nivel 1</option>
                      <option value="Nivel 2">Nivel 2</option>
                    </select>
                  )}
                </div>

                {/* Observaciones */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer font-black text-[10px] uppercase text-on-surface-variant tracking-wider">
                    <input
                      type="checkbox"
                      checked={updateFields.observaciones}
                      onChange={(e) => setUpdateFields(prev => ({ ...prev, observaciones: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-0 accent-primary cursor-pointer"
                    />
                    Actualizar Observaciones
                  </label>
                  {updateFields.observaciones && (
                    <div className="space-y-2">
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1.5 cursor-pointer font-bold text-[10px] text-outline uppercase">
                          <input
                            type="radio"
                            name="obsMode"
                            checked={obsMode === 'append'}
                            onChange={() => setObsMode('append')}
                            className="accent-primary"
                          />
                          Añadir al final
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer font-bold text-[10px] text-outline uppercase">
                          <input
                            type="radio"
                            name="obsMode"
                            checked={obsMode === 'overwrite'}
                            onChange={() => setObsMode('overwrite')}
                            className="accent-primary"
                          />
                          Sobrescribir
                        </label>
                      </div>
                      <textarea
                        value={values.observaciones}
                        onChange={(e) => setValues(prev => ({ ...prev, observaciones: e.target.value }))}
                        className="w-full bg-white border border-outline-variant rounded-xl px-3 py-2 text-xs font-bold text-primary focus:ring-2 focus:ring-primary/20 outline-none h-20 resize-none"
                        placeholder="Observaciones técnicas para el lote..."
                      />
                    </div>
                  )}
                </div>
              </div>

              {successCount !== null && (
                <div className="p-4 bg-green-50 text-green-700 rounded-2xl border border-green-200 flex items-center gap-3 animate-in fade-in">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-xs font-bold">¡Se actualizaron con éxito {successCount} de {ids.length} ingresos!</span>
                </div>
              )}

              <button
                onClick={handleApplyChanges}
                disabled={updating || ids.length === 0}
                className="w-full bg-primary text-white py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Aplicar Cambios Masivos
              </button>
            </div>

            {/* List Column */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-outline-variant shadow-sm overflow-hidden flex flex-col animate-in slide-in-from-right duration-300">
              <div className="px-6 py-4 border-b border-outline-variant bg-slate-50 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Ingresos Seleccionados ({ids.length})
                </h3>
              </div>
              <div className="divide-y divide-outline-variant/60 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {data.map((row, i) => {
                  const serialVal = row.serial || row.serial_de_remplazo
                  return (
                    <div key={i} className="px-6 py-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs font-black text-primary">{serialVal}</span>
                          <span className="text-[10px] font-bold uppercase text-outline tracking-wider">{row.modelo || 'Sin modelo'}</span>
                        </div>
                        <p className="text-xs font-bold text-on-surface truncate">{row.razon_social || row.razn_social || 'PENDIENTE POR CLIENTE'}</p>
                        
                        {/* Current Status Pills */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight bg-slate-100 text-slate-600 border border-slate-200">
                            Estatus: {row.estatus || 'N/A'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight bg-slate-100 text-slate-600 border border-slate-200">
                            Garantía: {row.garantia || 'N/A'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight bg-slate-100 text-slate-600 border border-slate-200">
                            Caso: {row.estatus_del_caso || 'N/A'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight bg-slate-100 text-slate-600 border border-slate-200">
                            Nivel: {row.nivel || 'N/A'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveId(row.id)}
                        className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-all"
                        title="Quitar de la lista"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
