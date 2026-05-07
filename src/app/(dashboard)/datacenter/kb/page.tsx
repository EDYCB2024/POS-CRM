'use client'

import { TopBar } from "@/components/layout/TopBar";
import { 
  BookOpen, 
  Search, 
  ChevronRight, 
  Cpu, 
  Wifi, 
  Signal, 
  Settings, 
  ShieldAlert,
  Terminal,
  Database
} from 'lucide-react';
import { useState } from 'react';
import { cn } from "@/lib/utils";

const kbSections = [
  {
    title: "N910 / N950 CREDICARD",
    icon: Terminal,
    articles: [
      {
        title: "Descargar Parámetros TMS",
        steps: [
          "Ingrese a FUNCIONES.",
          "Acceda a Configuración de sistema.",
          "Ingrese la clave 123456.",
          "Ejecute Descargar parámetros TMS."
        ]
      },
      {
        title: "Limpiar ADVICE, Etiquetas y/o Reversos",
        steps: [
          "Acceda a FUNCIONES.",
          "Vaya a Configuración de sistema.",
          "Clave 123456.",
          "Seleccione la opción a Ejecutar.",
          "Clave 88888888 (8 veces 8)."
        ]
      }
    ]
  },
  {
    title: "ME60",
    icon: Cpu,
    articles: [
      {
        title: "Cambio de Red (Movistar/Digitel)",
        content: "Para Movistar (SIM 2) o Digitel (SIM 1), siga estos pasos:",
        steps: [
          "Presione la tecla Menú (X).",
          "Seleccione Opción 7: Comunicaciones.",
          "Seleccione Opción 4: Tipo de red.",
          "Elija la SIM correspondiente y seleccione 3G."
        ]
      },
      {
        title: "Configuración WIFI",
        steps: [
          "Tecla asterisco (*) -> Menú Técnico.",
          "Seleccione Opción 2: Comunicaciones.",
          "Seleccione Opción 5: WIFI.",
          "Utiliza SSL = 0.NO.",
          "Buscar SSID y colocar clave.",
          "OPEN DHCP = 1.SI.",
          "Host IPs: 201.222.13.4 / 201.222.14.22 (Puerto 4541)."
        ]
      }
    ]
  },
  {
    title: "Parámetros APN",
    icon: Database,
    tables: [
      {
        header: ["Procesadora", "Operadora", "APN", "Host IP", "Puerto"],
        rows: [
          ["Credicard", "Digitel", "tdd1.vatc", "200.109.231.231", "4455"],
          ["Credicard", "Movistar", "m2mcredi.movistar.ve", "200.109.231.231", "4455"],
          ["Platco", "Digitel", "tdd1.platco2", "10.0.16.174", "4541"],
          ["Platco", "Movistar", "m2mplatco.movistar.ve", "172.20.100.174", "4541"]
        ]
      }
    ]
  }
];

export default function KnowledgeBasePage() {
  const [search, setSearch] = useState("");
  const [expandedSection, setExpandedSection] = useState<number | null>(0);

  return (
    <>
      <TopBar title="Base de Conocimiento" />
      
      <section className="p-8 max-w-7xl mx-auto w-full">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-black uppercase tracking-tight text-primary flex items-center gap-3">
              <BookOpen className="w-8 h-8" />
              Base de Conocimiento
            </h1>
            <p className="text-on-surface-variant mt-2 font-medium max-w-2xl">
              Manuales de procedimientos técnicos, parámetros de configuración y guías de mantenimiento para terminales POS.
            </p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
            <input 
              type="text"
              placeholder="Buscar procedimientos o modelos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-outline-variant rounded-2xl shadow-sm focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-4 space-y-3">
            {kbSections.map((section, idx) => (
              <button
                key={section.title}
                onClick={() => setExpandedSection(idx)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-2xl transition-all border group",
                  expandedSection === idx 
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                    : "bg-white text-on-surface border-outline-variant hover:border-primary/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-xl transition-colors",
                    expandedSection === idx ? "bg-white/20" : "bg-primary/5 group-hover:bg-primary/10"
                  )}>
                    <section.icon className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm tracking-tight">{section.title}</span>
                </div>
                <ChevronRight className={cn("w-4 h-4 transition-transform", expandedSection === idx && "rotate-90")} />
              </button>
            ))}

            <div className="mt-8 p-6 bg-red-50 border border-red-100 rounded-2xl">
              <div className="flex items-center gap-3 text-red-700 mb-2">
                <ShieldAlert className="w-5 h-5" />
                <span className="font-black uppercase text-xs tracking-widest">Aviso Importante</span>
              </div>
              <p className="text-[11px] text-red-600/80 font-medium leading-relaxed">
                Si un equipo presenta mensaje de <strong>TAMPER</strong>, no intente realizar procedimientos de software. El equipo debe ingresar a revisión física en servicio técnico.
              </p>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-8">
            {expandedSection !== null && (
              <div className="bg-white border border-outline-variant rounded-[32px] p-8 shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
                  <div className="p-3 bg-primary/5 rounded-2xl">
                    {(() => {
                      const Icon = kbSections[expandedSection].icon;
                      return <Icon className="w-8 h-8 text-primary" />;
                    })()}
                  </div>
                  <h2 className="text-2xl font-black text-on-surface uppercase tracking-tight">
                    {kbSections[expandedSection].title}
                  </h2>
                </div>

                <div className="space-y-10">
                  {kbSections[expandedSection].articles?.map((article, aIdx) => (
                    <div key={aIdx} className="space-y-4">
                      <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                        {article.title}
                      </h3>
                      {article.content && <p className="text-sm text-on-surface-variant font-medium">{article.content}</p>}
                      <ol className="space-y-3 pl-2">
                        {article.steps.map((step, sIdx) => (
                          <li key={sIdx} className="flex gap-4 items-start">
                            <span className="flex-shrink-0 w-6 h-6 bg-slate-100 text-primary rounded-lg flex items-center justify-center text-[10px] font-black">
                              {sIdx + 1}
                            </span>
                            <span className="text-sm text-on-surface font-medium pt-0.5">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}

                  {kbSections[expandedSection].tables?.map((table, tIdx) => (
                    <div key={tIdx} className="overflow-hidden border border-outline-variant rounded-2xl">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-outline-variant">
                            {table.header.map(h => (
                              <th key={h} className="px-6 py-4 text-[10px] text-on-surface-variant uppercase font-black tracking-widest">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant">
                          {table.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-50/50 transition-colors">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className={cn(
                                  "px-6 py-4 text-xs font-bold uppercase",
                                  cIdx === 0 ? "text-primary font-black" : "text-on-surface"
                                )}>
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
