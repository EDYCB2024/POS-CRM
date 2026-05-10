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
  Loader2,
  ExternalLink,
  FilterX,
  RefreshCw,
  Copy,
  Check
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
  const [totalCount, setTotalCount] = useState(0)
  const [filterLote, setFilterLote] = useState('')
  const [filterMes, setFilterMes] = useState('')
  const [filterEstatus, setFilterEstatus] = useState('')
  const [filterEstatusCaso, setFilterEstatusCaso] = useState('')
  const [filterGarantia, setFilterGarantia] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSerial, setSelectedSerial] = useState('')
  const [selectedRow, setSelectedRow] = useState<any>(null)
  const [exporting, setExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const pageSize = 20




  const fetchData = async () => {
    if (!slug) return
    try {
      setLoading(true)
      const currentSlug = slug.toString()
      const tableMapping: Record<string, string> = {
        'del-sur': 'delsur',
        'pos-comercial': 'poscom',
        'token-pagos': 'tokenp',
        'banco-activo': 'bactivo'
      }
      const tableName = tableMapping[currentSlug] || currentSlug.replace(/-/g, '_')
      
      const from = page * pageSize
      const to = from + pageSize - 1

      let query = supabase
        .from(tableName)
        .select('*', { count: 'exact' })

      // Aplicar Filtros
      if (searchTerm) {
        const possibleLoteCols = ['lote', 'categoria', 'categora', 'categoria/lote']
        const possibleNameCols = ['razon_social', 'razn_social', 'cliente', 'comercio']
        
        let loteCol = 'categoria'
        let nameCol = 'razon_social'
        
        if (columns.length > 0) {
          loteCol = possibleLoteCols.find(c => columns.includes(c)) || 'categoria'
          nameCol = possibleNameCols.find(c => columns.includes(c)) || 'razon_social'
        } else {
          if (currentSlug === 'platco' || currentSlug === 'platco-pos') loteCol = 'lote'
          else if (['banplus', 'ccr', 'instapago'].includes(currentSlug)) loteCol = 'categora'
          
          if (['banplus', 'ccr', 'instapago', 'platco', 'platco-pos'].includes(currentSlug)) nameCol = 'razn_social'
        }

        query = query.or(`${loteCol}.ilike.*${searchTerm}*,${nameCol}.ilike.*${searchTerm}*,serial.ilike.*${searchTerm}*,serial_de_remplazo.ilike.*${searchTerm}*`)
      }
      if (filterMes) {
        query = query.or(`fecha.ilike.%-${filterMes}-%,fecha.ilike.%/${filterMes}/%`)
      }
      if (filterEstatus) query = query.ilike('estatus', `%${filterEstatus}%`)
      if (filterEstatusCaso) query = query.ilike('estatus_del_caso', `%${filterEstatusCaso}%`)
      if (filterGarantia) query = query.ilike('garantia', `%${filterGarantia}%`)

      const { data: tableData, error: dbError, count } = await query
        .order('fecha', { ascending: false })
        .range(from, to)

      if (dbError) throw dbError
      
      setData(tableData || [])
      setTotalCount(count || 0)
      if (tableData && tableData.length > 0) {
        const allCols = Object.keys(tableData[0]).filter(h => !['id', 'created_at', 'serial_id', 'modificado_crm'].includes(h))
        
        const globalOrder = [
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
        
        const sortedCols = allCols.sort((a, b) => {
          const indexA = globalOrder.findIndex(o => a.toLowerCase() === o.toLowerCase());
          const indexB = globalOrder.findIndex(o => b.toLowerCase() === o.toLowerCase());
          
          if (indexA === -1 && indexB === -1) return a.localeCompare(b);
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });

        setColumns(sortedCols)
      }
    } catch (err: any) {
      console.error('Error fetching data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    if (!slug) return
    
    const currentSlug = slug.toString()
    const tableMapping: Record<string, string> = {
      'del-sur': 'delsur',
      'pos-comercial': 'poscom',
      'token-pagos': 'tokenp',
      'banco-activo': 'bactivo'
    }
    const tableName = tableMapping[currentSlug] || currentSlug.replace(/-/g, '_')
    const fileName = `Aliado_${currentSlug.toUpperCase()}_${new Date().toISOString().split('T')[0]}.xlsx`

    setExporting(true)
    setExportProgress(0)

    try {
      const { utils, write } = await import('xlsx')
      
      let allData: any[] = []
      let from = 0
      const limit = 1000
      let hasMore = true

      while (hasMore) {
        let query = supabase
          .from(tableName)
          .select('*')
          .range(from, from + limit - 1)
          .order('fecha', { ascending: false })

        if (searchTerm) {
          const possibleLoteCols = ['lote', 'categoria', 'categora', 'categoria/lote']
          const possibleNameCols = ['razon_social', 'razn_social', 'cliente', 'comercio']
          let loteCol = possibleLoteCols.find(c => columns.includes(c)) || 'categoria'
          let nameCol = possibleNameCols.find(c => columns.includes(c)) || 'razon_social'
          query = query.or(`${loteCol}.ilike.*${searchTerm}*,${nameCol}.ilike.*${searchTerm}*,serial.ilike.*${searchTerm}*,serial_de_remplazo.ilike.*${searchTerm}*`)
        }
        if (filterMes) query = query.or(`fecha.ilike.%-${filterMes}-%,fecha.ilike.%/${filterMes}/%`)
        if (filterEstatus) query = query.ilike('estatus', `%${filterEstatus}%`)
        if (filterEstatusCaso) query = query.ilike('estatus_del_caso', `%${filterEstatusCaso}%`)
        if (filterGarantia) query = query.ilike('garantia', `%${filterGarantia}%`)

        const { data: batchData, error } = await query
        if (error) throw error

        if (batchData && batchData.length > 0) {
          allData = [...allData, ...batchData]
          from += limit
          if (totalCount > 0) {
             setExportProgress(Math.min(99, Math.round((allData.length / totalCount) * 100)))
          }
          if (batchData.length < limit) hasMore = false
        } else {
          hasMore = false
        }
      }

      if (allData.length === 0) {
        alert("No hay datos para exportar con los filtros seleccionados.")
        return
      }

      setExportProgress(100)

      const formattedData = allData.map(item => {
        const newItem: any = {}
        Object.keys(item).forEach(key => {
          if (!['id', 'created_at', 'modificado_crm'].includes(key)) {
            newItem[key.replace(/_/g, ' ').toUpperCase()] = item[key]
          }
        })
        return newItem
      })

      const wb = utils.book_new()
      const ws = utils.json_to_sheet(formattedData)
      utils.book_append_sheet(wb, ws, currentSlug.toUpperCase())
      
      const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

    } catch (err: any) {
      console.error('Error exporting:', err)
      alert("Error al exportar: " + err.message)
    } finally {
      setExporting(false)
      setTimeout(() => setExportProgress(0), 1000)
    }
  }

  useEffect(() => {
    fetchData()
  }, [slug, page, searchTerm, filterMes, filterEstatus, filterEstatusCaso, filterGarantia])

  const headers = columns.length > 0 ? columns : []

  // Helper para renderizar badges de estatus al estilo "Terminal"
  const renderCellContent = (header: string, value: any, record?: any) => {
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

    if (header.toLowerCase().includes('informe')) {
      const serialValue = record?.serial || record?.serial_de_remplazo || '';
      return (
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-on-surface truncate max-w-[120px] block" title={stringValue}>{stringValue}</span>
          {serialValue && (
            <Link 
              href={`/print/informe?serial=${serialValue}`}
              target="_blank"
              className="p-1 hover:bg-primary/10 rounded-md text-primary transition-all"
              title="Abrir Informe"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      )
    }

    if (header.toLowerCase().includes('informe')) {
      const serialValue = record?.serial || record?.serial_de_remplazo || '';
      return (
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-on-surface truncate max-w-[120px] block" title={stringValue}>{stringValue}</span>
          {serialValue && (
            <Link 
              href={`/print/informe?serial=${serialValue}`}
              target="_blank"
              className="p-1 hover:bg-primary/10 rounded-md text-primary transition-all"
              title="Abrir Informe"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      )
    }

    if (header.toLowerCase().includes('serial')) {
      return (
        <div className="flex items-center gap-2 group/serial">
          <span className="font-mono text-[11px] font-bold text-primary">{stringValue}</span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(stringValue);
              const btn = e.currentTarget;
              const icon = btn.querySelector('.copy-icon');
              const check = btn.querySelector('.check-icon');
              if (icon && check) {
                icon.classList.add('hidden');
                check.classList.remove('hidden');
                setTimeout(() => {
                  icon.classList.remove('hidden');
                  check.classList.add('hidden');
                }, 2000);
              }
            }}
            className="p-1 hover:bg-primary/10 rounded-md transition-all opacity-0 group-hover/serial:opacity-100"
            title="Copiar Serial"
          >
            <Copy className="w-3 h-3 text-primary copy-icon" />
            <Check className="w-3 h-3 text-green-600 hidden check-icon" />
          </button>
        </div>
      )
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
          <div className="flex flex-col">
            <h1 className="text-xl uppercase tracking-tight font-black flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              {slug}
            </h1>
            <p className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest ml-7">
              {totalCount.toLocaleString()} Registros
            </p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <div className="flex gap-2">
              <button 
                onClick={handleExport}
                disabled={exporting || loading}
                className="flex items-center gap-2 bg-white border border-outline-variant text-on-surface px-4 py-2 rounded-lg text-sm font-semibold hover:bg-surface-container transition-all disabled:opacity-50"
              >
                {exporting ? <RefreshCw className="w-4 h-4 text-primary animate-spin" /> : <Download className="w-4 h-4 text-primary" />}
                {exporting ? `Exportando (${exportProgress}%)` : 'Exportar Excel'}
              </button>
            </div>
            {exporting && (
              <div className="w-32 bg-slate-100 h-1 rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>


        {/* Filtros */}
        <div className="mb-4 bg-white p-3 rounded-xl border border-outline-variant flex gap-4 items-center shadow-sm">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase text-on-surface-variant ml-1">Buscar</label>
            <input 
              type="text" 
              placeholder="Serial, Cliente, Lote..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-outline-variant rounded-lg text-xs focus:ring-2 focus:ring-primary/20 outline-none w-64"
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
              <option value="ENTREGADO">Entregado</option>
              <option value="EN REVISION">En Revisión</option>
              <option value="IRREPARABLE">Irreparable</option>
              <option value="PENDIENTE POR PAGO">Pendiente Pago</option>
              <option value="SERVICIO TECNICO">Servicio Técnico</option>
              <option value="OPERATIVO">Operativo</option>
              <option value="SUSTITUIDO">Sustituido</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase text-on-surface-variant ml-1">Estatus del Caso</label>
            <select 
              value={filterEstatusCaso}
              onChange={(e) => setFilterEstatusCaso(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-outline-variant rounded-lg text-xs focus:ring-2 focus:ring-primary/20 outline-none w-32"
            >
              <option value="">Todos</option>
              <option value="ABIERTO">Caso Abierto</option>
              <option value="CERRADO">Caso Cerrado</option>
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

          { (searchTerm || filterMes || filterEstatus || filterEstatusCaso || filterGarantia) && (
            <>
              <button 
                onClick={() => { setSearchTerm(''); setFilterMes(''); setFilterEstatus(''); setFilterEstatusCaso(''); setFilterGarantia(''); }}
                className="mt-6 p-2 bg-slate-100 text-on-surface-variant hover:text-red-600 hover:bg-red-50 rounded-lg transition-all animate-in fade-in zoom-in duration-200"
                title="Limpiar Filtros"
              >
                <FilterX className="w-4 h-4" />
              </button>

              <div className="h-8 w-px bg-outline-variant mt-4 mx-2" />

              <Link 
                href={`/seriales?slug=${slug}&search=${searchTerm}&mes=${filterMes}&estatus=${filterEstatus}&estatus_caso=${filterEstatusCaso}&garantia=${filterGarantia}`}
                target="_blank"
                className="mt-6 p-2 bg-primary text-white rounded-lg hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center animate-in fade-in zoom-in duration-200"
                title="Ver Seriales Filtrados"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>


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
                <button 
                  onClick={() => fetchData()}
                  className="p-1.5 bg-white border border-outline-variant rounded-md hover:bg-slate-50 text-on-surface-variant transition-all flex items-center gap-2 group"
                  title="Refrescar Datos"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5 text-primary group-hover:rotate-180 transition-transform duration-500", loading && "animate-spin")} />
                  <span className="text-[10px] font-bold uppercase tracking-tight">Refrescar</span>
                </button>
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
                    {headers.map(header => {
                      const isNumber = header.toLowerCase() === 'n' || header.toLowerCase() === 'nro'
                      return (
                        <th key={header} className={cn(
                          "px-3 py-2 text-[10px] text-on-surface-variant uppercase tracking-wider font-extrabold border-r border-outline-variant/30 last:border-r-0",
                          isNumber ? "w-[60px]" : "w-[150px]"
                        )}>
                          <div className="flex items-center justify-between">
                            {(header.toLowerCase() === 'n' || header.toLowerCase() === 'nro') ? 'NID' : header.replace(/_/g, ' ').toUpperCase()}
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
                        setSelectedRow(row)
                        setIsModalOpen(true)
                      }}
                      className="transition-colors group cursor-pointer hover:bg-primary/5"
                    >
                      {headers.map(header => (
                        <td key={header} className="px-3 py-1.5 border-r border-outline-variant/10 last:border-r-0">
                          {renderCellContent(header, row[header], row)}
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
        onClose={() => {
          setIsModalOpen(false)
          setSelectedRow(null)
        }}
        serial={selectedSerial}
        currentSlug={slug?.toString() || ''}
        initialData={selectedRow}
      />
    </main>
  )
}
