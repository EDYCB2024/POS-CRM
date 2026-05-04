'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
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
  Loader2
} from 'lucide-react'
import { cn } from "@/lib/utils"

export default function AllyPage() {
  const { slug } = useParams()
  const [data, setData] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      if (!slug) return
      try {
        setLoading(true)
        const tableName = slug.toString().replace(/-/g, '_')
        
        const { data: tableData, error: dbError } = await supabase
          .from(tableName)
          .select('*')
          .limit(100)
          .order('created_at', { ascending: false })

        if (dbError) throw dbError
        setData(tableData || [])

        if (tableData && tableData.length > 0) {
          const headers = Object.keys(tableData[0]).filter(h => h !== 'id' && h !== 'created_at')
          setColumns(headers)
        } else if (slug === 'vatc') {
          setColumns([
            'n', 'factura', 'procesadora', 'fecha', 'aliado', 'modelo', 
            'razon_social', 'serial', 'rif', 'estatus', 'nivel', 'observaciones'
          ])
        } else if (slug === 'platco') {
          setColumns([
            'nro', 'fecha', 'aliado', 'modelo', 'razon_social', 'serial', 'columna_7', 
            'rif', 'ingreso', 'columna_10', 'serial_de_remplazo', 'fecha_venta', 
            'column_26', 'categoria', 'fecha_final', 'estatus_del_caso', 'estatus', 
            'nivel', 'garantia', 'cotizacion', 'repuesto_servicio', 
            'repuesto_servicio_2', 'repuesto_servicio_3', 'observaciones', 'lote', 'observacion_2'
          ])
        } else if (slug === 'banplus') {
          setColumns([
            'n', 'fecha', 'aliado', 'modelo', 'razon_social', 'serial', 'informe', 
            'rif', 'ingreso', 'serial_de_remplazo', 'falla_notificada', 'categoria', 
            'fecha_final', 'estatus_del_caso', 'estatus', 'nivel', 'garantia', 
            'informe2', 'cotizacion', 'repuesto_servicio', 'repuesto_servicio_2', 
            'repuesto_servicio_3', 'observaciones'
          ])
        } else if (slug === 'ccr') {
          setColumns([
            'n', 'fecha', 'aliado', 'modelo', 'razon_social', 'serial', 'informe', 
            'rif', 'ingreso', 'serial_de_remplazo', 'falla_notificada', 'categoria', 
            'fecha_final', 'estatus_del_caso', 'estatus', 'nivel', 'garantia', 
            'informe2', 'cotizacion', 'observaciones', 'ne', 
            'repuesto_servicio_1', 'repuesto_servicio_2', 'repuesto_servicio_3'
          ])
        } else if (slug === 'instapago') {
          setColumns([
            'n', 'fecha', 'aliado', 'modelo', 'razon_social', 'serial', 'informe', 
            'rif', 'ingreso', 'serial_de_remplazo', 'falla_notificada', 'categoria', 
            'fecha_final', 'estatus_del_caso', 'estatus', 'nivel', 'garantia', 
            'informe2', 'cotizacion', 'observaciones', 'repuesto_1', 'repuesto_2', 'repuesto_3'
          ])
        } else if (slug === 'pos-comercial') {
          setColumns([
            'n', 'fecha', 'aliado', 'modelo', 'razon_social', 'serial', 'informe', 
            'rif', 'ingreso', 'serial_de_remplazo', 'falla_notificada', 'categoria', 
            'fecha_final', 'estatus_del_caso', 'estatus', 'nivel', 'garantia', 
            'informe2', 'cotizacion', 'observaciones', 'repuesto_servicio', 
            'repuesto_servicio_2', 'repuesto_servicio_3'
          ])
        } else if (slug === 'exterior') {
          setColumns([
            'n', 'fecha', 'aliado', 'modelo', 'razon_social', 'serial', 'informe', 
            'rif', 'ingreso', 'serial_de_remplazo', 'falla_notificada', 'categoria', 
            'fecha_final', 'estatus_del_caso', 'estatus', 'nivel', 'garantia', 
            'informe2', 'cotizacion', 'observaciones', 'repuesto_1', 'repuesto_2', 'repuesto_3'
          ])
        } else if (slug === 'bancaribe') {
          setColumns([
            'n', 'fecha', 'aliado', 'modelo', 'razon_social', 'serial', 'informe', 
            'rif', 'ingreso', 'serial_de_remplazo', 'falla_notificada', 'categoria', 
            'fecha_final', 'estatus_del_caso', 'estatus', 'nivel', 'garantia', 
            'informe2', 'cotizacion', 'observaciones', 'repuesto_servicio', 
            'repuesto_servicio_2', 'repuesto_servicio_3'
          ])
        } else if (slug === 'token-pagos') {
          setColumns([
            'n', 'fecha', 'aliado', 'modelo', 'razon_social', 'serial', 'informe', 
            'rif', 'ingreso', 'serial_de_remplazo', 'falla_notificada', 'categoria', 
            'fecha_final', 'estatus_del_caso', 'estatus', 'nivel', 'garantia', 
            'informe2', 'cotizacion', 'observaciones', 'repuesto_1', 'repuesto_2', 'repuesto_3'
          ])
        } else if (slug === 'banco-activo') {
          setColumns([
            'n', 'fecha', 'aliado', 'modelo', 'razon_social', 'serial', 'informe', 
            'rif', 'ingreso', 'serial_de_remplazo', 'falla_notificada', 'categoria', 
            'fecha_final', 'estatus_del_caso', 'estatus', 'nivel', 'garantia', 
            'informe2', 'cotizacion', 'observaciones', 'repuesto_1', 'repuesto_2', 'repuesto_3'
          ])
        } else if (slug === 'del-sur') {
          setColumns([
            'n', 'fecha', 'aliado', 'modelo', 'razon_social', 'serial', 'informe', 
            'rif', 'ingreso', 'serial_de_remplazo', 'falla_notificada', 'categoria', 
            'fecha_final', 'estatus_del_caso', 'estatus', 'nivel', 'garantia', 
            'informe2', 'cotizacion', 'observaciones', 'repuesto_1', 'repuesto_2', 'repuesto_3'
          ])
        } else if (slug === 'bestpay') {
          setColumns([
            'n', 'fecha', 'aliado', 'modelo', 'razon_social', 'serial', 'informe', 
            'rif', 'ingreso', 'serial_de_remplazo', 'falla_notificada', 'categoria', 
            'fecha_final', 'estatus_del_caso', 'estatus', 'nivel', 'garantia', 
            'informe2', 'cotizacion', 'observaciones', 'repuesto_1', 'repuesto_2', 'repuesto_3'
          ])
        } else if (slug === 'bancrecer') {
          setColumns([
            'n', 'fecha', 'aliado', 'modelo', 'razon_social', 'serial', 'informe', 
            'rif', 'ingreso', 'serial_de_remplazo', 'falla_notificada', 'categoria', 
            'fecha_final', 'estatus_del_caso', 'estatus', 'nivel', 'garantia', 
            'informe2', 'cotizacion', 'observaciones', 'repuesto_1', 'repuesto_2', 'repuesto_3'
          ])
        }
      } catch (err: any) {
        console.error('Error fetching data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug])

  const headers = columns.length > 0 ? columns : []

  // Helper para renderizar badges de estatus al estilo "Terminal"
  const renderCellContent = (header: string, value: any) => {
    const stringValue = value?.toString() || '-'
    
    if (header.toLowerCase().includes('estatus') || header.toLowerCase().includes('status')) {
      const isOnline = stringValue.toLowerCase().includes('online') || stringValue.toLowerCase().includes('activo')
      const isOffline = stringValue.toLowerCase().includes('offline') || stringValue.toLowerCase().includes('inactivo')
      const isMaintenance = stringValue.toLowerCase().includes('mantenimiento') || stringValue.toLowerCase().includes('proceso')

      return (
        <div className={cn(
          "inline-flex items-center px-sm py-xs rounded-full text-label-sm font-bold border",
          isOnline && "bg-green-50 text-green-700 border-green-200",
          isOffline && "bg-red-50 text-red-700 border-red-200",
          isMaintenance && "bg-slate-100 text-slate-600 border-slate-200",
          !isOnline && !isOffline && !isMaintenance && "bg-slate-50 text-slate-500 border-slate-200"
        )}>
          <span className={cn(
            "w-2 h-2 rounded-full mr-2",
            isOnline && "bg-green-500",
            isOffline && "bg-red-500 animate-pulse",
            isMaintenance && "bg-slate-400",
            !isOnline && !isOffline && !isMaintenance && "bg-slate-300"
          )}></span>
          {stringValue}
        </div>
      )
    }

    if (header.toLowerCase().includes('id') || header.toLowerCase().includes('serial')) {
      return <span className="font-semibold text-primary">{stringValue}</span>
    }

    return <span className="text-body-md text-on-surface">{stringValue}</span>
  }

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-surface-container-lowest">
      <TopBar title={`Ally Management: ${slug?.toString().toUpperCase()}`} />
      
      <section className="p-margin">
        <div className="mb-xl flex justify-between items-end">
          <div>
            <h1 className="mb-xs uppercase tracking-tight font-black">{slug} Management</h1>
            <p className="text-body-md text-on-surface-variant">Monitor and manage all records for {slug} synced from Google Sheets.</p>
          </div>
          <button className="flex items-center gap-sm bg-primary text-on-primary px-lg py-md rounded-xl font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all">
            <Plus className="w-5 h-5" />
            Export Data
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4 bg-white rounded-xl border border-outline-variant">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-label-md text-on-surface-variant font-medium">Fetching ally data...</p>
          </div>
        ) : error ? (
          <div className="bg-white p-12 rounded-xl border border-red-100 flex flex-col items-center gap-4 text-center shadow-sm">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <h3 className="text-h3 text-gray-900">Connection Error</h3>
            <p className="text-body-md text-gray-500 max-w-sm">{error}</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-outline-variant overflow-hidden shadow-sm">
            {/* Table Toolbar (Terminal Style) */}
            <div className="px-lg py-md border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
              <div className="flex gap-md">
                <button className="px-md py-sm bg-white border border-outline-variant rounded-lg text-label-md flex items-center gap-xs hover:bg-surface-container transition-colors shadow-sm">
                  <Filter className="w-4 h-4 text-primary" />
                  Filter
                </button>
                <button className="px-md py-sm bg-white border border-outline-variant rounded-lg text-label-md flex items-center gap-xs hover:bg-surface-container transition-colors shadow-sm">
                  <ArrowUpDown className="w-4 h-4 text-primary" />
                  Sort
                </button>
              </div>
              <div className="flex items-center gap-sm">
                <p className="text-label-sm text-on-surface-variant font-bold">Showing {data.length > 0 ? `1-${data.length}` : '0'} of {data.length}</p>
                <div className="flex border border-outline-variant rounded-lg overflow-hidden shadow-sm">
                  <button className="p-1.5 bg-white hover:bg-surface-container border-r border-outline-variant disabled:opacity-30" disabled>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 bg-white hover:bg-surface-container disabled:opacity-30" disabled={data.length === 0}>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Table Area */}
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-outline-variant scrollbar-track-transparent">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    {headers.map(header => (
                      <th key={header} className="px-lg py-md text-label-md text-on-surface-variant uppercase tracking-wider font-bold">
                        {header.replace(/_/g, ' ')}
                      </th>
                    ))}
                    <th className="px-lg py-md text-label-md text-on-surface-variant text-right uppercase tracking-wider font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {data.length > 0 ? data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-surface-container-low/50 transition-all group">
                      {headers.map(header => (
                        <td key={header} className="px-lg py-md">
                          {renderCellContent(header, row[header])}
                        </td>
                      ))}
                      <td className="px-lg py-md text-right">
                        <button className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant transition-colors">
                          <MoreVertical className="w-4 h-4" />
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
    </main>
  )
}
