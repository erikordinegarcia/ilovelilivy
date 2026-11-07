// =====================================================
// CONEXÃO COM O SUPABASE
// Preencha com os dados do projeto em:
// Supabase > Project Settings > API (Project URL e anon public key)
// A chave "anon" é pública por natureza; a segurança vem das regras RLS
// definidas em supabase/schema.sql. NUNCA coloque a "service_role" aqui.
// =====================================================
const SUPABASE_URL = 'https://oqljjceleerkeypftykl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xbGpqY2VsZWVya2V5cGZ0eWtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwMTIyNTEsImV4cCI6MjEwOTU4ODI1MX0.age79Ou9CMT_pYM6SVOwKA8ibIMj04hcHmAkk5FHOpI';

const SUPABASE_CONFIGURADO = /^https:\/\/.+\.supabase\.co/.test(SUPABASE_URL);

const supabaseClient =
  SUPABASE_CONFIGURADO && window.supabase
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

const PRODUCT_BUCKET = 'product-images';
const CATEGORIAS = {
  brincos: 'Brincos',
  pulseiras: 'Pulseiras',
  bolsas: 'Bolsas',
  colares: 'Colares'
};
