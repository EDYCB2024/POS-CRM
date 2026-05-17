'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('PROCESANDO ACCESO...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 1. Exchange PKCE code if present in the URL
        const code = searchParams.get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        // 2. Retrieve authenticated user details
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) {
          throw new Error('No se pudo encontrar una sesión activa de usuario.');
        }
        setStatus('success');
        setMessage('¡ACCESO CONFIRMADO! REDIRIGIENDO A CREAR CONTRASEÑA...');
        
        setTimeout(() => {
          router.push('/auth/setup-password');
        }, 2000);
      } catch (err: any) {
        console.error('Callback error:', err);
        setStatus('error');
        setMessage(err.message || 'ERROR AL VALIDAR LA INVITACIÓN DEL SISTEMA.');
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -z-10" />

      {/* Glassmorphic Card */}
      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-2xl p-10 rounded-[32px] border border-slate-800/60 shadow-2xl text-center flex flex-col items-center">
        
        {/* Title */}
        <h1 className="text-xs font-black text-primary tracking-[0.25em] uppercase mb-8">
          SISTEMA POS-CRM
        </h1>

        {/* Dynamic Icon */}
        <div className="relative mb-8">
          {status === 'loading' && (
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-primary/10 animate-pulse" />
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          )}
          {status === 'success' && (
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full border border-emerald-500/20 flex items-center justify-center animate-in zoom-in duration-300">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
          )}
          {status === 'error' && (
            <div className="w-20 h-20 bg-red-500/10 rounded-full border border-red-500/20 flex items-center justify-center animate-in zoom-in duration-300">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
          )}
        </div>

        {/* Message */}
        <p className="text-sm font-black text-white tracking-wide uppercase leading-relaxed max-w-[280px]">
          {message}
        </p>

        {/* Subtitle / Action */}
        {status === 'loading' && (
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">
            Estableciendo conexión segura...
          </p>
        )}
        {status === 'success' && (
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-4 animate-pulse">
            Configurando entorno de trabajo...
          </p>
        )}
        {status === 'error' && (
          <button 
            onClick={() => router.push('/login')}
            className="mt-6 px-6 py-2.5 bg-primary text-white text-xs font-black uppercase tracking-wider rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20"
          >
            Volver al Inicio de Sesión
          </button>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
