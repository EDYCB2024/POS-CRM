"use client";

import React from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { 
  Smartphone,
  Zap,
  Search,
  LayoutGrid,
  FileText
} from 'lucide-react';

export default function HomeLandingPage() {
  return (
    <>
      <TopBar title="Inicio - POS CRM" />
      
      <main className="p-lg space-y-lg max-w-[1440px] mx-auto w-full min-h-[calc(100vh-100px)] flex flex-col justify-center">
        {/* Welcome Section */}
        <section className="relative overflow-hidden bg-white border border-outline-variant p-xl rounded-[48px] shadow-2xl shadow-primary/5">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />
          
          <div className="relative z-10 py-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
                <Zap className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">Sistema de Gestión POS</span>
              </div>
              
              <h1 className="text-[56px] font-black tracking-tighter text-on-surface leading-[1.1] mb-6">
                Bienvenido al Panel Central <br /> 
                <span className="text-primary text-opacity-80">POS-CRM</span>
              </h1>
              
              <p className="text-body-xl text-on-surface-variant max-w-2xl mx-auto">
                Tu plataforma unificada para el monitoreo de terminales, gestión de aliados y control de inventario en tiempo real. Selecciona una acción para comenzar.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg max-w-5xl mx-auto">
              <Link 
                href="/terminals" 
                className="group p-xl bg-slate-50/50 border border-outline-variant rounded-[32px] hover:bg-white hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-500"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-5 rounded-2xl bg-white border border-outline-variant group-hover:bg-primary group-hover:border-primary transition-all duration-500 shadow-sm group-hover:shadow-lg group-hover:shadow-primary/30 mb-6">
                    <Search className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <h4 className="font-black text-on-surface uppercase text-sm tracking-widest mb-3">Gestión de Terminales</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Monitorea equipos, revisa estatus y realiza búsquedas globales por serial.
                  </p>
                </div>
              </Link>

              <Link 
                href="/inventory" 
                className="group p-xl bg-slate-50/50 border border-outline-variant rounded-[32px] hover:bg-white hover:shadow-2xl hover:shadow-secondary/10 hover:-translate-y-2 transition-all duration-500"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-5 rounded-2xl bg-white border border-outline-variant group-hover:bg-secondary group-hover:border-secondary transition-all duration-500 shadow-sm group-hover:shadow-lg group-hover:shadow-secondary/30 mb-6">
                    <LayoutGrid className="w-8 h-8 text-secondary group-hover:text-white transition-colors" />
                  </div>
                  <h4 className="font-black text-on-surface uppercase text-sm tracking-widest mb-3">Control de Inventario</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Administra el stock disponible de modelos, repuestos y accesorios.
                  </p>
                </div>
              </Link>

              <Link 
                href="/datacenter/clientes" 
                className="group p-xl bg-slate-50/50 border border-outline-variant rounded-[32px] hover:bg-white hover:shadow-2xl hover:shadow-tertiary/10 hover:-translate-y-2 transition-all duration-500"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-5 rounded-2xl bg-white border border-outline-variant group-hover:bg-tertiary group-hover:border-tertiary transition-all duration-500 shadow-sm group-hover:shadow-lg group-hover:shadow-tertiary/30 mb-6">
                    <FileText className="w-8 h-8 text-tertiary group-hover:text-white transition-colors" />
                  </div>
                  <h4 className="font-black text-on-surface uppercase text-sm tracking-widest mb-3">Data Center</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Accede a las bases de datos maestras de clientes y aliados estratégicos.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Help Tip */}
        <div className="flex justify-center">
          <div className="flex items-center gap-3 px-6 py-3 bg-on-surface/5 rounded-full border border-outline-variant/30">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
              <Smartphone className="w-4 h-4 text-primary" />
            </div>
            <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              ¿Necesitas ayuda? Visita nuestro <Link href="/support" className="text-primary hover:underline">Centro de Soporte</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
