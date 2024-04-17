import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ltsimenqyeaglhukmwti.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0c2ltZW5xeWVhZ2xodWttd3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMzMTkzMjYsImV4cCI6MjAyODg5NTMyNn0.GDviTOuUD1u1kQ6CYGzHSG_Gje6rnWr7bek21Gpl6Ws"
export const supabase = createClient(supabaseUrl, supabaseKey)