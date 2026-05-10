"use client";

import React, { useState, useEffect, useRef } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { 
  Monitor, 
  Smartphone,
  Plus
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

// Cache outside the component to persist dashboard stats between remounts
let cachedStats: {
  key: string;
  data: any;
} | null = null;

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [dayStats, setDayStats] = useState<{ total: number, allies: any[], models: any[] }>({ total: 0, allies: [], models: [] });
  const [monthStats, setMonthStats] = useState<{ total: number, allies: any[], models: any[] }>({ total: 0, allies: [], models: [] });
  const [yearStats, setYearStats] = useState<{ total: number, allies: any[], models: any[] }>({ total: 0, allies: [], models: [] });
  const [totalGlobal, setTotalGlobal] = useState(0);

  const dateInputRef = useRef<HTMLInputElement>(null);
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const fullMonthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const allyTables = [
    'vatc', 'banplus', 'ccr', 'instapago', 'poscom', 'exterior', 
    'bancaribe', 'tokenp', 'bactivo', 'bancrecer', 'bestpay', 
    'delsur', 'paytech', 'platco'
  ];

  const aggregateBy = (data: any[], key: string) => {
    if (!data || data.length === 0) return [];
    const counts = data.reduce((acc: any, item: any) => {
      const val = item[key] || 'DESCONOCIDO';
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .map(([name, count]) => ({ name: name.toUpperCase(), count: count as number }))
      .sort((a, b) => b.count - a.count);
  };

  const fetchStats = async (force: boolean = false) => {
    const cacheKey = `${selectedDate.toISOString().split('T')[0]}-${selectedMonth}-${selectedYear}`;
    
    if (!force && cachedStats && cachedStats.key === cacheKey) {
      const { global_total, day_data, month_data, year_data } = cachedStats.data;
      setTotalGlobal(global_total);
      setDayStats({ total: day_data.length, allies: aggregateBy(day_data, 'table'), models: aggregateBy(day_data, 'modelo') });
      setMonthStats({ total: month_data.length, allies: aggregateBy(month_data, 'table'), models: aggregateBy(month_data, 'modelo') });
      setYearStats({ total: year_data.length, allies: aggregateBy(year_data, 'table'), models: aggregateBy(year_data, 'modelo') });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_pos_dashboard_stats', {
        p_selected_date: selectedDate.toISOString().split('T')[0],
        p_selected_month: selectedMonth + 1,
        p_selected_year: selectedYear
      });

      if (rpcError) throw rpcError;

      if (rpcData) {
        const { global_total, day_data, month_data, year_data } = rpcData;
        setTotalGlobal(global_total);
        setDayStats({ total: day_data.length, allies: aggregateBy(day_data, 'table'), models: aggregateBy(day_data, 'modelo') });
        setMonthStats({ total: month_data.length, allies: aggregateBy(month_data, 'table'), models: aggregateBy(month_data, 'modelo') });
        setYearStats({ total: year_data.length, allies: aggregateBy(year_data, 'table'), models: aggregateBy(year_data, 'modelo') });
        cachedStats = { key: cacheKey, data: rpcData };
      }
    } catch (error) {
      console.error('Error fetching stats via RPC:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedDate, selectedMonth, selectedYear]);

  return (
    <>
      <TopBar title="Dashboard Ejecutivo" />
      
      <div className="px-lg pt-md">
        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full w-fit animate-pulse">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">
            {loading ? 'Sincronizando...' : 'Sincronización en Vivo'}
          </span>
        </div>
      </div>
      
      <main className="p-lg space-y-lg max-w-[1440px] mx-auto w-full">
        {/* KPI Section */}
        <div className="grid grid-cols-1 gap-md">
          <div className="bg-white border border-outline-variant p-lg rounded-2xl hover:bg-surface-container-low transition-all shadow-sm group border-l-4 border-l-secondary">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-lg">
                <div className="p-4 rounded-xl bg-secondary-container/30 transition-transform group-hover:scale-110">
                  <Monitor className="w-8 h-8 text-secondary" />
                </div>
                <div>
                  <p className="text-label-lg text-on-surface-variant font-medium">Terminales Gestionadas</p>
                  <h2 className="text-[40px] font-bold text-on-surface leading-tight">
                    {loading ? "..." : totalGlobal.toLocaleString()}
                  </h2>
                </div>
              </div>
              <div className="text-right">
                <span className="text-label-md font-bold px-3 py-1 rounded-full text-blue-600 bg-blue-50">
                  Estable
                </span>
                <p className="text-label-md text-outline mt-2">Total en {allyTables.length} aliados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Grid Content */}
        <div className="grid grid-cols-1 gap-md items-stretch">
          {/* Daily Summary Section */}
          <div className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm flex flex-col hover:bg-slate-50/50 transition-all group">
            <div className="flex justify-between items-center mb-lg">
              <div className="flex items-center gap-4">
                <div 
                  className="relative group/cal cursor-pointer"
                  onClick={() => dateInputRef.current?.showPicker?.()}
                >
                  <input 
                    ref={dateInputRef}
                    type="date" 
                    className="absolute inset-0 opacity-0 w-0 h-0 pointer-events-none"
                    onChange={(e) => {
                      if (e.target.value) setSelectedDate(new Date(e.target.value));
                    }}
                  />
                  <div className="flex flex-col items-center bg-primary/10 border border-primary/20 rounded-xl px-3 py-1 shadow-sm group-hover/cal:bg-primary group-hover/cal:border-primary transition-all">
                    <p className="text-[10px] font-black text-primary uppercase leading-tight group-hover/cal:text-white">
                      {monthNames[selectedDate.getMonth()]}
                    </p>
                    <p className="text-xl font-black text-primary leading-tight group-hover/cal:text-white">
                      {selectedDate.getDate().toString().padStart(2, '0')}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-h3 text-on-surface font-black uppercase tracking-tight">Ingresos del Día</h3>
                  <p className="text-[10px] font-bold text-outline uppercase tracking-widest mt-0.5">
                    {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black text-primary">+{dayStats.total}</p>
                <p className="text-[10px] font-bold text-green-600 uppercase">Equipos hoy</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
              <div>
                <p className="text-[10px] font-black text-outline uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <Plus className="w-3 h-3" />
                  Por Aliado
                </p>
                <div className="space-y-2">
                  {dayStats.allies.length > 0 ? dayStats.allies.map(ally => (
                    <div key={ally.name} className="flex items-center justify-between group/item">
                      <span className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">{ally.name}</span>
                      <div className="flex items-center gap-3 flex-1 px-4">
                        <div className="h-1.5 bg-slate-100 rounded-full flex-1 overflow-hidden">
                          <div className={cn("h-full rounded-full bg-primary transition-all")} style={{ width: `${(ally.count / dayStats.total) * 100}%` }} />
                        </div>
                        <span className="text-xs font-black text-on-surface w-4 text-right">{ally.count}</span>
                      </div>
                    </div>
                  )) : (
                    <p className="text-[10px] text-outline italic">Sin registros para esta fecha</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-outline uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <Smartphone className="w-3 h-3" />
                  Por Modelo
                </p>
                <div className="flex flex-wrap gap-2">
                  {dayStats.models.length > 0 ? dayStats.models.map(model => (
                    <div key={model.name} className="px-4 py-2 bg-slate-50 border border-outline-variant/30 rounded-xl flex items-center gap-3">
                      <span className="text-[10px] font-black text-on-surface">{model.name}</span>
                      <div className="w-px h-3 bg-outline-variant" />
                      <span className="text-[11px] font-black text-primary">{model.count}</span>
                    </div>
                  )) : (
                    <p className="text-[10px] text-outline italic">Sin registros para esta fecha</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Summary Section */}
          <div className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm flex flex-col hover:bg-slate-50/50 transition-all group">
            <div className="flex justify-between items-start mb-lg">
              <div>
                <h3 className="text-h3 text-on-surface font-black uppercase tracking-tight">Acumulado Mes</h3>
                <div className="mt-2 flex items-center gap-2">
                  <select 
                    value={fullMonthNames[selectedMonth]}
                    onChange={(e) => setSelectedMonth(fullMonthNames.indexOf(e.target.value))}
                    className="bg-secondary/10 border border-secondary/20 rounded-lg px-2 py-1 text-[10px] font-black text-secondary uppercase outline-none cursor-pointer hover:bg-secondary/20 transition-all"
                  >
                    {fullMonthNames.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black text-secondary">{monthStats.total}</p>
                <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Equipos total</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
              <div>
                <p className="text-[10px] font-black text-outline uppercase tracking-[0.2em] mb-4">Top Aliados del Mes</p>
                <div className="space-y-3">
                  {monthStats.allies.slice(0, 3).map(ally => (
                    <div key={ally.name} className="p-3 bg-secondary/5 rounded-xl border border-secondary/10">
                      <div className="flex justify-between mb-1">
                        <span className="text-[10px] font-black text-on-surface uppercase">{ally.name}</span>
                        <span className="text-xs font-black text-secondary">{ally.count} u.</span>
                      </div>
                      <div className="w-full h-1 bg-white rounded-full overflow-hidden">
                        <div className="h-full bg-secondary" style={{ width: `${(ally.count / monthStats.total) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                  {monthStats.allies.length === 0 && <p className="text-[10px] text-outline italic">Sin registros</p>}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-outline uppercase tracking-[0.2em] mb-4">Inventario Mensual</p>
                <div className="grid grid-cols-2 gap-3">
                  {monthStats.models.slice(0, 4).map(model => (
                    <div key={model.name} className="p-3 bg-slate-50 border border-outline-variant/30 rounded-xl">
                      <p className="text-[9px] font-bold text-outline uppercase tracking-tighter mb-1">{model.name}</p>
                      <p className="text-lg font-black text-on-surface leading-none">{model.count}</p>
                    </div>
                  ))}
                  {monthStats.models.length === 0 && <p className="text-[10px] text-outline italic col-span-2">Sin registros</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
