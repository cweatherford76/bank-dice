import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('Supabase URL:', url);
  console.log('Supabase Key exists:', !!key, 'length:', key?.length);
  
  if (!url || !key) {
    console.error('Missing Supabase credentials!');
  }
  
  return createBrowserClient(url!, key!);
}
