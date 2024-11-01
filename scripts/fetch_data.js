const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Function to call a Supabase RPC and save to a file
async function fetchAndSaveData(functionName, fileName) {
  const { data, error } = await supabase.rpc(functionName);

  if (error) {
    console.error(`Error fetching data for ${functionName}:`, error);
    process.exit(1);
  }

  fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
  console.log(`Data successfully written to ${fileName}`);
}

// Main function to call each export function
async function run() {
  await fetchAndSaveData('export_open_brands_json', 'open_brands.json');
  await fetchAndSaveData('export_open_producers_json', 'open_producers.json');
  await fetchAndSaveData('export_open_certifications_json', 'open_certifications.json');
}

run();