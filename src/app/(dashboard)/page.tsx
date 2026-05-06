"use client";

import { TopBar } from "@/components/layout/TopBar";
import { 
  TrendingUp, 
  Monitor, 
  ShoppingCart, 
  ShieldCheck,
  Download,
  Plus,
  ArrowUpRight,
  MoreVertical
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";

const kpis = [
  {
    title: "Active Terminals",
    value: "1,248",
    change: "Stable",
    comparison: "98% uptime across all zones",
    icon: Monitor,
    color: "text-secondary",
    bgColor: "bg-secondary-container/30",
    changeColor: "text-blue-600 bg-blue-50"
  }
];

const activity = [
  {
    title: "New Terminal Activated",
    subtitle: "Central Mall, London - Store #42",
    time: "2 minutes ago",
    color: "bg-green-500",
    ringColor: "ring-green-100"
  },
  {
    title: "Bulk Payment Processed",
    subtitle: "High Street Hub - $4,200.00",
    time: "45 minutes ago",
    color: "bg-blue-500",
    ringColor: "ring-blue-100"
  },
  {
    title: "System Alert: Offline",
    subtitle: "North Station Kiosk #3",
    time: "1 hour ago",
    color: "bg-error",
    ringColor: "ring-error-container"
  },
  {
    title: "Software Update",
    subtitle: "Firmware v2.4.1 deployed",
    time: "3 hours ago",
    color: "bg-slate-300",
    ringColor: "ring-slate-100"
  }
];

export default function DashboardPage() {
  const [activeTerminals, setActiveTerminals] = useState<number>(0);
  const [modelData, setModelData] = useState<{name: string, count: number, percentage: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const tables = [
          'vatc', 'banplus', 'ccr', 'instapago', 'platco', 
          'exterior', 'bancaribe', 'tokenp', 'bactivo', 
          'poscom', 'paytech', 'bestpay', 'bancrecer'
        ];

        const results = await Promise.all(
          tables.map(table => 
            supabase.from(table).select('modelo')
          )
        );

        const modelMap: Record<string, number> = {};
        let total = 0;

        results.forEach((res) => {
          if (res.data) {
            res.data.forEach((item: any) => {
              const model = item.modelo || 'Otros';
              modelMap[model] = (modelMap[model] || 0) + 1;
              total++;
            });
          }
        });

        const sortedModels = Object.entries(modelMap)
          .map(([name, count]) => ({ 
            name, 
            count, 
            percentage: Math.round((count / total) * 100) 
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 12); // Show top 12 models in the trend chart

        setActiveTerminals(total);
        setModelData(sortedModels);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const dynamicKpis = [
    {
      ...kpis[0],
      value: loading ? "..." : activeTerminals.toLocaleString(),
      comparison: `Total gestionado en ${loading ? '...' : '13'} aliados`
    }
  ];

  return (
    <>
      <TopBar title="Panel Ejecutivo de Control" />
      
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
          {dynamicKpis.map((kpi) => (
            <div key={kpi.title} className="bg-white border border-outline-variant p-lg rounded-2xl hover:bg-surface-container-low transition-all shadow-sm group border-l-4 border-l-secondary">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-lg">
                  <div className={cn("p-4 rounded-xl transition-transform group-hover:scale-110", kpi.bgColor)}>
                    <kpi.icon className={cn("w-8 h-8", kpi.color)} />
                  </div>
                  <div>
                    <p className="text-label-lg text-on-surface-variant font-medium">{kpi.title}</p>
                    <h2 className="text-[40px] font-bold text-on-surface leading-tight">{kpi.value}</h2>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn("text-label-md font-bold px-3 py-1 rounded-full", kpi.changeColor)}>
                    {kpi.change}
                  </span>
                  <p className="text-label-md text-outline mt-2">{kpi.comparison}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Real-time Data Distribution (New Section) */}
        <DashboardCharts />

        {/* Bento Grid Content */}
        <div className="grid grid-cols-12 gap-md items-stretch">
          {/* Recent Activity Section */}
          <div className="col-span-12 lg:col-span-4 bg-white border border-outline-variant rounded-xl p-lg shadow-sm">
            <div className="flex justify-between items-center mb-lg">
              <h3 className="text-h3 text-on-surface font-bold">Actividad Reciente</h3>
              <button className="text-primary text-label-md font-semibold hover:underline">Ver Todo</button>
            </div>
            <div className="space-y-md relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container-low">
              {activity.map((item, i) => (
                <div key={i} className="relative pl-8 group cursor-pointer">
                  <div className={cn(
                    "absolute left-0 top-1 w-5 h-5 rounded-full border-4 border-white ring-1 transition-transform group-hover:scale-125",
                    item.color,
                    item.ringColor
                  )}></div>
                  <p className="text-body-md font-semibold group-hover:text-primary transition-colors">{item.title}</p>
                  <p className="text-label-md text-on-surface-variant">{item.subtitle}</p>
                  <span className="text-label-sm text-outline">{item.time}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-lg">
              <div className="bg-primary/5 rounded-xl p-md flex items-center gap-md border border-primary/10">
                <div className="h-12 w-12 rounded-lg bg-white flex items-center justify-center border border-outline-variant shrink-0 shadow-sm">
                  <ShieldCheck className="text-primary w-6 h-6" />
                </div>
                <div>
                  <p className="text-label-md font-bold text-on-surface">Estado de Seguridad</p>
                  <p className="text-label-sm text-on-surface-variant">Sincronización encriptada activa</p>
                </div>
              </div>
            </div>
          </div>

          {/* Models Comparison Bar Chart */}
          <div className="col-span-12 lg:col-span-8 bg-white border border-outline-variant rounded-xl p-lg shadow-sm">
            <div className="flex justify-between items-center mb-xl">
              <div>
                <h3 className="text-h3 text-on-surface font-bold">Distribución por Modelo</h3>
                <p className="text-body-md text-on-surface-variant">Comparativa de volumen por modelo de terminal</p>
              </div>
              <div className="flex bg-surface-container-low rounded-lg p-1">
                <button className="px-3 py-1 text-label-md bg-white rounded-md shadow-sm">Vista Barras</button>
                <button className="px-3 py-1 text-label-md text-on-surface-variant">Tabla</button>
              </div>
            </div>
            
            <div className="h-64 relative rounded-xl bg-surface-container-low/30 border border-outline-variant/50 mt-4">
              <div className="absolute bottom-0 left-0 right-0 top-10 flex items-end justify-between px-6 pb-2 gap-2">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center text-outline animate-pulse">
                    Cargando modelos...
                  </div>
                ) : (
                  modelData.map((model, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "flex-1 rounded-t-sm transition-all hover:opacity-80 group relative min-w-[20px]",
                        i === 0 ? "bg-primary" : i === 1 ? "bg-secondary" : i === 2 ? "bg-tertiary" : "bg-primary-container"
                      )}
                      style={{ height: `${(model.count / modelData[0].count) * 100}%` }}
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-lg pointer-events-none">
                        <p className="font-bold">{model.name}</p>
                        <p>{model.count.toLocaleString()} unidades</p>
                      </div>
                      {/* Direct Label on top of bar */}
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-primary whitespace-nowrap">
                        {model.count}
                      </div>
                      {/* Model Name at the foot of the bar */}
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-on-surface-variant whitespace-nowrap rotate-45 origin-left">
                        {model.name}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Space for the rotated labels */}
            <div className="h-16"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mt-xl pt-lg border-t border-outline-variant">
              <div className="hover:bg-surface-container-low p-2 rounded-lg transition-colors">
                <p className="text-[10px] text-outline uppercase tracking-wider mb-1 font-bold">Modelo Líder</p>
                <p className="text-h3 text-primary">{modelData[0]?.name || '...'}</p>
              </div>
              <div className="hover:bg-surface-container-low p-2 rounded-lg transition-colors">
                <p className="text-[10px] text-outline uppercase tracking-wider mb-1 font-bold">Variedad de Hardware</p>
                <p className="text-h3 text-secondary">{modelData.length} modelos</p>
              </div>
              <div className="hover:bg-surface-container-low p-2 rounded-lg transition-colors">
                <p className="text-[10px] text-outline uppercase tracking-wider mb-1 font-bold">Disponibilidad</p>
                <p className="text-h3 text-tertiary">Global</p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
        <button className="fixed bottom-margin right-margin w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50">
          <Plus className="w-6 h-6" />
        </button>
      </main>
    </>
  );
}
