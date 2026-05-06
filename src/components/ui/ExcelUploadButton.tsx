'use client'

import React, { useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import { CloudUpload, Loader2, CheckCircle2, AlertCircle, FileSpreadsheet } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface ExcelUploadButtonProps {
  tableName: string
  onUploadComplete?: () => void
  label?: string
  className?: string
}

export function ExcelUploadButton({ tableName, onUploadComplete, label = "Importar Excel", className }: ExcelUploadButtonProps) {
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setStatus('idle')
    
    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      if (jsonData.length === 0) {
        throw new Error("El archivo está vacío")
      }

      // Preguntar si desea REEMPLAZAR o ADICIONAR (simplificado por ahora como reemplazo total si el usuario lo solicita)
      const confirmReplace = window.confirm(`Se han detectado ${jsonData.length} registros. ¿Desea REEMPLAZAR toda la base de datos actual? (Cancelar para solo adicionar)`)

      if (confirmReplace) {
        // Borrar datos actuales
        const { error: deleteError } = await supabase.from(tableName).delete().neq('id', '00000000-0000-0000-0000-000000000000') // Borra todo
        if (deleteError) throw deleteError
      }

      // Insertar nuevos datos en lotes para evitar límites de payload
      const batchSize = 100
      for (let i = 0; i < jsonData.length; i += batchSize) {
        const batch = jsonData.slice(i, i + batchSize)
        const { error: insertError } = await supabase.from(tableName).insert(batch)
        if (insertError) throw insertError
      }

      setStatus('success')
      if (onUploadComplete) onUploadComplete()
      
      // Reset después de 3 segundos
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err: any) {
      console.error("Upload error:", err)
      setStatus('error')
      setErrorMessage(err.message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className={cn("relative inline-block", className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx, .xls, .csv"
        className="hidden"
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className={cn(
          "flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg",
          status === 'idle' && "bg-white border border-outline-variant text-primary hover:bg-slate-50 shadow-primary/5",
          status === 'success' && "bg-green-500 text-white shadow-green-200",
          status === 'error' && "bg-red-500 text-white shadow-red-200",
          uploading && "opacity-70 cursor-not-allowed"
        )}
      >
        {uploading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : status === 'success' ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : status === 'error' ? (
          <AlertCircle className="w-5 h-5" />
        ) : (
          <FileSpreadsheet className="w-5 h-5" />
        )}
        
        {uploading ? "Procesando..." : status === 'success' ? "¡Completado!" : status === 'error' ? "Error" : label}
      </button>

      {status === 'error' && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white p-3 rounded-lg border border-red-100 shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
          <p className="text-[10px] font-black text-red-600 uppercase mb-1">Error al importar</p>
          <p className="text-xs text-on-surface-variant font-medium">{errorMessage}</p>
        </div>
      )}
    </div>
  )
}
