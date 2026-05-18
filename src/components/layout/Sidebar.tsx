'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  LayoutDashboard,
  Home,
  Smartphone,
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
  ChevronLeft,
  ListChecks,
  LifeBuoy,
  FileText,
  MessageSquare,
  Plus,
  Inbox
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from "@/lib/utils"
import { useSidebar } from '@/context/SidebarContext'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
]

const dataCenter = [
  { name: 'BD Clientes', href: '/datacenter/clientes', icon: Users },
  { name: 'BD PLATCO', href: '/datacenter/platco', icon: Building2 },
  { name: 'Base de Conocimiento', href: '/datacenter/kb', icon: HelpCircle },
]

const secondaryNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
]

const inventory = [
  { name: 'Stock General', href: '/inventory', icon: Boxes },
  { name: 'Movimientos', href: '/inventory/movements', icon: ListChecks },
]

const helpCenter = [
  { name: 'Guías de Usuario', href: '/help/guides', icon: FileText },
  { name: 'FAQ', href: '/help/faq', icon: HelpCircle },
]

// Module-level caches removed for data consistency


export function Sidebar() {
  const pathname = usePathname()
  const { isOpen, toggle } = useSidebar()
  const [isAliadosOpen, setIsAliadosOpen] = useState(false)
  const [isAddEquipmentOpen, setIsAddEquipmentOpen] = useState(false)
  const [isDataCenterOpen, setIsDataCenterOpen] = useState(false)
  const [isInventoryOpen, setIsInventoryOpen] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [isOtrosOpen, setIsOtrosOpen] = useState(false)

  const [dynamicAliados, setDynamicAliados] = useState<any[]>([])
  const [dynamicOtros, setDynamicOtros] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchAllies = async () => {


      const { data, error } = await supabase
        .from('allies_config')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (data) {
        const aliados = data.filter(a => a.category === 'Aliados');
        const otros = data.filter(a => a.category === 'Otros');

        setDynamicAliados(aliados)
        setDynamicOtros(otros)
      }
    }
    fetchAllies()
  }, [])

  useEffect(() => {
    // Cerrar sidebar al navegar en móviles
    if (window.innerWidth < 1024 && isOpen) {
      toggle()
    }
  }, [pathname])

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={toggle}
        />
      )}
      
      <div
        className={cn(
          "fixed left-0 top-0 h-screen z-50 transition-all duration-300 ease-in-out flex w-72 lg:w-80",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
      {/* Sidebar Content Container */}
      <aside className="w-full h-full bg-surface-container-lowest border-r border-outline-variant flex flex-col p-6 overflow-y-auto custom-scrollbar relative shadow-2xl shadow-black/5">
        {/* Logo Section */}
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Smartphone className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className="text-h3 font-black tracking-tighter text-primary uppercase leading-tight">POS CRM</h2>
              <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Management v1.0</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={toggle}
            className="p-2 -mr-2 text-on-surface-variant hover:bg-surface-container rounded-lg lg:hidden transition-colors"
            title="Cerrar menú"
          >
            <ChevronLeft className="w-5 h-5 text-primary" />
          </button>
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
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all group",
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
          <div className="pt-2 mt-1">
            <div className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-[0.2em] px-4 mb-2">Network</div>
            
            {/* Add Equipment Link */}
            <Link
              href="/terminals/new"
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all group mb-1 border border-transparent",
                pathname === '/terminals/new'
                  ? "bg-primary text-white shadow-lg shadow-primary/20 border-primary"
                  : "text-secondary hover:text-on-surface hover:bg-white hover:border-outline-variant/30"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-lg flex items-center justify-center transition-colors",
                pathname === '/terminals/new' ? "bg-white text-primary" : "bg-primary text-white"
              )}>
                <Plus className="w-3.5 h-3.5" />
              </div>
              <span>Añadir Equipo</span>
            </Link>

            {/* Terminals Link added to Network */}
            <Link
              href="/terminals"
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all group mb-1",
                pathname === '/terminals'
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-secondary hover:text-on-surface hover:bg-white border border-transparent hover:border-outline-variant/30"
              )}
            >
              <Smartphone className={cn("w-5 h-5", pathname === '/terminals' ? "text-white" : "text-primary/70 group-hover:text-primary")} />
              <span>Terminals</span>
            </Link>

            <button
              onClick={() => setIsAliadosOpen(!isAliadosOpen)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-medium transition-all group",
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
                {dynamicAliados.map((aliado) => (
                  <Link
                    key={aliado.id}
                    href={`/aliados/${aliado.slug}`}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-secondary hover:text-primary hover:bg-primary/5 transition-all rounded-lg"
                  >
                    <Building2 className="w-3.5 h-3.5 text-on-surface-variant/40" />
                    <span>{aliado.name}</span>
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
                      {dynamicOtros.map((item) => (
                        <Link
                          key={item.id}
                          href={`/aliados/${item.slug}`}
                          className="flex items-center gap-3 px-4 py-2 text-[13px] text-secondary hover:text-primary hover:bg-primary/5 transition-all rounded-lg"
                        >
                          <Package className="w-3 h-3 text-on-surface-variant/40" />
                          <span>{item.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Almacén y Despacho Section */}
          <div className="pt-2 mt-1">
            <div className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-[0.2em] px-4 mb-2">Almacén y Despacho</div>
            <Link
              href={"/almacen/recepcion" as any}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all group mb-1",
                pathname === '/almacen/recepcion'
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-secondary hover:text-on-surface hover:bg-white border border-transparent hover:border-outline-variant/30"
              )}
            >
              <Inbox className={cn("w-5 h-5", pathname === '/almacen/recepcion' ? "text-white" : "text-primary/70 group-hover:text-primary")} />
              <span>Recepción de Equipos</span>
            </Link>
          </div>

          {/* Inventario Section */}
          <div className="pt-2 mt-1">
            <div className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-[0.2em] px-4 mb-2">Logistics</div>
            <button
              onClick={() => setIsInventoryOpen(!isInventoryOpen)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-medium transition-all group",
                isInventoryOpen
                  ? "bg-secondary-container/30 text-primary border border-primary/10"
                  : "text-secondary hover:text-on-surface hover:bg-white border border-transparent hover:border-outline-variant/30"
              )}
            >
              <div className="flex items-center gap-3">
                <Package className={cn("w-5 h-5", isInventoryOpen ? "text-primary" : "text-primary/70 group-hover:text-primary")} />
                <span>Inventario</span>
              </div>
              <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", isInventoryOpen ? "rotate-180" : "")} />
            </button>

            {isInventoryOpen && (
              <div className="mt-1 space-y-0.5 pl-4 animate-in slide-in-from-top-2 duration-300">
                {inventory.map((item) => (
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

          {/* Data Center Section */}
          <div className="pt-2 mt-1">
            <div className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-[0.2em] px-4 mb-2">Systems</div>
            <button
              onClick={() => setIsDataCenterOpen(!isDataCenterOpen)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-medium transition-all group",
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
          "hidden lg:flex w-6 h-20 bg-primary text-white rounded-r-xl items-center justify-center shadow-lg shadow-primary/20 hover:w-8 transition-all duration-300 mt-[50vh] -translate-y-1/2",
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
    </>
  )
}
