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
  Mail,
  Trash2,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { cn } from "@/lib/utils";
import { useNotification } from '@/context/NotificationContext';

// Removed module-level caches to ensure data freshness after updates


export default function SettingsPage() {
  const { showToast, showAlert, showConfirm } = useNotification();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'activity' | 'allies' | 'users'>('profile');
  
  // Role based access control state
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);
  
  // Allies Management State
  const [allies, setAllies] = useState<any[]>([]);
  const [loadingAllies, setLoadingAllies] = useState(true);
  const [editingAllyId, setEditingAllyId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isAddingAlly, setIsAddingAlly] = useState(false);
  const [newAlly, setNewAlly] = useState({ name: '', table_name: '', category: 'Aliados' });
  
  // Users Management State
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [userFormData, setUserFormData] = useState({ 
    full_name: '', 
    email: '', 
    role: 'editor', 
    status: 'active' 
  });
  
  // Profile Management State
  const [profileData, setProfileData] = useState({
    nombre: '',
    apellido: '',
    alias: '',
    correo: ''
  });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  
  // Security State
  const [securityData, setSecurityData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const fetchLogs = async (force: boolean = false) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllies = async (force: boolean = false) => {
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
      
      setAllies(alliesWithCounts);
    } catch (err) {
      console.error('Error fetching allies:', err);
    } finally {
      setLoadingAllies(false);
    }
  };

  const fetchUsers = async (force: boolean = false) => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAddUser = async () => {
    if (currentUserRole !== 'admin') {
      showToast('Solo los administradores pueden gestionar usuarios.', 'error');
      return;
    }
    if (!userFormData.email) return;
    
    setLoadingUsers(true);
    try {
      const redirectToUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/auth/callback` 
        : 'http://localhost:3000/auth/callback';

      const { data, error } = await supabase.functions.invoke('invite-user', {
        body: {
          email: userFormData.email,
          full_name: userFormData.full_name,
          role: userFormData.role,
          redirectTo: redirectToUrl
        }
      });

      if (error) {
        let errorMsg = error.message;
        try {
          // If the error has a response context, try to parse the error message from the response body
          if (error && 'context' in error) {
            const context = (error as any).context;
            if (context && typeof context.text === 'function') {
              const bodyText = await context.text();
              const parsed = JSON.parse(bodyText);
              if (parsed?.error) errorMsg = parsed.error;
            }
          }
        } catch (_) {}
        throw new Error(errorMsg);
      }
      
      // Update profile with the selected role and set status to 'pending'
      const invitedUser = data?.data?.user;
      if (invitedUser?.id) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            role: userFormData.role,
            status: 'pending'
          })
          .eq('id', invitedUser.id);
          
        if (updateError) {
          console.error('Error updating user profile status to pending:', updateError);
        }
      }
      
      showAlert('Operación Exitosa', 'Invitación enviada con éxito.', 'success');
      setIsAddingUser(false);
      setUserFormData({ full_name: '', email: '', role: 'editor', status: 'active' });
      fetchUsers(true);
    } catch (err) {
      console.error('Error inviting user:', err);
      showAlert('Error al Enviar', 'Error al enviar invitación: ' + (err instanceof Error ? err.message : 'Error desconocido'), 'error');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUpdateUser = async (id: string) => {
    if (currentUserRole !== 'admin') {
      showToast('Solo los administradores pueden gestionar usuarios.', 'error');
      return;
    }
    try {
      const { error } = await supabase
        .from('profiles')
        .update(userFormData)
        .eq('id', id);
      
      if (error) throw error;
      setEditingUserId(null);
      setUserFormData({ full_name: '', email: '', role: 'editor', status: 'active' });
      showAlert('Operación Exitosa', 'Usuario actualizado con éxito.', 'success');
      fetchUsers(true);
    } catch (err) {
      console.error('Error updating user:', err);
      showToast('Error al actualizar usuario', 'error');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (currentUserRole !== 'admin') {
      showToast('Solo los administradores pueden gestionar usuarios.', 'error');
      return;
    }
    const confirmed = await showConfirm('¿Eliminar Usuario?', '¿Está seguro de eliminar este usuario? Los cambios no se podrán deshacer.', 'danger');
    if (!confirmed) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      showAlert('Operación Exitosa', 'Usuario eliminado con éxito.', 'success');
      fetchUsers(true);
    } catch (err) {
      console.error('Error deleting user:', err);
      showToast('Error al eliminar usuario', 'error');
    }
  };

  const handleResendInvite = async (user: any) => {
    if (currentUserRole !== 'admin') {
      showToast('Solo los administradores pueden gestionar usuarios.', 'error');
      return;
    }
    
    const confirmed = await showConfirm('Reenviar Invitación', `¿Está seguro de reenviar la invitación a ${user.email}?`, 'primary');
    if (!confirmed) return;

    try {
      // Determine target redirect url
      const redirectToUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/auth/callback` 
        : 'http://localhost:3000/auth/callback';

      const { error } = await supabase.functions.invoke('invite-user', {
        body: {
          email: user.email,
          full_name: user.full_name || '',
          role: user.role || 'editor',
          redirectTo: redirectToUrl
        }
      });

      if (error) {
        let errorMsg = error.message;
        try {
          if (error && 'context' in error) {
            const context = (error as any).context;
            if (context && typeof context.text === 'function') {
              const bodyText = await context.text();
              const parsed = JSON.parse(bodyText);
              if (parsed?.error) errorMsg = parsed.error;
            }
          }
        } catch (_) {}
        throw new Error(errorMsg);
      }

      showAlert('Operación Exitosa', 'Enlace de invitación reenviado con éxito.', 'success');
      fetchUsers(true);
    } catch (err) {
      console.error('Error resending invite:', err);
      showAlert('Error al Reenviar', 'Error al reenviar la invitación: ' + (err instanceof Error ? err.message : 'Error desconocido'), 'error');
    }
  };

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setProfileData({
          nombre: data.nombre || data.full_name?.split(' ')[0] || '',
          apellido: data.apellido || data.full_name?.split(' ').slice(1).join(' ') || '',
          alias: data.alias || '',
          correo: data.email || user.email || ''
        });
      } else {
        setProfileData(prev => ({ ...prev, correo: user.email || '' }));
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleUpdateProfile = async () => {
    setSavingProfile(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          nombre: profileData.nombre,
          apellido: profileData.apellido,
          alias: profileData.alias,
          full_name: `${profileData.nombre} ${profileData.apellido}`.trim(),
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      showToast('Perfil actualizado con éxito', 'success');
    } catch (err) {
      console.error('Error updating profile:', err);
      showToast('Error al actualizar el perfil', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!securityData.newPassword || !securityData.confirmPassword) {
      showToast('Por favor, complete ambos campos', 'warning');
      return;
    }
    if (securityData.newPassword !== securityData.confirmPassword) {
      showToast('Las contraseñas no coinciden', 'warning');
      return;
    }
    if (securityData.newPassword.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres', 'warning');
      return;
    }

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: securityData.newPassword
      });
      
      if (error) throw error;
      
      showToast('Contraseña actualizada con éxito', 'success');
      setSecurityData({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Error updating password:', err);
      showToast('Error al actualizar la contraseña', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  // Fetch current user's profile and role on mount
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        setCurrentUserEmail(user.email || '');

        // Secure bypass for super admins to ensure they always have all options
        if (user.email === 'edcastilloblanco@gmail.com' || user.email === 'edycb2025@gmail.com') {
          setCurrentUserRole('admin');
          setLoadingRole(false);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setCurrentUserRole(data.role || 'editor');
        } else {
          setCurrentUserRole('editor');
        }
      } catch (err) {
        console.error('Error fetching user role:', err);
        setCurrentUserRole('editor');
      } finally {
        setLoadingRole(false);
      }
    };
    loadCurrentUser();
  }, []);

  // Reset tab to profile if a non-admin tries to access admin tabs
  useEffect(() => {
    if (!loadingRole && currentUserRole !== 'admin' && ['users', 'allies', 'activity'].includes(activeTab)) {
      setActiveTab('profile');
    }
  }, [activeTab, currentUserRole, loadingRole]);

  useEffect(() => {
    if (activeTab === 'activity' && currentUserRole === 'admin') {
      fetchLogs();
    } else if (activeTab === 'allies' && currentUserRole === 'admin') {
      fetchAllies();
    } else if (activeTab === 'users' && currentUserRole === 'admin') {
      fetchUsers();
    } else if (activeTab === 'profile') {
      fetchProfile();
    }
  }, [activeTab, currentUserRole]);

  const handleUpdateAllyName = async (id: string) => {
    if (currentUserRole !== 'admin') {
      showToast('Solo los administradores pueden gestionar aliados.', 'error');
      return;
    }
    try {
      const { error } = await supabase
        .from('allies_config')
        .update({ name: editName })
        .eq('id', id);
      
      if (error) throw error;
      setEditingAllyId(null);
      showToast('Nombre de aliado actualizado', 'success');
      fetchAllies(true);
    } catch (err) {
      console.error('Error updating ally:', err);
      showToast('Error al actualizar el nombre del aliado', 'error');
    }
  };

  const handleAddAlly = async () => {
    if (currentUserRole !== 'admin') {
      showToast('Solo los administradores pueden gestionar aliados.', 'error');
      return;
    }
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
      showToast('Aliado añadido con éxito', 'success');
      fetchAllies(true);
    } catch (err) {
      console.error('Error adding ally:', err);
      showAlert('Error al Añadir', 'Error al añadir aliado. Asegúrese de que el nombre de tabla sea único.', 'error');
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
            {loadingRole ? (
              // Skeleton loaders for tabs
              Array(2).fill(0).map((_, i) => (
                <div key={i} className="h-12 w-full bg-slate-100/50 rounded-xl animate-pulse border border-outline-variant/30" />
              ))
            ) : (
              [
                { id: 'profile', label: 'Mi Perfil', icon: User },
                { id: 'security', label: 'Seguridad', icon: Shield },
                ...(currentUserRole === 'admin' ? [
                  { id: 'users', label: 'Gestión de Usuarios', icon: UsersIcon },
                  { id: 'allies', label: 'Gestión de Aliados', icon: Building2 },
                  { id: 'activity', label: 'Activity Log', icon: History }
                ] : [])
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
              ))
            )}
          </div>

          {/* Content Area */}
          <div className="lg:col-span-9 bg-white border border-outline-variant rounded-[32px] overflow-hidden shadow-sm min-h-[600px]">
            {activeTab === 'activity' && currentUserRole === 'admin' && (
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

            {activeTab === 'allies' && currentUserRole === 'admin' && (
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

            {activeTab === 'users' && currentUserRole === 'admin' && (
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-outline-variant bg-slate-50/50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <UsersIcon className="w-5 h-5 text-primary" />
                    <h2 className="font-black text-primary uppercase tracking-widest text-sm">Gestión de Usuarios del Sistema</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setIsAddingUser(true);
                        setEditingUserId(null);
                        setUserFormData({ full_name: '', email: '', role: 'editor', status: 'active' });
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                    >
                      <UserPlus className="w-3 h-3" />
                      Añadir Usuario
                    </button>
                    <button 
                      onClick={() => fetchUsers(true)}
                      className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-outline-variant"
                    >
                      <RefreshCw className={cn("w-4 h-4 text-primary", loadingUsers && "animate-spin")} />
                    </button>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[600px]">
                  {(isAddingUser || editingUserId) && (
                    <div className="mb-6 p-6 bg-primary/5 rounded-3xl border border-primary/10 animate-in fade-in zoom-in-95 duration-200">
                      <h3 className="text-sm font-black uppercase text-primary mb-4">
                        {editingUserId ? 'Editar Usuario' : 'Nuevo Usuario'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-[10px] font-bold text-outline uppercase mb-1 block">Nombre Completo</label>
                          <input 
                            type="text" 
                            className="w-full px-4 py-2 rounded-lg border border-outline-variant focus:border-primary outline-none text-sm font-bold"
                            placeholder="Ej: Juan Pérez"
                            value={userFormData.full_name}
                            onChange={(e) => setUserFormData({...userFormData, full_name: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-outline uppercase mb-1 block">Correo Electrónico</label>
                          <input 
                            type="email" 
                            className="w-full px-4 py-2 rounded-lg border border-outline-variant focus:border-primary outline-none text-sm font-bold"
                            placeholder="juan@ejemplo.com"
                            value={userFormData.email}
                            onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                            disabled={!!editingUserId}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-outline uppercase mb-1 block">Rol</label>
                          <select 
                            className="w-full px-4 py-2 rounded-lg border border-outline-variant focus:border-primary outline-none text-sm font-bold bg-white"
                            value={userFormData.role}
                            onChange={(e) => setUserFormData({...userFormData, role: e.target.value})}
                          >
                            <option value="admin">Administrador</option>
                            <option value="editor">Editor</option>
                            <option value="viewer">Lector</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-outline uppercase mb-1 block">Estatus</label>
                          <select 
                            className="w-full px-4 py-2 rounded-lg border border-outline-variant focus:border-primary outline-none text-sm font-bold bg-white"
                            value={userFormData.status}
                            onChange={(e) => setUserFormData({...userFormData, status: e.target.value})}
                          >
                            <option value="active">Activo</option>
                            <option value="pending">Pendiente</option>
                            <option value="inactive">Inactivo</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => {
                            setIsAddingUser(false);
                            setEditingUserId(null);
                          }}
                          className="px-4 py-2 rounded-lg text-xs font-bold uppercase text-outline hover:bg-slate-100"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={() => editingUserId ? handleUpdateUser(editingUserId) : handleAddUser()}
                          className="px-6 py-2 bg-primary text-white rounded-lg text-xs font-black uppercase tracking-widest"
                        >
                          {editingUserId ? 'Actualizar Usuario' : 'Guardar Usuario'}
                        </button>
                      </div>
                    </div>
                  )}

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
                                user.status === 'active' ? "text-green-500" : 
                                user.status === 'pending' ? "text-amber-500" : "text-red-500"
                              )}>
                                {user.status === 'active' ? '● Activo' : 
                                 user.status === 'pending' ? '◒ Pendiente' : '○ Inactivo'}
                              </p>
                              <p className="text-[9px] font-bold text-outline uppercase tracking-widest mt-1">
                                Miembro desde {new Date(user.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                              <button 
                                onClick={() => {
                                  setEditingUserId(user.id);
                                  setIsAddingUser(false);
                                  setUserFormData({
                                    full_name: user.full_name || '',
                                    email: user.email,
                                    role: user.role || 'editor',
                                    status: user.status || 'active'
                                  });
                                }}
                                className="p-2 hover:bg-slate-100 rounded-xl transition-all"
                                title="Editar Usuario"
                              >
                                <Edit2 className="w-4 h-4 text-primary" />
                              </button>
                              {user.status === 'pending' && (
                                <button 
                                  onClick={() => handleResendInvite(user)}
                                  className="p-2 hover:bg-amber-50 rounded-xl transition-all"
                                  title="Reenviar Invitación"
                                >
                                  <Mail className="w-4 h-4 text-amber-500" />
                                </button>
                              )}
                              {user.email !== 'edcastilloblanco@gmail.com' && user.email !== currentUserEmail && (
                                <button 
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="p-2 hover:bg-red-50 rounded-xl transition-all"
                                  title="Eliminar Usuario"
                                >
                                  <Trash2 className="w-4 h-4 text-red-400" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-outline-variant bg-slate-50/50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-primary" />
                    <h2 className="font-black text-primary uppercase tracking-widest text-sm">Mi Perfil Personal</h2>
                  </div>
                </div>
                
                <div className="p-8 max-w-2xl">
                  {loadingProfile ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                      <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-xs font-black text-outline uppercase tracking-widest">Cargando perfil...</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="flex items-center gap-6 mb-10">
                        <div className="w-24 h-24 rounded-[32px] bg-primary/5 border-2 border-primary/10 flex items-center justify-center text-primary text-3xl font-black shadow-inner">
                          {profileData.nombre?.charAt(0) || profileData.correo?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-on-surface uppercase tracking-tight">Configuración de Cuenta</h3>
                          <p className="text-xs font-bold text-outline uppercase tracking-widest mt-1">Gestione su identidad en el CRM</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Nombre</label>
                          <input 
                            type="text" 
                            className="w-full px-5 py-3 rounded-2xl border border-outline-variant bg-surface-container-lowest focus:border-primary outline-none text-sm font-bold transition-all"
                            value={profileData.nombre}
                            onChange={(e) => setProfileData({...profileData, nombre: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Apellido</label>
                          <input 
                            type="text" 
                            className="w-full px-5 py-3 rounded-2xl border border-outline-variant bg-surface-container-lowest focus:border-primary outline-none text-sm font-bold transition-all"
                            value={profileData.apellido}
                            onChange={(e) => setProfileData({...profileData, apellido: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Alias / Nickname</label>
                          <input 
                            type="text" 
                            className="w-full px-5 py-3 rounded-2xl border border-outline-variant bg-surface-container-lowest focus:border-primary outline-none text-sm font-bold transition-all"
                            value={profileData.alias}
                            onChange={(e) => setProfileData({...profileData, alias: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Correo Electrónico</label>
                          <input 
                            type="email" 
                            className="w-full px-5 py-3 rounded-2xl border border-outline-variant bg-slate-50 text-outline outline-none text-sm font-bold transition-all"
                            value={profileData.correo}
                            disabled
                          />
                        </div>
                      </div>

                      <div className="pt-6">
                        <button 
                          onClick={handleUpdateProfile}
                          disabled={savingProfile}
                          className="w-full md:w-auto px-10 py-4 bg-primary text-white rounded-[20px] text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                          {savingProfile ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          {savingProfile ? 'Guardando...' : 'Actualizar Perfil'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-outline-variant bg-slate-50/50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <h2 className="font-black text-primary uppercase tracking-widest text-sm">Seguridad de la Cuenta</h2>
                  </div>
                </div>
                
                <div className="p-8 max-w-2xl">
                  <div className="space-y-8">
                    <div className="flex items-center gap-6 mb-10">
                      <div className="w-20 h-20 rounded-3xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                        <Lock className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-on-surface uppercase tracking-tight">Cambiar Contraseña</h3>
                        <p className="text-xs font-bold text-outline uppercase tracking-widest mt-1">Asegure su acceso al sistema</p>
                      </div>
                    </div>

                    <div className="bg-slate-50/50 border border-outline-variant p-6 rounded-3xl space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                          <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Nueva Contraseña</label>
                          <button 
                            onClick={() => setShowPasswords(!showPasswords)}
                            className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline"
                          >
                            {showPasswords ? 'Ocultar' : 'Mostrar'}
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                          <input 
                            type={showPasswords ? "text" : "password"} 
                            className="w-full pl-12 pr-5 py-3 rounded-2xl border border-outline-variant bg-white focus:border-primary outline-none text-sm font-bold transition-all"
                            placeholder="Mínimo 6 caracteres"
                            value={securityData.newPassword}
                            onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Confirmar Nueva Contraseña</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                          <input 
                            type={showPasswords ? "text" : "password"} 
                            className="w-full pl-12 pr-5 py-3 rounded-2xl border border-outline-variant bg-white focus:border-primary outline-none text-sm font-bold transition-all"
                            placeholder="Repita su contraseña"
                            value={securityData.confirmPassword}
                            onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                      <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-[10px] font-bold text-on-surface-variant leading-relaxed">
                        Le recomendamos utilizar una contraseña fuerte que incluya letras, números y caracteres especiales. No comparta su contraseña con terceros.
                      </p>
                    </div>

                    <div className="pt-4">
                      <button 
                        onClick={handleUpdatePassword}
                        disabled={savingPassword}
                        className="w-full md:w-auto px-10 py-4 bg-primary text-white rounded-[20px] text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {savingPassword ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {savingPassword ? 'Actualizando...' : 'Cambiar Contraseña'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
