import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function createSuperUser() {
  const email = 'edcastilloblanco@gmail.com'
  const password = 'Poscrm*2026'

  console.log(`Intentando crear/actualizar super usuario: ${email}`)

  // 1. Crear el usuario en Auth
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: 'Eduardo Castillo (Super Admin)' }
  })

  if (userError) {
    if (userError.message.includes('already registered')) {
      console.log('El usuario ya existe en Auth. Actualizando contraseña y rol...')
      
      // Obtener el ID del usuario existente
      const { data: users } = await supabase.auth.admin.listUsers()
      const existingUser = users.users.find(u => u.email === email)
      
      if (existingUser) {
        await supabase.auth.admin.updateUserById(existingUser.id, { password })
        await supabase.from('profiles').upsert({
          id: existingUser.id,
          email,
          full_name: 'Eduardo Castillo (Super Admin)',
          role: 'admin',
          status: 'active'
        })
        console.log('Usuario actualizado con éxito.')
      }
    } else {
      console.error('Error al crear usuario:', userError.message)
      return
    }
  } else if (userData.user) {
    // 2. Crear el perfil en public.profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userData.user.id,
        email,
        full_name: 'Eduardo Castillo (Super Admin)',
        role: 'admin',
        status: 'active'
      })

    if (profileError) {
      console.error('Error al crear perfil:', profileError.message)
    } else {
      console.log('Super usuario creado exitosamente.')
    }
  }
}

createSuperUser()
