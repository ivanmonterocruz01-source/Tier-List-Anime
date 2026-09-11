// ============================================================
// CONFIGURACIÓN DE SUPABASE
// ============================================================
// Sustituye estos dos valores por los de TU proyecto de Supabase.
// Los encuentras en: Project Settings -> API
//   - "Project URL"       -> SUPABASE_URL
//   - "anon public" key   -> SUPABASE_ANON_KEY
// Es seguro que esta "anon key" esté visible en el frontend:
// está diseñada para eso, la seguridad real la da RLS (Row Level
// Security) en la base de datos, que configuramos en el SQL.
// ============================================================

const SUPABASE_URL = "https://kaneoxtzwihejtpdiqqh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthbmVveHR6d2loZWp0cGRpcXFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNTU0NzYsImV4cCI6MjEwNDczMTQ3Nn0.CQWOhQXHutE72CDqVe4S2-6zGWv2rRYZoXGQx35jwZA";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
