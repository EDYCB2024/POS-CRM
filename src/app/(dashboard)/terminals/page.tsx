'use client'

import { TopBar } from "@/components/layout/TopBar";

import { 
  Monitor, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Filter, 
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  MapPin,
  RefreshCw,
  Zap,
  Store
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useState } from 'react';
import { FilterDropdown } from "@/components/ui/FilterDropdown";
import { ShieldCheck, ShieldX } from 'lucide-react';


const stats = [
  { label: "Total Terminals", value: "142", change: "+12%", color: "bg-secondary-container", icon: Monitor, iconColor: "text-on-secondary-container" },
  { label: "Active Online", value: "138", change: "Stable", color: "bg-green-100", icon: CheckCircle, iconColor: "text-green-700" },
  { label: "Offline Alerts", value: "4", change: "Critical", color: "bg-red-100", icon: AlertCircle, iconColor: "text-red-700" },
];

const terminals = [
  { id: "TRM-9921", version: "V3.2.1 Stable", location: "Main Street Plaza - Store 4", status: "Online", lastSync: "2 mins ago", warranty: "si" },
  { id: "TRM-8440", version: "V3.2.1 Stable", location: "Grand Central Terminal - Kiosk B", status: "Online", lastSync: "Just now", warranty: "si" },
  { id: "TRM-7102", version: "V3.1.9 Legacy", location: "Airport West - Gate 12", status: "Offline", lastSync: "42 mins ago", warranty: "no" },
  { id: "TRM-2239", version: "V3.2.1 Stable", location: "Downtown Hub - Entrance", status: "Online", lastSync: "15 mins ago", warranty: "si" },
  { id: "TRM-5501", version: "V3.2.1 Stable", location: "Eastside Market - Aisle 3", status: "Maintenance", lastSync: "2 hours ago", warranty: "no" },
];

export default function TerminalsPage() {
  const [warrantyFilter, setWarrantyFilter] = useState<string>('');

  return (
    <>
      <TopBar title="Terminal Management" />
      
      <section className="p-margin">
        <div className="mb-xl flex justify-between items-end">
          <div>
            <h1 className="mb-xs">Terminal Management</h1>
            <p className="text-body-md text-on-surface-variant">Monitor and manage all active POS terminals across locations.</p>
          </div>
          <button className="flex items-center gap-sm bg-primary text-on-primary px-lg py-md rounded-xl font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all">
            <Plus className="w-5 h-5" />
            Add New Terminal
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-lg rounded-xl border border-outline-variant">
              <div className="flex justify-between items-start mb-md">
                <div className={cn("p-2 rounded-lg", stat.color)}>
                  <stat.icon className={cn("w-5 h-5", stat.iconColor)} />
                </div>
                <span className="text-label-sm font-bold uppercase tracking-wider text-primary">{stat.change}</span>
              </div>
              <p className="text-label-md text-on-surface-variant mb-xs">{stat.label}</p>
              <h3 className="text-h1">{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Terminal Table */}
        <div className="bg-white rounded-xl border border-outline-variant overflow-hidden">
          <div className="px-lg py-md border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
            <div className="flex gap-md items-center">
              <FilterDropdown 
                label="Garantía"
                currentValue={warrantyFilter}
                onSelect={setWarrantyFilter}
                options={[
                  { label: "Si", value: "si", icon: ShieldCheck },
                  { label: "No", value: "no", icon: ShieldX }
                ]}
              />
              <button className="px-md py-sm bg-white border border-outline-variant rounded-lg text-label-md flex items-center gap-xs hover:bg-surface-container transition-colors font-bold uppercase tracking-wider text-[10px]">
                <Filter className="w-4 h-4" />
                Otros Filtros
              </button>
              <button className="px-md py-sm bg-white border border-outline-variant rounded-lg text-label-md flex items-center gap-xs hover:bg-surface-container transition-colors font-bold uppercase tracking-wider text-[10px]">
                <ArrowUpDown className="w-4 h-4" />
                Sort
              </button>
            </div>
            <div className="flex items-center gap-sm">
              <p className="text-label-sm text-on-surface-variant">Showing 1-20 of 142</p>
              <div className="flex border border-outline-variant rounded-lg overflow-hidden">
                <button className="p-1 bg-white hover:bg-surface-container border-r border-outline-variant">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-1 bg-white hover:bg-surface-container">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="px-lg py-md text-label-md text-on-surface-variant">Terminal ID</th>
                <th className="px-lg py-md text-label-md text-on-surface-variant">Location</th>
                <th className="px-lg py-md text-label-md text-on-surface-variant">Status</th>
                <th className="px-lg py-md text-label-md text-on-surface-variant">Garantía</th>
                <th className="px-lg py-md text-label-md text-on-surface-variant">Last Sync</th>
                <th className="px-lg py-md text-label-md text-on-surface-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {terminals.map((terminal) => (
                <tr key={terminal.id} className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="px-lg py-md">
                    <p className="font-semibold text-primary">{terminal.id}</p>
                    <p className="text-xs text-on-surface-variant">{terminal.version}</p>
                  </td>
                  <td className="px-lg py-md">
                    <div className="flex items-center gap-sm">
                      <MapPin className="text-outline w-4 h-4" />
                      <span className="text-body-md">{terminal.location}</span>
                    </div>
                  </td>
                  <td className="px-lg py-md">
                    <div className={cn(
                      "inline-flex items-center px-sm py-xs rounded-full text-label-sm font-bold border",
                      terminal.status === 'Online' && "bg-green-50 text-green-700 border-green-200",
                      terminal.status === 'Offline' && "bg-red-50 text-red-700 border-red-200",
                      terminal.status === 'Maintenance' && "bg-slate-100 text-slate-600 border-slate-200"
                    )}>
                      <span className={cn(
                        "w-2 h-2 rounded-full mr-2",
                        terminal.status === 'Online' && "bg-green-500",
                        terminal.status === 'Offline' && "bg-red-500 animate-pulse",
                        terminal.status === 'Maintenance' && "bg-slate-400"
                      )}></span>
                      {terminal.status}
                    </div>
                  </td>
                  <td className="px-lg py-md">
                    {terminal.warranty === 'si' ? (
                      <span className="flex items-center gap-1 text-[10px] font-black text-green-600 uppercase tracking-tight">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Vigente
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-black text-red-500 uppercase tracking-tight opacity-60">
                        <ShieldX className="w-3.5 h-3.5" />
                        Vencida
                      </span>
                    )}
                  </td>
                  <td className={cn(
                    "px-lg py-md text-body-md",
                    terminal.status === 'Offline' && "text-error font-medium"
                  )}>{terminal.lastSync}</td>
                  <td className="px-lg py-md text-right">
                    <button className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
