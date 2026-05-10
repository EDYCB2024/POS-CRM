'use client'

import { useEffect, useState } from 'react'
import { Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

// Reusable components for the print view
function PrintField({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col border-b border-slate-200 pb-1.5 justify-end">
      <span className="text-[9px] font-black uppercase text-outline tracking-wider leading-none mb-1">{label}</span>
      <div className="text-[11px] font-bold text-on-surface truncate min-h-[16px]">
        {value || '---'}
      </div>
    </div>
  )
}

function PrintArea({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col h-full">
      <span className="text-[9px] font-black uppercase text-outline tracking-wider mb-2">{label}</span>
      <div className="text-[11px] leading-relaxed text-on-surface-variant italic whitespace-pre-wrap flex-1">
        {value || 'Sin observaciones adicionales.'}
      </div>
    </div>
  )
}

function PrintToggle({ label, value }: { label: string, value: boolean }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-slate-50">
      <span className="text-[10px] font-medium text-on-surface-variant">{label}</span>
      <span className="text-[10px] font-bold text-on-surface">
        {value ? 'SI' : 'NO'}
      </span>
    </div>
  )
}

export default function PrintReportPage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
      const searchParams = new URLSearchParams(window.location.search);
      const serialParam = searchParams.get('serial');

      if (serialParam) {
        // Try to fetch from Supabase to ensure fresh data
        try {
          const tables = ['vatc', 'banplus', 'ccr', 'instapago', 'poscom', 'exterior', 'bancaribe', 'tokenp', 'bactivo', 'bancrecer', 'bestpay', 'delsur', 'paytech', 'platco', 'platco_pos', 'otros'];
          
          let foundData = null;
          for (const table of tables) {
            const { data: record } = await supabase
              .from(table)
              .select('*')
              .or(`serial.eq.${serialParam},serial_de_remplazo.eq.${serialParam}`)
              .maybeSingle();
            
            if (record) {
              foundData = {
                formData: record,
                accessories: {
                  caja: false,
                  cargador: false,
                  bateria: false,
                  tapa: false,
                  rollos: false,
                  base: false
                },
                selectedTecnico: 'Servicio Técnico',
                serial: serialParam
              };
              break;
            }
          }

          if (foundData) {
            setData(foundData);
            return;
          }
        } catch (err) {
          console.error("Error fetching report data:", err);
        }
      }

      // Fallback to localStorage
      const savedData = localStorage.getItem('print_report_data')
      if (savedData) {
        setData(JSON.parse(savedData))
      }
    }

    loadData();
  }, [])

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-outline font-bold tracking-widest uppercase">Cargando informe...</p>
    </div>
  )

  const { formData, accessories, selectedTecnico, serial } = data

  return (
    <div className="min-h-screen bg-white text-on-surface p-8 max-w-4xl mx-auto print:p-0">
      {/* Hide the print button when actually printing */}
      <div className="mb-8 flex justify-end no-print">
        <button 
          onClick={() => window.print()}
          className="bg-primary text-white px-8 py-2 rounded-xl font-bold text-sm shadow hover:bg-primary/90"
        >
          Imprimir / Guardar PDF
        </button>
      </div>

      <div className="report-print-container w-full max-w-[816px] mx-auto bg-white p-8 print:p-0 print:w-[816px]">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-primary pb-3 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center">
              <Monitor className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-on-surface leading-none">
                Informe de Servicio Técnico
              </h1>
              <p className="text-[10px] font-bold text-outline tracking-widest uppercase mt-1">
                Soporte Técnico y Control de Calidad
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-outline uppercase tracking-widest">N# Control</p>
            <p className="text-base font-black text-primary">V-{Math.floor(Math.random() * 100000).toString().padStart(6, '0')}</p>
            <p className="text-[9px] font-black text-outline uppercase tracking-widest mt-2">Fecha</p>
            <p className="text-xs font-bold text-on-surface">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-6">
          {/* Section 1: Cliente y Equipo */}
          <section>
            <h5 className="text-[10px] font-black uppercase text-primary border-l-4 border-primary pl-3 mb-2 tracking-widest bg-slate-50 py-1.5">1. Información del Cliente y Equipo</h5>
            <div className="grid grid-cols-2 gap-x-12 gap-y-3">
              <PrintField label="Razón Social" value={formData.razon_social || formData.razn_social} />
              <PrintField label="Serial" value={serial} />
              <PrintField label="RIF" value={formData.rif} />
              <PrintField label="Falla Reportada" value={formData.falla_reportada || formData.falla} />
              <PrintField label="Marca" value={formData.marca || 'NEWLAND'} />
              <PrintField label="Modelo" value={formData.modelo} />
              <PrintField label="Procesadora" value={formData.procesadora || 'N/A'} />
            </div>
          </section>

          {/* Section 2: Accesorios */}
          <section>
            <h5 className="text-[10px] font-black uppercase text-primary border-l-4 border-primary pl-3 mb-2 tracking-widest bg-slate-50 py-1.5">2. Recepción del Equipo (Accesorios)</h5>
            <div className="grid grid-cols-2 gap-x-12 gap-y-1">
              {Object.entries(accessories).map(([key, val]) => (
                <PrintToggle key={key} label={key} value={val as boolean} />
              ))}
            </div>
          </section>

          {/* Section 3: Evaluación */}
          <section>
            <h5 className="text-[10px] font-black uppercase text-primary border-l-4 border-primary pl-3 mb-2 tracking-widest bg-slate-50 py-1.5">3. Evaluación Técnica</h5>
            <div className="grid grid-cols-2 gap-x-12 gap-y-3">
              <PrintField label="Estatus del Equipo" value={formData.estatus} />
              <PrintField label="Garantía" value={formData.garantia?.toUpperCase() === 'SI' ? 'SI' : 'NO'} />
              <PrintField label="Nivel" value={formData.nivel || 'N/A'} />
              <PrintField label="Estatus del Caso" value={formData.estatus?.toLowerCase().includes('cerrado') ? 'CASO CERRADO' : 'CASO ABIERTO'} />
            </div>
          </section>

          {/* Section 4: Observaciones */}
          <section>
            <h5 className="text-[10px] font-black uppercase text-primary border-l-4 border-primary pl-3 mb-2 tracking-widest bg-slate-50 py-1.5">4. Observaciones Finales</h5>
            <div className="p-3 border border-slate-100 rounded bg-slate-50/50 min-h-[80px]">
              <PrintArea label="Detalle de la evaluación" value={formData.observaciones} />
            </div>
          </section>
        </div>

        {/* Technician Section */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-end">
          <div>
            <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-1">Técnico Encargado</p>
            <p className="text-sm font-bold text-on-surface">{selectedTecnico}</p>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-bold text-outline uppercase tracking-widest opacity-30">
              ID: {Math.random().toString(36).substring(7).toUpperCase()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
