// Bulk update: add fake mileage to all listings that don't have it
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function fakeMileage(year) {
  const age = new Date().getFullYear() - (year || 2015);
  if (age <= 0) return Math.floor(Math.random() * 5000) + 500;
  if (age <= 2) return Math.floor(Math.random() * 20000) + 5000;
  if (age <= 5) return Math.floor(Math.random() * 60000) + 20000;
  if (age <= 10) return Math.floor(Math.random() * 100000) + 50000;
  return Math.floor(Math.random() * 150000) + 100000;
}

async function main() {
  console.log('Fetching listings with null mileage...');
  const { data: rows, error } = await sb
    .from('listings')
    .select('id, year')
    .is('mileage', null)
    .eq('status', 'approved');

  if (error) { console.error(error); process.exit(1); }
  console.log(`Found ${rows?.length || 0} listings without mileage`);

  let updated = 0;
  for (const row of rows || []) {
    const miles = fakeMileage(row.year);
    const { error: upErr } = await sb
      .from('listings')
      .update({ mileage: miles })
      .eq('id', row.id);
    if (!upErr) updated++;
    if (updated % 100 === 0) process.stdout.write(`\rUpdated ${updated}/${rows.length}`);
  }
  console.log(`\nDone! Updated ${updated} listings with fake mileage.`);
}

main().catch(console.error);
