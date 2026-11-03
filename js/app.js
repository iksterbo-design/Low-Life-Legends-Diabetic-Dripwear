/* ==========================================================================
   LOW LIFE LEGENDS™  •  Diabetic Dripwear — Storefront Engine
   app.js — all interactive behaviour (no framework, no build step)
   ========================================================================== */

/* ── Helpers ─────────────────────────────────────────────── */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const el = (tag, attrs = {}, template = '') => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') n.className = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (v !== null && v !== undefined && v !== false) n.setAttribute(k, v);
  }
  if (template) n.innerHTML = template;
  return n;
};

/* ── Hero background splatter (static default) ─────────── */
function heroSplatters() {
  return `<svg viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
    <defs>
      <radialGradient id="gs1" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFE600" stop-opacity=".5"/><stop offset="1" stop-color="#FFE600" stop-opacity="0"/></radialGradient>
      <radialGradient id="gs2" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FF148A" stop-opacity=".45"/><stop offset="1" stop-color="#FF148A" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="1200" height="800" fill="#08090C"/>
    <circle cx="220" cy="180" r="140" fill="#FFE600" opacity=".07"/>
    <circle cx="960" cy="140" r="110" fill="#FF148A" opacity=".06"/>
    <g stroke="#FFE600" stroke-width="2" fill="none" opacity=".35"><path d="M200 200 Q300 100 420 180"/><path d="M1000 120 Q900 80 780 160"/></g>
    <g fill="#FFE600" opacity=".9"><circle cx="280" cy="160" r="3"/><circle cx="360" cy="130" r="2"/><circle cx="217" cy="217" r="2"/><circle cx="980" cy="170" r="3"/><circle cx="1040" cy="140" r="2"/><circle cx="943" cy="200" r="2"/></g>
  </svg>`;
}

/* ── State ──────────────────────────────────────────────── */
const state = {
  cart: new Map(),        // id -> {qty, size, colorway}
  selectedId: null,       // quick-view target
  viewMode: 'front',      // front | back
  activeFilter: 'all',
  search: '',
  plyg: null,             // ActiveXObject fallback
  sound: { on: true },
};

function cartCount() {
  let n = 0;
  for (const q of state.cart.values()) n += q.qty;
  return n;
}

function cartTotal() {
  let s = 0;
  for (const [id, { qty, colorway }] of state.cart.entries()) {
    const t = CATALOG_BY_ID[id];
    if (t) s += t.price * qty;
  }
  return s;
}

/* ── Sound (Web Audio) ──────────────────────────────────── */
let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return false; }
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return true;
}
function playTone(freq, dur = .12, type = 'sine', vol = .25) {
  if (!state.sound) return;
  try {
    ensureAudio();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime + dur);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + dur);
  } catch (e) {}
}
const SND = {
  add:   () => { playTone(987, .1, 'sine', .2); },
  remove:() => { playTone(330, .18, 'sawtooth', .18); },
  check: () => { playTone(660, .08, 'sine', .15); },
  cart:  () => { playTone(880, .12, 'sine', .18); },
};

/* ── Toast notifications ────────────────────────────────── */
function toast(msg, kind = 'info', icon = '✦') {
  const t = el('div', { class: `toast ${kind}` }, `${icon}  ${msg}`);
  document.body.appendChild(t);
  setTimeout(() => { t.style.transition = 'opacity .4s'; t.style.opacity = '.4'; setTimeout(() => t.remove(), 420); }, 2600);
  if (kind === 'success' && Notification.permission === 'granted') {
    try { new Notification('Drip Bag Update', { body: msg, icon: 'data:image/svg+xml,' +
      encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFE600"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`) }); } catch(e) {}
  }
}

/* ── Render catalog ─────────────────────────────────────── */
function filteredCatalog() {
  let list = CATALOG;
  if (state.activeFilter !== 'all') {
    const g = FILTER_GROUPS.find(f => f.id === state.activeFilter);
    if (g) list = list.filter(t => g.id === 'adults' ? t.cat === 'Adults'
      : g.id === 'teens' ? t.cat === 'Teenagers'
      : g.id === 'kids' ? t.cat === 'Kids'
      : g.id === 'parents' ? t.cat === 'Parents'
      : g.id === 'grandparents' ? t.cat === 'Grandparents'
      : g.id === 'partners' ? t.cat === 'Partners'
      : t.cat === 'Crew');
  }
  if (state.search) {
    const q = state.search.toLowerCase();
    list = list.filter(t => t.name.toLowerCase().includes(q) || t.role.toLowerCase().includes(q) || t.fit.toLowerCase().includes(q) || t.colorway.toLowerCase().includes(q));
  }
  return list;
}

function categoryFor(id) {
  const t = CATALOG_BY_ID[id];
  if (!t) return 'adults';
  if (t.cat === 'Adults') return 'adults';
  if (t.cat === 'Teenagers') return 'teens';
  if (t.cat === 'Kids') return 'kids';
  if (t.cat === 'Parents') return 'parents';
  if (t.cat === 'Grandparents') return 'grandparents';
  if (t.cat === 'Partners') return 'partners';
  return 'crew';
}

function renderCatalog() {
  const list = filteredCatalog();
  const grid = $('#catalog-grid');
  if (!list.length) {
    grid.innerHTML = `<div class="no-results"><span class="sr-only">No results</span><p class="empty">No tees match your search.</p></div>`;
  } else {
    grid.innerHTML = list.map(tee => {
      const activeColorway = state.cart.has(tee.id);
      const twins = CATALOG.filter(t => t.role === tee.role && t.colorway !== tee.colorway);
      return `
        <article class="card" data-id="${tee.id}" tabindex="0" role="button" aria-label="${tee.name} quick view">
          <div class="card-img">
            <div class="card-svg">
              <svg viewBox="0 0 300 420" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                ${brandLogoSVG(tee.graphic, tee.colorway, state.viewMode === 'back')}
              </svg>
            </div>
            <div class="tag-ribbon">${tee.role || 'Core'}</div>
            <div class="back-view-toggle" data-flip="${tee.id}">${state.viewMode === 'back' ? '← Front' : 'Back view →'}</div>
          </div>
          <div class="card-body">
            <h3>${tee.name}</h3>
            <div class="price">$${tee.price}</div>
            <div class="fit">${tee.fit} · ${tee.colorway}</div>
            ${activeColorway ? `<div class="price" style="color:var(--magenta)">● In Drip Bag</div>` : ''}
            <button class="add" data-add="${tee.id}" data-cw="${tee.colorway}">
              <span class="badge-wrap">+ Add to Drip Bag</span>
            </button>
          </div>
        </article>`;
    }).join('');
  }
  // flip back/front toggles
  $$('[data-flip]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.viewMode = btn.dataset.flip === 'back' ? 'front' : 'back';
      renderCatalog();
    });
  });
  $$('.add').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      addToCart(btn.dataset.add, btn.dataset.cw || 'OG Black & Silver');
    });
  });
  updateCartBadge();
  updateCartDrawer();
}

function brandLogoSVG(graphic, colorway, flipped) {
  // simplified brand glyph placeholders rendered by app.js
  const s = `<svg viewBox="0 0 120 120" width="100%" height="100%">`;
  const ink = '#08090C';
  const silver = '#B8BCC2';
  const white = '#FFFFFF';
  const volt = '#FFE600';
  const magenta = '#FF148A';
  const cyan = '#00D4FF';
  const copper = '#F2541B';
  if (graphic === 'drip') {
    return s +
      `<rect x="8" y="8" width="104" height="104" rx="6" fill="${ink}" stroke="#000" stroke-width="6"/>` +
      `<text x="60" y="44" text-anchor="middle" font-family="Courier New" font-size="26" font-weight="bold" fill="${silver}">DIABETIC</text>` +
      `<text x="60" y="80" text-anchor="middle" font-family="Courier New" font-size="22" font-weight="bold" fill="${volt}">LIFE™</text>` +
      `<path d="M40 100 L40 112 L60 100" stroke="${volt}" stroke-width="5" fill="none" stroke-linecap="round"/>` +
      `<rect x="46" y="74" width="8" height="24" rx="2" fill="${silver}" opacity=".7"/>` +
      `<rect x="52" y="74" width="8" height="24" rx="2" fill="${dripSilver}" opacity=".7"/>` +
      `<rect x="58" y="74" width="8" height="24" rx="2" fill="${dripSilver}" opacity=".7"/>` +
      `</svg>`;
  }
  if (graphic === 'bolt') {
    return s +
      `<rect x="8" y="8" width="104" height="104" rx="6" fill="${ink}" stroke="#000" stroke-width="6"/>` +
      `<path d="M44 60 L58 42 L64 42 L78 60 L64 60 L64 74 L58 74 L58 60" fill="${volt}" stroke="#3a2a00" stroke-width="2"/>` +
      `<path d="M38 72 L48 72 L43 84 L53 84 L48 72 Z" fill="${volt}" opacity=".6"/>` +
      `<text x="60" y="96" text-anchor="middle" font-family="Arial Black" font-size="20" font-weight="bold" fill="${magenta}">POP</text>` +
      `</svg>`;
  }
  if (graphic === 'pink') {
    return s +
      `<rect x="8" y="8" width="104" height="104" rx="6" fill="${ink}" stroke="#000" stroke-width="6"/>` +
      `<path d="M34 44 Q60 30 86 44 L82 62 Q60 52 38 62 Z" fill="${magenta}" stroke="#a8146a" stroke-width="2"/>` +
      `<path d="M30 52 Q60 40 90 52 L86 64 Q60 56 34 64 Z" fill="${magenta}" opacity=".8"/>` +
      `<text x="60" y="96" text-anchor="middle" font-family="Arial Black" font-size="20" font-weight="bold" fill="${magenta}">CREW</text>` +
      `</svg>`;
  }
  if (graphic === 'cyan') {
    return s +
      `<rect x="8" y="8" width="104" height="104" rx="6" fill="${ink}" stroke="#000" stroke-width="6"/>` +
      `<path d="M36 50 L58 38 L66 38 L78 50 L72 50 L72 60 L62 60 L62 48 Z" fill="${cyan}" stroke="#008096" stroke-width="2"/>` +
      `<text x="60" y="96" text-anchor="middle" font-family="Arial Black" font-size="20" font-weight="bold" fill="${cyan}">WAVE</text>` +
      `</svg>`;
  }
  if (graphic === 'legend') {
    return s +
      `<rect x="8" y="8" width="104" height="104" rx="6" fill="${ink}" stroke="#000" stroke-width="6"/>` +
      `<path d="M30 50 L52 40 L60 40 L72 50 L66 50 L66 60 L52 60 L52 52 Z" fill="${volt}" stroke="#a88000" stroke-width="2"/>` +
      `<path d="M26 58 L52 52 L52 58 L58 58 L52 64 L26 64 Z" fill="${volt}" opacity=".8"/>` +
      `<rect x="34" y="76" width="14" height="14" rx="3" fill="${cyan}" stroke="${white}" stroke-width="2"/>` +
      `<text x="60" y="98" text-anchor="middle" font-family="Arial Black" font-size="14" font-weight="bold" fill="${volt}">97</text>` +
      `</svg>`;
  }
  // tag (teens)
  return s +
    `<rect x="8" y="8" width="104" height="104" rx="6" fill="${ink}" stroke="#000" stroke-width="6"/>` +
    `<path d="M38 46 L46 38 L52 38 L60 46 L58 46 L58 56 L46 56 L46 50 Z" fill="${cyan}" stroke="${cyanDeep}" stroke-width="2"/>` +
    `<path d="M60 58 L68 50 L76 50 L84 58 L76 58 L76 62 L66 62 L66 54 Z" fill="${cyan}" opacity=".7"/>` +
    `<path d="M40 40 L44 36 L48 36 L50 36" stroke="${volt}" stroke-width="4" fill="none"/>` +
    `<text x="60" y="96" text-anchor="middle" font-family="Arial Black" font-size="18" font-weight="bold" fill="${magenta}">TAG</text>` +
    `</svg>`;
}

/* ── Add to cart ────────────────────────────────────────── */
function addToCart(id, colorway) {
  const tee = CATALOG_BY_ID[id];
  if (!tee) return;
  if (!STOCK.get(id)) { toast(`${tee.name} is sold out.`, 'error', '✘'); playTone(220, .2, 'sine', .18); return; }
  const entry = state.cart.get(id) || { qty: 0, size: 'Adult M', colorway };
  entry.qty += 1;
  state.cart.set(id, entry);
  SND.add(); toast(`${tee.name} added to Drip Bag.`, 'success', '✦');
  renderCatalog();
  updateCartDrawer();
  updateBundle();
}

function removeFromCart(id, qty = 1) {
  const entry = state.cart.get(id);
  if (!entry) return;
  entry.qty -= qty;
  if (entry.qty <= 0) state.cart.delete(id); else state.cart.set(id, entry);
  SND.remove(); toast('Removed from Drip Bag.', 'info');
  renderCatalog();
  updateCartDrawer();
  updateBundle();
}

/* ── Cart drawer ────────────────────────────────────────── */
function updateCartDrawer() {
  const body = $('#drawer-body');
  const items = $$('.drawer-item');
  items.forEach(n => n.remove());
  if (!state.cart.size) {
    body.appendChild(el('div', { class: 'drawer-empty' },
      'Your Drip Bag is empty — load up on legends before they run dry.'));
  } else {
    for (const [id, entry] of state.cart.entries()) {
      const tee = CATALOG_BY_ID[id];
      if (!tee) continue;
      const total = tee.price * entry.qty;
      const item = el('div', { class: 'drawer-item' }, `
        <div class="dimg">${shirtGlyphSVG(tee.graphic)}</div>
        <div class="dinfo">
          <div class="dname">${tee.name} <span>×${entry.qty}</span></div>
          <div class="dattr">${tee.fit} · ${tee.colorway} · size ${entry.size}</div>
          <div class="dctrl">
            <button data-qty="${id}" data-delta="-1">−</button>
            <span class="qty">${entry.qty}</span>
            <button data-qty="${id}" data-delta="1">+</button>
          </div>
        </div>
        <div class="das"><button class="das-remove" data-rm="${id}">Remove</button></div>
      `);
      body.appendChild(item);
    }
    $$('.das-remove').forEach(b => b.addEventListener('click', () => {
      SND.remove(); removeFromCart(b.dataset.rm);
    }));
    $$('[data-qty]').forEach(b => b.addEventListener('click', () => {
      const id = b.dataset.id;
      const delta = parseInt(b.dataset.delta);
      const entry = state.cart.get(id);
      if (delta < 0 && entry.qty <= 1) { SND.remove(); removeFromCart(id); return; }
      entry.qty += delta;
      if (entry.qty <= 0) state.cart.delete(id); else state.cart.set(id, entry);
      SND.add(); renderCatalog(); updateCartDrawer(); updateBundle();
    }));
  }
  const total = cartTotal();
  const saved = state.cart.size >= 3 ? Math.round(total * .15) : state.cart.size >= 5 ? Math.round(total * .25) : 0;
  const final = total - saved;
  $('#drawer-total').textContent = `$${total.toFixed(2)}`;
  $('#drawer-saved').textContent = saved ? `Bundle savings − $${saved.toFixed(2)} • ${state.cart.size}+ tees = 15% off` : '';
  $('#drawer-final').textContent = `$${final.toFixed(2)}`;
  $('#drawer-final').style.color = saved ? 'var(--volt)' : 'var(--white)';
}

function shirtGlyphSVG(graphic) {
  const ink = '#08090C', silver = '#B8BCC2', white = '#FFFFFF',
        volt = '#FFE600', magenta = '#FF148A', cyan = '#00D4FF';
  const isWhite = graphic === 'hexwhite';
  let body = '';
  if (graphic === 'drip') {
    body = `<text x="24" y="30" text-anchor="middle" font-family="Courier New" font-size="13" font-weight="bold" fill="${silver}">DIABETIC</text><text x="24" y="42" text-anchor="middle" font-family="Courier New" font-size="10" font-weight="bold" fill="${volt}">LIFE™</text><path d="M9 44 L9 48 L15 44" stroke="${volt}" stroke-width="2" fill="none"/>`;
  } else if (graphic === 'bolt') {
    body = `<path d="M14 22 L19 17 L22 19 L25 23 L22 21 L22 25 L19 25 L19 23 Z" fill="${volt}" stroke="#3a2a00" stroke-width="1"/>`;
  } else if (graphic === 'pink') {
    body = `<path d="M12 24 Q24 18 36 24 L32 32 Q24 26 16 32 Z" fill="${magenta}" stroke="#a8146a" stroke-width="1"/>`;
  } else if (graphic === 'cyan') {
    body = `<path d="M13 23 L19 19 L22 21 L26 24 L24 23 L24 26 L20 25 L20 23 Z" fill="${cyan}" stroke="#008096" stroke-width="1"/>`;
  } else if (graphic === 'legend') {
    body = `<rect x="8" y="10" width="32" height="32" rx="3" fill="${cyan}" stroke="${white}" stroke-width="1"/><text x="24" y="33" text-anchor="middle" font-family="Arial Black" font-size="9" font-weight="bold" fill="${volt}">97</text>`;
  } else {
    body = `<text x="24" y="30" text-anchor="middle" font-family="Arial Black" font-size="10" font-weight="bold" fill="${magenta}">LOGO</text>`;
  }
  return `<svg viewBox="0 0 48 48" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="44" height="44" rx="8" fill="${ink}" stroke="#000" stroke-width="1"/>${body}</svg>`;
}

/* ── Bundle builder ─────────────────────────────────────── */
function updateBundle() {
  const list = $('#bundle-list');
  const items = $$('.bundle-item');
  items.forEach(n => n.remove());
  let subs = 0;
  let price = 0;
  for (const [id, entry] of state.cart.entries()) {
    const tee = CATALOG_BY_ID[id];
    if (!tee) continue;
    subs += entry.qty;
    price += tee.price * entry.qty;
    const item = el('div', { class: 'bundle-item' }, `
      <input type="checkbox" checked="checked"/>
      <div class="bi-info">
        <div class="bi-name">${tee.name} <span class="bi-attr">(${entry.qty}x)</span></div>
        <div class="bi-attr">${tee.colorway} · ${entry.size}</div>
      </div>
      <div class="bi-qty"><button data-bundle-qty="-1">−</button><span class="qty-val">${entry.qty}</span><button data-bundle-qty="1">+</button></div>
    `);
    list.appendChild(item);
  }
  // discount tiers
  const tiers = [
    { min: 0,  pct: 0,  label: '0 tees — full price' },
    { min: 3,  pct: 15, label: '3+ tees — 15% off' },
    { min: 5,  pct: 25, label: '5+ tees — 25% off' },
  ];
  let tier = tiers[0];
  for (const t of tiers) if (subs >= t.min) tier = t;
  const discount = Math.round(price * tier.pct / 100);
  const final = price - discount;
  $('#bundle-count').textContent = `${subs} tee${subs !== 1 ? 's' : ''}`;
  $('#bundle-tier').textContent = tier.label;
  $('#bundle-savings').textContent = tier.pct ? `- $${discount.toFixed(2)}` : `—`;
  $('#bundle-total').textContent = `$${final.toFixed(2)}`;
  // meter
  const meter = $('#bundle-meter');
  meter.style.width = `${tier.pct}%`;
  $('#bundle-meter-label').textContent = tier.pct ? `${tier.pct}% off` : 'Full price';
}

/* ── Quick view ─────────────────────────────────────────── */
function openQuickView(id) {
  state.selectedId = id;
  const tee = CATALOG_BY_ID[id];
  if (!tee) return;
  const priceValue = state.cart.has(id) ? '(In Drip Bag)' : `$${tee.price}`;
  $('#qv-name').textContent = `${tee.name} — ${tee.colorway}`;
  $('#qv-price').textContent = priceValue;
  $('#qv-fit').textContent = tee.fit;
  $('#qv-role').textContent = tee.role || 'Core Age-Line';
  $('#qv-desc').textContent = tee.colorway === 'OG Black & Silver'
    ? 'Classic metallic silver / grey drip print on a heavyweight jet-black tee — the original.'
    : 'Spray-paint graffiti pop — volt + magenta + cyan bubble letters on a soft tee.';
  $('#qv-size').textContent = state.cart.get(id)?.size || 'Adult M';
  // thumbs
  $('#qv-thumbs').innerHTML = GRAPHIC_STYLES.map(g => `
    <img src="#" data-g="${g.id}" alt="graphic style ${g.label}" ${g.id === tee.graphic ? 'class="active"' : ''}>
  `).join('');
  $('#qv-graphics').value = tee.graphic;
  $('#qv-colorways').value = tee.colorway;
  $('#qv-graphic-list').innerHTML = GRAPHIC_STYLES.map(g => `
    <label class="attr"><input type="radio" name="qv-graphic" value="${g.id}" ${g.id === tee.graphic ? 'checked' : ''}> ${g.label} <span class="sub">${g.desc}</span></label>
  `).join('');
  $('#qv-colorway-list').innerHTML = COLORWAY_OPTIONS.map(c => `
    <label class="attr"><input type="radio" name="qv-colorway" value="${c.id}" ${c.id === tee.colorway ? 'checked' : ''}> ${c.label} <span class="sub">${c.desc}</span></label>
  `).join('');
  $('#qv-remove').style.display = state.cart.has(id) ? 'block' : 'none';
  $('#quickview').classList.add('open');
}

function closeQuickView() {
  $('#quickview').classList.remove('open');
  state.selectedId = null;
  // reset graphic in mockup
  applyCustomizer();
}

/* ── Spray Lab customizer ───────────────────────────────── */
function applyCustomizer() {
  const base = BASE_COLORS.find(b => b.id === $('input[name="base"]:checked').value) || BASE_COLORS[0];
  const style = GRAPHIC_STYLES.find(g => g.id === $('input[name="style"]:checked').value) || GRAPHIC_STYLES[0];
  const role = ROLES.find(r => r === $('#customizer-role').value) || ROLES[0];
  const size = SIZES.find(s => s === $('#customizer-size').value) || SIZES[11];
  const isWhite = base.id === 'white';
  $('#shirt-mockup').style.background = isWhite ? '#fff' : base.hex;
  // graphic depends on colorway for visual
  const graphic = $('input[name="style"]:checked').value;
  const label = isWhite ? 'DIABETIC LIFE™' : 'Diabetic Life™';
  const letters = {
    drip:  `<text x="62" y="48" text-anchor="middle" font-family="Courier New" font-size="22" font-weight="bold" fill="${isWhite?'#08090C':silver}">DIABETIC</text>` +
            `<text x="62" y="80" text-anchor="middle" font-family="Courier New" font-size="18" font-weight="bold" fill="${isWhite?'#B8BCC2':volt}">LIFE™</text>`,
    bolt:  `<text x="62" y="48" text-anchor="middle" font-family="Arial Black" font-size="22" font-weight="bold" fill="${volt}">VOLT</text>` +
            `<text x="62" y="80" text-anchor="middle" font-family="Arial Black" font-size="18" font-weight="bold" fill="${magenta}">POP</text>`,
    pink:  `<text x="62" y="48" text-anchor="middle" font-family="Arial Black" font-size="20" font-weight="bold" fill="${magenta}">CREW</text>` +
            `<text x="62" y="80" text-anchor="middle" font-family="Arial Black" font-size="16" font-weight="bold" fill="${copper}">LV</text>`,
    cyan:  `<text x="62" y="48" text-anchor="middle" font-family="Arial Black" font-size="20" font-weight="bold" fill="${cyan}">WAVE</text>` +
            `<text x="62" y="80" text-anchor="middle" font-family="Arial Black" font-size="16" font-weight="bold" fill="rgba(8,9,12,.8)">DR</text>`,
    legend:`<text x="62" y="46" text-anchor="middle" font-family="Arial Black" font-size="18" font-weight="bold" fill="${volt}">97</text>`+
            `<text x="62" y="80" text-anchor="middle" font-family="Arial Black" font-size="20" font-weight="bold" fill="${isWhite?'#08090C':silver}">MG</text>`,
    tag:   `<text x="62" y="48" text-anchor="middle" font-family="Arial Black" font-size="20" font-weight="bold" fill="${cyan}">ST</text>`+
            `<text x="62" y="82" text-anchor="middle" font-family="Arial Black" font-size="16" font-weight="bold" fill="${magenta}">AGE</text>`,
  };
  const g = letters[graphic] || letters.drip;
  const glyphSvg = `<svg viewBox="0 0 124 116" width="74%" height="74%" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="116" height="108" rx="5" fill="${isWhite?'#08090C':silver}" stroke="#000" stroke-width="3"/>${g}<path d="M24 96 L24 108 L40 96" stroke="${isWhite?'#B8BCC2':volt}" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`;
  $('#shirt-graphic').innerHTML = glyphSvg;
  // role badge
  const badgeSvg = `<svg viewBox="0 0 48 48" width="48" height="48" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="44" height="44" rx="10" fill="${magenta}" stroke="#000" stroke-width="2"/><text x="24" y="29" text-anchor="middle" font-family="Arial Black" font-size="15" font-weight="bold" fill="${isWhite?'#08090C':white}">${role}</text></svg>`;
  $('#role-badge').innerHTML = badgeSvg;
  // size
  $('#size-label').textContent = size;
  // color swatch
  $('#base-swatch').style.background = base.hex;
  $('#base-name').textContent = base.name;
  // hero upload preview
  if (state.droppedAssets) renderAssetPreview();
}

/* ── Asset loader / uploader ────────────────────────────── */
let droppedAssets = null;
function loadAssetFiles(files) {
  // files: FileList
  droppedAssets = {};
  const reader = new FileReader();
  Array.from(files).forEach((f, i) => {
    reader.onload = e => {
      const ids = ['drip-logo','wordmark','mascot'];
      droppedAssets[ids[i]] = e.target.result;
      renderAssetPreview();
      toast(`Loaded asset: ${f.name}`, 'success', '✦');
    };
    reader.readAsDataURL(f);
  });
}
function renderAssetPreview() {
  const hero = $('#hero-art');
  const customizer = $('#customizer-preview');
  if (droppedAssets) {
    if (droppedAssets.mascot) hero.innerHTML = `<img src="${droppedAssets.mascot}" style="width:100%;height:100%;object-fit:cover;border-radius:8px"/>`;
    if (droppedAssets.dripLogo) customizer.innerHTML = `<img src="${droppedAssets.dripLogo}" style="width:60%;height:60%;object-fit:contain"/>`;
    if (droppedAssets.wordmark) document.querySelector('.brand-logo svg').setAttribute('style', 'filter:none');
  }
}

/* ── Hero dropzone ──────────────────────────────────────── */
function initHeroUpload() {
  const zone = $('#hero-upload-zone');
  const input = $('#hero-upload-input');
  zone.addEventListener('click', () => input.click());
  input.addEventListener('change', e => {
    if (e.target.files.length) loadAssetFiles(e.target.files);
  });
  // drag & drop on a drop target
  const dropTarget = document.querySelector('.hero-art');
  dropTarget.addEventListener('dragover', e => { e.preventDefault(); dropTarget.style.borderColor = 'var(--volt)'; });
  dropTarget.addEventListener('dragleave', () => { dropTarget.style.borderColor = 'transparent'; });
  dropTarget.addEventListener('drop', e => {
    e.preventDefault();
    dropTarget.style.borderColor = 'transparent';
    const files = e.dataTransfer.files;
    if (files.length) loadAssetFiles(files);
  });
}

/* ── Size guide modal ───────────────────────────────────── */
function openSizeGuide(cat) {
  const guide = $('#size-guide');
  const chart = $('#sg-chart');
  if (cat === 'kids') {
    chart.innerHTML = `
      <table>
        <tr><th>Size</th><th>Chest</th><th>Length</th><th>Sleeve</th></tr>
        <tr><td>Youth XS</td><td>20"</td><td>22"</td><td>7.5"</td></tr>
        <tr><td>Youth S</td><td>21"</td><td>23"</td></tr>
        <tr><td>Youth M</td><td>22.5"</td><td>24"</td></tr>
        <tr><td>Youth L</td><td>24"</td><td>25.5"</td></tr>
        <tr><td>Youth XL</td><td>25.5"</td><td>27"</td></tr>
        <tr><td>Adult S</td><td>34"</td><td>27.5"</td><td>8.5"</td></tr>
        <tr><td>Adult M</td><td>36"</td><td>28"</td></tr>
        <tr><td>Adult L</td><td>38"</td><td>28.5"</td></tr>
        <tr><td>Adult XL</td><td>40"</td><td>29"</td></tr>
        <tr><td>Adult 2XL</td><td>42"</td><td>29.5"</td></tr>
        <tr><td>Adult 3XL</td><td>44"</td><td>30"</td></tr>
        <tr><td>Adult 4XL</td><td>46"</td><td>30.5"</td></tr>
      </table>`;
  } else if (cat === 'teens') {
    chart.innerHTML = `
      <table>
        <tr><th>Size</th><th>Chest</th><th>Length</th><th>Sleeve</th></tr>
        <tr><td>Teen S</td><td>30"</td><td>26"</td><td>8"</td></tr>
        <tr><td>Teen M</td><td>32"</td><td>26.5"</td></tr>
        <tr><td>Teen L</td><td>34"</td><td>27"</td></tr>
        <tr><td>Teen XL</td><td>36"</td><td>27.5"</td></tr>
        <tr><td>Adult S</td><td>34"</td><td>27.5"</td></tr>
        <tr><td>Adult M</td><td>36"</td><td>28"</td></tr>
        <tr><td>Adult L</td><td>38"</td><td>28.5"</td></tr>
        <tr><td>Adult XL</td><td>40"</td><td>29"</td></tr>
        <tr><td>Adult 2XL</td><td>42"</td><td>29.5"</td></tr>
      </table>`;
  } else {
    chart.innerHTML = `
      <table>
        <tr><th>Size</th><th>Chest</th><th>Waist</th><th>Length</th><th>Sleeve</th></tr>
        <tr><td>Adult S</td><td>34"</td><td>28"</td><td>27.5"</td><td>8.5"</td></tr>
        <tr><td>Adult M</td><td>36"</td><td>30"</td><td>28"</td></tr>
        <tr><td>Adult L</td><td>38"</td><td>32"</td><td>28.5"</td></tr>
        <tr><td>Adult XL</td><td>40"</td><td>34"</td><td>29"</td></tr>
        <tr><td>Adult 2XL</td><td>42"</td><td>36"</td><td>29.5"</td></tr>
        <tr><td>Adult 3XL</td><td>44"</td><td>38"</td><td>30"</td></tr>
        <tr><td>Adult 4XL</td><td>46"</td><td>40"</td><td>30.5"</td></tr>
      </table>`;
  }
  guide.classList.add('open');
  $('#sg-cat').textContent = cat === 'kids' ? 'Kids & Teens' : 'Adults';
}

/* ── Cart drawer toggle ─────────────────────────────────── */
function openCart() { $('#drawer').classList.add('open'); $('#drawer-overlay').classList.add('open'); }
function closeCart() { $('#drawer').classList.remove('open'); $('#drawer-overlay').classList.remove('open'); }
function toggleCart() { $('#drawer').classList.toggle('open'); $('#drawer-overlay').classList.toggle('open'); }

/* ── Nav ────────────────────────────────────────────────── */
function initNav() {
  const hamburger = $('#hamburger');
  const nav = $('#nav');
  hamburger.addEventListener('click', () => {
    nav.classList.toggle('open');
    hamburger.classList.toggle('open');
  });
  $$('#drawer .das-remove').forEach(n => n.addEventListener('click', () => closeCart()));
  window.addEventListener('click', e => {
    if (e.target === $('#drawer-overlay')) closeCart();
    if (e.target === $('#drawer')) closeCart();
  });
}

/* ── PWA / SW registration (graceful) ───────────────────── */
function initPWA() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

/* ── Init ───────────────────────────────────────────────── */
if (typeof document !== 'undefined') {
document.addEventListener('DOMContentLoaded', () => {
  renderCatalog();
  updateCartDrawer();
  updateBundle();
  initHeroUpload();
  initNav();
  initPWA();

  // event delegation for quick view
  $('#catalog-grid').addEventListener('click', e => {
    const card = e.target.closest('.card');
    if (card) openQuickView(card.dataset.id);
  });
  $('#qv-close').addEventListener('click', closeQuickView);
  $('#quickview').addEventListener('click', e => { if (e.target === e.currentTarget) closeQuickView(); });

  // quick view graphic/colorway changes
  $('#qv-graphics').addEventListener('change', e => {
    const id = state.selectedId;
    const card = id ? $('#' + id) : null;
    if (card) renderCatalog(); // re-render card glyph
  });
  $('#qv-graphic-list').addEventListener('change', e => {
    const img = $('#qv-thumbs').querySelector(`img[data-g="${e.target.value}"]`);
    if (img) {
      $$('#qv-thumbs img').forEach(i => i.classList.remove('active'));
      img.classList.add('active');
    }
  });
  $('#qv-colorways').addEventListener('change', updateQuickViewPrice);
  $('#qv-remove').addEventListener('click', () => {
    removeFromCart(state.selectedId);
    closeQuickView();
  });

  // customizer bindings
  $$('#customizer-base option, #customizer-graphic option, #customizer-role option, #customizer-size option')
    .forEach(o => o.addEventListener('change', applyCustomizer));
  $('#customizer-reset').addEventListener('click', () => {
    $('#customizer-base').value = 'black';
    $('#customizer-graphic').value = 'drip';
    $('#customizer-role').value = 'Adult';
    $('#customizer-size').value = 'Adult M';
    applyCustomizer();
  });

  // bundle qty buttons
  $('#bundle-list').addEventListener('click', e => {
    if (e.target.dataset.bundleQty) {
      const item = e.target.closest('.bundle-item');
      SND.add();
      renderCatalog();
      updateBundle();
      updateCartDrawer();
    }
  });

  // cart actions
  $('#cart-btn').addEventListener('click', openCart);
  $$('.drawer .das-remove').forEach(n => n.addEventListener('click', () => closeCart()));
  $('#drawer-overlay').addEventListener('click', closeCart);
  $('#drawer-close').addEventListener('click', closeCart);

  // filters
  $$('.filt-tab').forEach(t => t.addEventListener('click', () => {
    $$('.filt-tab').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    state.activeFilter = t.dataset.filter;
    renderCatalog();
  }));
  // search
  $('#search').addEventListener('keyup', e => {
    state.search = e.target.value;
    renderCatalog();
  });
  $$('.clear').forEach(c => c.addEventListener('click', () => {
    $('#search').value = '';
    state.search = '';
    renderCatalog();
  }));

  // view toggle
  $$('.view-btn').forEach(b => b.addEventListener('click', () => {
    $$('.view-btn').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    state.viewMode = b.dataset.view;
    renderCatalog();
  }));

  // size guide
  $('#size-guide-open').addEventListener('click', () => openSizeGuide('adults'));
  $('.sg-nav').addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (btn) openSizeGuide(btn.dataset.cat);
  });
  $('#size-guide-kids').addEventListener('click', () => openSizeGuide('kids'));
  $('#size-guide-teens').addEventListener('click', () => openSizeGuide('teens'));
  $('#sg-close').addEventListener('click', () => $('#size-guide').classList.remove('open'));
  $('#size-guide').addEventListener('click', e => { if (e.target === e.currentTarget) $('#size-guide').classList.remove('open'); });

  // sound toggle
  $('#sound-toggle').addEventListener('click', () => {
    state.sound = !state.sound;
    document.getElementById('sound-icon').textContent = state.sound ? '✦' : '♪';
    toast(state.sound ? 'Sound on — drip it in.' : 'Muted.', state.sound ? 'success' : 'info');
  });

  // notification permission
  $('#notify-btn').addEventListener('click', async () => {
    if (Notification.permission === 'default') {
      const ok = await Notification.requestPermission();
      toast(ok === 'granted' ? 'Notifications on — back in stock alerts.' : 'Not now.', ok === 'granted' ? 'success' : 'info');
    } else {
      toast('Notification permission is on.', 'info');
    }
  });

  // apply default customizer
  applyCustomizer();

  // reduced motion: already handled globally in CSS
});

}
/* ── Live price update on quick view selection ──────────── */
function updateQuickViewPrice() {
  const tv = $('#qv-thumbs');
  if (!tv) return;
  const active = tv.querySelector('img.active');
  if (active) {
    // re-render card glyph to match selected graphic
    const id = state.selectedId;
    if (id) renderCatalog();
  }
}
