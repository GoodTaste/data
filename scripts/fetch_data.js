const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Function to call a Supabase RPC and save to a file
async function fetchAndSaveData(functionName, fileName) {
  const { data, error } = await supabase.rpc(functionName);

  if (error) {
    console.error(`Error fetching data for ${functionName}:`, error);
    process.exit(1);
  }

  const filePath = path.join('public-data', fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Data successfully written to ${filePath}`);
}

// Main function to call each export function
async function run() {
  await fetchAndSaveData('export_open_brands_json', 'brands.json');
  await fetchAndSaveData('export_open_producers_json', 'producers.json');
  await fetchAndSaveData('export_open_certifications_json', 'certifications.json');
}

run();