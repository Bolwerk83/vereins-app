// Supabase-Zugang (der publishable Key ist für den Browser bestimmt und
// gibt ohne Login bzw. gültige RLS-Policy keinerlei Daten preis).
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://phpkyzujpvrsypqqptlv.supabase.co'
export const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_gr_p1cF8VPZtPeXzIYiAmw_t7C1jT_x'
