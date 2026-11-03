import io
import os
import sys
import traceback

path = os.path.join(os.path.dirname(__file__), 'generate-icons.py')
src = io.open(path, encoding='utf-8').read()

# strip the main block
for call in ["render_png(make_icon('normal'), 'icon-512.png')",
             "render_png(make_icon('normal'), 'icon-192.png')",
             "render_png(make_icon('maskable'), 'icon-512-maskable.png')",
             "print('done')"]:
    src = src.replace(call, 'pass')

g = {'__file__': 'generate-icons.py'}
exec(src, g)

# Now call the pure functions manually on a tiny sample
img512 = g['make_icon']('normal')
print('normal img: rows', len(img512), 'cols', len(img512[0]), 'first px', img512[0][0])
mx = max(c for row in img512 for px in row for c in px)
print('max value in normal img:', mx)

img_msk = g['make_icon']('maskable')
print('maskable img: rows', len(img_msk))
mx2 = max(c for row in img_msk for px in row for c in px if isinstance(c, int))
print('max value in maskable img:', mx2)

# run the actual render path on a tiny 4x4 image
tiny = [[(13, 59, 82), (255, 230, 0)], [(8, 9, 12), (0, 212, 255)]]
try:
    png = g['make_png'](4, 4, tiny)
    print('tiny png bytes:', len(png))
except Exception:
    traceback.print_exc()
