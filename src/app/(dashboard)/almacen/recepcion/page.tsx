"use client";

import React from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Construction } from 'lucide-react';

export default function RecepcionEquiposPage() {
  return (
    <>
      <TopBar title="Almacén - Recepción de Equipos" />
      
      <main className="p-6 flex items-center justify-center min-h-[calc(100vh-160px)] w-full">
        <div className="flex flex-col items-center justify-center space-y-4 bg-white border border-outline-variant rounded-[32px] p-12 shadow-sm max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center">
            <Construction className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-on-surface tracking-tight">
            Sitio en Construcción
          </h2>
        </div>
      </main>
    </>
  );
}
