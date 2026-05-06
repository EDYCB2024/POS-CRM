'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

import { supabase } from '@/lib/supabase'
import { TopBar } from '@/components/layout/TopBar'
import { 
  Monitor, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Filter, 
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  MapPin,
  FileSpreadsheet,
  Building2,
  Download,
  CloudUpload,
  Loader2,
  ExternalLink
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { FilterDropdown } from "@/components/ui/FilterDropdown"
import { ShieldCheck, ShieldX } from 'lucide-react'
import { TerminalDetailsModal } from '@/components/modals/TerminalDetailsModal'

export default function AllyPage() {
  const { slug } = useParams()
  const [data, setData] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [filterLote, setFilterLote] = useState('')
  const [filterMes, setFilterMes] = useState('')
  const [filterEstatus, setFilterEstatus] = useState('')
  const [filterGarantia, setFilterGarantia] = useState('')
  const [filterSerial, setFilterSerial] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSerial, setSelectedSerial] = useState('')
  const pageSize = 10

  const toggleSelectAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(data.map(row => row.id))
    }
  }

  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedIds.length === 0) return
    try {
      setLoading(true)
      const tableName = slug?.toString().replace(/-/g, '_') || ''
      const { error: updateError } = await supabase
        .from(tableName)
        .update({ estatus: newStatus, modificado_crm: true })
        .in('id', selectedIds)

      if (updateError) throw updateError
      
      setSelectedIds([])
      window.location.reload() 
    } catch (err: any) {
      alert("Error al actualizar: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const COLUMN_ORDER: Record<string, string[]> = {
    vatc: ['n', 'factura', 'procesadora', 'fecha', 'aliado', 'modelo', 'razon_social', 'serial', 'rif', 'estatus', 'nivel', 'observaciones'],
    platco: ['nro', 'fecha', 'aliado', 'modelo', 'razon_social', 'serial', 'rif', 'ingreso', 'categoria', 'fecha_final', 'estatus', 'nivel', 'observaciones'],
    banplus: ['n', 'fecha', 'aliado', 'modelo', 'razon_social', 'serial', 'rif', 'ingreso', 'categoria', 'fecha_final', 'estatus', 'nivel', 'observaciones'],
    ccr: ['n', 'fecha', 'aliado', 'modelo', 'razon_social', 'serial', 'rif', 'ingreso', 'categoria', 'fecha_final', 'estatus', 'nivel', 'observaciones'],
  }

  useEffect(() => {
    async function fetchData() {
      if (!slug) return
      try {
        setLoading(true)
        const currentSlug = slug.toString()
        const tableName = currentSlug.replace(/-/g, '_')
        
        const from = page * pageSize
        const to = from + pageSize - 1

        let query = supabase
          .from(tableName)
          .select('*', { count: 'exact' })

        // Aplicar Filtros
        if (filterLote) {
          // Intentamos buscar en 'lote' si existe, si no en 'categoria'
          const loteCol = columns.includes('lote') ? 'lote' : 'categoria'
          query = query.ilike(loteCol, `%${filterLote}%`)
        }
        if (filterEstatus) query = query.ilike('estatus', `%${filterEstatus}%`)
        if (filterGarantia) query = query.ilike('garantia', `%${filterGarantia}%`)
        if (filterMes) {
          // Asumiendo formato DD/MM/YYYY en la base de datos
          query = query.ilike('fecha', `%/${filterMes}/%`)
        }
        if (filterSerial) {
          query = query.or(`serial.ilike.%${filterSerial}%,serial_de_remplazo.ilike.%${filterSerial}%`)
        }

        const { data: tableData, error: dbError, count } = await query
          .order('fecha', { ascending: false })
          .range(from, to)

        if (dbError) throw dbError
        
        setData(tableData || [])
        setTotalCount(count || 0)
        if (tableData && tableData.length > 0) {
          const allCols = Object.keys(tableData[0]).filter(h => !['id', 'created_at', 'serial_id', 'modificado_crm'].includes(h))
          const preferred = COLUMN_ORDER[currentSlug] || []
          
          const sortedCols = [
            ...preferred.filter(p => allCols.includes(p)),
            ...allCols.filter(c => !preferred.includes(c))
          ]
          setColumns(sortedCols)
        }
      } catch (err: any) {
        console.error('Error fetching data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug, page, filterLote, filterMes, filterEstatus, filterGarantia, filterSerial])

  const headers = columns.length > 0 ? columns : []

  // Helper para renderizar badges de estatus al estilo "Terminal"
  const renderCellContent = (header: string, value: any) => {
    const stringValue = value?.toString() || '-'
    
    if (header.toLowerCase().includes('estatus') || header.toLowerCase().includes('status')) {
      const isOnline = stringValue.toLowerCase().includes('cerrado') || stringValue.toLowerCase().includes('entregado') || stringValue.toLowerCase().includes('reparado')
      const isPending = stringValue.toLowerCase().includes('abierto') || stringValue.toLowerCase().includes('proceso') || stringValue.toLowerCase().includes('pendiente')
      const isOffline = stringValue.toLowerCase().includes('falla') || stringValue.toLowerCase().includes('inactivo') || stringValue.toLowerCase().includes('anulado') || stringValue.toLowerCase().includes('irreparable')

      return (
        <div className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap uppercase tracking-tighter",
          isOnline && "bg-green-50 text-green-700 border-green-200",
          isPending && "bg-amber-50 text-amber-700 border-amber-200",
          isOffline && "bg-red-50 text-red-700 border-red-200",
          !isOnline && !isPending && !isOffline && "bg-slate-50 text-slate-500 border-slate-200"
        )}>
          {stringValue}
        </div>
      )
    }

    if (header.toLowerCase().includes('factura')) {
      const cleanValue = stringValue.includes('T') ? stringValue.split('T')[0] : stringValue
      return <span className="font-mono text-[11px] font-bold text-primary block text-right">{cleanValue}</span>
    }

    if (header.toLowerCase().includes('fecha') || header.toLowerCase().includes('date')) {
      if (!value) return '-'
      const dateOnly = stringValue.split('T')[0].split(' ')[0]
      return <span className="text-[11px] font-medium text-on-surface-variant">{dateOnly}</span>
    }

    if (header.toLowerCase().includes('serial')) {
      return <span className="font-mono text-[11px] font-bold text-primary">{stringValue}</span>
    }

    if (header.toLowerCase().includes('garantia')) {
      const isSi = stringValue.toLowerCase() === 'si'
      return (
        <div className={cn(
          "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter border",
          isSi ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200 opacity-60"
        )}>
          {isSi ? <ShieldCheck className="w-2.5 h-2.5" /> : <ShieldX className="w-2.5 h-2.5" />}
          {stringValue}
        </div>
      )
    }

    return <span className="text-[11px] text-on-surface truncate max-w-[150px] block" title={stringValue}>{stringValue}</span>
  }

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-surface-container-lowest">
      <TopBar title={`Aliado: ${slug?.toString().toUpperCase()}`} />
      
      <section className="p-4">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl uppercase tracking-tight font-black flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              {slug}
            </h1>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-white border border-outline-variant text-on-surface px-4 py-2 rounded-lg text-sm font-semibold hover:bg-surface-container transition-all">
              <Download className="w-4 h-4 text-primary" />
              Exportar
            </button>
            <button className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-600 shadow-lg shadow-amber-200 transition-all">
              <CloudUpload className="w-4 h-4" />
              Subir Cambios
            </button>
          </div>
        </div>

        <div className="mb-4 flex justify-end">
          <button className="flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 shadow-lg shadow-primary/20 transition-all">
            <Plus className="w-4 h-4" />
            Añadir Equipo
          </button>
        </div>

        {/* Filtros */}
        <div className="mb-4 bg-white p-3 rounded-xl border border-outline-variant flex gap-4 items-center shadow-sm">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase text-on-surface-variant ml-1">Lote / Categoría</label>
            <input 
              type="text" 
              placeholder="Ej: Lote 1..."
              value={filterLote}
              onChange={(e) => setFilterLote(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-outline-variant rounded-lg text-xs focus:ring-2 focus:ring-primary/20 outline-none w-40"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase text-on-surface-variant ml-1">Serial</label>
            <input 
              type="text" 
              placeholder="Ej: N910..."
              value={filterSerial}
              onChange={(e) => setFilterSerial(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-outline-variant rounded-lg text-xs focus:ring-2 focus:ring-primary/20 outline-none w-32"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase text-on-surface-variant ml-1">Mes</label>
            <select 
              value={filterMes}
              onChange={(e) => setFilterMes(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-outline-variant rounded-lg text-xs focus:ring-2 focus:ring-primary/20 outline-none w-32"
            >
              <option value="">Todos</option>
              {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(m => (
                <option key={m} value={m}>{new Date(2024, parseInt(m)-1).toLocaleString('es', { month: 'long' })}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase text-on-surface-variant ml-1">Estatus</label>
            <select 
              value={filterEstatus}
              onChange={(e) => setFilterEstatus(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-outline-variant rounded-lg text-xs focus:ring-2 focus:ring-primary/20 outline-none w-32"
            >
              <option value="">Todos</option>
              <option value="ABIERTO">Abierto</option>
              <option value="CERRADO">Cerrado</option>
              <option value="PROCESO">Proceso</option>
              <option value="IRREPARABLE">Irreparable</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase text-on-surface-variant ml-1">Garantía</label>
            <FilterDropdown 
              label="Filtro"
              currentValue={filterGarantia}
              onSelect={setFilterGarantia}
              options={[
                { label: "Si", value: "si", icon: ShieldCheck },
                { label: "No", value: "no", icon: ShieldX }
              ]}
            />
          </div>

          <button 
            onClick={() => { setFilterLote(''); setFilterMes(''); setFilterEstatus(''); setFilterGarantia(''); setFilterSerial(''); }}
            className="mt-5 text-[10px] font-black uppercase text-on-surface-variant hover:text-primary transition-colors"
          >
            Limpiar Filtros
          </button>

          <div className="h-8 w-px bg-outline-variant mt-4 mx-2" />

          <Link 
            href={`/seriales?slug=${slug}&lote=${filterLote}&mes=${filterMes}&estatus=${filterEstatus}&garantia=${filterGarantia}&serial=${filterSerial}&loteCol=${columns.includes('lote') ? 'lote' : 'categoria'}`}
            target="_blank"
            className="mt-5 flex items-center gap-2 bg-primary text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase hover:opacity-90 transition-all shadow-md shadow-primary/20"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Ver Seriales Filtrados
          </Link>
        </div>

        {selectedIds.length > 0 && (
          <div className="mb-4 bg-primary text-white p-3 rounded-xl flex items-center justify-between shadow-lg animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold">{selectedIds.length} equipos seleccionados</span>
              <div className="h-4 w-px bg-white/20" />
              <div className="flex gap-2">
                {['ABIERTO', 'CERRADO', 'REPARADO', 'IRREPARABLE'].map(status => (
                  <button 
                    key={status}
                    onClick={() => handleBulkStatusChange(status)}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-md text-[10px] font-black uppercase transition-all"
                  >
                    Marcar {status}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setSelectedIds([])} className="text-xs font-bold hover:underline opacity-80">Cancelar</button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4 bg-white rounded-lg border border-outline-variant">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-on-surface-variant">Cargando datos...</p>
          </div>
        ) : error ? (
          <div className="bg-white p-12 rounded-lg border border-red-100 flex flex-col items-center gap-4 text-center">
            <AlertCircle className="w-10 h-10 text-red-500" />
            <h3 className="text-lg font-bold">Error de Conexión</h3>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-outline-variant overflow-hidden shadow-sm">
            {/* Table Toolbar */}
            <div className="px-4 py-2 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
              <div className="flex gap-2">
                {/* Search removed */}
              </div>
              <div className="flex items-center gap-4">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                  Showing {page * pageSize + 1}-{Math.min((page + 1) * pageSize, totalCount)} of {totalCount}
                </p>
                <div className="flex border border-outline-variant rounded-md overflow-hidden">
                  <button 
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="p-1.5 bg-white hover:bg-surface-container border-r border-outline-variant disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => setPage(p => p + 1)}
                    disabled={(page + 1) * pageSize >= totalCount}
                    className="p-1.5 bg-white hover:bg-surface-container disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Table Area */}
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-outline-variant">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="bg-blue-50 border-b border-outline-variant">
                    <th className="px-3 py-2 w-[40px] text-center border-r border-outline-variant/30">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.length === data.length && data.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-outline-variant text-primary focus:ring-primary"
                      />
                    </th>
                    {headers.map(header => {
                      const isNumber = header.toLowerCase() === 'n' || header.toLowerCase() === 'nro'
                      return (
                        <th key={header} className={cn(
                          "px-3 py-2 text-[10px] text-on-surface-variant uppercase tracking-wider font-extrabold border-r border-outline-variant/30 last:border-r-0",
                          isNumber ? "w-[60px]" : "w-[150px]"
                        )}>
                          <div className="flex items-center justify-between">
                            {header.replace(/_/g, ' ')}
                            <ArrowUpDown className="w-2.5 h-2.5 opacity-30" />
                          </div>
                        </th>
                      )
                    })}
                    <th className="px-3 py-2 text-[10px] text-on-surface-variant text-right uppercase tracking-wider font-extrabold w-[80px]">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {data.length > 0 ? data.map((row, idx) => (
                    <tr 
                      key={idx} 
                      onClick={() => {
                        setSelectedSerial(row.serial || row.serial_de_remplazo)
                        setIsModalOpen(true)
                      }}
                      className={cn(
                        "transition-colors group cursor-pointer", 
                        selectedIds.includes(row.id) ? "bg-primary/10" : "hover:bg-primary/5"
                      )}
                    >
                      <td 
                        className="px-3 py-1.5 text-center border-r border-outline-variant/10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(row.id)}
                          onChange={() => toggleSelectRow(row.id)}
                          className="rounded border-outline-variant text-primary focus:ring-primary"
                        />
                      </td>
                      {headers.map(header => (
                        <td key={header} className="px-3 py-1.5 border-r border-outline-variant/10 last:border-r-0">
                          {renderCellContent(header, row[header])}
                        </td>
                      ))}
                      <td className="px-3 py-1.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <button className="p-1 hover:bg-surface-container rounded-md text-on-surface-variant transition-colors">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={headers.length + 1} className="px-lg py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="p-4 bg-surface-container-low rounded-2xl">
                            <FileSpreadsheet className="w-10 h-10 text-outline" />
                          </div>
                          <div>
                            <p className="text-h3 text-primary uppercase font-black">No Data Available</p>
                            <p className="text-body-md text-on-surface-variant">Synchronize your Google Sheet to see records here.</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <TerminalDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serial={selectedSerial}
        currentSlug={slug?.toString() || ''}
      />
    </main>
  )
}
