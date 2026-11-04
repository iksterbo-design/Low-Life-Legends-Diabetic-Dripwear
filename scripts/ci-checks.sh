#!/usr/bin/env bash
# Dripwear — local CI checks (dev loop): JS syntax + HTML sanity + asset count.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> JS syntax check"
for f in $(find js -name '*.js'); do
  node --check "$f" || { echo "FAIL: $f"; exit 1; }
done
echo "JS OK"

echo "==> Node module load"
node -e "require('./js/store.js'); require('./js/app.js'); console.log('modules OK')"

echo "==> HTML sanity"
python3 - <<'PY'
import re
html = open('index.html', encoding='utf-8').read()
for tag in ['div','section','button','script','svg','span','ul','li','a','header','footer','select','option']:
    o = len(re.findall(rf'<{tag}[>\s]', html))
    c = len(re.findall(rf'</{tag}>', html))
    if tag in ('script','svg','br','img','input','meta','link','hr'):
        continue
    if o < c:
        print(f'WARN: <{tag}> {o} < </{tag}> {c}')
print('HTML OK')
PY

echo "==> Asset inventory"
find svg -type f | sort
find svg/graffiti -type f 2>/dev/null | sort
echo "asset files: $(find svg -type f | wc -l)"

echo "==> DONE"
