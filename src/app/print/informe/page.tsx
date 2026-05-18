'use client'

import { useEffect, useState } from 'react'
import { Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

// Reusable components for the print view
function PrintField({ label, value }: { label: string, value: string }) {
  const [localVal, setLocalVal] = useState(value || '---')

  useEffect(() => {
    setLocalVal(value || '---')
  }, [value])

  return (
    <div className="flex flex-col border-b border-slate-200 pb-1.5 justify-end group hover:border-primary/45 transition-colors">
      <span className="text-[9px] font-black uppercase text-outline tracking-wider leading-none mb-1 group-hover:text-primary transition-colors">{label}</span>
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => setLocalVal(e.target.innerText)}
        className="text-[11px] font-bold text-on-surface truncate min-h-[16px] outline-none cursor-text select-text focus:bg-slate-50 px-1 rounded transition-all"
      >
        {localVal}
      </div>
    </div>
  )
}

function PrintArea({ label, value }: { label: string, value: string }) {
  const [localVal, setLocalVal] = useState(value || 'Sin observaciones adicionales.')

  useEffect(() => {
    setLocalVal(value || 'Sin observaciones adicionales.')
  }, [value])

  return (
    <div className="flex flex-col h-full group">
      <span className="text-[9px] font-black uppercase text-outline tracking-wider mb-2 group-hover:text-primary transition-colors">{label}</span>
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => setLocalVal(e.target.innerText)}
        className="text-[11px] leading-relaxed text-on-surface-variant italic whitespace-pre-wrap flex-1 outline-none cursor-text select-text focus:bg-slate-50 px-1 rounded transition-all min-h-[40px]"
      >
        {localVal}
      </div>
    </div>
  )
}

function PrintToggle({ label, value }: { label: string, value: boolean }) {
  const [active, setActive] = useState(value)

  useEffect(() => {
    setActive(value)
  }, [value])

  return (
    <div 
      onClick={() => setActive(!active)}
      className="flex items-center justify-between py-0.5 border-b border-slate-50 cursor-pointer hover:bg-slate-100/50 px-1 -mx-1 rounded transition-all group"
    >
      <span className="text-[10px] font-medium text-on-surface-variant group-hover:text-primary transition-colors">{label}</span>
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded leading-none transition-all ${active ? 'text-primary bg-primary/5 font-black' : 'text-outline bg-slate-50/70'}`}>
        {active ? 'SI' : 'NO'}
      </span>
    </div>
  )
}

function PrintCheckbox({ label, value }: { label: string, value: boolean }) {
  const [active, setActive] = useState(value)

  useEffect(() => {
    setActive(value)
  }, [value])

  return (
    <div 
      onClick={() => setActive(!active)}
      className="flex items-center gap-2 py-0.5 cursor-pointer hover:bg-slate-100/50 px-1 -mx-1 rounded transition-all group"
    >
      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${active ? 'border-primary bg-primary text-white' : 'border-slate-300 bg-white group-hover:border-primary/50'}`}>
        {active && (
          <svg className="w-2.5 h-2.5 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      <span className="text-[10px] font-medium text-on-surface-variant group-hover:text-primary transition-colors leading-none">{label}</span>
    </div>
  )
}

function PrintWideField({ label, value }: { label: string, value: string }) {
  const [localVal, setLocalVal] = useState(value || '---')

  useEffect(() => {
    setLocalVal(value || '---')
  }, [value])

  return (
    <div className="flex flex-col border-b border-slate-200 pb-2 justify-end group hover:border-primary/45 transition-colors">
      <span className="text-[9px] font-black uppercase text-outline tracking-wider leading-none mb-1.5 group-hover:text-primary transition-colors">{label}</span>
      <div
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => setLocalVal(e.target.innerText)}
        className="text-[11px] font-bold text-on-surface leading-relaxed min-h-[16px] whitespace-pre-wrap outline-none cursor-text select-text focus:bg-slate-50 px-1 rounded transition-all"
      >
        {localVal}
      </div>
    </div>
  )
}

export default function PrintReportPage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
      const searchParams = new URLSearchParams(window.location.search);
      const serialParam = searchParams.get('serial');

      // Fetch logged in user to get their name
      let currentUserFullName = 'Servicio Técnico';
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('nombre, apellido, full_name')
            .eq('id', user.id)
            .single()
          if (data) {
            if (data.nombre && data.apellido) {
              currentUserFullName = `${data.nombre} ${data.apellido}`
            } else if (data.full_name) {
              currentUserFullName = data.full_name
            } else {
              currentUserFullName = user.email?.split('@')[0] || 'Servicio Técnico'
            }
          }
        }
      } catch (err) {
        console.error('Error fetching logged in user for print page:', err)
      }

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
                  sim_card: false,
                  etiqueta_garantia: false,
                  tapa: false,
                  forro: false,
                  declaracion_contribuyente: false,
                  rollo_termico: false
                },
                selectedTecnico: currentUserFullName,
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
        const parsed = JSON.parse(savedData);
        // If parsed selectedTecnico is default or empty, override with current logged in user
        if (!parsed.selectedTecnico || parsed.selectedTecnico === 'TECNICO 1' || parsed.selectedTecnico === 'Servicio Técnico') {
          parsed.selectedTecnico = currentUserFullName;
        }
        setData(parsed)
      }
    }

    loadData();
  }, [])

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-outline font-bold tracking-widest uppercase">Cargando informe...</p>
    </div>
  )

  const { formData, accessories, section4, selectedTecnico, serial } = data
  const section4Val = section4 || {
    garantia: false,
    cotizacion: false,
    irreparable: false,
    nivel_0: false,
    nivel_1: false,
    nivel_2: false,
    carga_llaves_si: false,
    carga_llaves_no: false
  }

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
        <div className="flex items-start justify-between border-b-2 border-primary pb-2 mb-4">
          <div className="flex items-center gap-4">
            <img
              src="/logo-vatc.png"
              alt="Logo VAT & C"
              className="h-16 w-auto object-contain"
            />
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-on-surface leading-none">
                Informe de Servicio Técnico
              </h1>
              <p className="text-[10px] font-bold text-outline tracking-widest uppercase mt-1.5">
                VA TECHNOLOGY & COMMUNICATION
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-outline uppercase tracking-widest">N# Control</p>
            <p
              contentEditable
              suppressContentEditableWarning
              className="text-base font-black text-primary outline-none cursor-text px-1 focus:bg-slate-50 rounded inline-block"
            >
              {formData.informe || formData.informes || formData.informe2 || '---'}
            </p>
            <p className="text-[9px] font-black text-outline uppercase tracking-widest mt-2">Fecha</p>
            <p
              contentEditable
              suppressContentEditableWarning
              className="text-xs font-bold text-on-surface outline-none cursor-text px-1 focus:bg-slate-50 rounded inline-block"
            >
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-4">
          {/* Section 1: Cliente y Equipo */}
          <section>
            <h5 className="text-[10px] font-black uppercase text-primary border-l-4 border-primary pl-3 mb-2 tracking-widest bg-slate-50 py-1.5">1. Información del Cliente y Equipo</h5>
            <div className="grid grid-cols-2 gap-x-12 gap-y-3">
              {/* Columna Izquierda */}
              <div className="space-y-3">
                <PrintField label="Razón Social" value={formData.razon_social || formData.razn_social} />
                <PrintField label="Serial" value={serial} />
                <PrintField label="RIF" value={formData.rif} />
                <PrintField label="Falla Reportada" value={formData.falla_reportada || formData.falla_notificada || formData.falla} />
              </div>
              {/* Columna Derecha */}
              <div className="space-y-3">
                <PrintField label="Marca" value={formData.marca || 'NEWLAND'} />
                <PrintField label="Modelo" value={formData.modelo} />
                <PrintField label="Procesadora" value={formData.procesadora || 'N/A'} />
                <PrintField label="Operadora" value={formData.operadora || 'N/A'} />
              </div>
            </div>
          </section>

          {/* Section 2: Accesorios */}
          <section>
            <h5 className="text-[10px] font-black uppercase text-primary border-l-4 border-primary pl-3 mb-2 tracking-widest bg-slate-50 py-1.5">2. Recepción del Equipo (Accesorios)</h5>
            <div className="grid grid-cols-2 gap-x-12 gap-y-1">
              {/* Columna Izquierda */}
              <div className="space-y-1">
                <PrintToggle label="Caja" value={!!accessories.caja} />
                <PrintToggle label="Cargador" value={!!accessories.cargador} />
                <PrintToggle label="Batería" value={!!accessories.bateria} />
                <PrintToggle label="Sim Card" value={!!accessories.sim_card} />
                <PrintToggle label="Etiqueta de garantía" value={!!accessories.etiqueta_garantia} />
              </div>
              {/* Columna Derecha */}
              <div className="space-y-1">
                <PrintToggle label="Tapa de Batería" value={!!accessories.tapa} />
                <PrintToggle label="Forro" value={!!accessories.forro} />
                <PrintToggle label="Declaración de Cont." value={!!accessories.declaracion_contribuyente} />
                <PrintToggle label="Rollo Térmico" value={!!accessories.rollo_termico} />
              </div>
            </div>
          </section>

          {/* Section 3: Evaluación Técnica */}
          <section>
            <h5 className="text-[10px] font-black uppercase text-primary border-l-4 border-primary pl-3 mb-2 tracking-widest bg-slate-50 py-1.5">3. Evaluación Técnica</h5>
            <div className="space-y-2.5">
              <PrintWideField
                label="Diagnóstico Técnico"
                value={formData.observaciones || formData.observacion_2 || 'Reporte estándar de revisión'}
              />
              <PrintWideField
                label="Servicio a realizar"
                value={(() => {
                  const parts = [
                    formData.repuesto__servicio,
                    formData.repuesto__servicio_1,
                    formData.repuesto__servicio_2,
                    formData.repuesto__servicio_3,
                    formData.repuesto_1,
                    formData.repuesto_2,
                    formData.repuesto_3
                  ].filter(Boolean);
                  return parts.length > 0 ? parts.join(', ') : 'Servicio técnico de revisión y diagnóstico';
                })()}
              />
              <PrintWideField
                label="Evidencias / Observaciones"
                value={formData.falla_notificada || formData.falla || 'Sin novedades adicionales reportadas.'}
              />
            </div>
          </section>

          {/* Section 4: Diagnóstico y Estado Técnico */}
          <section className="mt-4">
            <h5 className="text-[10px] font-black uppercase text-primary border-l-4 border-primary pl-3 mb-2 tracking-widest bg-slate-50 py-1.5">4. Diagnóstico y Estado Técnico</h5>

            <div className="grid grid-cols-3 gap-4 p-2.5 border border-slate-100 rounded bg-slate-50/50">
              {/* Col 1: Condición del Equipo */}
              <div className="space-y-1.5 border-r border-slate-200/50 pr-4">
                <span className="text-[10px] font-black uppercase text-on-surface tracking-widest block mb-2">Condición del Equipo</span>
                <PrintCheckbox label="Garantía" value={!!section4Val.garantia} />
                <PrintCheckbox label="Cotización" value={!!section4Val.cotizacion} />
                <PrintCheckbox label="Irreparable" value={!!section4Val.irreparable} />
              </div>

              {/* Col 2: Nivel de Falla */}
              <div className="space-y-1.5 border-r border-slate-200/50 pr-4">
                <span className="text-[10px] font-black uppercase text-on-surface tracking-widest block mb-2">Nivel de Falla</span>
                <PrintCheckbox label="Nivel 0" value={!!section4Val.nivel_0} />
                <PrintCheckbox label="Nivel 1" value={!!section4Val.nivel_1} />
                <PrintCheckbox label="Nivel 2" value={!!section4Val.nivel_2} />
              </div>

              {/* Col 3: Requiere Carga de Llaves */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase text-on-surface tracking-widest block mb-2">Requiere carga de llaves</span>
                <PrintCheckbox label="Sí" value={!!section4Val.carga_llaves_si} />
                <PrintCheckbox label="No" value={!!section4Val.carga_llaves_no} />
              </div>
            </div>
          </section>
        </div>

        {/* Technician Section */}
        <div className="mt-4 pt-2 border-t border-slate-100 flex justify-between items-end">
          <div>
            <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-1">Técnico Encargado</p>
            <p
              contentEditable
              suppressContentEditableWarning
              className="text-sm font-bold text-on-surface outline-none cursor-text px-1 focus:bg-slate-50 rounded inline-block min-w-[120px]"
            >
              {selectedTecnico}
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
