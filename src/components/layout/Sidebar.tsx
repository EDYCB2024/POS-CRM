'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Monitor, 
  BarChart3, 
  Database,
  Settings, 
  HelpCircle, 
  ChevronDown, 
  Users, 
  Building2,
  Package,
  Boxes,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { useSidebar } from '@/context/SidebarContext'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Terminals', href: '/terminals', icon: Monitor },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
]

const aliados = [
  'VATC', 'PLATCO', 'PLATCO POS', 'BANPLUS', 'CCR', 'INSTAPAGO', 'POS COMERCIAL',
  'EXTERIOR', 'BANCARIBE', 'TOKEN PAGOS', 'BANCO ACTIVO',
  'DEL SUR', 'PAYTECH'
]

const dataCenter = [
  { name: 'BD Clientes', href: '/datacenter/clientes', icon: Users },
  { name: 'BD PLATCO', href: '/datacenter/platco', icon: Building2 },
]

const otros = [
  'BANCRECER', 'BESTPAY'
]

const secondaryNavigation = [
  { name: 'Support', href: '/support', icon: HelpCircle },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isOpen, toggle } = useSidebar()
  const [isAliadosOpen, setIsAliadosOpen] = useState(true)
  const [isDataCenterOpen, setIsDataCenterOpen] = useState(false)
  const [isOtrosOpen, setIsOtrosOpen] = useState(false)

  return (
    <div 
      className={cn(
        "fixed left-0 top-0 h-screen z-50 transition-all duration-300 ease-in-out flex",
        isOpen ? "translate-x-0" : "-translate-x-80"
      )}
    >
      {/* Sidebar Content Container */}
      <aside className="w-80 h-full bg-surface-container-lowest border-r border-outline-variant flex flex-col p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-outline-variant scrollbar-track-transparent relative shadow-2xl shadow-black/5">
        {/* Logo Section */}
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Monitor className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 className="text-h3 font-black tracking-tighter text-primary uppercase leading-tight">POS CRM</h2>
            <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Management v1.0</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <div className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-[0.2em] px-4 mb-2">Main Menu</div>
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group",
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-secondary hover:text-on-surface hover:bg-white border border-transparent hover:border-outline-variant/30"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-primary/70 group-hover:text-primary")} />
                <span>{item.name}</span>
              </Link>
            )
          })}

          {/* Aliados Section */}
          <div className="pt-4 mt-2">
            <div className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-[0.2em] px-4 mb-2">Network</div>
            <button
              onClick={() => setIsAliadosOpen(!isAliadosOpen)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all group",
                isAliadosOpen
                  ? "bg-secondary-container/30 text-primary border border-primary/10"
                  : "text-secondary hover:text-on-surface hover:bg-white border border-transparent hover:border-outline-variant/30"
              )}
            >
              <div className="flex items-center gap-3">
                <Users className={cn("w-5 h-5", isAliadosOpen ? "text-primary" : "text-primary/70 group-hover:text-primary")} />
                <span>Aliados</span>
              </div>
              <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", isAliadosOpen ? "rotate-180" : "")} />
            </button>

            {isAliadosOpen && (
              <div className="mt-1 space-y-0.5 pl-4 animate-in slide-in-from-top-2 duration-300">
                {aliados.map((aliado) => (
                  <Link
                    key={aliado}
                    href={`/aliados/${aliado.toLowerCase().replace(/\s+/g, '-')}`}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-secondary hover:text-primary hover:bg-primary/5 transition-all rounded-lg"
                  >
                    <Building2 className="w-3.5 h-3.5 text-on-surface-variant/40" />
                    <span>{aliado}</span>
                  </Link>
                ))}

                {/* Sub-sección Otros nidificada */}
                <div className="pt-2">
                  <button
                    onClick={() => setIsOtrosOpen(!isOtrosOpen)}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm text-secondary hover:text-primary transition-all rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Boxes className="w-3.5 h-3.5 text-on-surface-variant/40" />
                      <span className="font-semibold uppercase text-[10px] tracking-wider">Otros</span>
                    </div>
                    <ChevronRight className={cn("w-3 h-3 transition-transform duration-300", isOtrosOpen ? "rotate-90" : "")} />
                  </button>

                  {isOtrosOpen && (
                    <div className="mt-1 space-y-0.5 pl-4 animate-in slide-in-from-left-2 duration-300 border-l border-outline-variant/30 ml-2">
                      {otros.map((item) => (
                        <Link
                          key={item}
                          href={`/aliados/${item.toLowerCase().replace(/\s+/g, '-')}`}
                          className="flex items-center gap-3 px-4 py-2 text-[13px] text-secondary hover:text-primary hover:bg-primary/5 transition-all rounded-lg"
                        >
                          <Package className="w-3 h-3 text-on-surface-variant/40" />
                          <span>{item}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Data Center Section */}
          <div className="pt-4 mt-2">
            <div className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-[0.2em] px-4 mb-2">Systems</div>
            <button
              onClick={() => setIsDataCenterOpen(!isDataCenterOpen)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all group",
                isDataCenterOpen
                  ? "bg-secondary-container/30 text-primary border border-primary/10"
                  : "text-secondary hover:text-on-surface hover:bg-white border border-transparent hover:border-outline-variant/30"
              )}
            >
              <div className="flex items-center gap-3">
                <Database className={cn("w-5 h-5", isDataCenterOpen ? "text-primary" : "text-primary/70 group-hover:text-primary")} />
                <span>Data Center</span>
              </div>
              <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", isDataCenterOpen ? "rotate-180" : "")} />
            </button>

            {isDataCenterOpen && (
              <div className="mt-1 space-y-0.5 pl-4 animate-in slide-in-from-top-2 duration-300">
                {dataCenter.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-secondary hover:text-primary hover:bg-primary/5 transition-all rounded-lg"
                  >
                    <item.icon className="w-3.5 h-3.5 text-on-surface-variant/40" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Secondary Navigation */}
        <div className="pt-6 mt-6 border-t border-outline-variant space-y-1">
          {secondaryNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 text-secondary hover:text-on-surface hover:bg-white rounded-xl transition-all group"
            >
              <item.icon className="w-5 h-5 text-on-surface-variant/60 group-hover:text-primary transition-colors" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </div>
      </aside>

      {/* Tab Button (Handle) */}
      <button 
        onClick={toggle}
        className={cn(
          "w-6 h-20 bg-primary text-white rounded-r-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:w-8 transition-all duration-300 mt-[50vh] -translate-y-1/2",
          !isOpen && "bg-primary/90"
        )}
        title={isOpen ? "Hide Sidebar" : "Show Sidebar"}
      >
        {isOpen ? (
          <ChevronLeft className="w-5 h-5" />
        ) : (
          <ChevronRight className="w-5 h-5" />
        )}
      </button>
    </div>
  )
}
