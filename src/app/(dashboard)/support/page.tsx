'use client'

import { TopBar } from "@/components/layout/TopBar";
import { 
  LifeBuoy, 
  MessageSquare, 
  Phone, 
  Mail, 
  Cpu, 
  Zap, 
  CheckCircle2, 
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useState } from 'react';

export default function SupportPage() {
  const [activeStatus] = useState([
    { name: 'Core API', status: 'Operational', color: 'text-green-500' },
    { name: 'Database (Supabase)', status: 'Operational', color: 'text-green-500' },
    { name: 'Auth Service', status: 'Operational', color: 'text-green-500' },
    { name: 'Excel Engine', status: 'Stable', color: 'text-blue-500' },
  ]);

  return (
    <>
      <TopBar title="Soporte Técnico" />
      
      <section className="p-8 max-w-7xl mx-auto w-full">
        {/* Header Hero */}
        <div className="relative overflow-hidden bg-primary rounded-[32px] p-8 mb-8 shadow-xl shadow-primary/20 group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <LifeBuoy className="w-48 h-48 text-white" />
          </div>
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-[9px] font-black uppercase tracking-widest mb-4 backdrop-blur-sm border border-white/10">
              <Sparkles className="w-3 h-3 text-amber-300" />
              Centro de Ayuda
            </span>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-tight">
              ¿Cómo podemos ayudarte?
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: System Health & Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Suggestion Box */}
            <div className="bg-white border border-outline-variant rounded-[32px] p-8 shadow-sm relative overflow-hidden group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-primary uppercase tracking-tight">Buzón de Sugerencias</h2>
                  <p className="text-on-surface-variant text-sm font-medium">Ayúdanos a mejorar el CRM con tus ideas.</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <textarea 
                  placeholder="Escribe tu sugerencia aquí..."
                  className="w-full min-h-[120px] p-4 rounded-2xl border border-outline-variant focus:border-primary outline-none text-sm font-medium transition-all bg-slate-50/50"
                />
                <button className="px-8 py-3 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
                  Enviar Sugerencia
                </button>
              </div>
            </div>

            {/* Quick Stats / Health removed */}
          </div>

          {/* Right: Contact Column */}
          <div className="space-y-8">
            <div className="bg-white border border-outline-variant rounded-[32px] p-6 shadow-sm">
              <h2 className="text-lg font-black text-primary uppercase tracking-tight mb-6">Canales Directos</h2>
              
              <div className="space-y-4">
                <a href="#" className="flex items-center gap-4 p-4 rounded-2xl bg-green-50 border border-green-100 hover:bg-green-100 transition-all group">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-green-700 uppercase">WhatsApp</p>
                    <p className="text-sm font-bold text-on-surface">Soporte Express</p>
                  </div>
                  <ExternalLink className="w-4 h-4 ml-auto text-green-600 opacity-0 group-hover:opacity-100 transition-all" />
                </a>

                <a href="#" className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-all group">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-blue-700 uppercase">Email</p>
                    <p className="text-sm font-bold text-on-surface">Casos Especiales</p>
                  </div>
                  <ExternalLink className="w-4 h-4 ml-auto text-blue-600 opacity-0 group-hover:opacity-100 transition-all" />
                </a>

                <a href="#" className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all group">
                  <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center text-white">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-700 uppercase">Llamada</p>
                    <p className="text-sm font-bold text-on-surface">Emergencia 24/7</p>
                  </div>
                  <ExternalLink className="w-4 h-4 ml-auto text-slate-600 opacity-0 group-hover:opacity-100 transition-all" />
                </a>
              </div>
            </div>

            <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden">
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
              <ShieldAlert className="w-12 h-12 text-primary mb-6" />
              <h3 className="text-xl font-black uppercase tracking-tight mb-2">Seguridad Primero</h3>
              <p className="text-white/60 text-sm font-medium mb-6">
                Nunca comparta sus claves TMS o credenciales de Supabase con personal no autorizado.
              </p>
              <button className="text-xs font-black uppercase tracking-widest text-primary hover:text-white transition-colors">
                Reportar Incidencia →
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
