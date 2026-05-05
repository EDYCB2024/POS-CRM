'use client'

import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'
import { Loader2, Copy, Check, ArrowLeft, List, ShieldCheck, ShieldX, Hash, Download } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import * as XLSX from 'xlsx'

export default function SerialesPage({ searchParams }: { searchParams: Promise<any> }) {
  const params = use(searchParams)
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const { slug, lote, mes, estatus, garantia, loteCol } = params
      if (!slug) return

      try {
        setLoading(true)
        const tableName = slug.replace(/-/g, '_')
        
        let query = supabase
          .from(tableName)
          .select('*')

        if (lote && loteCol) {
          query = query.ilike(loteCol, `%${lote}%`)
        }
        if (estatus) query = query.ilike('estatus', `%${estatus}%`)
        if (garantia) query = query.ilike('garantia', `%${garantia}%`)
        if (mes) query = query.ilike('fecha', `%/${mes}/%`)

        const { data: tableData, error } = await query.order('fecha', { ascending: false })

        if (error) throw error
        
        setData(tableData || [])
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params])

  const copySerials = () => {
    const serials = data.map(row => row.serial || row.serial_de_remplazo).filter(Boolean)
    navigator.clipboard.writeText(serials.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const exportToExcel = async () => {
    if (data.length === 0) return

    const exportData = data.map((row, i) => ({
      "N#": i + 1,
      "Fecha": row.fecha?.split('T')[0] || '',
      "Serial": row.serial || row.serial_de_remplazo || '',
      "Razón Social": row.razon_social || row.razn_social || '',
      "Estatus": row.estatus || '',
      "Garantía": row.garantia || ''
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Seriales")
    
    // Auto-ajustar anchos de columna básicos
    const wscols = [
      {wch: 5},  // N#
      {wch: 12}, // Fecha
      {wch: 18}, // Serial
      {wch: 40}, // Razón Social
      {wch: 12}, // Estatus
      {wch: 10}  // Garantía
    ]
    worksheet['!cols'] = wscols

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const defaultName = `seriales_${params.slug || 'export'}.xlsx`

    // Intentar usar el File System Access API para "Guardar como"
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: defaultName,
          types: [{
            description: 'Excel file',
            accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
          }],
        })
        const writable = await handle.createWritable()
        await writable.write(blob)
        await writable.close()
        return
      } catch (err: any) {
        // Si el usuario canceló (AbortError), no hacemos nada más
        if (err.name === 'AbortError') {
          console.log('User cancelled the save dialog')
          return
        }
        // Si fue otro error (ej: API no soportada en este contexto), continuamos al fallback
        console.log('Picker failed, falling back to traditional download', err)
      }
    }

    // Fallback: Descarga tradicional
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', defaultName)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto pb-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href={`/aliados/${params.slug}`}
              className="p-2 hover:bg-white rounded-full border border-transparent hover:border-outline-variant transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-on-surface-variant" />
            </Link>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-primary flex items-center gap-2">
                <List className="w-6 h-6" />
                Ver Seriales Filtrados: {params.slug?.toUpperCase()}
              </h1>
              <p className="text-on-surface-variant text-sm font-medium">
                {data.length} registros encontrados {params.estatus ? `• ${params.estatus}` : ''}
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={exportToExcel}
              disabled={data.length === 0}
              className="flex items-center gap-2 bg-white border border-outline-variant text-on-surface px-6 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-green-600" />
              Exportar Excel
            </button>
            <button 
              onClick={copySerials}
              disabled={data.length === 0}
              className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado' : 'Copiar Seriales'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl border border-outline-variant p-20 flex flex-col items-center justify-center gap-4 shadow-sm">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="font-bold text-on-surface-variant uppercase tracking-widest text-xs">Cargando datos...</p>
          </div>
        ) : data.length > 0 ? (
          <>
            <div className="bg-white rounded-3xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-outline-variant">
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant border-r border-outline-variant/30">N#</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant border-r border-outline-variant/30">Fecha</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant border-r border-outline-variant/30">Serial</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant border-r border-outline-variant/30">Razón Social</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant border-r border-outline-variant/30">Estatus</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Garantía</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {data.map((row, i) => (
                      <tr key={i} className="hover:bg-primary/5 transition-colors group">
                        <td className="px-6 py-3 text-[11px] font-bold text-on-surface-variant border-r border-outline-variant/10">{i + 1}</td>
                        <td className="px-6 py-3 text-[11px] text-on-surface-variant border-r border-outline-variant/10">
                          {row.fecha?.split('T')[0] || '-'}
                        </td>
                        <td className="px-6 py-3 font-mono text-[11px] font-bold text-primary border-r border-outline-variant/10">
                          {row.serial || row.serial_de_remplazo}
                        </td>
                        <td className="px-6 py-3 text-[11px] text-on-surface font-medium border-r border-outline-variant/10 truncate max-w-[200px]">
                          {row.razon_social || row.razn_social || '-'}
                        </td>
                        <td className="px-6 py-3 border-r border-outline-variant/10">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border",
                            row.estatus?.toLowerCase().includes('cerrado') ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"
                          )}>
                            {row.estatus}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          {row.garantia?.toLowerCase() === 'si' ? (
                            <span className="flex items-center gap-1 text-[9px] font-black text-green-600 uppercase tracking-tight">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Si
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[9px] font-black text-red-500 uppercase tracking-tight opacity-60">
                              <ShieldX className="w-3.5 h-3.5" />
                              No
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-8 bg-white rounded-3xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="px-8 py-4 border-b border-outline-variant bg-slate-50 flex justify-between items-center">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Seriales Filtrados (Texto)
                </h3>
                <button 
                  onClick={copySerials}
                  className="text-[10px] font-black uppercase text-primary hover:underline"
                >
                  {copied ? '¡Copiado!' : 'Copiar Lista'}
                </button>
              </div>
              <div className="p-6">
                <textarea 
                  readOnly
                  value={data.map(row => row.serial || row.serial_de_remplazo).filter(Boolean).join('\n')}
                  className="w-full h-40 p-4 bg-slate-50 border border-outline-variant rounded-xl font-mono text-xs focus:ring-0 outline-none resize-none"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-3xl border border-outline-variant p-20 text-center shadow-sm">
            <p className="text-on-surface-variant font-bold uppercase tracking-widest text-sm">No se encontraron registros con estos filtros.</p>
          </div>
        )}
      </div>
    </main>
  )
}
