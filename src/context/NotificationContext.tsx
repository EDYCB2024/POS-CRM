'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X, HelpCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastState {
  message: string;
  type: ToastType;
}

interface AlertState {
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
  resolve: (value: boolean) => void;
}

interface ConfirmState {
  title: string;
  message: string;
  type: 'primary' | 'danger';
  resolve: (value: boolean) => void;
}

interface NotificationContextType {
  showToast: (message: string, type?: ToastType) => void;
  showAlert: (title: string, message: string, type?: 'success' | 'error' | 'info') => Promise<boolean>;
  showConfirm: (title: string, message: string, type?: 'primary' | 'danger') => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [alertState, setAlertState] = useState<AlertState | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  };

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info'): Promise<boolean> => {
    return new Promise((resolve) => {
      setAlertState({ title, message, type, resolve });
    });
  };

  const showConfirm = (title: string, message: string, type: 'primary' | 'danger' = 'primary'): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({ title, message, type, resolve });
    });
  };

  const handleAlertClose = () => {
    if (alertState) {
      alertState.resolve(true);
      setAlertState(null);
    }
  };

  const handleConfirmAction = (confirmed: boolean) => {
    if (confirmState) {
      confirmState.resolve(confirmed);
      setConfirmState(null);
    }
  };

  return (
    <NotificationContext.Provider value={{ showToast, showAlert, showConfirm }}>
      {children}

      {/* Render portals only on client-side */}
      {mounted && typeof document !== 'undefined' && (
        <>
          {/* TOAST SYSTEM */}
          {toast && createPortal(
            <div className="fixed top-6 right-6 z-[999999] animate-in slide-in-from-right-10 fade-in duration-300">
              <div className={cn(
                "bg-white/95 backdrop-blur-md border shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl p-4 flex items-center gap-4 min-w-[320px] max-w-[400px]",
                toast.type === 'success' ? "border-green-100" :
                toast.type === 'error' ? "border-red-100" :
                toast.type === 'warning' ? "border-amber-100" : "border-blue-100"
              )}>
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center border shrink-0",
                  toast.type === 'success' ? "bg-green-50 border-green-200" :
                  toast.type === 'error' ? "bg-red-50 border-red-200" :
                  toast.type === 'warning' ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200"
                )}>
                  {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600 animate-bounce" />}
                  {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 animate-bounce" />}
                  {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 animate-bounce" />}
                  {toast.type === 'info' && <Info className="w-5 h-5 text-blue-600 animate-bounce" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    toast.type === 'success' ? "text-green-600" :
                    toast.type === 'error' ? "text-red-600" :
                    toast.type === 'warning' ? "text-amber-600" : "text-blue-600"
                  )}>
                    {toast.type === 'success' ? 'Operación Exitosa' :
                     toast.type === 'error' ? 'Error en Operación' :
                     toast.type === 'warning' ? 'Advertencia' : 'Información'}
                  </h4>
                  <p className="text-xs font-bold text-slate-700 mt-0.5 break-words">{toast.message}</p>
                </div>
                <button 
                  onClick={() => setToast(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-50 rounded-lg cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>,
            document.body
          )}

          {/* ALERT MODAL SYSTEM */}
          {alertState && createPortal(
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
              {/* Backdrop */}
              <div
                onClick={handleAlertClose}
                className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm transition-opacity duration-300"
              />

              {/* Modal Container */}
              <div className="bg-surface rounded-[32px] border border-outline-variant shadow-2xl w-[420px] max-w-[95vw] overflow-hidden relative z-10 p-8 text-center flex flex-col items-center animate-in zoom-in duration-300 scale-100">
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center mb-6 border",
                  alertState.type === 'success' ? "bg-green-50 border-green-200 text-green-600" :
                  alertState.type === 'error' ? "bg-red-50 border-red-200 text-red-600" :
                  "bg-blue-50 border-blue-200 text-blue-600"
                )}>
                  {alertState.type === 'success' && <CheckCircle className="w-8 h-8 animate-bounce" />}
                  {alertState.type === 'error' && <AlertCircle className="w-8 h-8 animate-pulse" />}
                  {alertState.type === 'info' && <Info className="w-8 h-8" />}
                </div>

                <h3 className="text-xl font-black text-on-surface mb-2 uppercase tracking-wide">
                  {alertState.title}
                </h3>

                <p className="text-sm font-bold text-on-surface-variant mb-6 leading-relaxed max-h-[250px] overflow-y-auto w-full px-2">
                  {alertState.message}
                </p>

                <button
                  onClick={handleAlertClose}
                  className={cn(
                    "w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg cursor-pointer",
                    alertState.type === 'success' ? "bg-green-600 text-white shadow-green-600/20 hover:bg-green-700" :
                    alertState.type === 'error' ? "bg-red-600 text-white shadow-red-600/20 hover:bg-red-700" :
                    "bg-primary text-on-primary shadow-primary/20 hover:opacity-95"
                  )}
                >
                  Entendido
                </button>
              </div>
            </div>,
            document.body
          )}

          {/* CONFIRMATION MODAL SYSTEM */}
          {confirmState && createPortal(
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
              {/* Backdrop */}
              <div
                onClick={() => handleConfirmAction(false)}
                className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm transition-opacity duration-300"
              />

              {/* Modal Container */}
              <div className="bg-surface rounded-[32px] border border-outline-variant shadow-2xl w-[440px] max-w-[95vw] overflow-hidden relative z-10 p-8 text-center flex flex-col items-center animate-in zoom-in duration-300 scale-100">
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center mb-6 border",
                  confirmState.type === 'danger' ? "bg-red-50 border-red-200 text-red-600" :
                  "bg-primary/10 border-primary/20 text-primary"
                )}>
                  {confirmState.type === 'danger' ? (
                    <AlertTriangle className="w-8 h-8 animate-pulse" />
                  ) : (
                    <HelpCircle className="w-8 h-8 animate-bounce" />
                  )}
                </div>

                <h3 className="text-xl font-black text-on-surface mb-2 uppercase tracking-wide">
                  {confirmState.title}
                </h3>

                <p className="text-sm font-bold text-on-surface-variant mb-6 leading-relaxed w-full px-2">
                  {confirmState.message}
                </p>

                <div className="flex gap-4 w-full">
                  <button
                    onClick={() => handleConfirmAction(false)}
                    className="flex-1 py-3 border border-outline-variant rounded-2xl font-bold text-xs uppercase tracking-widest text-on-surface hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleConfirmAction(true)}
                    className={cn(
                      "flex-1 py-3 text-white rounded-2xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg cursor-pointer",
                      confirmState.type === 'danger'
                        ? "bg-red-600 hover:bg-red-700 shadow-red-600/20"
                        : "bg-primary hover:opacity-90 shadow-primary/20"
                    )}
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
        </>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
