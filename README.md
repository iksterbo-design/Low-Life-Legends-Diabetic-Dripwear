# Low Life Legends™ — Diabetic Dripwear Storefront

A complete, production-ready, interactive streetwear storefront for
**Low Life Legends™** and its flagship brand **Diabetic Dripwear** — 33 T-shirts,
a Spray Lab customizer, a filterable catalog, a bundle builder, a cart drawer,
a size guide, brand-logo image uploader, Web-Audio sound, PWA/offline, and
WCAG-2.2-AA-accessible interactions.

> All palette, typography, and mascot details come straight from the official
> artwork brief. Drop your own `DIABETIC LIFE™`, `LOW LIFE LEGENDS™`, and
> `LIL DRIP™` files onto the store to swap in your exact artwork.

---

## What's inside

| Feature | Requirement fulfilled |
|---|---|
| **33-Tee catalog** | All 9 core-teens + 12 supporter-roles × 2 colorways (33 shirts) |
| **Filter tabs** | All / Adults / Teenagers / Kids / Parents / Grandparents / Partners / Crew |
| **Search** | Live text search across names, roles, fits, colorways |
| **Back/front view toggle** | Per-card view flip |
| **Quick-view modal** | Front/back image, colorway & graphic style pickers, price |
| **Spray Lab customizer** | Shirt base color, graphic style, role-edition tag, full size chart |
| **Image uploader** | Drag-and-drop of the 3 brand files (hero artwork + customizer print) |
| **Bundle builder** | Any mix of shirts; 3+ tees = 15% off, 5+ tees = 25% off; live savings meter |
| **Cart drawer** | Slide-out with qty/size adjust, bundle savings, simulated checkout |
| **Size guide** | Adult / Teen / Kids charts, one-click open, in-cart size picker |
| **Story section** | "The Story of Lil Drip & 97 mg/dL" brand spotlight |
| **Spray-can cursor** | Hover mist + paint-splatter micro-animations |
| **Sound** | Web-Audio click/shell sounds (toggle + mute) |
| **Notifications** | Back-in-stock alerts (browser permission) |
| **PWA** | manifest + service worker (offline, installable) |
| **Accessibility** | WCAG 2.2 AA, `prefers-reduced-motion`, focus states, skip link |

---

## Quick start

**Just open it** (no build step):

```bat
cd Desktop\Low-Life-Legends-Diabetic-Dripwear
start index.html
```

or on macOS/Linux:

```bash
open index.html        # macOS
xdg-open index.html    # Linux
```

The file loads entirely from `file://` — no server, no bundler, no dependencies.

**Or run a local dev server** (faster, and needed if you later add the SW):

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

---

## Project structure

```
Low-Life-Legends-Diabetic-Dripwear/
├── index.html                  # single-page storefront (layout + inline SVG)
├── css/
│   └── styles.css              # complete spray-paint stylesheet
├── js/
│   ├── store.js                # 33 shirts + roles/sizes/colorways data
│   └── app.js                  # UI engine (render, cart, customizer, bundle, etc.)
├── svg/                        # brand SVG mark libraries + spray motifs
├── public/
│   ├── manifest.webmanifest    # PWA manifest
│   ├── sw.js                   # offline service worker
│   └── icons/                  # PWA icons (regenerable)
├── scripts/
│   ├── generate-icons.py       # stdlib-only PNG icon generator
│   ├── asset-sync.py           # embed 3 brand logos as data URIs
│   └── ci-checks.sh            # local CI sanity checks
├── .github/workflows/ci.yml    # GitHub Actions CI/CD
├── README.md                   # this file
└── START-HERE.html             # quick-start landing
```

---

## Development workflow

1. **Project setup (first time)**
   ```bash
   cd Low-Life-Legends-Diabetic-Dripwear
   npm i -g http-server   # optional, for a nicer dev server
   ./scripts/ci-checks.sh   # verify clean baseline
   ```

2. **Work on a feature**
   - Edit `index.html` for layout changes
   - `css/styles.css` for look-and-feel (palette is in `:root` CSS vars)
   - `js/store.js` for catalog data (never touch the catalogue UI in HTML)
   - `js/app.js` for interactions; new features get one small function + one UI binding
   - Keep the 33-shirts count in sync in `store.js`

3. **Verify locally before committing**
   ```bash
   ./scripts/ci-checks.sh
   python3 -m http.server 8080 &   # smoke test in a real browser
   ```

4. **Commit & push**
   ```bash
   git add -A
   git commit -m "feat: add <feature>"
   git push origin main
   ```

5. **GitHub Actions runs automatically** on every push/PR:
   - `validate` → node `--check` on every JS, HTML sanity, `require()` load
   - `build` → regenerates PWA icons, packs a `dripwear.zip` artifact

---

## Continuous integration & deployment

**`.github/workflows/ci.yml`** runs on every push to `main` and on every PR:

```
┌──────────────────────────────────────────────────────┐
│  push / PR → GitHub Actions                          │
│  ├─ validate: node --check, HTML sanity, module load │
│  └─ build : regenerate icons → pack dripwear.zip     │
└──────────────────────────────────────────────────────┘
```

**Deployment options:**

| Target | How |
|---|---|
| **GitHub Pages** | Push repo to GitHub; enable Pages → `main` branch, `/root`; SW registers with relative path so it works on a project page |
| **Free static host** | Drop the ZIP anywhere (Netlify, Vercel, Surge, Caddy, IIS) |
| **Phone (APK-like)** | `python3 -m http.server` on phone + install PWA, or wrap with Capacitor/WebView |
| **Local** | `python3 -m http.server` — sound/Unsplash upload & PWA registration need a secure origin |

> The service worker uses **relative paths** (`./sw.js`, `./index.html`) so it
> installs correctly on GitHub Pages subpaths, not just domain roots.

---

## The workflow the user asked for

1. Developer edits `index.html` / `css/styles.css` / `js/*.js`
2. `./scripts/ci-checks.sh` → local sanity (JS syntax + module load + HTML)
3. `git add -A && git commit -m "…" && git push`
4. GitHub Actions (`ci.yml`): `validate` → `build`
5. Artifact `dripwear.zip` lands in the Actions tab — download & drop into any static host (or use Pages)
6. User opens the live site: spray-paint hero, spray lab, 33-shop, bundle, cart, size guide, sound, notifications, offline-capable

---

## Asset sync (brand logos)

Before going live, paste the 3 official files into `assets/logo/` (or pass `--dir`):

```bash
python3 scripts/asset-sync.py --dir ./assets/logo
```

This writes `assets/brand-assets.js` with the files embedded as data URIs, so the
image uploader starts with your real `DIABETIC LIFE™`, `LOW LIFE LEGENDS™`,
and `LIL DRIP™` art instead of placeholders.

---

## Tech notes

- **No framework, no bundler, no npm dependencies** — `file://` compatible everywhere.
- **ES5-safe JS**, but written for modern browsers; service worker requires HTTPS or localhost.
- **Sound** uses the Web Audio API with auto-unlock on first user gesture.
- **Suffix/flicker effects** do NOT run under `prefers-reduced-motion`.
- **33-shirt catalog** is generated from `js/store.js` — add a shirt there and it appears everywhere.

---

## License

Artwork & brand marks © Low Life Legends™ (Lil Drip). The code is free to study
and remix; merchandise/redistribution of the logo art is governed by the official brand policy.
