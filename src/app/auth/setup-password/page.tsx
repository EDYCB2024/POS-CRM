'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldCheck, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SetupPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Password requirements
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const matchesConfirm = password === confirmPassword && confirmPassword !== '';

  const requirementsMetCount = [hasMinLength, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;
  
  // Progress bar calculation
  const strengthPercentage = (requirementsMetCount / 4) * 100;
  
  // Verify session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
        } else {
          setSessionLoading(false);
        }
      } catch (err) {
        router.push('/login');
      }
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Guard clauses
    if (requirementsMetCount < 4) {
      setErrorMsg('Por favor, cumpla con todos los requisitos de seguridad para la contraseña.');
      return;
    }
    if (!matchesConfirm) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      // Update the user status to active in database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ status: 'active' })
          .eq('id', user.id);
        if (profileError) throw profileError;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Error setting password:', err);
      setErrorMsg(err.message || 'Ocurrió un error al establecer la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -z-10" />

      {/* Glassmorphic Container */}
      <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-2xl p-8 rounded-[32px] border border-slate-800/60 shadow-2xl relative">
        {success ? (
          <div className="text-center py-8 flex flex-col items-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full border border-emerald-500/20 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-lg font-black text-white uppercase tracking-wider mb-2">
              ¡Contraseña Creada!
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-[280px]">
              Tu cuenta ha sido configurada con éxito. Redirigiendo al dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col">
            {/* Header */}
            <div className="text-center mb-6">
              <span className="text-[10px] font-black text-primary tracking-[0.25em] uppercase block mb-2">
                SISTEMA POS-CRM
              </span>
              <h2 className="text-lg font-black text-white uppercase tracking-wide">
                Establecer Contraseña
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Crea una contraseña segura para activar tu cuenta
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold uppercase tracking-wider animate-in fade-in duration-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Inputs */}
            <div className="space-y-4">
              {/* Password */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3.5 bg-slate-950/50 border border-slate-800 rounded-2xl text-white text-sm focus:outline-none focus:border-primary/50 transition-all font-sans"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-all"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3.5 bg-slate-950/50 border border-slate-800 rounded-2xl text-white text-sm focus:outline-none focus:border-primary/50 transition-all font-sans"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-all"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Strength Indicator */}
            <div className="mt-5 p-4 bg-slate-950/40 border border-slate-800/60 rounded-2xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Seguridad de Contraseña
                </span>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest",
                  requirementsMetCount === 4 ? "text-emerald-500" :
                  requirementsMetCount >= 2 ? "text-amber-500" : "text-red-500"
                )}>
                  {requirementsMetCount === 4 ? 'Excelente' :
                   requirementsMetCount >= 2 ? 'Media' : 'Baja'}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mb-4">
                <div 
                  className={cn(
                    "h-full transition-all duration-300 rounded-full",
                    requirementsMetCount === 4 ? "bg-emerald-500" :
                    requirementsMetCount >= 2 ? "bg-amber-500" : "bg-red-500"
                  )}
                  style={{ width: `${strengthPercentage}%` }}
                />
              </div>

              {/* Checklist */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  {hasMinLength ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  )}
                  <span className={cn("text-[9px] font-bold uppercase tracking-wider", hasMinLength ? "text-slate-300" : "text-slate-500")}>
                    Mín. 8 Caracteres
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {hasUppercase ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  )}
                  <span className={cn("text-[9px] font-bold uppercase tracking-wider", hasUppercase ? "text-slate-300" : "text-slate-500")}>
                    Una Mayúscula
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {hasNumber ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  )}
                  <span className={cn("text-[9px] font-bold uppercase tracking-wider", hasNumber ? "text-slate-300" : "text-slate-500")}>
                    Un Número
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {hasSpecial ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  )}
                  <span className={cn("text-[9px] font-bold uppercase tracking-wider", hasSpecial ? "text-slate-300" : "text-slate-500")}>
                    Carácter Especial
                  </span>
                </div>
              </div>
            </div>

            {/* Confirm Check */}
            {confirmPassword !== '' && (
              <div className="mt-3 flex items-center gap-2 px-1">
                {matchesConfirm ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 animate-in zoom-in duration-300" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 animate-in zoom-in duration-300" />
                )}
                <span className={cn(
                  "text-[9px] font-bold uppercase tracking-wider",
                  matchesConfirm ? "text-emerald-500" : "text-red-500"
                )}>
                  {matchesConfirm ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                </span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || requirementsMetCount < 4 || !matchesConfirm}
              className="mt-6 w-full py-4 bg-primary hover:bg-primary/95 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Activar Cuenta y Entrar</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
