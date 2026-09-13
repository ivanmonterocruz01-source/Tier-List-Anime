// ============================================================
// CONFIGURACIÓN DE SUPABASE
// ============================================================
// OJO: la variable se llama "supabaseClient" (no "supabase"),
// porque la librería cargada desde el CDN ya usa el nombre global
// "supabase" internamente. Si la llamamos igual, el navegador da
// error de "Identifier already decgfdñolhtdlom
// ============================================================

const SUPABASE_URL = "https://kaneoxtzwihejtpdiqqh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthbmVveHR6d2loZWp0cGRpcXFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNTU0NzYsImV4cCI6MjEwNDczMTQ3Nn0.CQWOhQXHutE72CDqVe4S2-6zGWv2rRYZoXGQx35jwZA";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);