"use client";

import React, { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { 
  Inbox,
  Plus,
  Search,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Building2,
  User,
  History,
  FileText
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useNotification } from "@/context/NotificationContext";

export default function RecepcionEquiposPage() {
  const { showToast } = useNotification();
  const [serial, setSerial] = useState("");
  const [modelo, setModelo] = useState("");
  const [aliado, setAliado] = useState("");
  const [recibidoPor, setRecibidoPor] = useState("Almacén Central");
  const [observaciones, setObservaciones] = useState("");
  const [estado, setEstado] = useState("Bueno");

  const [receivedToday, setReceivedToday] = useState([
    { id: 1, serial: "982738411", modelo: "PAX A920", aliado: "CCR", estado: "Bueno", fecha: "Hoy, 09:30 AM", tecnico: "Carlos M." },
    { id: 2, serial: "482019482", modelo: "NEXGO K3", aliado: "VATC", estado: "Detalle Cosmético", fecha: "Hoy, 10:15 AM", tecnico: "Carlos M." },
    { id: 3, serial: "582019472", modelo: "AMP 8000", aliado: "BANPLUS", estado: "Falla Crítica", fecha: "Hoy, 11:00 AM", tecnico: "Carlos M." },
  ]);

  const [searchQuery, setSearchQuery] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serial || !modelo || !aliado) {
      showToast("Por favor rellena el Serial, Modelo y Aliado.", "warning");
      return;
    }

    const newRecord = {
      id: Date.now(),
      serial,
      modelo,
      aliado,
      estado,
      fecha: "Hoy, Justo ahora",
      tecnico: recibidoPor
    };

    setReceivedToday([newRecord, ...receivedToday]);
    setSerial("");
    setModelo("");
    setAliado("");
    setObservaciones("");
    showToast("¡Equipo recibido e ingresado al almacén con éxito!", "success");
  };

  const filteredHistory = receivedToday.filter(
    item => 
      item.serial.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.aliado.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.modelo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <TopBar title="Almacén - Recepción de Equipos" />
      
      <main className="p-lg space-y-lg max-w-[1440px] mx-auto w-full min-h-[calc(100vh-100px)]">
        
        {/* Welcome & Fast Reception Banner */}
        <section className="bg-white border border-outline-variant p-6 rounded-[32px] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase text-primary tracking-widest bg-primary/5 px-3 py-1 rounded-full">
              Gestión de Entrada y Stock
            </span>
            <h2 className="text-2xl font-black text-on-surface tracking-tight mt-2">
              Recepción Física de Equipos
            </h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Registra la llegada de nuevos lotes, terminales de reemplazo o equipos devueltos por clientes a nuestro taller central.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 border border-outline-variant rounded-2xl px-4 py-2">
            <Inbox className="w-5 h-5 text-primary animate-bounce" />
            <div>
              <p className="text-[10px] font-black text-outline uppercase tracking-wider">Hoy Recibidos</p>
              <p className="text-lg font-black text-on-surface leading-none">{receivedToday.length} Equipos</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-stretch">
          
          {/* Fast Scan / Reception Form */}
          <section className="col-span-12 lg:col-span-5 bg-white border border-outline-variant p-6 rounded-[40px] shadow-sm flex flex-col justify-between">
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-outline-variant/30">
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-md font-black text-on-surface uppercase tracking-wider">Nueva Entrada</h3>
                  <p className="text-[10px] font-bold text-outline">Ingresa los datos del equipo que acaba de ingresar</p>
                </div>
              </div>

              {/* Serial Field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-outline flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" /> Serial del Equipo (Escáner)
                </label>
                <input 
                  type="text" 
                  value={serial}
                  onChange={(e) => setSerial(e.target.value)}
                  placeholder="Escanea o escribe el número de serial..."
                  className="w-full px-4 py-3 bg-slate-50/50 border border-outline-variant rounded-xl text-xs font-bold text-on-surface focus:bg-white focus:border-primary focus:outline-none transition-all"
                  required
                />
              </div>

              {/* Grid model + ally */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-outline">Modelo</label>
                  <select 
                    value={modelo}
                    onChange={(e) => setModelo(e.target.value)}
                    className="w-full px-3 py-3 bg-slate-50/50 border border-outline-variant rounded-xl text-xs font-bold text-on-surface focus:bg-white focus:border-primary focus:outline-none transition-all cursor-pointer"
                    required
                  >
                    <option value="">Selecciona...</option>
                    <option value="PAX A920">PAX A920</option>
                    <option value="NEXGO K3">NEXGO K3</option>
                    <option value="AMP 8000">AMP 8000</option>
                    <option value="NEWPOS 9220">NEWPOS 9220</option>
                    <option value="PAX S90">PAX S90</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-outline">Aliado</label>
                  <select 
                    value={aliado}
                    onChange={(e) => setAliado(e.target.value)}
                    className="w-full px-3 py-3 bg-slate-50/50 border border-outline-variant rounded-xl text-xs font-bold text-on-surface focus:bg-white focus:border-primary focus:outline-none transition-all cursor-pointer"
                    required
                  >
                    <option value="">Selecciona...</option>
                    <option value="CCR">CCR</option>
                    <option value="VATC">VATC</option>
                    <option value="BANPLUS">BANPLUS</option>
                    <option value="PAYTECH">PAYTECH</option>
                    <option value="PLATCO">PLATCO</option>
                  </select>
                </div>
              </div>

              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-outline">Estado de Recepción Física</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Bueno", "Detalle Cosmético", "Falla Crítica"].map((est) => (
                    <button
                      type="button"
                      key={est}
                      onClick={() => setEstado(est)}
                      className={cn(
                        "py-2 px-1 text-[10px] font-black uppercase rounded-lg border transition-all active:scale-95 cursor-pointer",
                        estado === est 
                          ? est === "Bueno" 
                            ? "bg-green-50 text-green-700 border-green-200 shadow-sm"
                            : est === "Detalle Cosmético"
                              ? "bg-amber-50 text-amber-700 border-amber-200 shadow-sm"
                              : "bg-red-50 text-red-700 border-red-200 shadow-sm"
                          : "bg-white border-outline-variant hover:bg-slate-50 text-outline"
                      )}
                    >
                      {est}
                    </button>
                  ))}
                </div>
              </div>

              {/* Receiver Technician */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-outline flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Recibido por (Técnico / Unidad)
                </label>
                <input 
                  type="text" 
                  value={recibidoPor}
                  onChange={(e) => setRecibidoPor(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50/50 border border-outline-variant rounded-xl text-xs font-bold text-on-surface focus:bg-white focus:border-primary focus:outline-none transition-all"
                  required
                />
              </div>

              {/* Observations */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-outline flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Observaciones Adicionales
                </label>
                <textarea 
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Detalles sobre accesorios en la caja, guías de envío, etc..."
                  className="w-full px-4 py-3 bg-slate-50/50 border border-outline-variant rounded-xl text-xs font-bold text-on-surface focus:bg-white focus:border-primary focus:outline-none transition-all h-20 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4.5 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-primary-container hover:text-primary transition-all duration-300 shadow-lg shadow-primary/20 active:scale-[0.98] cursor-pointer text-center"
              >
                Confirmar e Ingresar a Almacén
              </button>
            </form>
          </section>

          {/* History of Today's Incoming Terminal Packages */}
          <section className="col-span-12 lg:col-span-7 bg-white border border-outline-variant p-6 rounded-[40px] shadow-sm flex flex-col justify-between">
            <div className="space-y-6 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <History className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-md font-black text-on-surface uppercase tracking-wider">Historial de Entrada</h3>
                    <p className="text-[10px] font-bold text-outline">Terminales registrados en el almacén hoy</p>
                  </div>
                </div>

                {/* Filter Search */}
                <div className="relative max-w-xs w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                  <input 
                    type="text" 
                    placeholder="Buscar por serial, aliado..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-outline-variant rounded-xl text-xs font-bold text-on-surface focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant text-[10px] font-black uppercase text-outline tracking-wider">
                      <th className="py-3 px-2">Equipo</th>
                      <th className="py-3 px-2">Aliado</th>
                      <th className="py-3 px-2">Estado</th>
                      <th className="py-3 px-2">Recibido</th>
                      <th className="py-3 px-2 text-right">Técnico</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {filteredHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-2">
                          <div className="flex items-center gap-2.5">
                            <Smartphone className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-xs font-black text-on-surface">{item.serial}</p>
                              <p className="text-[10px] text-outline font-semibold">{item.modelo}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-2">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-outline" />
                            <span className="text-xs font-bold text-on-surface uppercase">{item.aliado}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-2">
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                            item.estado === "Bueno" 
                              ? "bg-green-50 text-green-700"
                              : item.estado === "Detalle Cosmético"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-red-50 text-red-700"
                          )}>
                            {item.estado === "Bueno" ? (
                              <CheckCircle2 className="w-2.5 h-2.5" />
                            ) : (
                              <AlertCircle className="w-2.5 h-2.5" />
                            )}
                            {item.estado}
                          </span>
                        </td>
                        <td className="py-3.5 px-2">
                          <div className="flex items-center gap-1.5 text-outline text-[10px] font-semibold">
                            <Calendar className="w-3.5 h-3.5" />
                            {item.fecha}
                          </div>
                        </td>
                        <td className="py-3.5 px-2 text-right">
                          <span className="text-xs font-bold text-on-surface-variant">{item.tecnico}</span>
                        </td>
                      </tr>
                    ))}

                    {filteredHistory.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-outline text-xs italic">
                          No se encontraron registros de recepción.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

        </div>

      </main>
    </>
  );
}
