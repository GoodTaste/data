const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Set output directory to the root of the repository using GITHUB_WORKSPACE
const outputDir = path.join(process.env.GITHUB_WORKSPACE || '.', 'public-data');

// Ensure the 'public-data' directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function hasDataChanged(filePath, newData) {
  if (!fs.existsSync(filePath)) {
    return true;
  }

  const existingData = fs.readFileSync(filePath, 'utf8');
  return existingData !== JSON.stringify(newData, null, 2);
}

async function fetchAndSaveData(functionName, fileName) {
  const { data, error } = await supabase.rpc(functionName);

  if (error) {
    console.error(`Error fetching data for ${functionName}:`, error);
    process.exit(1);
  }

  const filePath = path.join(outputDir, fileName);
  console.log(`Writing data to ${filePath}`);
  
  if (hasDataChanged(filePath, data)) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Data successfully written to ${filePath}`);
    return true;
  } else {
    console.log(`No changes detected for ${fileName}.`);
    return false;
  }
}

async function run() {
  const updates = await Promise.all([
    fetchAndSaveData('export_open_brands_json', 'brands.json'),
    fetchAndSaveData('export_open_producers_json', 'producers.json'),
    fetchAndSaveData('export_open_certifications_json', 'certifications.json'),
  ]);

  const dataChanged = updates.includes(true);
  console.log(`Data changed: ${dataChanged}`);

  // Use environment file instead of deprecated `set-output`
  const outputFile = process.env.GITHUB_ENV;
  fs.appendFileSync(outputFile, `DATA_CHANGED=${dataChanged}\n`);

  if (!dataChanged) {
    console.log("No data changes detected. Exiting without updates.");
    process.exit(0);
  }
}

run();