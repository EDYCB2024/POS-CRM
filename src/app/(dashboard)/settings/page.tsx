'use client'

import { TopBar } from "@/components/layout/TopBar";
import { 
  Settings as SettingsIcon, 
  History, 
  User, 
  Shield, 
  Database, 
  Search,
  Filter,
  RefreshCw,
  Clock,
  ArrowRight,
  Building2,
  Edit2,
  Save,
  X,
  Plus,
  Users as UsersIcon,
  UserPlus,
  UserCog,
  Mail
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { cn } from "@/lib/utils";

// Cache outside the component to persist settings data between remounts
let cachedLogs: any[] | null = null;
let cachedAllies: any[] | null = null;
let cachedUsers: any[] | null = null;

export default function SettingsPage() {
  const [logs, setLogs] = useState<any[]>(cachedLogs || []);
  const [loading, setLoading] = useState(!cachedLogs);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'activity' | 'allies' | 'users'>('activity');
  
  // Allies Management State
  const [allies, setAllies] = useState<any[]>(cachedAllies || []);
  const [loadingAllies, setLoadingAllies] = useState(!cachedAllies);
  const [editingAllyId, setEditingAllyId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isAddingAlly, setIsAddingAlly] = useState(false);
  const [newAlly, setNewAlly] = useState({ name: '', table_name: '', category: 'Aliados' });
  
  // Users Management State
  const [users, setUsers] = useState<any[]>(cachedUsers || []);
  const [loadingUsers, setLoadingUsers] = useState(!cachedUsers);
  const [isAddingUser, setIsAddingUser] = useState(false);

  const fetchLogs = async (force: boolean = false) => {
    if (!force && cachedLogs) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      cachedLogs = data || [];
      setLogs(cachedLogs);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllies = async (force: boolean = false) => {
    if (!force && cachedAllies) {
      setLoadingAllies(false);
      return;
    }
    setLoadingAllies(true);
    try {
      // 1. Fetch config
      const { data: config, error: configError } = await supabase
        .from('allies_config')
        .select('*')
        .order('name', { ascending: true });
      
      if (configError) throw configError;
      
      // 2. Fetch all counts in ONE go using RPC
      const { data: counts, error: countsError } = await supabase.rpc('get_all_table_counts');
      if (countsError) throw countsError;

      // Map counts to config
      const alliesWithCounts = (config || []).map(ally => {
        const countData = (counts || []).find((c: any) => c.table_name === ally.table_name);
        return { ...ally, count: countData ? countData.row_count : 0 };
      });
      
      cachedAllies = alliesWithCounts;
      setAllies(cachedAllies);
    } catch (err) {
      console.error('Error fetching allies:', err);
    } finally {
      setLoadingAllies(false);
    }
  };

  const fetchUsers = async (force: boolean = false) => {
    if (!force && cachedUsers) {
      setLoadingUsers(false);
      return;
    }
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      cachedUsers = data || [];
      setUsers(cachedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'activity') {
      fetchLogs();
    } else if (activeTab === 'allies') {
      fetchAllies();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const handleUpdateAllyName = async (id: string) => {
    try {
      const { error } = await supabase
        .from('allies_config')
        .update({ name: editName })
        .eq('id', id);
      
      if (error) throw error;
      setEditingAllyId(null);
      fetchAllies();
    } catch (err) {
      console.error('Error updating ally:', err);
      alert('Error al actualizar el nombre del aliado');
    }
  };

  const handleAddAlly = async () => {
    if (!newAlly.name || !newAlly.table_name) return;
    
    try {
      // 1. Create entry in config
      const { error } = await supabase
        .from('allies_config')
        .insert([{
          name: newAlly.name,
          slug: newAlly.table_name.toLowerCase().replace(/_/g, '-'),
          table_name: newAlly.table_name.toLowerCase(),
          category: newAlly.category
        }]);
      
      if (error) throw error;
      
      // 2. We don't automatically create the SQL table here as it requires DDL permissions 
      // and a specific schema. In a real scenario, this would trigger a background task
      // or we'd use a single 'terminals' table approach.
      
      setIsAddingAlly(false);
      setNewAlly({ name: '', table_name: '', category: 'Aliados' });
      fetchAllies();
    } catch (err) {
      console.error('Error adding ally:', err);
      alert('Error al añadir aliado. Asegúrese de que el nombre de tabla sea único.');
    }
  };

  return (
    <>
      <TopBar title="Configuración" />
      
      <section className="p-8 max-w-7xl mx-auto w-full">
        <div className="mb-10">
          <h1 className="text-3xl font-black uppercase tracking-tight text-primary flex items-center gap-3">
            <SettingsIcon className="w-8 h-8" />
            Configuración y Sistema
          </h1>
          <p className="text-on-surface-variant mt-2 font-medium">Administre su perfil, seguridad y audite las actividades del sistema.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Navigation */}
          <div className="lg:col-span-3 space-y-2">
            {[
              { id: 'profile', label: 'Mi Perfil', icon: User },
              { id: 'security', label: 'Seguridad', icon: Shield },
              { id: 'users', label: 'Gestión de Usuarios', icon: UsersIcon },
              { id: 'allies', label: 'Gestión de Aliados', icon: Building2 },
              { id: 'activity', label: 'Activity Log', icon: History },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all border",
                  activeTab === tab.id 
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                    : "bg-white text-on-surface border-outline-variant hover:border-primary/50"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="lg:col-span-9 bg-white border border-outline-variant rounded-[32px] overflow-hidden shadow-sm min-h-[600px]">
            {activeTab === 'activity' && (
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-outline-variant bg-slate-50/50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <History className="w-5 h-5 text-primary" />
                    <h2 className="font-black text-primary uppercase tracking-widest text-sm">Registro de Actividad Reciente</h2>
                  </div>
                  <button 
                    onClick={() => fetchLogs(true)}
                    className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-outline-variant"
                  >
                    <RefreshCw className={cn("w-4 h-4 text-primary", loading && "animate-spin")} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-outline-variant scrollbar-track-transparent">
                  {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4">
                      <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-xs font-black text-outline uppercase tracking-widest">Consultando logs...</p>
                    </div>
                  ) : logs.length === 0 ? (
                    <div className="p-20 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-outline-variant">
                        <Database className="w-8 h-8 text-outline" />
                      </div>
                      <p className="text-sm font-bold text-outline uppercase tracking-widest">No hay registros aún</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {logs.map((log) => (
                        <div key={log.id} className="p-5 hover:bg-slate-50 transition-colors group">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex gap-4">
                              <div className="mt-1 p-2 bg-primary/5 rounded-lg border border-primary/10">
                                <Clock className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[10px] font-black uppercase text-primary tracking-widest bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                                    {log.entity || 'SISTEMA'}
                                  </span>
                                  <span className="text-xs font-black text-on-surface uppercase">
                                    {log.action}
                                  </span>
                                </div>
                                <p className="text-sm text-on-surface-variant font-medium line-clamp-2">
                                  {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                                </p>
                                <div className="flex items-center gap-4 mt-2">
                                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-outline uppercase">
                                    <User className="w-3 h-3" />
                                    {log.user_email}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-outline uppercase">
                                    <Clock className="w-3 h-3" />
                                    {new Date(log.created_at).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'allies' && (
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-outline-variant bg-slate-50/50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-primary" />
                    <h2 className="font-black text-primary uppercase tracking-widest text-sm">Gestión de Aliados y Red</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsAddingAlly(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                    >
                      <Plus className="w-3 h-3" />
                      Añadir Aliado
                    </button>
                    <button 
                      onClick={() => fetchAllies(true)}
                      className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-outline-variant"
                    >
                      <RefreshCw className={cn("w-4 h-4 text-primary", loadingAllies && "animate-spin")} />
                    </button>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[600px]">
                  {isAddingAlly && (
                    <div className="mb-6 p-6 bg-primary/5 rounded-2xl border border-primary/10 animate-in fade-in zoom-in-95 duration-200">
                      <h3 className="text-sm font-black uppercase text-primary mb-4">Nuevo Aliado</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-[10px] font-bold text-outline uppercase mb-1 block">Nombre Visual</label>
                          <input 
                            type="text" 
                            className="w-full px-4 py-2 rounded-lg border border-outline-variant focus:border-primary outline-none text-sm font-bold"
                            placeholder="Ej: BANCO MERCANTIL"
                            value={newAlly.name}
                            onChange={(e) => setNewAlly({...newAlly, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-outline uppercase mb-1 block">Nombre de Tabla (DB)</label>
                          <input 
                            type="text" 
                            className="w-full px-4 py-2 rounded-lg border border-outline-variant focus:border-primary outline-none text-sm font-bold"
                            placeholder="Ej: mercantil_pos"
                            value={newAlly.table_name}
                            onChange={(e) => setNewAlly({...newAlly, table_name: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setIsAddingAlly(false)}
                          className="px-4 py-2 rounded-lg text-xs font-bold uppercase text-outline hover:bg-slate-100"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={handleAddAlly}
                          className="px-6 py-2 bg-primary text-white rounded-lg text-xs font-black uppercase tracking-widest"
                        >
                          Guardar Aliado
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-3">
                    {loadingAllies ? (
                      Array(5).fill(0).map((_: any, i: number) => (
                        <div key={i} className="h-20 bg-slate-50 animate-pulse rounded-2xl border border-outline-variant/30" />
                      ))
                    ) : allies.map((ally) => (
                      <div key={ally.id} className="bg-white p-4 rounded-2xl border border-outline-variant flex items-center justify-between group hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-primary">
                            {ally.name.charAt(0)}
                          </div>
                          {editingAllyId === ally.id ? (
                            <div className="flex items-center gap-2 flex-1">
                              <input 
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="px-3 py-1.5 border border-primary rounded-lg text-sm font-bold outline-none flex-1 max-w-[300px]"
                                autoFocus
                              />
                              <button onClick={() => handleUpdateAllyName(ally.id)} className="p-1.5 bg-green-500 text-white rounded-lg"><Save className="w-4 h-4" /></button>
                                <button onClick={() => setEditingAllyId(null)} className="p-1.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-all"><X className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <div>
                              <h3 className="text-sm font-black text-on-surface uppercase tracking-tight flex items-center gap-2">
                                {ally.name}
                                <button 
                                  onClick={() => {
                                    setEditingAllyId(ally.id);
                                    setEditName(ally.name);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded transition-all"
                                >
                                  <Edit2 className="w-3 h-3 text-outline" />
                                </button>
                              </h3>
                              <p className="text-[10px] font-bold text-outline uppercase tracking-widest flex items-center gap-2">
                                {ally.table_name}
                                <span className="w-1 h-1 bg-outline-variant rounded-full"></span>
                                {ally.category}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-primary leading-none">{ally.count}</p>
                          <p className="text-[9px] font-bold text-outline uppercase tracking-widest mt-1">Registros</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-outline-variant bg-slate-50/50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <UsersIcon className="w-5 h-5 text-primary" />
                    <h2 className="font-black text-primary uppercase tracking-widest text-sm">Gestión de Usuarios del Sistema</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => fetchUsers(true)}
                      className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-outline-variant"
                    >
                      <RefreshCw className={cn("w-4 h-4 text-primary", loadingUsers && "animate-spin")} />
                    </button>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[600px]">
                  <div className="grid grid-cols-1 gap-4">
                    {loadingUsers ? (
                      Array(3).fill(0).map((_: any, i: number) => (
                        <div key={i} className="h-24 bg-slate-50 animate-pulse rounded-2xl border border-outline-variant/30" />
                      ))
                    ) : users.length === 0 ? (
                      <div className="py-20 text-center bg-slate-50/50 rounded-3xl border border-dashed border-outline-variant">
                        <UserCog className="w-12 h-12 text-outline mx-auto mb-4 opacity-20" />
                        <p className="text-sm font-bold text-outline uppercase tracking-widest">No hay otros usuarios registrados</p>
                        <p className="text-[10px] text-outline mt-2">Los usuarios aparecerán aquí una vez que se registren en el sistema.</p>
                      </div>
                    ) : (
                      users.map((user) => (
                        <div key={user.id} className="bg-white p-5 rounded-3xl border border-outline-variant flex items-center justify-between hover:border-primary/30 transition-all shadow-sm group">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-black text-lg">
                              {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="text-sm font-black text-on-surface uppercase tracking-tight">{user.full_name || 'Usuario sin nombre'}</h3>
                              <div className="flex items-center gap-3 mt-1">
                                <p className="text-[10px] font-bold text-outline uppercase tracking-widest flex items-center gap-1.5">
                                  <Mail className="w-3 h-3" />
                                  {user.email}
                                </p>
                                <span className="w-1 h-1 bg-outline-variant rounded-full"></span>
                                <span className={cn(
                                  "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border",
                                  user.role === 'admin' ? "bg-red-50 text-red-600 border-red-100" : "bg-primary/5 text-primary border-primary/10"
                                )}>
                                  {user.role}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className={cn(
                                "text-[10px] font-black uppercase tracking-widest",
                                user.status === 'active' ? "text-green-500" : "text-red-500"
                              )}>
                                {user.status === 'active' ? '● Activo' : '○ Inactivo'}
                              </p>
                              <p className="text-[9px] font-bold text-outline uppercase tracking-widest mt-1">
                                Miembro desde {new Date(user.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <button className="p-2 hover:bg-slate-100 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                              <Edit2 className="w-4 h-4 text-outline" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {(activeTab === 'profile' || activeTab === 'security') && (
              <div className="p-20 text-center flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-2 border border-primary/10">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-black text-primary uppercase">Módulo en Desarrollo</h3>
                <p className="text-sm text-on-surface-variant max-w-xs font-medium">
                  Esta sección de configuración estará disponible en la próxima actualización del sistema.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
