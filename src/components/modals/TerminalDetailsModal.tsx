'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
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
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TerminalDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  serial: string
  currentSlug: string
}

export function TerminalDetailsModal({ isOpen, onClose, serial, currentSlug }: TerminalDetailsModalProps) {
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info')

  useEffect(() => {
    if (!isOpen || !serial) return

    async function fetchHistory() {
      setLoading(true)
      try {
        const tables = [
          'vatc', 'banplus', 'ccr', 'instapago', 'platco', 
          'exterior', 'bancaribe', 'tokenp', 'bactivo', 
          'poscom', 'paytech', 'bestpay', 'bancrecer'
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

  if (!isOpen) return null

  const mainRecord = history.find(r => r.sourceTable === currentSlug.replace(/-/g, '_')) || history[0]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 bg-slate-50 border-b border-outline-variant flex justify-between items-center">
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
        <div className="flex border-b border-outline-variant bg-white px-8">
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
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm font-bold text-outline uppercase tracking-widest">Consultando base de datos...</p>
            </div>
          ) : activeTab === 'info' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Main Info Column */}
              <div className="space-y-6">
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
                    <User className="w-4 h-4" />
                    Cliente / Comercio
                  </h3>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-outline-variant space-y-2">
                    <p className="text-sm font-bold text-on-surface">{mainRecord?.razon_social || mainRecord?.razn_social || 'Desconocido'}</p>
                    <p className="text-xs font-medium text-on-surface-variant flex items-center gap-2">
                      <span className="bg-slate-200 px-1.5 py-0.5 rounded uppercase font-bold text-[10px]">RIF:</span>
                      {mainRecord?.rif || 'N/A'}
                    </p>
                  </div>
                </section>
              </div>

              {/* Status Column */}
              <div className="space-y-6">
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
                            <><ShieldCheck className="w-4 h-4 text-green-600" /><span className="text-xs font-bold text-green-700">ACTIVA</span></>
                          ) : (
                            <><ShieldX className="w-4 h-4 text-red-500" /><span className="text-xs font-bold text-red-600">EXPIRADA</span></>
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

                <section>
                  <h3 className="text-xs font-black uppercase tracking-widest text-outline mb-4">Observaciones</h3>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-outline-variant min-h-[100px]">
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {mainRecord?.observaciones || 'No hay observaciones registradas para este ingreso.'}
                    </p>
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((record, index) => (
                <div 
                  key={index}
                  className="group bg-white border border-outline-variant rounded-2xl p-6 hover:border-primary/50 hover:bg-primary/[0.02] transition-all relative"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        {history.length - index}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface uppercase">{record.sourceTable.replace(/_/g, ' ')}</p>
                        <div className="flex items-center gap-3 text-xs font-medium text-on-surface-variant">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {record.fecha?.split('T')[0]}</span>
                          <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {record.categoria || record.lote}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border",
                        record.estatus?.toLowerCase().includes('cerrado') ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"
                      )}>
                        {record.estatus}
                      </div>
                      <ChevronRight className="w-5 h-5 text-outline group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                  {record.observaciones && (
                    <div className="mt-4 pt-4 border-t border-dashed border-outline-variant">
                      <p className="text-xs italic text-on-surface-variant">"{record.observaciones}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-50 border-t border-outline-variant flex justify-end">
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
