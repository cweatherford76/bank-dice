import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pwfhgylrzizabbypnxrl.supabase.co';
const supabaseKey = 'sb_publishable_yWXk9FLVnjfzz4cYS5SoJw_344pUumU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing with publishable key...');
  const { data, error } = await supabase
    .from('games')
    .insert({ join_code: 'TESTPUB1', status: 'setup' })
    .select()
    .single();
  
  if (error) {
    console.error('Error:', JSON.stringify(error, null, 2));
  } else {
    console.log('Success:', JSON.stringify(data, null, 2));
  }
}

test();
