# Workflow — Dripwear Storefront

How a change travels from the developer's keyboard to a live, offline-capable storefront.

## 1. Local dev (no tooling required)

```bash
# 1. Open directly, or serve locally
start index.html                 # file://  (no server, no deps)
# or
python3 -m http.server 8080        # localhost + sound/upload support

# 2. Local sanity check (JS syntax + module load + HTML)
./scripts/ci-checks.sh

# 3. Edit:
#    - index.html        → layout
#    - css/styles.css    → palette & spray-paint visuals (CSS vars in :root)
#    - js/store.js       → add/remove a tee (33 total)
#    - js/app.js         → new interactions
```

## 2. Commit & push

```bash
git add -A
git commit -m "feat: <what>"
git push origin main
```

## 3. GitHub Actions (automatic)

`.github/workflows/ci.yml` runs on every push to `main` + every PR:

| Job | What it checks |
|---|---|
| `validate` | `node --check` on every JS; HTML tag-balance heuristic; `require()` all modules |
| `build` | Regenerates PWA icons (`scripts/generate-icons.py`), lists artifacts, packs `dripwear.zip` |

Artifact lands in the **Actions → build job → Artifacts** tab → download `dripwear.zip`.

## 4. Deploy

| Target | Steps |
|---|---|
| **GitHub Pages** | Repo Settings → Pages → Source: `main` (root); SW uses relative path so it installs on `/<repo>/` |
| **Any static host** | Drop the ZIP anywhere (Netlify drag-and-drop, Vercel, Caddy, IIS) |
| **Phone / offline app** | Serve over HTTPS on the phone; browser → Install PWA (or Capacitor/WebView wrap) |

## 5. Brand assets

Drop the 3 official files into `assets/logo/` (or pass `--dir`):

```bash
python3 scripts/asset-sync.py --dir ./assets/logo
```

Outputs `assets/brand-assets.js` (data URIs). The store's image uploader now
shows the real `DIABETIC LIFE™`, `LOW LIFE LEGENDS™`, and `LIL DRIP™` art.

## 6. The full loop (one message)

```
edit → scripts/ci-checks.sh → commit → push → CI(v-validate+build) → download ZIP → deploy
```
