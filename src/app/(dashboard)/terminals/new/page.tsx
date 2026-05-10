"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { 
  UserPlus, 
  Files, 
  Info
} from 'lucide-react';
import { TerminalDetailsModal } from "@/components/modals/TerminalDetailsModal";

export default function NewTerminalSelectionPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <TopBar title="Añadir Nuevo Equipo" />
      
      <main className="p-lg max-w-[1200px] mx-auto w-full min-h-[calc(100vh-100px)] flex flex-col justify-center">
        <div className="mb-10">
          <h1 className="text-h2 font-black text-on-surface tracking-tight">Registro de Equipos</h1>
          <p className="text-sm text-on-surface-variant uppercase font-bold tracking-widest mt-1">Selecciona el método de ingreso</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg items-stretch">
          {/* Individual Addition Card */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="group relative overflow-hidden bg-white border border-outline-variant p-xl rounded-[40px] hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-500 flex flex-col items-center text-center w-full"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <UserPlus className="w-32 h-32 text-primary" />
            </div>
            
            <div className="p-6 rounded-[24px] bg-primary/5 border border-primary/10 group-hover:bg-primary group-hover:border-primary transition-all duration-500 shadow-sm mb-8">
              <UserPlus className="w-10 h-10 text-primary group-hover:text-white transition-colors" />
            </div>
            
            <h2 className="text-2xl font-black text-on-surface mb-4">Añadir Individual</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-8 max-w-[280px]">
              Ideal para registrar un único equipo con todos sus detalles específicos de forma manual.
            </p>
            
            <div className="mt-auto px-6 py-2 bg-slate-50 rounded-full text-[10px] font-black text-primary uppercase tracking-[0.2em] group-hover:bg-primary group-hover:text-white transition-all">
              Abrir Expediente
            </div>
          </button>

          {/* Bulk Addition Card */}
          <Link 
            href="/terminals/new/bulk" 
            className="group relative overflow-hidden bg-white border border-outline-variant p-xl rounded-[40px] hover:shadow-2xl hover:shadow-secondary/10 hover:-translate-y-2 transition-all duration-500 flex flex-col items-center text-center"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Files className="w-32 h-32 text-secondary" />
            </div>
            
            <div className="p-6 rounded-[24px] bg-secondary/5 border border-secondary/10 group-hover:bg-secondary group-hover:border-secondary transition-all duration-500 shadow-sm mb-8">
              <Files className="w-10 h-10 text-secondary group-hover:text-white transition-colors" />
            </div>
            
            <h2 className="text-2xl font-black text-on-surface mb-4">Añadir Masivo</h2>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-8 max-w-[280px]">
              Carga múltiples equipos de forma simultánea mediante un archivo Excel o CSV.
            </p>
            
            <div className="mt-auto px-6 py-2 bg-slate-50 rounded-full text-[10px] font-black text-secondary uppercase tracking-[0.2em] group-hover:bg-secondary group-hover:text-white transition-all">
              Subir Archivo
            </div>
          </Link>
        </div>

        {/* Info Box */}
        <div className="mt-12 p-6 bg-blue-50 border border-blue-100 rounded-[24px] flex items-start gap-4">
          <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-blue-900 mb-1">Recomendación de carga</p>
            <p className="text-xs text-blue-700 leading-relaxed">
              Si vas a registrar más de 10 equipos, te recomendamos utilizar la opción de **Añadir Masivo**. Asegúrate de tener el archivo preparado.
            </p>
          </div>
        </div>
      </main>

      <TerminalDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serial=""
        currentSlug=""
        isNew={true}
      />
    </>
  );
}
