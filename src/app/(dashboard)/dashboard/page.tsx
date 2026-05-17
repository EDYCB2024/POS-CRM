"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { supabase } from "@/lib/supabase";
import {
  Smartphone,
  Calendar,
  TrendingUp,
  Activity,
  Award,
  Users,
  BarChart3,
  Loader2,
  CalendarDays,
  ArrowRight,
  Flame,
  Search,
  LayoutGrid,
  FileText,
  RotateCw
} from 'lucide-react';
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-indexed
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const months = [
    { value: 1, name: "Enero" },
    { value: 2, name: "Febrero" },
    { value: 3, name: "Marzo" },
    { value: 4, name: "Abril" },
    { value: 5, name: "Mayo" },
    { value: 6, name: "Junio" },
    { value: 7, name: "Julio" },
    { value: 8, name: "Agosto" },
    { value: 9, name: "Septiembre" },
    { value: 10, name: "Octubre" },
    { value: 11, name: "Noviembre" },
    { value: 12, name: "Diciembre" }
  ];

  const years = [2024, 2025, 2026, 2027];

  // Helper to get days in selected month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);

  // Reusable fetching function
  const fetchStats = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      // 1. Fetch daily stats from our optimized RPC function
      const { data: dailyRes, error: dailyErr } = await supabase.rpc('get_dashboard_stats', {
        p_year: selectedYear,
        p_month: selectedMonth
      });

      if (dailyErr) throw dailyErr;
      setDailyData(dailyRes || []);

      // 2. Fetch yearly stats from our optimized RPC function
      const { data: yearlyRes, error: yearlyErr } = await supabase.rpc('get_yearly_dashboard_stats', {
        p_year: selectedYear
      });

      if (yearlyErr) throw yearlyErr;
      setYearlyData(yearlyRes || []);

    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedYear, selectedMonth]);

  // Daily Chart calculations
  const dailyTimeline = Array.from({ length: daysInMonth }, (_, index) => {
    const dayNum = index + 1;
    const formattedDay = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

    // Filter all active records for this day
    const records = dailyData.filter(d => d.day_str === formattedDay);
    const total = records.reduce((sum, r) => sum + (r.count || 0), 0);
    const breakdown = records.map(r => ({ ally: r.ally_name, count: r.count }));

    return {
      day: dayNum,
      total,
      breakdown
    };
  });

  const maxDailyCount = Math.max(...dailyTimeline.map(d => d.total), 1);

  // Month summary calculations
  const totalMonthRegistrations = dailyTimeline.reduce((sum, d) => sum + d.total, 0);

  // YTD (Year-to-date) calculations
  const totalYtdRegistrations = yearlyData.reduce((sum, m) => sum + (m.count || 0), 0);

  // Active Ally ranking calculations
  const alliesStatsMap: Record<string, number> = {};
  dailyData.forEach(d => {
    alliesStatsMap[d.ally_name] = (alliesStatsMap[d.ally_name] || 0) + (d.count || 0);
  });

  const rankedAllies = Object.entries(alliesStatsMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const topAlly = rankedAllies[0] || { name: "Sin Registros", count: 0 };

  // Daily peak calculations
  const peakDayRecord = [...dailyTimeline].sort((a, b) => b.total - a.total)[0] || { day: 1, total: 0 };

  // Yearly monthly trends mapped dynamically
  const yearlyMonthlyTimeline = Array.from({ length: 12 }, (_, index) => {
    const monthNum = index + 1;
    const monthStr = String(monthNum).padStart(2, '0');
    const records = yearlyData.filter(m => m.month_str === monthStr);
    const total = records.reduce((sum, r) => sum + (r.count || 0), 0);
    return {
      monthName: months[index].name.substring(0, 3),
      total
    };
  });

  const maxYearlyMonthCount = Math.max(...yearlyMonthlyTimeline.map(m => m.total), 1);

  return (
    <>
      <TopBar title="Dashboard - POS CRM" />

      <main className="p-margin space-y-lg max-w-[1440px] mx-auto w-full min-h-[calc(100vh-100px)]">
        {/* Top Header Action Row */}
        <div className="flex justify-between items-center pb-2">
          <div>
            <span className="text-[10px] font-black uppercase text-outline tracking-widest bg-slate-50 border border-outline-variant px-3 py-1 rounded-full">
              MONITOR GENERAL DE RED
            </span>
          </div>
          
          {/* Premium ACTUALIZAR Button positioned ABOVE the card */}
          <button
            onClick={() => fetchStats(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-primary/10 border border-outline-variant hover:border-primary/30 rounded-2xl transition-all duration-300 group cursor-pointer text-primary active:scale-95 shadow-md font-extrabold text-[11px] uppercase tracking-wider"
            title="Actualizar Datos"
          >
            <RotateCw className="w-4 h-4 text-primary group-hover:rotate-180 transition-transform duration-500" />
            Actualizar
          </button>
        </div>

        {/* Sleek Interactive Header Filter Row */}
        <section className="bg-white border border-outline-variant p-6 rounded-[32px] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase text-primary tracking-widest bg-primary/5 px-3 py-1 rounded-full">
              Analítica en Tiempo Real
            </span>
            <h2 className="text-2xl font-black text-on-surface tracking-tight mt-2">
              Rendimiento y Diagnóstico Global
            </h2>
            <p className="text-xs text-on-surface-variant leading-relaxed mt-1">
              Filtra las estadísticas por mes y año para revisar la tasa de ingresos y fallas reportadas.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            {/* Year Selector */}
            <div className="flex items-center gap-2 bg-slate-50 border border-outline-variant rounded-2xl px-3 py-1.5">
              <CalendarDays className="w-4 h-4 text-outline" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="bg-transparent text-xs font-black text-primary outline-none cursor-pointer"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Month Selector */}
            <div className="flex items-center gap-2 bg-slate-50 border border-outline-variant rounded-2xl px-3 py-1.5">
              <Calendar className="w-4 h-4 text-outline" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="bg-transparent text-xs font-black text-primary outline-none cursor-pointer"
              >
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Premium Reset Button */}
            <button
              onClick={() => {
                setSelectedYear(new Date().getFullYear());
                setSelectedMonth(new Date().getMonth() + 1);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-red-50 border border-outline-variant hover:border-red-200 rounded-2xl transition-all duration-300 group cursor-pointer text-outline hover:text-red-600 active:scale-95 shadow-sm font-black text-[11px] uppercase tracking-wider"
              title="Restablecer Filtros"
            >
              Reset
            </button>
          </div>
        </section>

        {/* Dashboard loading overlay */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white border border-outline-variant rounded-[40px] shadow-sm">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-[10px] font-black text-outline uppercase tracking-widest">
              Compilando estadísticas de aliados...
            </p>
          </div>
        ) : (
          <>
            {/* Dashboard Quick Action Grid & YTD KPI Card */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-lg">
              {/* Year to Date (YTD) - Lo que va de año - Glassmorphism style card */}
              <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-container to-primary-container p-6 rounded-[32px] shadow-xl text-white flex flex-col justify-between min-h-[180px] lg:col-span-2 group">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-all duration-700" />

                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <span className="text-[9px] font-black uppercase text-on-primary-container/80 tracking-widest bg-white/15 px-3 py-1 rounded-full">
                      LO QUE VA DE AÑO ({selectedYear})
                    </span>
                    <h3 className="text-3xl font-black tracking-tighter mt-4 leading-none">
                      {totalYtdRegistrations.toLocaleString()} Equipos
                    </h3>
                  </div>
                  <div className="p-3 bg-white/10 border border-white/20 rounded-2xl">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between">
                  <p className="text-[10px] font-bold text-on-primary-container/90 leading-snug">
                    Total general de terminales registrados o ingresados en todos los aliados a lo largo de este año.
                  </p>
                  <Link
                    href="/terminals"
                    className="p-2 bg-white/20 hover:bg-white text-white hover:text-primary rounded-xl transition-all active:scale-95 flex items-center justify-center cursor-pointer shadow-md"
                    title="Monitorear Todos"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Month registrations card */}
              <div className="bg-white border border-outline-variant p-6 rounded-[32px] shadow-sm flex flex-col justify-between min-h-[180px] relative overflow-hidden group">
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-secondary/5 rounded-full blur-2xl group-hover:scale-125 transition-all duration-500" />
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <span className="text-[9px] font-black uppercase text-outline tracking-widest bg-slate-50 border border-outline-variant/30 px-3 py-1 rounded-full">
                      TOTAL DEL MES
                    </span>
                    <h3 className="text-2xl font-black text-on-surface tracking-tighter mt-4 leading-none">
                      {totalMonthRegistrations.toLocaleString()} Equipos
                    </h3>
                  </div>
                  <div className="p-3 bg-secondary/5 border border-outline-variant/30 rounded-2xl">
                    <Smartphone className="w-5 h-5 text-secondary" />
                  </div>
                </div>

                <div className="text-[10px] font-bold text-on-surface-variant leading-relaxed relative z-10 pt-4 border-t border-outline-variant/20">
                  <span className="text-green-600 font-extrabold">Promedio diario:</span> ~{Math.round(totalMonthRegistrations / daysInMonth)} equipos ingresados al taller por día.
                </div>
              </div>

              {/* Top Leader Ally of the month */}
              <div className="bg-white border border-outline-variant p-6 rounded-[32px] shadow-sm flex flex-col justify-between min-h-[180px] relative overflow-hidden group">
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:scale-125 transition-all duration-500" />
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <span className="text-[9px] font-black uppercase text-amber-700 tracking-widest bg-amber-50 border border-amber-200/50 px-3 py-1 rounded-full">
                      ALIADO LÍDER
                    </span>
                    <h3 className="text-2xl font-black text-on-surface tracking-tighter mt-4 leading-none truncate max-w-[200px]">
                      {topAlly.name}
                    </h3>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200/50 rounded-2xl">
                    <Award className="w-5 h-5 text-amber-600 animate-pulse" />
                  </div>
                </div>

                <div className="text-[10px] font-bold text-on-surface-variant leading-relaxed relative z-10 pt-4 border-t border-outline-variant/20 flex items-center justify-between">
                  <span>Volumen en el mes:</span>
                  <strong className="text-amber-700 font-black">{topAlly.count.toLocaleString()} Equipos</strong>
                </div>
              </div>
            </div>

            {/* Daily Timeline Statistics Section */}
            <section className="bg-white border border-outline-variant p-6 rounded-[40px] shadow-sm relative">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-on-surface tracking-tight">
                      Línea de Tiempo Diaria
                    </h3>
                    <p className="text-[10px] font-black uppercase text-outline tracking-wider">
                      Frecuencia diaria de ingresos para el mes de {months[selectedMonth - 1].name} {selectedYear}
                    </p>
                  </div>
                </div>

                {/* Peak volume marker */}
                {peakDayRecord.total > 0 && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                    <Flame className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                    <span className="text-[9px] font-black text-red-700 uppercase tracking-widest">
                      Día Pico: {peakDayRecord.day} ({peakDayRecord.total} eq)
                    </span>
                  </div>
                )}
              </div>

              {/* Dynamic SVG / HTML daily interactive chart */}
              <div className="relative h-64 w-full flex items-end justify-between gap-1.5 px-2 md:px-4 pt-10 border-b border-outline-variant pb-2">
                {dailyTimeline.map((d) => {
                  const barHeightPercent = (d.total / maxDailyCount) * 90; // max height is 90%
                  const isHovered = hoveredDay === d.day;

                  return (
                    <div
                      key={`daily-bar-${d.day}`}
                      className="flex-1 flex flex-col items-center group relative cursor-pointer"
                      onMouseEnter={() => setHoveredDay(d.day)}
                      onMouseLeave={() => setHoveredDay(null)}
                    >
                      {/* Bar indicator */}
                      <div
                        style={{ height: d.total > 0 ? `${barHeightPercent}%` : '4px' }}
                        className={cn(
                          "w-full rounded-t-full transition-all duration-300",
                          d.total > 0
                            ? isHovered
                              ? "bg-primary shadow-lg shadow-primary/30"
                              : "bg-gradient-to-t from-primary/80 to-primary-container/90 group-hover:from-primary group-hover:to-primary-container"
                            : "bg-slate-200 group-hover:bg-slate-300"
                        )}
                      />

                      {/* Floating Tooltip */}
                      {isHovered && d.total > 0 && (
                        <div className="absolute bottom-full mb-3 z-30 bg-on-surface/95 backdrop-blur-md rounded-2xl border border-outline-variant/20 shadow-2xl p-4 text-left w-56 text-white animate-in fade-in slide-in-from-bottom-2 duration-150">
                          <div className="flex justify-between items-center border-b border-white/10 pb-1.5 mb-2">
                            <span className="text-[10px] font-black uppercase text-outline-variant tracking-wider">
                              {d.day} de {months[selectedMonth - 1].name}
                            </span>
                            <span className="text-[10px] font-black bg-primary px-2 py-0.5 rounded-full">
                              {d.total} eq
                            </span>
                          </div>

                          <p className="text-[9px] font-black text-outline-variant uppercase tracking-widest mb-1.5">
                            Desglose por Aliado:
                          </p>

                          <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                            {d.breakdown.map((item, idx) => (
                              <div key={`${item.ally}-${idx}`} className="flex justify-between text-xs font-bold text-white/90">
                                <span className="truncate max-w-[120px]">{item.ally}</span>
                                <span>{item.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Day Label on X Axis */}
                      <span className={cn(
                        "text-[9px] font-black mt-2 transition-all",
                        isHovered ? "text-primary scale-125" : "text-outline"
                      )}>
                        {/* Only display all days on large screen, or every 5 days on mobile to avoid clutter */}
                        <span className="hidden md:inline">{d.day}</span>
                        <span className="md:hidden">{d.day % 5 === 0 || d.day === 1 || d.day === daysInMonth ? d.day : '.'}</span>
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Daily Timeline Legend */}
              <div className="flex items-center justify-between mt-4 text-[10px] font-bold text-outline uppercase tracking-wider">
                <span>Día 1</span>
                <span className="text-center">Línea temporal diaria de equipos recibidos en el taller</span>
                <span>Día {daysInMonth}</span>
              </div>
            </section>

            {/* Split layout for Ranked Allies and Yearly Monthly seasonality */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">

              {/* Allies month ranking */}
              <section className="bg-white border border-outline-variant p-6 rounded-[40px] shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-on-surface tracking-tight">
                        Volumen por Aliado
                      </h3>
                      <p className="text-[10px] font-black uppercase text-outline tracking-wider">
                        Rendimiento y distribución del mes seleccionado
                      </p>
                    </div>
                  </div>

                  {rankedAllies.length === 0 ? (
                    <div className="text-center py-12 text-outline text-xs font-bold">
                      No se encontraron registros de ningún aliado en este período.
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[360px] overflow-y-auto custom-scrollbar pr-2">
                      {rankedAllies.map((ally, idx) => {
                        const percentShare = ((ally.count / totalMonthRegistrations) * 100).toFixed(1);
                        return (
                          <div key={`ally-rank-${ally.name}`} className="space-y-1">
                            <div className="flex justify-between items-center text-xs font-bold text-on-surface">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black bg-slate-100 text-outline w-5 h-5 rounded-full flex items-center justify-center">
                                  {idx + 1}
                                </span>
                                <span className="uppercase">{ally.name}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span>{ally.count} eq</span>
                                <span className="text-outline text-[10px] font-semibold">({percentShare}%)</span>
                              </div>
                            </div>
                            {/* Sleek horizontal progress bar */}
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${percentShare}%` }}
                                className="h-full bg-secondary rounded-full"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>

              {/* Monthly seasonality for the selected year */}
              <section className="bg-white border border-outline-variant p-6 rounded-[40px] shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-tertiary/10 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-tertiary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-on-surface tracking-tight">
                        Distribución Mensual del Año
                      </h3>
                      <p className="text-[10px] font-black uppercase text-outline tracking-wider">
                        Tasa estacional registrada en {selectedYear}
                      </p>
                    </div>
                  </div>

                  {/* Monthly bar chart */}
                  <div className="relative h-44 w-full flex items-end justify-between gap-3 pt-6 border-b border-outline-variant pb-2">
                    {yearlyMonthlyTimeline.map((m, idx) => {
                      const barHeightPercent = (m.total / maxYearlyMonthCount) * 85;
                      const isCurrentSelectedMonth = selectedMonth === (idx + 1);

                      return (
                        <div
                          key={`yearly-month-bar-${idx}`}
                          className="flex-1 flex flex-col items-center group relative cursor-pointer"
                          onClick={() => setSelectedMonth(idx + 1)}
                        >
                          <div
                            style={{ height: m.total > 0 ? `${barHeightPercent}%` : '4px' }}
                            className={cn(
                              "w-full rounded-t-lg transition-all duration-300",
                              m.total > 0
                                ? isCurrentSelectedMonth
                                  ? "bg-tertiary shadow-md shadow-tertiary/20"
                                  : "bg-tertiary/60 group-hover:bg-tertiary"
                                : "bg-slate-100 group-hover:bg-slate-200"
                            )}
                          />

                          {/* Quick popover count on hover */}
                          {m.total > 0 && (
                            <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-on-surface text-white text-[9px] font-black px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap">
                              {m.total} eq
                            </div>
                          )}

                          <span className={cn(
                            "text-[9px] font-black mt-2",
                            isCurrentSelectedMonth ? "text-tertiary" : "text-outline"
                          )}>
                            {m.monthName}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-center mt-4">
                    <p className="text-[9px] font-black text-outline uppercase tracking-wider text-center">
                      Haz clic en cualquier mes para actualizar y ver su línea temporal diaria al detalle.
                    </p>
                  </div>
                </div>
              </section>

            </div>

            {/* Quick navigations for primary directories */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-lg pt-4">
              <Link
                href="/terminals"
                className="group p-6 bg-white border border-outline-variant rounded-[32px] hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-primary/5 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <Search className="w-6 h-6 text-primary group-hover:text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-on-surface uppercase text-xs tracking-wider">General de Terminales</h4>
                    <p className="text-[10px] text-on-surface-variant leading-normal mt-1">
                      Búsqueda global por serial y control de expedientes de aliados.
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href="/inventory"
                className="group p-6 bg-white border border-outline-variant rounded-[32px] hover:shadow-2xl hover:shadow-secondary/5 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-secondary/5 group-hover:bg-secondary group-hover:text-white transition-all duration-300">
                    <LayoutGrid className="w-6 h-6 text-secondary group-hover:text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-on-surface uppercase text-xs tracking-wider">Control de Inventario</h4>
                    <p className="text-[10px] text-on-surface-variant leading-normal mt-1">
                      Revisión de stock, repuestos disponibles y modelos centrales.
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href="/datacenter/clientes"
                className="group p-6 bg-white border border-outline-variant rounded-[32px] hover:shadow-2xl hover:shadow-tertiary/5 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-tertiary/5 group-hover:bg-tertiary group-hover:text-white transition-all duration-300">
                    <FileText className="w-6 h-6 text-tertiary group-hover:text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-on-surface uppercase text-xs tracking-wider">Data Center Maestro</h4>
                    <p className="text-[10px] text-on-surface-variant leading-normal mt-1">
                      Bases de datos de clientes, procesadoras y configuraciones.
                    </p>
                  </div>
                </div>
              </Link>
            </section>
          </>
        )}
      </main>
    </>
  );
}
