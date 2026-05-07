import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const logActivity = async (action: string, entity: string, details: any) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('activity_logs').insert({
      action,
      entity,
      details,
      user_email: user?.email || 'Anonymous'
    })
  } catch (err) {
    console.error('Error logging activity:', err)
  }
}
