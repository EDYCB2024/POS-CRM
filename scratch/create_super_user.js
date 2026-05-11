const { createClient } = require('@supabase/supabase-js');

const url = 'https://jfpxuvhmqufdxuodwtii.supabase.co';
const serviceRole = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmcHh1dmhtcXVmZHh1b2R3dGlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzkwMTQwNiwiZXhwIjoyMDkzNDc3NDA2fQ.5lEaTVgluYw6g8yZRhuggKnVpyklnGmqI364JgmhCxA';

const supabase = createClient(url, serviceRole, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createSuperUser() {
  const email = 'edcastilloblanco@gmail.com';
  const password = 'Poscrm*2026';

  console.log(`Intentando crear/actualizar super usuario: ${email}`);

  // 1. Intentar crear el usuario
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: 'Eduardo Castillo (Super Admin)' }
  });

  if (error) {
    if (error.message.includes('already registered')) {
      console.log('El usuario ya existe. Actualizando credenciales...');
      const { data: users } = await supabase.auth.admin.listUsers();
      const existingUser = users.users.find(u => u.email === email);
      if (existingUser) {
        await supabase.auth.admin.updateUserById(existingUser.id, { password });
        await supabase.from('profiles').upsert({
          id: existingUser.id,
          email,
          full_name: 'Eduardo Castillo (Super Admin)',
          role: 'admin',
          status: 'active'
        });
        console.log('Credenciales actualizadas correctamente.');
      }
    } else {
      console.error('Error:', error.message);
    }
  } else {
    // Perfil
    await supabase.from('profiles').upsert({
      id: data.user.id,
      email,
      full_name: 'Eduardo Castillo (Super Admin)',
      role: 'admin',
      status: 'active'
    });
    console.log('Super usuario creado correctamente.');
  }
}

createSuperUser();
