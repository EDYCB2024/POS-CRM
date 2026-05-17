"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Monitor, Users, ChevronRight, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

interface StatItem {
  name: string;
  count: number;
  percentage?: number;
  color?: string;
}

const COLORS = [
  'bg-primary',
  'bg-secondary',
  'bg-tertiary',
  'bg-blue-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-teal-500',
  'bg-pink-500',
];

export function DashboardCharts() {
  const [modelStats, setModelStats] = useState<StatItem[]>([]);
  const [allyStats, setAllyStats] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch active allies from allies_config table dynamically
        const { data: configData, error: configError } = await supabase
          .from('allies_config')
          .select('table_name')
          .eq('is_active', true);

        if (configError) throw configError;

        const tables = configData ? configData.map(c => c.table_name) : [];

        // Fetch counts for models and allies across all tables
        const modelMap: Record<string, number> = {};
        const allyMap: Record<string, number> = {};

        const results = await Promise.all(
          tables.map(table => 
            supabase.from(table).select('modelo, aliado')
          )
        );

        results.forEach((res, index) => {
          if (res.data) {
            res.data.forEach((item: any) => {
              const model = item.modelo || 'Unknown';
              const ally = item.aliado || (tables[index] ? tables[index].toUpperCase() : 'DESCONOCIDO');
              
              modelMap[model] = (modelMap[model] || 0) + 1;
              allyMap[ally] = (allyMap[ally] || 0) + 1;
            });
          }
        });

        // Process Model Stats
        const sortedModels = Object.entries(modelMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);
        
        const totalModels = sortedModels.reduce((acc, curr) => acc + curr.count, 0);
        const topModels = sortedModels.slice(0, 5).map((item, i) => ({
          ...item,
          percentage: Math.round((item.count / totalModels) * 100),
          color: COLORS[i % COLORS.length]
        }));

        if (sortedModels.length > 5) {
          const otherCount = sortedModels.slice(5).reduce((acc, curr) => acc + curr.count, 0);
          topModels.push({
            name: 'Otros',
            count: otherCount,
            percentage: Math.round((otherCount / totalModels) * 100),
            color: 'bg-slate-300'
          });
        }

        // Process Ally Stats
        const sortedAllies = Object.entries(allyMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8);
        
        const totalAllies = Object.values(allyMap).reduce((acc, curr) => acc + curr, 0);
        const processedAllies = sortedAllies.map((item, i) => ({
          ...item,
          percentage: Math.round((item.count / totalAllies) * 100),
          color: COLORS[i % COLORS.length]
        }));

        setModelStats(topModels);
        setAllyStats(processedAllies);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-md animate-pulse">
        <div className="h-80 bg-white border border-outline-variant rounded-xl"></div>
        <div className="h-80 bg-white border border-outline-variant rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
      {/* Models Chart Card */}
      <div className="bg-white border border-outline-variant rounded-2xl p-lg shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center mb-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Monitor className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-h3 text-on-surface">Distribución por Modelo</h3>
            </div>
            <p className="text-body-md text-on-surface-variant">Top modelos de terminales activos</p>
          </div>
          <button className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
            <PieChartIcon className="w-5 h-5 text-outline" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-xl">
          {/* Donut Chart Visualization */}
          <div className="relative w-48 h-48 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {modelStats.reduce((acc, item, i) => {
                const start = acc.offset;
                const slice = item.percentage || 0;
                acc.offset += slice;
                
                // SVG Circle Dash Array calculation
                // Perimeter = 2 * PI * R (R=40) => ~251.3
                const dashArray = `${(slice * 251.3) / 100} 251.3`;
                const dashOffset = `-${(start * 251.3) / 100}`;
                
                return {
                  offset: acc.offset,
                  elements: [
                    ...acc.elements,
                    <circle
                      key={item.name}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke={item.color?.replace('bg-', 'var(--') || 'currentColor'}
                      strokeWidth="12"
                      strokeDasharray={dashArray}
                      strokeDashoffset={dashOffset}
                      className={cn("transition-all duration-1000", item.color)}
                      style={{ 
                        stroke: i === 0 ? 'var(--color-primary)' : 
                                i === 1 ? 'var(--color-secondary)' : 
                                i === 2 ? 'var(--color-tertiary)' : 
                                i === 3 ? '#3b82f6' : 
                                i === 4 ? '#a855f7' : '#cbd5e1'
                      }}
                    />
                  ]
                };
              }, { offset: 0, elements: [] as React.ReactNode[] }).elements}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-h1 font-bold text-on-surface">{modelStats[0]?.percentage}%</span>
              <span className="text-[10px] uppercase tracking-tighter text-outline">{modelStats[0]?.name}</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 w-full space-y-3">
            {modelStats.map((item) => (
              <div key={item.name} className="flex items-center justify-between group cursor-default">
                <div className="flex items-center gap-3">
                  <div className={cn("w-3 h-3 rounded-full shrink-0", item.color)}></div>
                  <span className="text-label-md text-on-surface font-medium group-hover:text-primary transition-colors">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-label-sm text-outline">{item.count.toLocaleString()}</span>
                  <span className="text-label-md font-bold text-on-surface w-10 text-right">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Allies Chart Card */}
      <div className="bg-white border border-outline-variant rounded-2xl p-lg shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center mb-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-secondary/10 rounded-lg">
                <Users className="w-4 h-4 text-secondary" />
              </div>
              <h3 className="text-h3 text-on-surface font-bold">Presencia por Aliado</h3>
            </div>
            <p className="text-body-md text-on-surface-variant">Distribución de terminales por socio</p>
          </div>
          <button className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
            <BarChart3 className="w-5 h-5 text-outline" />
          </button>
        </div>

        <div className="space-y-5">
          {allyStats.map((item) => (
            <div key={item.name} className="space-y-1.5">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                  <span className="text-label-md font-bold text-on-surface">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 text-label-sm">
                  <span className="text-outline font-medium">{item.count.toLocaleString()} terminales</span>
                  <span className="text-on-surface-variant font-bold">{item.percentage}%</span>
                </div>
              </div>
              <div className="h-3.5 w-full bg-surface-container rounded-full overflow-hidden flex relative group/bar">
                <div 
                  className={cn("h-full rounded-full transition-all duration-1000 ease-out", item.color)} 
                  style={{ width: `${item.percentage}%` }}
                >
                  {item.percentage !== undefined && item.percentage > 15 && (
                    <span className="absolute inset-y-0 left-2 flex items-center text-[8px] font-bold text-white uppercase tracking-tighter">
                      {item.percentage}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          <button className="w-full mt-2 py-2 flex items-center justify-center gap-2 text-label-md text-primary font-semibold hover:bg-primary/5 rounded-lg transition-colors border border-dashed border-primary/20">
            Ver desglose completo de aliados
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
