'use client'

import { useEffect, useState } from 'react'
import { Boxes, TrendingUp, ArrowUpRight, Download, MoreVertical, Plus, X, Loader2, RefreshCw, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from "@/lib/utils"
import { supabase } from '@/lib/supabase'


export default function InventoryPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [data, setData] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' | null }>({
    key: 'codigo',
    direction: 'asc'
  })

  // Form State
  const [formData, setFormData] = useState({
    codigo: '',
    modelo: '',
    descripcion: '',
    stock: ''
  })

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const { data: inventoryData, error: dbError } = await supabase
        .from('inventory')
        .select('*')
        .order('codigo', { ascending: true })

      if (dbError) throw dbError
      setData(inventoryData || [])
    } catch (err: any) {
      console.error('Error fetching inventory:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item: any) => {
    setEditingId(item.id)
    setFormData({
      codigo: item.codigo,
      modelo: item.modelo,
      descripcion: item.descripcion,
      stock: item.stock.toString()
    })
    setIsModalOpen(true)
  }

  const handleSaveRepuesto = async () => {
    if (!formData.codigo) {
      alert('El código es obligatorio')
      return
    }

    try {
      setSaving(true)
      const payload = {
        codigo: formData.codigo,
        modelo: formData.modelo,
        descripcion: formData.descripcion,
        stock: parseInt(formData.stock) || 0
      }

      let error = null
      if (editingId) {
        const { error: updateError } = await supabase
          .from('inventory')
          .update(payload)
          .eq('id', editingId)
        error = updateError
      } else {
        const { error: saveError } = await supabase
          .from('inventory')
          .insert([payload])
        error = saveError
      }

      if (error) throw error

      setFormData({ codigo: '', modelo: '', descripcion: '', stock: '' })
      setEditingId(null)
      setIsModalOpen(false)
      fetchInventory()
    } catch (err: any) {
      alert('Error al guardar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  const filteredData = data.filter(item => 
    item.codigo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.modelo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.descripcion?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key || !sortConfig.direction) return 0
    
    let aValue = a[sortConfig.key]
    let bValue = b[sortConfig.key]

    // Handle numeric values (like stock)
    if (sortConfig.key === 'stock') {
      aValue = Number(aValue)
      bValue = Number(bValue)
    } else {
      // String comparison
      aValue = String(aValue).toLowerCase()
      bValue = String(bValue).toLowerCase()
    }

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1
    }
    return 0
  })

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black tracking-tight text-primary uppercase">Inventario</h1>
          <p className="text-secondary font-medium">Gestión de stock, movimientos y control de terminales.</p>
        </div>
        <button className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all group">
          <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform duration-300" />
          Exportar
        </button>
      </div>


      {/* Main Content Vertical Layout */}
      <div className="space-y-8">
        {/* Stock Table - Full Width */}
        <div className="bg-white rounded-3xl border border-outline-variant/30 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-lowest">
            <h3 className="text-xl font-bold text-primary flex items-center gap-2">
              <Boxes className="w-5 h-5 text-primary" />
              Detalle de Repuestos en Stock
            </h3>
            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                <input 
                  type="text"
                  placeholder="Buscar repuesto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs font-bold text-primary placeholder:text-outline/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={fetchInventory}
                  className="p-2 hover:bg-primary/10 rounded-xl transition-all group border border-outline-variant/30"
                  title="Refrescar Inventario"
                >
                  <RefreshCw className={cn("w-5 h-5 text-primary transition-all duration-700", loading && "animate-spin")} />
                </button>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all whitespace-nowrap"
                >
                  Añadir Repuesto
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-50/50 border-b border-outline-variant">
                  <th 
                    className="px-6 py-4 text-[10px] text-on-surface-variant uppercase font-black tracking-widest cursor-pointer hover:bg-primary/5 transition-colors group/th"
                    onClick={() => handleSort('codigo')}
                  >
                    <div className="flex items-center justify-between">
                      Código
                      {sortConfig.key === 'codigo' ? (
                        sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-primary" /> : <ArrowDown className="w-3 h-3 text-primary" />
                      ) : (
                        <ArrowUpDown className="w-2.5 h-2.5 opacity-30 group-hover/th:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-[10px] text-on-surface-variant uppercase font-black tracking-widest cursor-pointer hover:bg-primary/5 transition-colors group/th"
                    onClick={() => handleSort('modelo')}
                  >
                    <div className="flex items-center justify-between">
                      Modelo
                      {sortConfig.key === 'modelo' ? (
                        sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-primary" /> : <ArrowDown className="w-3 h-3 text-primary" />
                      ) : (
                        <ArrowUpDown className="w-2.5 h-2.5 opacity-30 group-hover/th:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-[10px] text-on-surface-variant uppercase font-black tracking-widest cursor-pointer hover:bg-primary/5 transition-colors group/th"
                    onClick={() => handleSort('descripcion')}
                  >
                    <div className="flex items-center justify-between">
                      Descripción
                      {sortConfig.key === 'descripcion' ? (
                        sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-primary" /> : <ArrowDown className="w-3 h-3 text-primary" />
                      ) : (
                        <ArrowUpDown className="w-2.5 h-2.5 opacity-30 group-hover/th:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-[10px] text-on-surface-variant uppercase font-black tracking-widest text-right cursor-pointer hover:bg-primary/5 transition-colors group/th"
                    onClick={() => handleSort('stock')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Stock
                      {sortConfig.key === 'stock' ? (
                        sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-primary" /> : <ArrowDown className="w-3 h-3 text-primary" />
                      ) : (
                        <ArrowUpDown className="w-2.5 h-2.5 opacity-30 group-hover/th:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-[10px] text-on-surface-variant uppercase font-black tracking-widest text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-xs font-bold text-outline uppercase tracking-widest">Cargando inventario...</p>
                      </div>
                    </td>
                  </tr>
                ) : sortedData.length > 0 ? sortedData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-primary">{item.codigo}</td>
                    <td className="px-6 py-4 font-bold text-on-surface-variant">{item.modelo}</td>
                    <td className="px-6 py-4 text-sm text-secondary font-medium">{item.descripcion}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={cn(
                        "inline-block px-3 py-1 rounded-lg font-mono font-black text-sm",
                        item.stock < 100 ? "bg-red-100 text-red-700" : "bg-primary/5 text-primary"
                      )}>
                        {item.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleEdit(item)}
                        className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-on-surface-variant/40 hover:text-primary"
                        title="Editar Repuesto"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant/40 font-bold uppercase tracking-widest text-xs">
                      {searchQuery ? `No se encontraron resultados para "${searchQuery}"` : "No hay repuestos registrados en el inventario."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts Section - Below Table */}
        <div className="bg-white rounded-3xl border border-outline-variant/30 p-8 space-y-6 shadow-sm">
          <h3 className="text-xl font-bold text-primary flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Alertas de Stock Crítico por Modelo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(
              data.filter(i => i.stock < 100).reduce((acc: any, item) => {
                if (!acc[item.modelo]) acc[item.modelo] = []
                acc[item.modelo].push(item)
                return acc
              }, {})
            ).length > 0 ? Object.entries(
              data.filter(i => i.stock < 100).reduce((acc: any, item) => {
                if (!acc[item.modelo]) acc[item.modelo] = []
                acc[item.modelo].push(item)
                return acc
              }, {})
            ).map(([modelo, items]: [string, any], i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 hover:border-primary/30 transition-all cursor-pointer group">
                <div className={cn("w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px] bg-red-500 text-red-500")} />
                <div className="flex-1">
                  <p className="text-sm font-black text-primary uppercase tracking-tight">{modelo}</p>
                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                    {items.length} {items.length === 1 ? 'Pieza crítica' : 'Piezas críticas'}
                  </p>
                </div>
                <div className="text-right pr-2">
                  <div className="flex -space-x-2 overflow-hidden">
                    {items.slice(0, 3).map((_, idx) => (
                      <div key={idx} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-red-100 flex items-center justify-center">
                        <Boxes className="w-3 h-3 text-red-500" />
                      </div>
                    ))}
                    {items.length > 3 && (
                      <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-[8px] font-black text-outline">
                        +{items.length - 3}
                      </div>
                    )}
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-primary/30 group-hover:text-primary transition-colors" />
              </div>
            )) : (
              <div className="col-span-3 py-10 flex flex-col items-center justify-center bg-green-50/30 rounded-2xl border border-dashed border-green-200">
                <p className="text-xs font-black text-green-600 uppercase tracking-[0.2em]">Niveles de Stock Saludables en todos los modelos</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Añadir/Editar Repuesto - Table Style Layout */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl min-w-[320px] md:min-w-[600px] rounded-[32px] shadow-2xl border border-outline-variant/30 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
            
            {/* Header */}
            <div className="p-8 border-b border-outline-variant/10 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-black text-primary uppercase tracking-tight">
                  {editingId ? 'Editar Repuesto' : 'Añadir Nuevo Repuesto'}
                </h2>
              </div>
              <button 
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingId(null)
                  setFormData({ codigo: '', modelo: '', descripcion: '', stock: '' })
                }}
                className="p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Table-style Form */}
            <div className="overflow-hidden">
              <table className="w-full border-collapse table-fixed">
                <thead>
                  <tr className="bg-surface-container-lowest border-b border-outline-variant/20">
                    <th className="px-8 py-4 text-left text-[11px] font-black text-on-surface-variant/50 uppercase tracking-[0.2em] w-1/2">Nombre del Campo</th>
                    <th className="px-8 py-4 text-left text-[11px] font-black text-on-surface-variant/50 uppercase tracking-[0.2em] w-1/2">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  <tr className="group hover:bg-primary/5 transition-colors">
                    <td className="px-8 py-4 text-sm font-bold text-on-surface-variant group-hover:text-primary transition-colors">Código</td>
                    <td className="px-8 py-4">
                      <input 
                        type="text" 
                        value={formData.codigo}
                        onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                        placeholder="Ej: POS-001"
                        className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-primary placeholder:text-on-surface-variant/20 focus:outline-none uppercase"
                      />
                    </td>
                  </tr>
                  <tr className="group hover:bg-primary/5 transition-colors">
                    <td className="px-8 py-4 text-sm font-bold text-on-surface-variant group-hover:text-primary transition-colors">Modelo</td>
                    <td className="px-8 py-4">
                      <input 
                        type="text" 
                        value={formData.modelo}
                        onChange={(e) => setFormData({...formData, modelo: e.target.value})}
                        placeholder="Ej: N950"
                        className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-primary placeholder:text-on-surface-variant/20 focus:outline-none"
                      />
                    </td>
                  </tr>
                  <tr className="group hover:bg-primary/5 transition-colors">
                    <td className="px-8 py-4 text-sm font-bold text-on-surface-variant group-hover:text-primary transition-colors">Descripción</td>
                    <td className="px-8 py-4">
                      <input 
                        type="text" 
                        value={formData.descripcion}
                        onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                        placeholder="Ingrese descripción..."
                        className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-primary placeholder:text-on-surface-variant/20 focus:outline-none"
                      />
                    </td>
                  </tr>
                  <tr className="group hover:bg-primary/5 transition-colors">
                    <td className="px-8 py-4 text-sm font-bold text-on-surface-variant group-hover:text-primary transition-colors">Stock {editingId ? 'Actual' : 'Inicial'}</td>
                    <td className="px-8 py-4">
                      <input 
                        type="number" 
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                        placeholder="0"
                        className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-primary placeholder:text-on-surface-variant/20 focus:outline-none"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="p-6 bg-surface-container-lowest border-t border-outline-variant/10 flex gap-3">
              <button 
                onClick={() => {
                  setIsModalOpen(false)
                  setEditingId(null)
                  setFormData({ codigo: '', modelo: '', descripcion: '', stock: '' })
                }}
                disabled={saving}
                className="flex-1 py-3 bg-surface-container-low text-secondary font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-outline-variant/20 transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveRepuesto}
                disabled={saving}
                className="flex-[2] py-3 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {saving ? 'Guardando...' : editingId ? 'Actualizar Repuesto' : 'Guardar Repuesto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
