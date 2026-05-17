'use client'

import React, { useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import { CloudUpload, Loader2, CheckCircle2, AlertCircle, FileSpreadsheet } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { useNotification } from '@/context/NotificationContext'

interface ExcelUploadButtonProps {
  tableName: string
  onUploadComplete?: () => void
  label?: string
  className?: string
}

export function ExcelUploadButton({ tableName, onUploadComplete, label = "Importar Excel", className }: ExcelUploadButtonProps) {
  const { showConfirm } = useNotification()
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [uploadStatus, setUploadStatus] = useState('')
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

      // Función para convertir fechas de Excel (números) a string legible
      const formatExcelDate = (value: any) => {
        if (!value) return '';
        
        // Si ya es un string con formato de fecha, lo dejamos igual
        if (typeof value === 'string' && value.includes('/')) return value;
        if (typeof value === 'string' && value.includes('-') && value.length > 7) return value;

        // Si es un número (formato serial de Excel)
        const num = Number(value);
        if (!isNaN(num) && num > 30000 && num < 60000) {
          try {
            // Excel base date is 1899-12-30
            const date = new Date(Math.round((num - 25569) * 86400 * 1000));
            return date.toLocaleDateString('es-VE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });
          } catch (e) {
            return value.toString();
          }
        }
        return value.toString();
      };

      // Normalizar datos: Convertir todas las llaves a minúsculas para coincidir con Postgres
      const normalizedData = jsonData.map((row: any) => {
        const newRow: any = {};
        Object.keys(row).forEach(key => {
          let normalizedKey = key.toLowerCase()
            .replace(/\s+/g, '_')         // Espacios por guiones bajos
            .replace(/[^a-z0-9_]/g, '')   // Quitar caracteres especiales
          
          // Corregir errores comunes (ej: fehca -> fecha)
          if (normalizedKey === 'fehca') normalizedKey = 'fecha';
          
          // Mapeos específicos para casos comunes
          let finalKey = normalizedKey;
          if (normalizedKey === 'no') finalKey = 'no';
          if (normalizedKey === 'seriales') finalKey = 'seriales';
          if (normalizedKey === 'imei1') finalKey = 'imei_1';
          if (normalizedKey === 'imei2') finalKey = 'imei_2';
          if (normalizedKey === 'fecha_de_entrega' || normalizedKey === 'fechadeentrega') finalKey = 'fecha_de_entrega';
          
          // Formatear el valor si parece ser una fecha
          let value = row[key];
          if (finalKey.includes('fecha')) {
            value = formatExcelDate(value);
          }
          
          newRow[finalKey] = value;
        });
        return newRow;
      });

      console.log("Datos normalizados para subir:", normalizedData[0]);

      // Preguntar si desea REEMPLAZAR o ADICIONAR
      const confirmReplace = await showConfirm(
        'Método de Carga',
        `Se han detectado ${normalizedData.length} registros. ¿Desea REEMPLAZAR toda la base de datos actual? (Aceptar para Reemplazar todo / Cancelar para Adicionar los registros al final)`,
        'danger'
      )

      if (confirmReplace) {
        setUploadStatus('Borrando datos antiguos...')
        const { error: deleteError } = await supabase
          .from(tableName)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000')
        
        if (deleteError) throw deleteError
      }

      setUploadStatus('Subiendo datos...')
      
      // Dividir en lotes de 100 para evitar saturar la red
      const batchSize = 100;
      for (let i = 0; i < normalizedData.length; i += batchSize) {
        const batch = normalizedData.slice(i, i + batchSize);
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
        
        {uploading 
          ? (uploadStatus || "Procesando...") 
          : status === 'success' 
            ? "¡Completado!" 
            : status === 'error' 
              ? "Error" 
              : label
        }
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
