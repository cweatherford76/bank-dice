import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pwfhgylrzizabbypnxrl.supabase.co';
const supabaseKey = 'sb_secret_Fvb5JV_5GW3lrqrjFpfbSQ_gxK247_F';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing with secret key...');
  const { data, error } = await supabase
    .from('games')
    .insert({ join_code: 'TESTJS02', status: 'setup' })
    .select()
    .single();
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success:', data);
  }
}

test();
