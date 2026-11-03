#!/usr/bin/env python3
"""
Low Life Legends™ — generate PWA icons from the brand palette.
Stdlib only (zlib + struct) — no PIL required.
Writes: public/icons/icon-192.png, icon-512.png, icon-512-maskable.png
"""
import math
import os
import struct
import zlib

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'icons')
os.makedirs(OUT, exist_ok=True)

# Exact brand palette
DEEP_PETROL = (13, 59, 82)
NIGHT_ALLEY = (7, 30, 43)
INK = (8, 9, 12)
VOLT = (255, 230, 0)
MAGNETA = (255, 20, 138)
CYAN = (0, 212, 255)
SILVER = (184, 188, 194)
WHITE = (255, 255, 255)


def make_png(width, height, rgba):
    """Build a PNG from an RGBA tuple grid."""
    raw = b''
    for row in rgba:
        raw += b'\x00' + bytes(row)  # filter type 0 (none)
    def chunk(tag, data):
        c = tag + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)
    sig = b'\x89PNG\r\n\x1a\n'
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    return sig + chunk(b'IHDR', ihdr) + chunk(b'IDAT', zlib.compress(raw)) + chunk(b'IEND', b'')


def draw_bolt(cx, cy, scale, color_volt, color_magenta, bg):
    """Draw a simple spray-bolt glyph centred at (cx,cy), scaled."""
    img = [[bg for _ in range(height)] for _ in range(height)]
    # spray-streak base
    for dx in range(-22, 23, 2):
        for dy in range(-20, 21, 2):
            dist = abs(dx) + abs(dy)
            if dist < 26:
                x, y = cx + dx, cy + dy
                if 0 <= x < width and 0 <= y < height:
                    img[y][x] = color_volt
    # bolt core (magenta-red)
    for dx in range(-16, 17, 2):
        for dy in range(-12, 13, 2):
            dist = abs(dx) + abs(dy)
            if dist < 18:
                x, y = cx + dx, cy + dy
                if 0 <= x < width and 0 <= y < height:
                    img[y][x] = color_magenta
    # yellow highlight spark
    for dx in range(-8, 9, 2):
        for dy in range(-10, 11, 2):
            dist = abs(dx) + abs(dy)
            if dist < 14:
                x, y = cx + dx, cy + dy
                if 0 <= x < width and 0 <= y < height:
                    img[y][x] = color_volt
    return img


width, height = 512, 512
# palette per role
def make_icon(kind):
    img = [[DEEP_PETROL for _ in range(width)] for _ in range(height)]
    if kind == 'maskable':
        # safe-zone: keep glyph within central 70%
        cx, cy, s = width // 2, height // 2, 26
        volt, mag, bg = VOLT, MAGENTA, DEEP_PETROL
    else:
        cx, cy, s = width // 2, height // 2, 30
        volt, mag, bg = VOLT, MAGENTA, DEEP_PETROL
    glyph = draw_bolt(cx, cy, s, volt, mag, bg)
    # fade edges for non-maskable
    if kind != 'maskable':
        for y in range(height):
            for x in range(width):
                d = math.hypot(x - cx, y - cy) / (width * 0.5)
                if d > 0.95:
                    alpha = int(255 * (1 - (d - 0.95) / 0.05))
                    img[y][x] = (*glyph[y][x], alpha)
    return glyph if kind == 'maskable' else img


def render_png(img, name):
    png = make_png(width, height, [tuple(row) for row in img])
    path = os.path.join(OUT, name)
    with open(path, 'wb') as f:
        f.write(png)
    print('wrote', path, len(png), 'bytes')


render_png(make_icon('normal'), 'icon-512.png')
render_png(make_icon('normal'), 'icon-192.png')
render_png(make_icon('maskable'), 'icon-512-maskable.png')
print('done')
