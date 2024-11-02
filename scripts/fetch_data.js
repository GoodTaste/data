const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Directory for output files
const outputDir = path.join(__dirname, '..', 'public-data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Function to check if file content has changed
function hasDataChanged(filePath, newData) {
  if (!fs.existsSync(filePath)) {
    return true; // File doesn't exist, so data has "changed"
  }
  const existingData = fs.readFileSync(filePath, 'utf8');
  return existingData !== JSON.stringify(newData, null, 2);
}

// Function to call a Supabase RPC, save data if changed, and return if updated
async function fetchAndSaveData(functionName, fileName) {
  const { data, error } = await supabase.rpc(functionName);

  if (error) {
    console.error(`Error fetching data for ${functionName}:`, error);
    process.exit(1);
  }

  const filePath = path.join(outputDir, fileName);
  if (hasDataChanged(filePath, data)) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Data successfully written to ${filePath}`);
    return true; // Indicates data was updated
  } else {
    console.log(`No changes in data for ${fileName}. Skipping update.`);
    return false; // No update needed
  }
}

// Main function to fetch and save data
async function run() {
  const updates = await Promise.all([
    fetchAndSaveData('export_open_brands_json', 'brands.json'),
    fetchAndSaveData('export_open_producers_json', 'producers.json'),
    fetchAndSaveData('export_open_certifications_json', 'certifications.json'),
  ]);

  // Check if any updates were made
  const dataChanged = updates.includes(true);
  
  // Set output for GitHub Actions
  console.log(`::set-output name=DATA_CHANGED::${dataChanged}`);

  // Exit successfully if no updates were made
  if (!dataChanged) {
    console.log("No data changes detected. Exiting without updates.");
    process.exit(0);
  }
}

run();
