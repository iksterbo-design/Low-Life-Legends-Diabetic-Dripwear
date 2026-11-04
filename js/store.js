// ==========================================================================
//  LOW LIFE LEGENDS™  •  Diabetic Dripwear — 33-Tee Catalog Data
//  store.js — single source of truth for every tee
// ==========================================================================

const CATALOG = [
  // ── A. Core Age-Group Line (9) ──────────────────────────────
  { id: 'a1',  cat: 'Adults',        line: 'Adults',          name: 'OG Silver Drip on Jet Black',            fit: 'Heavyweight Street Fit',   colorway: 'OG Black & Silver',  graphic: 'drip',   price: 34 },
  { id: 'a2',  cat: 'Adults',        line: 'Adults',          name: 'Volt Yellow & Hot Pink Graffiti Burst',  fit: 'Boxy Drop-Shoulder Fit',   colorway: 'Graffiti Pop',         graphic: 'bolt',   price: 36 },
  { id: 'a3',  cat: 'Adults',        line: 'Adults',          name: 'Petrol Blue & Electric Cyan Splatter',   fit: 'Classic Crew Fit',         colorway: 'Graffiti Pop',         graphic: 'cyan',   price: 34 },
  { id: 't1',  cat: 'Teenagers',     line: 'Teenagers',       name: 'Lil Drip Pink Camo Edition',             fit: 'Skate/Street Fit',         colorway: 'Graffiti Pop',         graphic: 'pinkcamo', price: 34 },
  { id: 't2',  cat: 'Teenagers',     line: 'Teenagers',       name: '97 mg/dL Legend Bubble Tee',             fit: 'Hype Oversized Fit',       colorway: 'OG Black & Silver',  graphic: 'legend', price: 34 },
  { id: 't3',  cat: 'Teenagers',     line: 'Teenagers',       name: 'Neon Spray Tag Edition',                 fit: 'Relaxed Street Fit',       colorway: 'Graffiti Pop',         graphic: 'tag',    price: 32 },
  { id: 'k1',  cat: 'Kids',          line: 'Kids',            name: 'Lil Drip Mascot Hero Tee',               fit: 'Youth',                    colorway: 'Graffiti Pop',         graphic: 'drip',   price: 28 },
  { id: 'k2',  cat: 'Kids',          line: 'Kids',            name: 'Mini Legend Spray-Paint Tee',            fit: 'Youth',                    colorway: 'OG Black & Silver',  graphic: 'cyan',   price: 28 },
  { id: 'k3',  cat: 'Kids',          line: 'Kids',            name: 'Pink Camo Hoodie Match Tee',             fit: 'Youth',                    colorway: 'Graffiti Pop',         graphic: 'pinkcamo', price: 28 },

  // ── B. Family & Crew Supporter Roles (12 × 2 = 24) ──────────
  // Siblings
  { id: 'sib-og',  cat: 'Crew',      role: 'Siblings',  line: 'Family & Crew',  name: 'Sibling Squad',        fit: 'Youth-Adult',    colorway: 'OG Black & Silver',  graphic: 'drip',   price: 30 },
  { id: 'sib-pop', cat: 'Crew',      role: 'Siblings',  line: 'Family & Crew',  name: 'Sibling Squad',        fit: 'Youth-Adult',    colorway: 'Graffiti Pop',         graphic: 'bolt',   price: 30 },
  // Family
  { id: 'fam-og',  cat: 'Crew',      role: 'Family',    line: 'Family & Crew',  name: 'Family Legends',       fit: 'Youth-Adult',    colorway: 'OG Black & Silver',  graphic: 'drip',   price: 30 },
  { id: 'fam-pop', cat: 'Crew',      role: 'Family',    line: 'Family & Crew',  name: 'Family Legends',       fit: 'Youth-Adult',    colorway: 'Graffiti Pop',         graphic: 'bolt',   price: 30 },
  // Girlfriend
  { id: 'gf-og',   cat: 'Partners',  role: 'Girlfriend',line: 'Family & Crew',  name: 'Ride-or-Die Girlfriend',fit: 'Teens-Adult', colorway: 'OG Black & Silver',  graphic: 'drip',   price: 32 },
  { id: 'gf-pop',  cat: 'Partners',  role: 'Girlfriend',line: 'Family & Crew',  name: 'Ride-or-Die Girlfriend',fit: 'Teens-Adult', colorway: 'Graffiti Pop',         graphic: 'cyan',   price: 32 },
  // Boyfriend
  { id: 'bf-og',   cat: 'Partners',  role: 'Boyfriend', line: 'Family & Crew',  name: 'Ride-or-Die Boyfriend', fit: 'Teens-Adult',    colorway: 'OG Black & Silver',  graphic: 'drip',   price: 32 },
  { id: 'bf-pop',  cat: 'Partners',  role: 'Boyfriend', line: 'Family & Crew',  name: 'Ride-or-Die Boyfriend', fit: 'Teens-Adult',    colorway: 'Graffiti Pop',         graphic: 'cyan',   price: 32 },
  // Husband
  { id: 'hus-og',  cat: 'Partners',  role: 'Husband',   line: 'Family & Crew',  name: 'Legendary Husband',    fit: 'Adult',            colorway: 'OG Black & Silver',  graphic: 'legend', price: 34 },
  { id: 'hus-pop', cat: 'Partners',  role: 'Husband',   line: 'Family & Crew',  name: 'Legendary Husband',    fit: 'Adult',            colorway: 'Graffiti Pop',         graphic: 'bolt',   price: 34 },
  // Wife
  { id: 'wif-og',  cat: 'Partners',  role: 'Wife',      line: 'Family & Crew',  name: 'Legendary Wife',       fit: 'Adult',            colorway: 'OG Black & Silver',  graphic: 'legend', price: 34 },
  { id: 'wif-pop', cat: 'Partners',  role: 'Wife',      line: 'Family & Crew',  name: 'Legendary Wife',       fit: 'Adult',            colorway: 'Graffiti Pop',         graphic: 'bolt',   price: 34 },
  // Stepdad
  { id: 'step-og', cat: 'Parents',   role: 'Stepdad',   line: 'Family & Crew',  name: 'Bonus Legend Stepdad', fit: 'Adult',            colorway: 'OG Black & Silver',  graphic: 'drip',   price: 32 },
  { id: 'step-pop',cat: 'Parents',   role: 'Stepdad',   line: 'Family & Crew',  name: 'Bonus Legend Stepdad', fit: 'Adult',            colorway: 'Graffiti Pop',         graphic: 'cyan',   price: 32 },
  // Mom
  { id: 'mom-og',  cat: 'Parents',   role: 'Mom',       line: 'Family & Crew',  name: 'Warrior Mom',          fit: 'Adult',            colorway: 'OG Black & Silver',  graphic: 'drip',   price: 32 },
  { id: 'mom-pop', cat: 'Parents',   role: 'Mom',       line: 'Family & Crew',  name: 'Warrior Mom',          fit: 'Adult',            colorway: 'Graffiti Pop',         graphic: 'bolt',   price: 32 },
  // Dad
  { id: 'dad-og',  cat: 'Parents',   role: 'Dad',       line: 'Family & Crew',  name: 'Warrior Dad',          fit: 'Adult',            colorway: 'OG Black & Silver',  graphic: 'drip',   price: 32 },
  { id: 'dad-pop', cat: 'Parents',   role: 'Dad',       line: 'Family & Crew',  name: 'Warrior Dad',          fit: 'Adult',            colorway: 'Graffiti Pop',         graphic: 'bolt',   price: 32 },
  // Grandma
  { id: 'gma-og',  cat: 'Grandparents', role: 'Grandma', line: 'Family & Crew',  name: 'OG Grandma',           fit: 'Adult',            colorway: 'OG Black & Silver',  graphic: 'drip',   price: 32 },
  { id: 'gma-pop', cat: 'Grandparents', role: 'Grandma', line: 'Family & Crew',  name: 'OG Grandma',           fit: 'Adult',            colorway: 'Graffiti Pop',         graphic: 'cyan',   price: 32 },
  // Grandpa
  { id: 'gpa-og',  cat: 'Grandparents', role: 'Grandpa', line: 'Family & Crew',  name: 'OG Grandpa',           fit: 'Adult',            colorway: 'OG Black & Silver',  graphic: 'drip',   price: 32 },
  { id: 'gpa-pop', cat: 'Grandparents', role: 'Grandpa', line: 'Family & Crew',  name: 'OG Grandpa',           fit: 'Adult',            colorway: 'Graffiti Pop',         graphic: 'bolt',   price: 32 },
  // Friends
  { id: 'fri-og',  cat: 'Crew',      role: 'Friends',   line: 'Family & Crew',  name: 'Day-One Friends Crew',   fit: 'Youth-Adult',    colorway: 'OG Black & Silver',  graphic: 'drip',   price: 30 },
  { id: 'fri-pop', cat: 'Crew',      role: 'Friends',   line: 'Family & Crew',  name: 'Day-One Friends Crew',   fit: 'Youth-Adult',    colorway: 'Graffiti Pop',         graphic: 'bolt',   price: 30 },
];

// ── Derived lookups ──
const CATALOG_BY_ID = Object.fromEntries(CATALOG.map(t => [t.id, t]));

const IN_STOCK = new Set([
  'a1','a2','a3','t1','t2','t3','k1','k2','k3',
  'sib-og','sib-pop','fam-og','fam-pop','gf-og','gf-pop','bf-og','bf-pop',
  'hus-og','hus-pop','wif-og','wif-pop','step-og','step-pop','mom-og','mom-pop',
  'dad-og','dad-pop','gma-og','gma-pop','gpa-og','gpa-pop','fri-og','fri-pop'
]);

// Stock state (simple toggle; in production this syncs to a backend)
const STOCK = new Map();
IN_STOCK.forEach(id => STOCK.set(id, true));

const ROLES = ['Adult','Teen','Kid','Mom','Dad','Stepdad','Siblings','Family','Grandma','Grandpa','Girlfriend','Boyfriend','Husband','Wife','Friends'];
const SIZES = ['Youth XS','Youth S','Youth M','Youth L','Youth XL','Teen S','Teen M','Teen L','Teen XL','Adult S','Adult M','Adult L','Adult XL','Adult 2XL','Adult 3XL','Adult 4XL'];
const GRAPHIC_STYLES = [
  { id: 'drip',   label: 'OG Silver Drip',      color: '#B8BCC2', desc: 'Classic Metallic Silver / White drip print' },
  { id: 'bolt',   label: 'Volt Yellow Burst',   color: '#FFE600', desc: 'Spray-pop block letters, yellow face' },
  { id: 'pink',   label: 'Hot Pink Spray',      color: '#FF148A', desc: 'Neon bubble graffiti, magenta tones' },
  { id: 'cyan',   label: 'Electric Cyan Tag',   color: '#00D4FF', desc: 'Cyan spray-paint bubble letters' },
  { id: 'legend', label: '97 mg/dL Legend',     color: '#FFE600', desc: 'Bold dashed-bubble badge with meter read-out' },
  { id: 'tag',    label: 'Neon Spray Tag',      color: '#00D4FF', desc: 'Stencil-style spray tag with claw mark' },
];
const BASE_COLORS = [
  { id: 'black', name: 'Jet Black',          hex: '#08090C' },
  { id: 'petrol',name: 'Petrol Alley Blue',  hex: '#0D3B52' },
  { id: 'white', name: 'Crisp White',        hex: '#FFFFFF' },
  { id: 'camo',  name: 'Hot Pink Camo',      hex: '#FF148A' },
];
const COLORWAY_OPTIONS = [
  { id: 'og', label: 'OG Black & Silver Drip',  desc: 'Classic metallic silver/grey print on dark tee' },
  { id: 'pop', label: 'Spray-Paint Graffiti Pop', desc: 'Volt + magenta + cyan spray-bubble print' },
];

// ── Brand asset config (image uploader) ──────────────────────
const BRAND_ASSETS = [
  { id: 'drip-logo', label: 'DIABETIC LIFE™ Drip Logo',      short: 'Drip Logo' },
  { id: 'wordmark',  label: 'LOW LIFE LEGENDS™ Arched Wordmark', short: 'Wordmark' },
  { id: 'mascot',    label: 'LIL DRIP™ Mascot Crest',        short: 'Mascot Crest' },
];

// ── Category filter groups ───────────────────────────────────
const FILTER_GROUPS = [
  { id: 'all',      label: 'All',        count: CATALOG.length },
  { id: 'adults',   label: 'Adults',     count: 3 },
  { id: 'teens',    label: 'Teenagers',  count: 3 },
  { id: 'kids',     label: 'Kids',       count: 3 },
  { id: 'parents',  label: 'Parents',    count: 6 },
  { id: 'grandparents', label: 'Grandparents', count: 4 },
  { id: 'partners', label: 'Partners',   count: 8 },
  { id: 'crew',     label: 'Crew',       count: 6 },
];

// ── Story step data ──────────────────────────────────────────
const STORY_STEPS = [
  { num: '01', title: 'The Origin',      body: 'Low Life Legends™ began as a family inside a diabetic warrior\'s world, where blood-sugar battles became battles of pride.' },
  { num: '02', title: 'The Face',         body: 'Lil Drip — the founder\'s son — holds the meter at 97 mg/dL, proof that a controlled diabetic life is a legend worth reping.' },
  { num: '03', title: 'The Line',         body: 'Every tee carries the DIABETIC LIFE™ drip on the chest, the Lil Drip crest on the sleeve, and the wearer\'s role as their own bravest crew.' },
  { num: '04', title: 'The Pride',        body: 'Diabetic Dripwear turns fear, routine, and roll-call into a street-gun identity — because managing diabetes is the hardest hustle of all.' },
];

// ── Back-in-stock alert log ──────────────────────────────────
const RESTOCK_LOG = [
  { id: 't1', at: '02:14', by: 'server' },
  { id: 'gpa-pop', at: '08:02', by: 'stock' },
];
