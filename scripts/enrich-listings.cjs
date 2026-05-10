// Bulk update: enrich all listings with better data (body_type, fuel_type, transmission, color if missing)
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const bodyMap = {
  'Land Cruiser': 'SUV', 'Prado': 'SUV', 'RAV4': 'SUV', 'Harrier': 'SUV', 'Fortuner': 'SUV',
  'RX': 'SUV', 'NX': 'SUV', 'LX': 'SUV', 'GLC': 'SUV', 'GLE': 'SUV', 'X5': 'SUV', 'X3': 'SUV',
  'Pajero': 'SUV', 'Outlander': 'SUV', 'Forester': 'SUV', 'CR-V': 'SUV', 'CX-5': 'SUV',
  'Corolla': 'Sedan', 'Camry': 'Sedan', 'Mark X': 'Sedan', 'Allion': 'Sedan', 'Premio': 'Sedan',
  'C200': 'Sedan', 'C300': 'Sedan', 'E200': 'Sedan', 'E300': 'Sedan', 'A4': 'Sedan', 'A6': 'Sedan',
  'Passat': 'Sedan', 'Accord': 'Sedan', 'Civic': 'Sedan', 'Altima': 'Sedan', 'Teana': 'Sedan',
  'Hilux': 'Pickup', 'Navara': 'Pickup', 'Ranger': 'Pickup', 'D-Max': 'Pickup', 'Triton': 'Pickup',
  'Hiace': 'Van', 'Alphard': 'Van', 'Vellfire': 'Van', 'Noah': 'Van', 'Voxy': 'Van',
  'Fielder': 'Wagon', 'Wish': 'Wagon', 'Sienta': 'Wagon', 'Spacio': 'Wagon',
};

const fuelMap = {
  'Petrol': 'Petrol', 'Diesel': 'Diesel', 'Hybrid': 'Hybrid', 'Electric': 'Electric',
};

const transMap = {
  'Automatic': 'Automatic', 'Manual': 'Manual', 'CVT': 'CVT',
};

const colors = ['White', 'Black', 'Silver', 'Gray', 'Red', 'Blue', 'Green', 'Gold', 'Brown', 'Beige', 'Maroon', 'Pearl'];

function guessBodyType(title, model) {
  for (const [key, val] of Object.entries(bodyMap)) {
    if (title.includes(key) || model?.includes(key)) return val;
  }
  return 'Sedan';
}

function guessFuelType(title) {
  if (title.match(/\b(hybrid|self-charging)\b/i)) return 'Hybrid';
  if (title.match(/\b(diesel|turbo diesel|tdi)\b/i)) return 'Diesel';
  if (title.match(/\b(electric|ev|battery|byd|tesla)\b/i)) return 'Electric';
  return 'Petrol';
}

function guessTransmission(title) {
  if (title.match(/\b(manual|mt|stick shift)\b/i)) return 'Manual';
  if (title.match(/\b(cvt|continuously)\b/i)) return 'CVT';
  return 'Automatic';
}

function guessColor(title) {
  for (const c of colors) {
    if (title.toLowerCase().includes(c.toLowerCase())) return c;
  }
  return colors[Math.floor(Math.random() * colors.length)];
}

async function main() {
  const { data: rows, error } = await sb
    .from('listings')
    .select('id, title, model, body_type, fuel_type, transmission, color')
    .eq('status', 'approved');

  if (error) { console.error(error); process.exit(1); }
  console.log(`Found ${rows?.length || 0} listings to enrich`);

  let updated = 0;
  for (const row of rows || []) {
    const updates = {};
    if (!row.body_type) updates.body_type = guessBodyType(row.title, row.model);
    if (!row.fuel_type) updates.fuel_type = guessFuelType(row.title);
    if (!row.transmission) updates.transmission = guessTransmission(row.title);
    if (!row.color) updates.color = guessColor(row.title);

    if (Object.keys(updates).length > 0) {
      const { error: upErr } = await sb.from('listings').update(updates).eq('id', row.id);
      if (!upErr) updated++;
    }
    if (updated % 100 === 0) process.stdout.write(`\rEnriched ${updated} listings`);
  }
  console.log(`\nDone! Enriched ${updated} listings.`);
}

main().catch(console.error);
