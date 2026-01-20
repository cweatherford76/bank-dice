import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pwfhgylrzizabbypnxrl.supabase.co';
const supabaseKey = 'ce528a77-065c-4473-98e8-cba77a55793c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing with JWT key...');
  const { data, error } = await supabase
    .from('games')
    .insert({ join_code: 'TESTJS01', status: 'setup' })
    .select()
    .single();
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success:', data);
  }
}

test();
