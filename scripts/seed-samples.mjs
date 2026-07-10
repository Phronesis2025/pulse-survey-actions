// Seeds ~15 realistic sample action items through the public API
// (POST /api/action-items) — the same path the submit form uses — so RLS,
// validation, and route logic are all exercised. Re-runnable after a wipe.
//
//   npm run seed                          # against http://localhost:3000
//   SEED_BASE_URL=https://… npm run seed  # against a deployment
//
// Requires the dev server (or deployment) to be reachable and the lookup
// tables to contain the data from 001_initial_schema.sql.

const BASE_URL = process.env.SEED_BASE_URL || 'http://localhost:3000';

async function getJson(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

// Date offsets are relative to "today" so overdue items stay overdue no
// matter when the script is re-run. null = no target date.
function daysFromNow(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Category / sub-category names reference 001_initial_schema.sql seed data.
// subCategory matches by case-insensitive prefix (full names are long).
const SAMPLE_ITEMS = [
  {
    action_item: 'Improve break room ventilation — several teams report stuffy air by mid-afternoon',
    site: 'Maple Grove Campus', category: 'Indoor Environmental Quality', subCategory: 'Other',
    status: 'In Progress', dueInDays: 21, user_name: 'Dana Whitfield',
    notes: 'Recurring theme in Q2 pulse survey. Assigned to HVAC vendor (Air-Flow Co.) for duct assessment.',
  },
  {
    action_item: "Repair the leaking faucet in the 2nd-floor men's restroom",
    site: 'Northgate Campus', category: 'Restroom/Bathroom Issues', subCategory: 'Other',
    status: 'Pending', dueInDays: -9, user_name: 'Miguel Santos', // overdue
    notes: 'Assigned to on-site plumber; replacement cartridge on order.',
  },
  {
    action_item: 'Deep-clean carpets in the northeast cubicle block',
    site: 'Willow Creek Campus', category: 'Office/Cube Cleaning & Maintenance', subCategory: 'Cleanliness of the office areas',
    status: 'Completed', dueInDays: -14, user_name: 'Priya Raman',
    notes: 'Completed by janitorial crew; second pass done over the weekend.',
  },
  {
    action_item: 'Replace burnt-out light fixtures in the main lobby',
    site: 'Summit Campus', category: 'Building Maintenance & Repairs', subCategory: 'Cleanliness of the building lobbies',
    status: 'Completed', dueInDays: -30, user_name: 'Alex Chen',
    notes: '',
  },
  {
    action_item: 'Re-stripe visitor parking spaces and add EV charging signage',
    site: 'Meridian Campus', category: 'Building Maintenance & Repairs', subCategory: 'Cleanliness of the building exterior',
    status: 'On Hold', dueInDays: 45, user_name: 'Jordan Baker',
    notes: 'On hold pending FY budget approval. Assigned to grounds contractor once released.',
  },
  {
    action_item: 'Fix the wobbly conference table in room B204',
    site: 'Riverside Campus', category: 'Conference Room & Meeting Space Issues', subCategory: 'Other',
    status: 'Pending', dueInDays: null, user_name: 'Sam Okafor', // no date
    notes: '',
  },
  {
    action_item: 'Restock restroom paper towel dispensers more frequently during peak hours',
    site: 'Highland Park Campus', category: 'Restroom/Bathroom Issues', subCategory: 'Cleanliness of the restrooms',
    status: 'In Progress', dueInDays: 7, user_name: 'Elena Petrova',
    notes: 'Janitorial schedule updated; monitoring for two weeks. Owner: facilities lead (R. Ortiz).',
  },
  {
    action_item: 'Adjust HVAC weekend schedule for the warehouse shift',
    site: 'Cedar Valley Plant', category: 'Indoor Environmental Quality', subCategory: 'Other',
    status: 'In Progress', dueInDays: -3, user_name: 'Chris Doyle', // overdue
    notes: 'Assigned to building controls tech; awaiting BMS vendor access.',
  },
  {
    action_item: 'Set up a weekly deep-clean rotation for kitchenette refrigerators',
    site: 'Bayfront Campus', category: 'Office/Cube Cleaning & Maintenance', subCategory: 'Cleanliness of the kitchenettes',
    status: 'Completed', dueInDays: -7, user_name: 'Fatima Al-Sayed',
    notes: 'Rotation posted on each fridge; first cycle completed.',
  },
  {
    action_item: 'Replace stained ceiling tiles near the east stairwell',
    site: 'Lakeshore Campus', category: 'Building Maintenance & Repairs', subCategory: 'General maintenance',
    status: 'Pending', dueInDays: 30, user_name: 'Rob Jenkins',
    notes: 'Water stain traced to a repaired roof leak — tiles only, no active moisture.',
  },
  {
    action_item: 'Add recycling bins to all breakrooms',
    site: 'Southgate Campus', category: 'Office/Cube Cleaning & Maintenance', subCategory: 'Cleanliness of the kitchenettes',
    status: 'In Progress', dueInDays: 14, user_name: 'Grace Liu',
    notes: 'Bins delivered; assigned to porters for placement and signage.',
  },
  {
    action_item: 'Fix the squeaky door hinge in phone booth 3',
    site: 'Riverside Campus', category: 'Conference Room & Meeting Space Issues', subCategory: 'Other',
    status: 'Completed', dueInDays: null, user_name: 'Tom Nakamura', // no date
    notes: 'Handled same-day by roving maintenance.',
  },
  {
    action_item: 'Pressure-wash the main entrance walkway',
    site: 'Desert Ridge Plant', category: 'Building Maintenance & Repairs', subCategory: 'Cleanliness of the building exterior',
    status: 'Cancelled', dueInDays: 10, user_name: 'Nia Brooks',
    notes: 'Cancelled — duplicate of quarterly landscaping contract scope.',
  },
  {
    action_item: 'Improve air circulation in the west wing print room',
    site: 'Northgate Campus', category: 'Indoor Environmental Quality', subCategory: 'Other',
    status: 'On Hold', dueInDays: 60, user_name: 'Leah Goldberg',
    notes: 'On hold until the print fleet consolidation decision lands.',
  },
  {
    action_item: 'Descale and deep-clean the 3rd-floor coffee machines',
    site: 'Summit Campus', category: 'Office/Cube Cleaning & Maintenance', subCategory: 'Cleanliness of the kitchenettes',
    status: 'Pending', dueInDays: 10, user_name: 'Omar Haddad',
    notes: 'Requested by multiple teams in the survey. Assigned to vending vendor.',
  },
];

function findByName(list, name, label) {
  const match = list.find((x) => x.name.toLowerCase() === name.toLowerCase());
  if (!match) throw new Error(`${label} not found: "${name}" (have: ${list.map((x) => x.name).join(', ')})`);
  return match;
}

function findSubCategory(subCategories, categoryId, prefix) {
  const match = subCategories.find(
    (s) => s.category_id === categoryId && s.name.toLowerCase().startsWith(prefix.toLowerCase())
  );
  if (!match) throw new Error(`Sub-category starting with "${prefix}" not found in category ${categoryId}`);
  return match;
}

async function main() {
  console.log(`Seeding sample action items via ${BASE_URL} …`);

  const [sites, categories, subCategories, statuses] = await Promise.all([
    getJson('/api/sites'),
    getJson('/api/categories'),
    getJson('/api/sub-categories'),
    getJson('/api/statuses'),
  ]);

  let created = 0;
  for (const item of SAMPLE_ITEMS) {
    const site = findByName(sites, item.site, 'Site');
    const category = findByName(categories, item.category, 'Category');
    const subCategory = findSubCategory(subCategories, category.id, item.subCategory);
    const status = findByName(statuses, item.status, 'Status');

    const body = {
      user_name: item.user_name,
      site_id: site.id,
      category_id: category.id,
      sub_category_id: subCategory.id,
      action_item: item.action_item,
      estimated_completion_date: item.dueInDays === null ? '' : daysFromNow(item.dueInDays),
      status_id: status.id,
      notes: item.notes,
    };

    const res = await fetch(`${BASE_URL}/api/action-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`POST failed (${res.status}) for "${item.action_item}": ${await res.text()}`);
    }
    created++;
    console.log(`  ✓ [${item.status}] ${item.action_item}`);
  }

  console.log(`Done — created ${created} action items.`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
