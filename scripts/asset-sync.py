#!/usr/bin/env python3
"""
Low Life Legends™ — asset sync utility.
Syncs the 3 brand logos into the storefront so the image uploader starts
with the real official files instead of placeholders.

Usage:
  python3 scripts/asset-sync.py            # uses ./assets/logo/ by default
  python3 scripts/asset-sync.py --dir ./my-logos
  python3 scripts/asset-sync.py --list

Outputs:
  assets/brand-assets.js   — ready to include in index.html (data URIs)
"""
import argparse
import base64
import os
import sys

BRAND_ASSETS = [
    { 'id': 'drip-logo', 'file': 'diabetic-life-drip-logo.png', 'label': 'DIABETIC LIFE™ Drip Logo' },
    { 'id': 'wordmark',  'file': 'low-life-legends-arched.svg', 'label': 'LOW LIFE LEGENDS™ Arched Wordmark' },
    { 'id': 'mascot',    'file': 'lil-drip-mascot-crest.png', 'label': 'LIL DRIP™ Mascot Crest' },
]

DEFAULT_DIR = os.path.join('assets', 'logo')


def to_data_uri(path):
    ext = os.path.splitext(path)[1].lower()
    mime = {'.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
            '.gif': 'image/gif', '.svg': 'image/svg+xml', '.webp': 'image/webp'}.get(ext, 'image/png')
    with open(path, 'rb') as f:
        b64 = base64.b64encode(f.read()).decode('ascii')
    return f'data:{mime};base64,{b64}'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dir', default=DEFAULT_DIR, help='folder holding the 3 brand files')
    ap.add_argument('--out', default='assets/brand-assets.js', help='output JS path')
    ap.add_argument('--list', action='store_true', help='just list what is found')
    args = ap.parse_args()

    if args.list:
        print(f'Scanning {args.dir} ...')
        found = {}
        for a in BRAND_ASSETS:
            p = os.path.join(args.dir, a['file'])
            if os.path.exists(p):
                found[a['id']] = os.path.getsize(p)
        for a in BRAND_ASSETS:
            print(f"  {a['id']:12s} {'FOUND' if a['id'] in found else 'MISSING'}  {a['file']}")
        return

    lines = [
        '// AUTO-GENERATED — do not edit by hand. Run: python3 scripts/asset-sync.py',
        "/* Low Life Legends™  •  brand asset loader */",
        "window.BRAND_ASSETS = {",
    ]
    any_found = False
    for a in BRAND_ASSETS:
        p = os.path.join(args.dir, a['file'])
        if os.path.exists(p):
            uri = to_data_uri(p)
            lines.append(f"  '{a['id']}': {uri},   // {a['label']}")
            any_found = True
        else:
            lines.append(f"  // '{a['id']}': MISSING — {a['file']}  (upload via Sprayer dropzone)")
    lines.append('};')
    lines.append('')
    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with open(args.out, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print(f'Wrote {args.out}')
    if not any_found:
        print('WARNING: no brand files found. Uploads via the dropzone will be needed.')
    else:
        print('Brand images embedded as data URIs — drag-and-drop upload now shows real logos.')


if __name__ == '__main__':
    main()
